import { availableParallelism, cpus } from 'node:os';
import { Worker } from 'node:worker_threads';
import { SERVER_ONLY_ROUTE_EXPORTS } from './constants.js';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
  type RouteTransformTaskOptions,
} from './route-transform-tasks.js';
import type { PluginOptions } from './types.js';

export type ParallelTransformsConfig =
  NonNullable<PluginOptions['parallelTransforms']> extends infer Config
    ? Exclude<Config, false>
    : never;

export type RouteTransformExecutorOptions = RouteTransformTaskOptions & {
  parallelTransforms?: PluginOptions['parallelTransforms'];
  routeCount?: number;
  splitRouteModules?: boolean;
};

export type RouteTransformExecutor = {
  run: (task: RouteTransformTask) => Promise<RouteTransformResult>;
  close: () => Promise<void>;
};

type WorkerResponse =
  | {
      id: number;
      ok: true;
      result: RouteTransformResult;
    }
  | {
      id: number;
      ok: false;
      error: WorkerErrorPayload;
    };

type WorkerRequest = {
  id: number;
  task:
    | RouteTransformTask
    | (Omit<RouteTransformTask, 'code'> & { code?: string });
  sourceCacheKey?: string;
};

type WorkerErrorPayload = {
  name?: string;
  message: string;
  stack?: string;
};

type PendingTask = {
  resolve: (result: RouteTransformResult) => void;
  reject: (error: Error) => void;
};

type WorkerState = {
  worker: Worker;
  pending: Map<number, PendingTask>;
  sourceCache: Map<string, string>;
  startupError?: WorkerStartupError;
};

type RouteModuleResultCacheEntry = {
  source: string;
  result: Promise<RouteTransformResult>;
};

class WorkerStartupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerStartupError';
  }
}

const DEFAULT_RESERVED_CORES = 2;
const DEFAULT_MIN_PARALLEL_ROUTES = 128;
const DEFAULT_MAX_WORKERS = 8;
const DEFAULT_ROUTE_MAX_WORKERS = 6;
const DEFAULT_SPLIT_ROUTE_MAX_WORKERS = 6;
const DEFAULT_LARGE_ROUTE_MIN_ROUTES = 1024;
const DEFAULT_LARGE_ROUTE_MAX_WORKERS = 2;
const MAX_WORKER_SOURCE_CACHE_ENTRIES = 2048;
const MAX_ROUTE_MODULE_RESULT_CACHE_ENTRIES = 2048;

const getAvailableCpuCount = (): number =>
  typeof availableParallelism === 'function'
    ? availableParallelism()
    : cpus().length;

export const getDefaultWorkerCount = (
  cpuCount: number = getAvailableCpuCount(),
  {
    routeCount,
    splitRouteModules = false,
  }: Pick<
    RouteTransformExecutorOptions,
    'routeCount' | 'splitRouteModules'
  > = {}
): number => {
  if (
    typeof routeCount === 'number' &&
    routeCount < DEFAULT_MIN_PARALLEL_ROUTES
  ) {
    return 0;
  }

  const maxWorkers =
    typeof routeCount === 'number' &&
    routeCount >= DEFAULT_LARGE_ROUTE_MIN_ROUTES
      ? DEFAULT_LARGE_ROUTE_MAX_WORKERS
      : splitRouteModules
        ? DEFAULT_SPLIT_ROUTE_MAX_WORKERS
        : typeof routeCount === 'number'
          ? DEFAULT_ROUTE_MAX_WORKERS
          : DEFAULT_MAX_WORKERS;
  const workerCount = Math.floor(cpuCount) - DEFAULT_RESERVED_CORES;
  if (workerCount < 2) {
    return 0;
  }
  return Math.min(maxWorkers, workerCount);
};

