import { parentPort } from 'node:worker_threads';
import { setBoundedCacheEntry } from './bounded-cache.js';
import {
  executeRouteTransformTask,
  type RouteTransformTask,
} from './route-transform-tasks.js';
import type {
  WorkerErrorPayload,
  WorkerRequest,
  WorkerResponse,
} from './parallel-route-transform-protocol.js';

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

const hydrateTaskSource = ({
  task,
  sourceCacheKey,
}: Pick<WorkerRequest, 'task' | 'sourceCacheKey'>): RouteTransformTask => {
  if (!sourceCacheKey) {
    return task as RouteTransformTask;
  }

  if (typeof task.code === 'string') {
    setBoundedCacheEntry(
      sourceCache,
      sourceCacheKey,
      task.code,
      MAX_SOURCE_CACHE_ENTRIES
    );
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
