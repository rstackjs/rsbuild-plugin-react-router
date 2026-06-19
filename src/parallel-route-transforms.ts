import { availableParallelism, cpus } from 'node:os';
import { Worker } from 'node:worker_threads';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
  type RouteTransformTaskOptions,
} from './route-transform-tasks.js';
import type { PluginOptions } from './types.js';

export type ParallelTransformsConfig = NonNullable<
  PluginOptions['parallelTransforms']
> extends infer Config
  ? Exclude<Config, false>
  : never;

export type RouteTransformExecutorOptions = RouteTransformTaskOptions & {
  parallelTransforms?: PluginOptions['parallelTransforms'];
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
};

class WorkerStartupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerStartupError';
  }
}

const DEFAULT_MAX_WORKERS = 8;

const getDefaultWorkerCount = (): number => {
  const cpuCount =
    typeof availableParallelism === 'function'
      ? availableParallelism()
      : cpus().length;
  return Math.max(1, Math.min(DEFAULT_MAX_WORKERS, cpuCount));
};

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

class ParallelRouteTransformExecutor implements RouteTransformExecutor {
  #closed = false;
  #nextId = 1;
  #workers: WorkerState[];

  constructor(
    workerCount: number,
    private readonly options: RouteTransformTaskOptions
  ) {
    this.#workers = Array.from({ length: workerCount }, () =>
      this.#createWorkerState()
    );
  }

  async run(task: RouteTransformTask): Promise<RouteTransformResult> {
    if (this.#closed) {
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
      for (const pending of state.pending.values()) {
        pending.reject(startupError);
      }
      state.pending.clear();
    });

    return state;
  }

  #runInWorker(task: RouteTransformTask): Promise<RouteTransformResult> {
    const workerIndex =
      hashString(task.resourcePath) % Math.max(1, this.#workers.length);
    const state = this.#workers[workerIndex];
    if (!state) {
      return executeRouteTransformTask(task, this.options);
    }

    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      state.pending.set(id, { resolve, reject });
      state.worker.postMessage({ id, task });
    });
  }
}

export const createRouteTransformExecutor = ({
  parallelTransforms,
  routeChunkCache,
}: RouteTransformExecutorOptions = {}): RouteTransformExecutor => {
  const options = { routeChunkCache };
  if (!parallelTransforms) {
    return {
      run: task => executeRouteTransformTask(task, options),
      close: async () => {},
    };
  }

  const workerCount = getConfiguredWorkerCount(parallelTransforms);
  return new ParallelRouteTransformExecutor(workerCount, options);
};
