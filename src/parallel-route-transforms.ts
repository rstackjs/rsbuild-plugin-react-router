import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteTransformTask,
  type RouteTransformTaskOptions,
} from './route-transform-tasks.js';

const AUTO_PARALLEL_ROUTE_THRESHOLD = 256;

export const shouldParallelizeRouteTransforms = (routeCount: number): boolean =>
  routeCount >= AUTO_PARALLEL_ROUTE_THRESHOLD;

export type RouteTransformRunnerOptions = RouteTransformTaskOptions;

export type RouteTransformRunner = (
  task: RouteTransformTask
) => Promise<RouteTransformResult>;

export const createRouteTransformRunner =
  (options: RouteTransformRunnerOptions = {}): RouteTransformRunner =>
  task =>
    executeRouteTransformTask(task, options);
