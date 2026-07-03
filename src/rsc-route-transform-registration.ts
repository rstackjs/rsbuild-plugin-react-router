import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RsbuildPlugin } from '@rsbuild/core';
import { resolve } from 'pathe';
import type { RouteChunkCache, RouteChunkConfig } from './route-chunks.js';
import type { Route } from './types.js';
import { transformRscRouteModule } from './rsc-route-transforms.js';

type RscRouteTransformProfiler = {
  record<T>(
    environmentName: string | undefined,
    label: string,
    resource: string,
    task: () => Promise<T>
  ): Promise<T>;
};

const mdxRoutePattern = /\.mdx?$/i;
const RSC_ROUTE_TRANSFORM_LOADER = 'react-router-rsc-route-transform';

const getRscRouteTransformLoaderPath = (): string =>
  join(
    dirname(fileURLToPath(import.meta.url)),
    import.meta.url.endsWith('.cjs')
      ? 'rsc-route-transform-loader.cjs'
      : 'rsc-route-transform-loader.js'
  );

export const registerReactRouterRscRouteTransforms = ({
  api,
  isBuild,
  performanceProfiler,
  routeByFilePath,
  routeChunkCache,
  routeChunkConfig,
}: {
  api: Parameters<RsbuildPlugin['setup']>[0];
  isBuild: boolean;
  performanceProfiler: RscRouteTransformProfiler;
  routeByFilePath: Map<string, Route>;
  routeChunkCache: RouteChunkCache;
  routeChunkConfig: RouteChunkConfig;
}): void => {
  const transformRoute = async (
    args: Parameters<Parameters<typeof api.transform>[1]>[0]
  ) => {
    const route = routeByFilePath.get(resolve(args.resourcePath));
    if (!route) {
      return { code: args.code };
    }

    return performanceProfiler.record(
      args.environment?.name,
      'rsc:route',
      args.resource,
      () =>
        transformRscRouteModule({
          code: args.code,
          resourcePath: args.resourcePath,
          resourceQuery: args.resourceQuery,
          isRootRoute: route.id === 'root',
          routeId: route.id,
          routeChunkCache,
          routeChunkConfig,
          isServerEnvironment: args.environment.name === 'node',
          isDev: !isBuild,
        })
    );
  };

  api.transform(
    {
      test: path =>
        routeByFilePath.has(resolve(path)) && !mdxRoutePattern.test(path),
      order: 'pre',
    },
    transformRoute
  );

  api.modifyBundlerChain((chain, { CHAIN_ID, environment }) => {
    if (!chain.module.rules.has('mdx')) {
      return;
    }

    chain.plugin(`${RSC_ROUTE_TRANSFORM_LOADER}-${environment.name}`).use(
      class ReactRouterRscRouteTransformPlugin {
        apply(compiler: {
          __reactRouterRscRouteTransform?: typeof transformRoute;
          hooks: {
            thisCompilation: {
              tap(
                name: string,
                handler: (compilation: {
                  hooks: {
                    childCompiler: {
                      tap(
                        name: string,
                        handler: (childCompiler: {
                          __reactRouterRscRouteTransform?: typeof transformRoute;
                        }) => void
                      ): void;
                    };
                  };
                }) => void
              ): void;
            };
          };
        }) {
          compiler.__reactRouterRscRouteTransform = transformRoute;
          compiler.hooks.thisCompilation.tap(
            RSC_ROUTE_TRANSFORM_LOADER,
            compilation => {
              compilation.hooks.childCompiler.tap(
                RSC_ROUTE_TRANSFORM_LOADER,
                childCompiler => {
                  childCompiler.__reactRouterRscRouteTransform = transformRoute;
                }
              );
            }
          );
        }
      }
    );

    const mdxRule = chain.module.rules.get('mdx');
    const rscRouteTransformLoaderPath = getRscRouteTransformLoaderPath();
    const use = mdxRule
      .use(RSC_ROUTE_TRANSFORM_LOADER)
      .loader(rscRouteTransformLoaderPath)
      .options({
        environmentName: environment.name,
      });

    if (mdxRule.uses.has('mdx')) {
      use.before('mdx');
    }

    if (!mdxRule.uses.has(CHAIN_ID.USE.SWC)) {
      const jsRule = chain.module.rules.get(CHAIN_ID.RULE.JS);
      const jsMainRule = jsRule?.oneOfs.get(CHAIN_ID.ONE_OF.JS_MAIN);
      const jsSwcUse = jsMainRule?.uses.get(CHAIN_ID.USE.SWC);
      if (jsSwcUse) {
        const mdxSwcUse = mdxRule.use(CHAIN_ID.USE.SWC);
        const swcLoader = jsSwcUse.get('loader');
        const swcOptions = jsSwcUse.get('options');
        if (swcLoader) {
          mdxSwcUse.loader(swcLoader);
        }
        if (swcOptions) {
          mdxSwcUse.options(swcOptions);
        }
        mdxSwcUse.before(RSC_ROUTE_TRANSFORM_LOADER);
      }
    }
  });
};
