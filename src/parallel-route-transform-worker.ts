import { parentPort } from 'node:worker_threads';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
} from './route-transform-tasks.js';

type WorkerRequest = {
  id: number;
  task: RouteTransformTask;
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

parentPort.on('message', async ({ id, task }: WorkerRequest) => {
  try {
    const result = await executeRouteTransformTask(task);
    parentPort?.postMessage({ id, ok: true, result } satisfies WorkerResponse);
  } catch (error) {
    parentPort?.postMessage({
      id,
      ok: false,
      error: serializeError(error),
    } satisfies WorkerResponse);
  }
});
