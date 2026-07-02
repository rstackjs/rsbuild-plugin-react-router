import { Worker } from 'node:worker_threads';
import { setBoundedCacheEntry } from './bounded-cache.js';
import { getAvailableCpuCount, getDefaultConcurrency } from './concurrency.js';
import { normalizeEffectError } from './effect-runtime.js';
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

export type ParallelRouteTransformConfig =
  NonNullable<PluginOptions['parallelRouteTransform']> extends infer Config
    ? Exclude<Config, false>
    : never;

export type RouteTransformExecutorOptions = RouteTransformTaskOptions & {
  parallelRouteTransform?: PluginOptions['parallelRouteTransform'];
  splitRouteModules?: boolean;
  isBuild?: boolean;
};

export type RouteTransformExecutor = {
  run: (task: RouteTransformTask) => Promise<RouteTransformResult>;
  prewarm: () => void;
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
const MAX_ROUTE_SOURCE_WORKER_ENTRIES = 4096;
const AUTO_PARALLEL_ROUTE_THRESHOLD = 256;
const DEFAULT_WORKER_COUNT_LIMIT = 2;
// Benchmarked on a 4-core cpuset: in dev (large-355 fixture) a single worker
// recovered no wall time while worker startup and IPC cost ~0.5s of
// dev-server ready (9.09s -> 8.57s median when disabled), so small machines
// run dev transforms inline. Production builds are different: at 1024 routes
// the transform volume is large enough that two workers beat inline by ~8%
// (synthetic-1024-ssr-esm build, 4.46s inline vs 4.09s with workers), so
// builds keep the default worker count even on small machines.
const SMALL_MACHINE_CPU_COUNT = 4;

export const getDefaultWorkerCount = (
  cpuCount?: number,
  { isBuild = false }: { isBuild?: boolean } = {}
): number => {
  const resolvedCpuCount = cpuCount ?? getAvailableCpuCount();
  if (!isBuild && resolvedCpuCount <= SMALL_MACHINE_CPU_COUNT) {
    return 0;
  }
  return Math.min(
    getDefaultConcurrency(resolvedCpuCount),
    DEFAULT_WORKER_COUNT_LIMIT
  );
};

export const shouldParallelizeRouteTransforms = (routeCount: number): boolean =>
  routeCount >= AUTO_PARALLEL_ROUTE_THRESHOLD;

const getConfiguredWorkerCount = (
  parallelRouteTransform: ParallelRouteTransformConfig,
  isBuild: boolean
): number => {
  if (parallelRouteTransform === true) {
    return getDefaultWorkerCount(undefined, { isBuild });
  }

  if (!Number.isInteger(parallelRouteTransform) || parallelRouteTransform < 1) {
    throw new Error(
      '[react-router] parallelRouteTransform must be true, false, or a positive integer.'
    );
  }
  return parallelRouteTransform;
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

const createWorkerStartupError = (error: unknown): WorkerStartupError => {
  const normalized = normalizeEffectError(error);
  const startupError = new WorkerStartupError(normalized.message);
  startupError.stack = normalized.stack;
  return startupError;
};

const rejectPendingTasks = (state: WorkerState, error: Error): void => {
  for (const pending of state.pending.values()) {
    pending.reject(error);
  }
  state.pending.clear();
};

const createInlineRouteTransformExecutor = (
  options: RouteTransformTaskOptions
): RouteTransformExecutor => ({
  run: task => executeRouteTransformTask(task, options),
  prewarm: () => {},
  close: async () => {},
});

class ParallelRouteTransformExecutor implements RouteTransformExecutor {
  #closed = false;
  #closePromise: Promise<void> | undefined;
  #workersDisabled = false;
  #nextId = 1;
  #nextRouteSourceWorkerIndex = 0;
  #routeSourceWorkers = new Map<string, number>();
  #workers: Array<WorkerState | undefined> | undefined;
  #prewarmScheduled = false;

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

  prewarm(): void {
    if (this.#prewarmScheduled || this.#closed || this.#workersDisabled) {
      return;
    }
    this.#prewarmScheduled = true;
    void this.#prewarmWorkers();
  }

  async #prewarmWorkers(): Promise<void> {
    try {
      for (let index = 0; index < this.workerCount; index += 1) {
        if (this.#closed || this.#workersDisabled) {
          return;
        }
        try {
          this.#getWorker(index);
        } catch (error) {
          this.#disableWorkers(createWorkerStartupError(error));
          return;
        }
      }
    } finally {
      this.#prewarmScheduled = false;
    }
  }

  close(): Promise<void> {
    if (this.#closePromise) {
      return this.#closePromise;
    }
    this.#closed = true;
    const workers = (this.#workers ?? []).filter(
      (state): state is WorkerState => Boolean(state)
    );
    this.#workers = [];
    this.#closePromise = Promise.all(
      workers.map(async state => {
        rejectPendingTasks(state, new Error('Route transform worker closed.'));
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
    const workers = (this.#workers ?? []).filter(
      (state): state is WorkerState => Boolean(state)
    );
    this.#workers = [];
    for (const state of workers) {
      rejectPendingTasks(state, error);
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
      this.#disableWorkers(createWorkerStartupError(error));
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

  #getWorker(index: number): WorkerState | undefined {
    if (this.#closed || this.#workersDisabled) {
      return undefined;
    }
    this.#workers ??= new Array(this.workerCount);
    const existingWorker = this.#workers[index];
    if (existingWorker) {
      return existingWorker;
    }

    const worker = this.#createWorkerState();
    this.#workers[index] = worker;
    return worker;
  }

  #runInWorker(task: RouteTransformTask): Promise<RouteTransformResult> {
    const workerIndex = this.#getWorkerIndex(task, this.workerCount);
    const state = this.#getWorker(workerIndex);
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
        reject(normalizeEffectError(error));
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
      return this.#getRouteSourceWorkerIndex(
        task.resourcePath,
        safeWorkerCount
      );
    }
    if (
      this.balanceRouteModuleTransforms &&
      task.kind === 'routeModule' &&
      !(task.environmentName === 'web' && !task.ssr && task.isSpaMode)
    ) {
      return this.#getRouteSourceWorkerIndex(
        task.resourcePath,
        safeWorkerCount
      );
    }
    return hashString(task.resourcePath) % safeWorkerCount;
  }

  #getRouteSourceWorkerIndex(
    resourcePath: string,
    safeWorkerCount: number
  ): number {
    const existingWorkerIndex = this.#routeSourceWorkers.get(resourcePath);
    if (existingWorkerIndex !== undefined) {
      this.#routeSourceWorkers.delete(resourcePath);
      this.#routeSourceWorkers.set(resourcePath, existingWorkerIndex);
      return existingWorkerIndex % safeWorkerCount;
    }
    const workerIndex = this.#nextRouteSourceWorkerIndex % safeWorkerCount;
    this.#nextRouteSourceWorkerIndex += 1;
    setBoundedCacheEntry(
      this.#routeSourceWorkers,
      resourcePath,
      workerIndex,
      MAX_ROUTE_SOURCE_WORKER_ENTRIES
    );
    return workerIndex;
  }
}

export const createRouteTransformExecutor = ({
  parallelRouteTransform,
  routeChunkCache,
  splitRouteModules,
  isBuild,
}: RouteTransformExecutorOptions = {}): RouteTransformExecutor => {
  return createRouteTransformExecutorWithWorkerFactory(
    {
      parallelRouteTransform,
      routeChunkCache,
      splitRouteModules,
      isBuild,
    },
    createDefaultWorker
  );
};

const createRouteTransformExecutorWithWorkerFactory = (
  {
    parallelRouteTransform,
    routeChunkCache,
    splitRouteModules,
    isBuild,
  }: RouteTransformExecutorOptions = {},
  createWorker: RouteTransformWorkerFactory
): RouteTransformExecutor => {
  const options = { routeChunkCache };
  if (
    parallelRouteTransform === undefined ||
    parallelRouteTransform === false
  ) {
    return createInlineRouteTransformExecutor(options);
  }

  const workerCount = getConfiguredWorkerCount(
    parallelRouteTransform,
    Boolean(isBuild)
  );
  if (workerCount < 1) {
    return createInlineRouteTransformExecutor(options);
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
