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
type LoaderInputSourceMap = Parameters<
  LoaderDefinition<RouteModuleTransformLoaderOptions>
>[1];
type RawLoaderSourceMap = Exclude<LoaderInputSourceMap, string | undefined>;

const LOADER_PERFORMANCE_FLUSH_DELAY_MS = 50;
const performanceWorkerId = `process-${process.pid}:thread-${threadId}`;

const composeSourceMaps = (
  generatedMap: SourceMapInput,
  inputSourceMap: SourceMapInput
): RawLoaderSourceMap =>
  JSON.parse(
    remapping([generatedMap, inputSourceMap], () => null).toString()
  ) as RawLoaderSourceMap;

const performanceProfilersByScope = new Map<
  string,
  Map<string, ReturnType<typeof createReactRouterPerformanceProfiler>>
>();
let performanceFlushTimer: ReturnType<typeof setTimeout> | undefined;

const getPerformanceProfiler = (
  scopeId: string,
  environment: string | undefined
): ReturnType<typeof createReactRouterPerformanceProfiler> => {
  let profilers = performanceProfilersByScope.get(scopeId);
  if (!profilers) {
    profilers = new Map();
    performanceProfilersByScope.set(scopeId, profilers);
  }
  const environmentKey = environment ?? 'unknown';
  let profiler = profilers.get(environmentKey);
  if (!profiler) {
    profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => console.info(message),
    });
    profilers.set(environmentKey, profiler);
  }
  return profiler;
};

export const flushRouteModuleTransformLoaderPerformance = (): void => {
  if (performanceFlushTimer) {
    clearTimeout(performanceFlushTimer);
    performanceFlushTimer = undefined;
  }

  for (const profilers of performanceProfilersByScope.values()) {
    for (const [environment, profiler] of profilers) {
      profiler.flush(environment === 'unknown' ? undefined : environment, {
        partial: true,
        workerId: performanceWorkerId,
      });
    }
  }
  performanceProfilersByScope.clear();
};

const schedulePerformanceFlush = (): void => {
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
        ? await getPerformanceProfiler(
            options.performanceScopeId,
            options.environmentName
          ).record(
            options.environmentName,
            'route:module',
            this.resource,
            transform
          )
        : await transform();

      const outputSourceMap =
        result.map && inputSourceMap
          ? composeSourceMaps(
              result.map as SourceMapInput,
              inputSourceMap as SourceMapInput
            )
          : result.map;
      callback(null, result.code, outputSourceMap ?? undefined);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    } finally {
      if (options.logPerformance) {
        schedulePerformanceFlush();
      }
    }
  };

export default routeModuleTransformLoader;
