import { Worker } from 'node:worker_threads';
import { setBoundedCacheEntry } from './bounded-cache.js';
import { getDefaultConcurrency } from './concurrency.js';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
  type RouteTransformTaskOptions,
} from './route-transform-tasks.js';
import type { PluginOptions } from './types.js';
import type {
  WorkerErrorPayload,
  WorkerRequest,
  WorkerResponse,
} from './parallel-route-transform-protocol.js';

export type ParallelTransformsConfig =
  NonNullable<PluginOptions['parallelTransforms']> extends infer Config
    ? Exclude<Config, false>
    : never;

export type RouteTransformExecutorOptions = RouteTransformTaskOptions & {
  parallelTransforms?: PluginOptions['parallelTransforms'];
  splitRouteModules?: boolean;
};

export type RouteTransformExecutor = {
  run: (task: RouteTransformTask) => Promise<RouteTransformResult>;
  close: () => Promise<void>;
};

type PendingTask = {
  resolve: (result: RouteTransformResult) => void;
  reject: (error: Error) => void;
};

type WorkerState = {
  worker: Worker;
  pending: Map<number, PendingTask>;
  sourceCache: Map<string, string>;
};

class WorkerStartupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerStartupError';
  }
}

const MAX_WORKER_SOURCE_CACHE_ENTRIES = 2048;
const AUTO_PARALLEL_ROUTE_THRESHOLD = 256;

export const getDefaultWorkerCount = (cpuCount?: number): number =>
  getDefaultConcurrency(cpuCount);

export const shouldParallelizeRouteTransforms = (routeCount: number): boolean =>
  routeCount >= AUTO_PARALLEL_ROUTE_THRESHOLD;

