import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
  type RouteTransformTaskOptions,
} from './route-transform-tasks.js';

const AUTO_PARALLEL_ROUTE_THRESHOLD = 256;

export const shouldParallelizeRouteTransforms = (routeCount: number): boolean =>
  routeCount >= AUTO_PARALLEL_ROUTE_THRESHOLD;

export type RouteTransformExecutorOptions = RouteTransformTaskOptions;

export type RouteTransformExecutor = {
  run: (task: RouteTransformTask) => Promise<RouteTransformResult>;
  prewarm: () => void;
  close: () => Promise<void>;
};

export const createRouteTransformExecutor = (
  options: RouteTransformExecutorOptions = {}
): RouteTransformExecutor => ({
  run: task => executeRouteTransformTask(task, options),
  prewarm: () => {},
  close: async () => {},
});