const getConfiguredWorkerCount = (
  parallelTransforms: ParallelTransformsConfig,
  options: Pick<
    RouteTransformExecutorOptions,
    'routeCount' | 'splitRouteModules'
  >
): number => {
  if (parallelTransforms === true) {
    return getDefaultWorkerCount(undefined, options);
  }

  const configured = parallelTransforms.maxWorkers;
  if (configured === undefined) {
    return getDefaultWorkerCount(undefined, options);
  }
  if (!Number.isFinite(configured) || configured < 1) {
    throw new Error(
      '[react-router] parallelTransforms.maxWorkers must be at least 1.'
    );
  }
  return Math.floor(configured);
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

const canShareRouteModuleBuildResult = (task: RouteTransformTask): boolean =>
  task.kind === 'routeModule' &&
  task.isBuild &&
  task.ssr &&
  !task.isSpaMode &&
  !SERVER_ONLY_ROUTE_EXPORTS.some(exportName => task.code.includes(exportName));

class ParallelRouteTransformExecutor implements RouteTransformExecutor {
  #closed = false;
  #nextId = 1;
  #nextRouteModuleWorkerIndex = 0;
  #nextSplitRouteAnalysisWorkerIndex = 0;
  #routeModuleResultCache = new Map<string, RouteModuleResultCacheEntry>();
  #splitRouteAnalysisWorkers = new Map<string, number>();
  #workers: WorkerState[];

  constructor(
    workerCount: number,
    private readonly options: RouteTransformTaskOptions,
    private readonly balanceRouteModuleTransforms: boolean,
    private readonly shareRouteModuleBuildResults: boolean
  ) {
    this.#workers = Array.from({ length: workerCount }, () =>
      this.#createWorkerState()
    );
  }

  async run(task: RouteTransformTask): Promise<RouteTransformResult> {
    if (this.#closed) {
      return executeRouteTransformTask(task, this.options);
    }

    if (
      this.shareRouteModuleBuildResults &&
      canShareRouteModuleBuildResult(task)
    ) {
      return this.#runCachedRouteModuleBuildTask(task);
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

  async close(): Promise<void> {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    const workers = this.#workers;
    this.#workers = [];
    await Promise.all(
      workers.map(async state => {
        for (const pending of state.pending.values()) {
          pending.reject(new Error('Route transform worker closed.'));
        }
        state.pending.clear();
        await state.worker.terminate();
      })
    );
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
      state.startupError = startupError;
      for (const pending of state.pending.values()) {
        pending.reject(startupError);
      }
      state.pending.clear();
    });

    worker.on('exit', code => {
      if (this.#closed || code === 0) {
        return;
      }
      const startupError = new WorkerStartupError(
        `Route transform worker exited with code ${code}.`
      );
      state.startupError = startupError;
      for (const pending of state.pending.values()) {
        pending.reject(startupError);
      }
      state.pending.clear();
    });

    return state;
  }

  #runCachedRouteModuleBuildTask(
    task: RouteTransformTask
  ): Promise<RouteTransformResult> {
    const cacheKey = task.resourcePath;
    const cached = this.#routeModuleResultCache.get(cacheKey);
    if (cached?.source === task.code) {
      return cached.result;
    }

    if (
      !this.#routeModuleResultCache.has(cacheKey) &&
      this.#routeModuleResultCache.size >= MAX_ROUTE_MODULE_RESULT_CACHE_ENTRIES
    ) {
      const oldestKey = this.#routeModuleResultCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.#routeModuleResultCache.delete(oldestKey);
      }
    }

    const result = this.#runInWorker(task).catch(error => {
      if (this.#routeModuleResultCache.get(cacheKey)?.result === result) {
        this.#routeModuleResultCache.delete(cacheKey);
      }
      if (isWorkerStartupError(error)) {
        return executeRouteTransformTask(task, this.options);
      }
      throw error;
    });
    this.#routeModuleResultCache.set(cacheKey, {
      source: task.code,
      result,
    });
    return result;
  }

  #runInWorker(task: RouteTransformTask): Promise<RouteTransformResult> {
    const workerIndex = this.#getWorkerIndex(task);
    const state = this.#workers[workerIndex];
    if (!state) {
      return executeRouteTransformTask(task, this.options);
    }
    if (state.startupError) {
      return Promise.reject(state.startupError);
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
      state.worker.postMessage({
        id,
        task: requestTask,
        sourceCacheKey,
      } satisfies WorkerRequest);
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

    if (
      !state.sourceCache.has(sourceCacheKey) &&
      state.sourceCache.size >= MAX_WORKER_SOURCE_CACHE_ENTRIES
    ) {
      const oldestKey = state.sourceCache.keys().next().value;
      if (oldestKey !== undefined) {
        state.sourceCache.delete(oldestKey);
      }
    }
    state.sourceCache.set(sourceCacheKey, task.code);
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
  routeCount,
  splitRouteModules,
}: RouteTransformExecutorOptions = {}): RouteTransformExecutor => {
  const options = { routeChunkCache };
  const effectiveParallelTransforms = parallelTransforms ?? true;
  if (!effectiveParallelTransforms) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  const workerCount = getConfiguredWorkerCount(effectiveParallelTransforms, {
    routeCount,
    splitRouteModules,
  });
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
    Boolean(
      splitRouteModules &&
      typeof routeCount === 'number' &&
      routeCount >= DEFAULT_LARGE_ROUTE_MIN_ROUTES
    )
  );
};