const getConfiguredWorkerCount = (
  parallelTransforms: ParallelTransformsConfig
): number => {
  if (parallelTransforms === true) {
    return getDefaultWorkerCount();
  }

  const configured = parallelTransforms.maxWorkers;
  if (configured === undefined) {
    return getDefaultWorkerCount();
  }
  if (!Number.isInteger(configured) || configured < 1) {
    throw new Error(
      '[react-router] parallelTransforms.maxWorkers must be a positive integer.'
    );
  }
  return configured;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const deserializeWorkerError = (error: WorkerErrorPayload): Error => {
  const result = new Error(error.message);
  result.name = error.name ?? 'Error';
  if (error.stack) {
    result.stack = error.stack;
  }
  return result;
};

const createWorkerUrl = (): URL =>
  new URL('./parallel-route-transform-worker.js', import.meta.url);

const isWorkerStartupError = (error: unknown): error is WorkerStartupError =>
  error instanceof WorkerStartupError;

class ParallelRouteTransformExecutor implements RouteTransformExecutor {
  #closed = false;
  #closePromise: Promise<void> | undefined;
  #workersDisabled = false;
  #nextId = 1;
  #nextRouteModuleWorkerIndex = 0;
  #nextSplitRouteAnalysisWorkerIndex = 0;
  #splitRouteAnalysisWorkers = new Map<string, number>();
  #workers: WorkerState[];

  constructor(
    workerCount: number,
    private readonly options: RouteTransformTaskOptions,
    private readonly balanceRouteModuleTransforms: boolean
  ) {
    this.#workers = [];
    try {
      for (let index = 0; index < workerCount; index += 1) {
        this.#workers.push(this.#createWorkerState());
      }
    } catch (error) {
      for (const state of this.#workers) {
        void state.worker.terminate();
      }
      this.#workers = [];
      throw error;
    }
  }

  async run(task: RouteTransformTask): Promise<RouteTransformResult> {
    if (this.#closed) {
      return executeRouteTransformTask(task, this.options);
    }
    if (task.kind === 'clientOnlyStub' && task.resolveExportAllModule) {
      return executeRouteTransformTask(task, this.options);
    }

    try {
      return await this.#runInWorker(task);
    } catch (error) {
      if (isWorkerStartupError(error)) {
        return executeRouteTransformTask(task, this.options);
      }
      throw error;
    }
  }

  close(): Promise<void> {
    if (this.#closePromise) {
      return this.#closePromise;
    }
    this.#closed = true;
    const workers = this.#workers;
    this.#workers = [];
    this.#closePromise = Promise.all(
      workers.map(async state => {
        for (const pending of state.pending.values()) {
          pending.reject(new Error('Route transform worker closed.'));
        }
        state.pending.clear();
        await state.worker.terminate();
      })
    ).then(() => undefined);
    return this.#closePromise;
  }

  #disableWorkers(error: WorkerStartupError): void {
    if (this.#workersDisabled || this.#closed) {
      return;
    }
    this.#workersDisabled = true;
    const workers = this.#workers;
    this.#workers = [];
    for (const state of workers) {
      for (const pending of state.pending.values()) {
        pending.reject(error);
      }
      state.pending.clear();
      void state.worker.terminate();
    }
  }

  #createWorkerState(): WorkerState {
    const worker = new Worker(createWorkerUrl());
    const state: WorkerState = {
      worker,
      pending: new Map(),
      sourceCache: new Map(),
    };

    worker.on('message', (response: WorkerResponse) => {
      const pending = state.pending.get(response.id);
      if (!pending) {
        return;
      }
      state.pending.delete(response.id);
      if (response.ok) {
        pending.resolve(response.result);
      } else {
        pending.reject(deserializeWorkerError(response.error));
      }
    });

    worker.on('error', (error: Error) => {
      const startupError = new WorkerStartupError(error.message);
      startupError.stack = error.stack;
      this.#disableWorkers(startupError);
    });

    worker.on('exit', code => {
      if (this.#closed || this.#workersDisabled) {
        return;
      }
      const startupError = new WorkerStartupError(
        `Route transform worker exited with code ${code}.`
      );
      this.#disableWorkers(startupError);
    });

    return state;
  }

  #runInWorker(task: RouteTransformTask): Promise<RouteTransformResult> {
    const workerIndex = this.#getWorkerIndex(task);
    const state = this.#workers[workerIndex];
    if (!state) {
      return executeRouteTransformTask(task, this.options);
    }

    const id = this.#nextId++;
    const sourceCacheKey = task.resourcePath;
    const requestTask = this.#createWorkerRequestTask(
      state,
      task,
      sourceCacheKey
    );
    return new Promise((resolve, reject) => {
      state.pending.set(id, { resolve, reject });
      try {
        state.worker.postMessage({
          id,
          task: requestTask,
          sourceCacheKey,
        } satisfies WorkerRequest);
      } catch (error) {
        state.pending.delete(id);
        // The worker may not have received the source update. Force the next
        // request for this module to send its full source again.
        state.sourceCache.delete(sourceCacheKey);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  #createWorkerRequestTask(
    state: WorkerState,
    task: RouteTransformTask,
    sourceCacheKey: string
  ): WorkerRequest['task'] {
    const cachedSource = state.sourceCache.get(sourceCacheKey);
    if (cachedSource === task.code) {
      const { code: _code, ...cachedTask } = task;
      return cachedTask;
    }

    setBoundedCacheEntry(
      state.sourceCache,
      sourceCacheKey,
      task.code,
      MAX_WORKER_SOURCE_CACHE_ENTRIES
    );
    return task;
  }

  #getWorkerIndex(task: RouteTransformTask): number {
    const workerCount = Math.max(1, this.#workers.length);
    if (
      this.balanceRouteModuleTransforms &&
      (task.kind === 'routeClientEntry' ||
        task.kind === 'routeChunk' ||
        task.kind === 'splitRouteExports')
    ) {
      const existingWorkerIndex = this.#splitRouteAnalysisWorkers.get(
        task.resourcePath
      );
      if (existingWorkerIndex !== undefined) {
        return existingWorkerIndex % workerCount;
      }
      const workerIndex = this.#nextSplitRouteAnalysisWorkerIndex % workerCount;
      this.#nextSplitRouteAnalysisWorkerIndex += 1;
      this.#splitRouteAnalysisWorkers.set(task.resourcePath, workerIndex);
      return workerIndex;
    }
    if (
      this.balanceRouteModuleTransforms &&
      task.kind === 'routeModule' &&
      !(task.environmentName === 'web' && !task.ssr && task.isSpaMode)
    ) {
      const workerIndex = this.#nextRouteModuleWorkerIndex % workerCount;
      this.#nextRouteModuleWorkerIndex += 1;
      return workerIndex;
    }
    return hashString(task.resourcePath) % workerCount;
  }
}

export const createRouteTransformExecutor = ({
  parallelTransforms,
  routeChunkCache,
  splitRouteModules,
}: RouteTransformExecutorOptions = {}): RouteTransformExecutor => {
  const options = { routeChunkCache };
  const effectiveParallelTransforms = parallelTransforms ?? false;
  if (!effectiveParallelTransforms) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  const workerCount = getConfiguredWorkerCount(effectiveParallelTransforms);
  if (workerCount < 1) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  return new ParallelRouteTransformExecutor(
    workerCount,
    options,
    Boolean(splitRouteModules)
  );
};
