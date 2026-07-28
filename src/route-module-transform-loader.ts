import { threadId } from 'node:worker_threads';
import remapping, { type SourceMapInput } from '@jridgewell/remapping';
import type { LoaderDefinition } from '@rspack/core';
import { createReactRouterPerformanceProfiler } from './performance.js';
import { executeRouteTransformTask } from './route-transform-tasks.js';

export type RouteModuleTransformLoaderOptions = {
  environmentName: string;
  performanceScopeId: string;
  logPerformance: boolean;
  ssr: boolean;
  isBuild: boolean;
  isSpaMode: boolean;
  rootRoutePath: string | null;
  devHmr: boolean;
};

type LoaderContextWithSourceMap = ThisParameterType<
  LoaderDefinition<RouteModuleTransformLoaderOptions>
> & {
  sourceMap?: boolean;
};

const LOADER_PERFORMANCE_FLUSH_DELAY_MS = 50;
const performanceWorkerId = `process-${process.pid}:thread-${threadId}`;

const routeModuleTransformLoaderPerformanceProfilers = new Map<
  string,
  ReturnType<typeof createReactRouterPerformanceProfiler>
>();
const pendingPerformanceFlushKeys = new Set<string>();
let performanceFlushTimer: ReturnType<typeof setTimeout> | undefined;

const getPerformanceFlushKey = (
  scopeId: string,
  environment: string | undefined
): string => `${scopeId}\0${environment ?? 'unknown'}`;

const getRouteModuleTransformLoaderPerformanceProfiler = (scopeId: string) => {
  let profiler = routeModuleTransformLoaderPerformanceProfilers.get(scopeId);
  if (!profiler) {
    profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => console.info(message),
    });
    routeModuleTransformLoaderPerformanceProfilers.set(scopeId, profiler);
  }
  return profiler;
};

export const flushRouteModuleTransformLoaderPerformance = (): void => {
  if (performanceFlushTimer) {
    clearTimeout(performanceFlushTimer);
    performanceFlushTimer = undefined;
  }

  for (const key of pendingPerformanceFlushKeys) {
    const [scopeId, environment] = key.split('\0');
    const profiler =
      routeModuleTransformLoaderPerformanceProfilers.get(scopeId);
    profiler?.flush(environment === 'unknown' ? undefined : environment, {
      partial: true,
      workerId: performanceWorkerId,
    });
    routeModuleTransformLoaderPerformanceProfilers.delete(scopeId);
  }
  pendingPerformanceFlushKeys.clear();
};

const scheduleRouteModuleTransformLoaderPerformanceFlush = (
  scopeId: string,
  environment: string | undefined
): void => {
  pendingPerformanceFlushKeys.add(getPerformanceFlushKey(scopeId, environment));
  if (performanceFlushTimer) {
    clearTimeout(performanceFlushTimer);
  }
  performanceFlushTimer = setTimeout(
    flushRouteModuleTransformLoaderPerformance,
    LOADER_PERFORMANCE_FLUSH_DELAY_MS
  );
};

process.once('beforeExit', flushRouteModuleTransformLoaderPerformance);

const routeModuleTransformLoader: LoaderDefinition<RouteModuleTransformLoaderOptions> =
  async function routeModuleTransformLoader(
    this: LoaderContextWithSourceMap,
    source,
    inputSourceMap
  ) {
    const callback = this.async();
    const options = this.getOptions();

    const transform = () =>
      executeRouteTransformTask({
        kind: 'routeModule',
        code: String(source),
        resource: this.resource,
        resourcePath: this.resourcePath,
        environmentName: options.environmentName,
        sourceMaps: Boolean(this.sourceMap),
        ssr: options.ssr,
        isBuild: options.isBuild,
        isSpaMode: options.isSpaMode,
        rootRoutePath: options.rootRoutePath,
        devHmr: options.devHmr,
      });

    try {
      const result = options.logPerformance
        ? await getRouteModuleTransformLoaderPerformanceProfiler(
            options.performanceScopeId
          ).record(
            options.environmentName,
            'route:module',
            this.resource,
            transform
          )
        : await transform();

      const outputSourceMap =
        result.map && inputSourceMap
          ? JSON.parse(
              remapping(
                [
                  result.map as SourceMapInput,
                  (typeof inputSourceMap === 'string'
                    ? JSON.parse(inputSourceMap)
                    : inputSourceMap) as SourceMapInput,
                ],
                () => null
              ).toString()
            )
          : result.map;
      callback(null, result.code, outputSourceMap ?? undefined);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    } finally {
      if (options.logPerformance) {
        scheduleRouteModuleTransformLoaderPerformanceFlush(
          options.performanceScopeId,
          options.environmentName
        );
      }
    }
  };

export default routeModuleTransformLoader;
