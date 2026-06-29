import type {
  RouteTransformResult,
  RouteTransformTask,
} from './route-transform-tasks.js';

type WithoutRequiredSource<Task> = Task extends RouteTransformTask
  ? Omit<Task, 'code'> & { code?: string }
  : never;

export type CachedRouteTransformTask =
  WithoutRequiredSource<RouteTransformTask>;

export type WorkerRequest = {
  id: number;
  task: RouteTransformTask | CachedRouteTransformTask;
  sourceCacheKey?: string;
};

export type WorkerErrorPayload = {
  name?: string;
  message: string;
  stack?: string;
};

export type WorkerResponse =
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
