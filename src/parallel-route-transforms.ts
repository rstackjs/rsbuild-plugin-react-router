import { Worker } from 'node:worker_threads';
import { Effect } from 'effect';
import { setBoundedCacheEntry } from './bounded-cache.js';
import { getAvailableCpuCount, getDefaultConcurrency } from './concurrency.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';
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

type RouteTransformWorker = {
  on(event: 'message', handler: (response: WorkerResponse) => void): unknown;
  on(event: 'error', handler: (error: Error) => void): unknown;
  on(event: 'exit', handler: (code: number) => void): unknown;
  postMessage(message: WorkerRequest): void;
  terminate(): Promise<number> | number;
};

type RouteTransformWorkerFactory = () => RouteTransformWorker;

type WorkerState = {
  worker: RouteTransformWorker;
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
const DEFAULT_WORKER_COUNT_LIMIT = 4;
const SMALL_MACHINE_WORKER_COUNT_LIMIT = 1;
const SMALL_MACHINE_CPU_COUNT = 4;

export const getDefaultWorkerCount = (cpuCount?: number): number => {
  const resolvedCpuCount = cpuCount ?? getAvailableCpuCount();
  const workerCount = getDefaultConcurrency(resolvedCpuCount);
  if (workerCount < 1) {
    return 0;
  }
  const workerLimit =
    resolvedCpuCount <= SMALL_MACHINE_CPU_COUNT
      ? SMALL_MACHINE_WORKER_COUNT_LIMIT
      : DEFAULT_WORKER_COUNT_LIMIT;
  return Math.min(workerCount, workerLimit);
};

const getConfiguredWorkerCount = (
  parallelTransforms: ParallelTransformsConfig
): number => {
  if (!Number.isInteger(parallelTransforms) || parallelTransforms < 1) {
    throw new Error(
      '[react-router] parallelTransforms must be false or a positive integer.'
    );
  }
  return parallelTransforms;
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

const createDefaultWorker = (): RouteTransformWorker =>
  new Worker(createWorkerUrl());

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
  #workers: WorkerState[] | undefined;

  constructor(
    private readonly workerCount: number,
    private readonly options: RouteTransformTaskOptions,
    private readonly balanceRouteModuleTransforms: boolean,
    private readonly createWorker: RouteTransformWorkerFactory
  ) {}

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
    const workers = this.#workers ?? [];
    this.#workers = [];
    this.#closePromise = runPluginEffect(
      Effect.all(
        workers.map(state =>
          Effect.sync(() => {
            for (const pending of state.pending.values()) {
              pending.reject(new Error('Route transform worker closed.'));
            }
            state.pending.clear();
          }).pipe(
            Effect.zipRight(
              tryPluginPromise(() => state.worker.terminate()).pipe(
                Effect.asVoid
              )
            )
          )
        ),
        { concurrency: 'unbounded' }
      ).pipe(Effect.asVoid)
    );
    return this.#closePromise;
  }

  #disableWorkers(error: WorkerStartupError): void {
    if (this.#workersDisabled || this.#closed) {
      return;
    }
    this.#workersDisabled = true;
    const workers = this.#workers ?? [];
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
    const worker = this.createWorker();
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

  #getWorkers(): WorkerState[] {
    if (this.#closed || this.#workersDisabled) {
      return [];
    }
    if (this.#workers) {
      return this.#workers;
    }
    const workers: WorkerState[] = [];
    try {
      for (let index = 0; index < this.workerCount; index += 1) {
        workers.push(this.#createWorkerState());
      }
    } catch (error) {
      for (const state of workers) {
        void state.worker.terminate();
      }
      this.#workers = [];
      throw error;
    }
    this.#workers = workers;
    return workers;
  }

  #runInWorker(task: RouteTransformTask): Promise<RouteTransformResult> {
    const workers = this.#getWorkers();
    const workerIndex = this.#getWorkerIndex(task, workers.length);
    const state = workers[workerIndex];
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

  #getWorkerIndex(task: RouteTransformTask, workerCount: number): number {
    const safeWorkerCount = Math.max(1, workerCount);
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
        return existingWorkerIndex % safeWorkerCount;
      }
      const workerIndex =
        this.#nextSplitRouteAnalysisWorkerIndex % safeWorkerCount;
      this.#nextSplitRouteAnalysisWorkerIndex += 1;
      this.#splitRouteAnalysisWorkers.set(task.resourcePath, workerIndex);
      return workerIndex;
    }
    if (
      this.balanceRouteModuleTransforms &&
      task.kind === 'routeModule' &&
      !(task.environmentName === 'web' && !task.ssr && task.isSpaMode)
    ) {
      const workerIndex = this.#nextRouteModuleWorkerIndex % safeWorkerCount;
      this.#nextRouteModuleWorkerIndex += 1;
      return workerIndex;
    }
    return hashString(task.resourcePath) % safeWorkerCount;
  }
}

export const createRouteTransformExecutor = ({
  parallelTransforms,
  routeChunkCache,
  splitRouteModules,
}: RouteTransformExecutorOptions = {}): RouteTransformExecutor => {
  return createRouteTransformExecutorWithWorkerFactory(
    {
      parallelTransforms,
      routeChunkCache,
      splitRouteModules,
    },
    createDefaultWorker
  );
};

const createRouteTransformExecutorWithWorkerFactory = (
  {
    parallelTransforms,
    routeChunkCache,
    splitRouteModules,
  }: RouteTransformExecutorOptions = {},
  createWorker: RouteTransformWorkerFactory
): RouteTransformExecutor => {
  const options = { routeChunkCache };
  if (parallelTransforms === false) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  const workerCount =
    parallelTransforms === undefined
      ? getDefaultWorkerCount()
      : getConfiguredWorkerCount(parallelTransforms);
  if (workerCount < 1) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  return new ParallelRouteTransformExecutor(
    workerCount,
    options,
    Boolean(splitRouteModules),
    createWorker
  );
};

export const createRouteTransformExecutorForTesting = (
  options: RouteTransformExecutorOptions,
  createWorker: RouteTransformWorkerFactory
): RouteTransformExecutor =>
  createRouteTransformExecutorWithWorkerFactory(options, createWorker);
