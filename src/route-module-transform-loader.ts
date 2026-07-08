import type { LoaderDefinition } from '@rspack/core';
import { executeRouteTransformTask } from './route-transform-tasks.js';

export type RouteModuleTransformLoaderOptions = {
  environmentName: string;
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

    try {
      const result = await executeRouteTransformTask({
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

      callback(null, result.code, result.map ?? undefined);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  };

export default routeModuleTransformLoader;
