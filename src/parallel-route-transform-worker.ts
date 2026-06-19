import { parentPort } from 'node:worker_threads';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
} from './route-transform-tasks.js';

type CachedRouteTransformTask = Omit<RouteTransformTask, 'code'> & {
  code?: string;
};

type WorkerRequest = {
  id: number;
  task: RouteTransformTask | CachedRouteTransformTask;
  sourceCacheKey?: string;
};

type WorkerErrorPayload = {
  name?: string;
  message: string;
  stack?: string;
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

const serializeError = (error: unknown): WorkerErrorPayload => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    message: String(error),
  };
};

if (!parentPort) {
  throw new Error('parallel route transform worker requires parentPort');
}

const MAX_SOURCE_CACHE_ENTRIES = 2048;
const sourceCache = new Map<string, string>();

const setSourceCacheEntry = (key: string, code: string) => {
  if (!sourceCache.has(key) && sourceCache.size >= MAX_SOURCE_CACHE_ENTRIES) {
    const oldestKey = sourceCache.keys().next().value;
    if (oldestKey !== undefined) {
      sourceCache.delete(oldestKey);
    }
  }
  sourceCache.set(key, code);
};

const hydrateTaskSource = ({
  task,
  sourceCacheKey,
}: Pick<WorkerRequest, 'task' | 'sourceCacheKey'>): RouteTransformTask => {
  if (!sourceCacheKey) {
    return task as RouteTransformTask;
  }

  if (typeof task.code === 'string') {
    setSourceCacheEntry(sourceCacheKey, task.code);
    return task as RouteTransformTask;
  }

  const code = sourceCache.get(sourceCacheKey);
  if (code === undefined) {
    throw new Error(
      `Missing cached route transform source for ${sourceCacheKey}.`
    );
  }
  return {
    ...task,
    code,
  } as RouteTransformTask;
};

parentPort.on(
  'message',
  async ({ id, task, sourceCacheKey }: WorkerRequest) => {
    try {
      const hydratedTask = hydrateTaskSource({ task, sourceCacheKey });
      const result = await executeRouteTransformTask(hydratedTask);
      parentPort?.postMessage({
        id,
        ok: true,
        result,
      } satisfies WorkerResponse);
    } catch (error) {
      parentPort?.postMessage({
        id,
        ok: false,
        error: serializeError(error),
      } satisfies WorkerResponse);
    }
  }
);
