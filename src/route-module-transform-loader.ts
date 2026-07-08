import type { LoaderDefinition } from '@rspack/core';
import {
  createSingleOperationPerformanceReport,
  formatReactRouterPerformanceReport,
} from './performance.js';
import { executeRouteTransformTask } from './route-transform-tasks.js';

export type RouteModuleTransformLoaderOptions = {
  environmentName: string;
  logPerformance: boolean;
  ssr: boolean;
  isBuild: boolean;
  isSpaMode: boolean;
  rootRoutePath: string | null;
};

type LoaderContextWithSourceMap = ThisParameterType<
  LoaderDefinition<RouteModuleTransformLoaderOptions>
> & {
  sourceMap?: boolean;
};

const routeModuleTransformLoader: LoaderDefinition<RouteModuleTransformLoaderOptions> =
  async function routeModuleTransformLoader(
    this: LoaderContextWithSourceMap,
    source
  ) {
    const callback = this.async();
    const options = this.getOptions();
    const startMs = options.logPerformance ? performance.now() : 0;

    try {
      const result = await (async () => {
        try {
          return await executeRouteTransformTask({
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
          });
        } finally {
          if (options.logPerformance) {
            console.info(
              formatReactRouterPerformanceReport(
                createSingleOperationPerformanceReport({
                  environment: options.environmentName,
                  operation: 'route:module',
                  resource: this.resource,
                  durationMs: performance.now() - startMs,
                })
              )
            );
          }
        }
      })();

      callback(null, result.code, result.map ?? undefined);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  };

export default routeModuleTransformLoader;
