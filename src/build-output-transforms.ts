import type { RsbuildPluginAPI, TransformHandler } from '@rsbuild/core';
import jsesc from 'jsesc';
import { relative } from 'pathe';
import { PLUGIN_NAME } from './constants.js';
import {
  createReactRouterManifestOptions,
  getReactRouterManifestForDev,
  type ReactRouterManifestForDev as ReactRouterManifest,
  type RouteChunkManifestOptions,
  type RouteModuleAnalysisProvider,
  type ReactRouterManifestStats,
} from './manifest.js';
import type { RouteTransformExecutor } from './parallel-route-transforms.js';
import type { ReactRouterPerformanceProfiler } from './performance.js';
import { createBundlerRouteExportResolver } from './route-export-resolution.js';
import {
  getRouteChunkNameFromModuleId,
  type RouteChunkConfig,
} from './route-chunks.js';
import type { PluginOptions, Route } from './types.js';
import { isSourceMapEnabled } from './warnings/warn-on-client-source-maps.js';
import {
  analyzeRouteModuleCode,
  type RouteModuleAnalysis,
} from './export-utils.js';
import {
  relocateServerAssetsToClient,
  type RelocatableAssetCompilation,
} from './ssr-asset-relocation.js';

/**
 * Register the node-compilation hook that relocates server-only static assets
 * (`?url` imports, `.css?url` files, and other `asset/resource` outputs
 * referenced only by loaders or `.server` modules) into the client build. The
 * loader/`links()` export returns the asset URL to the client, which fetches it
 * from `build/client` at runtime, so the file must exist there even though only
 * the node compilation referenced it. The assets are also stripped from the
 * server build to avoid shipping duplicate static files, mirroring upstream
 * React Router's Vite plugin. This runs for every node compilation, so it also
 * covers `serverBundles` (multiple node outputs) and dev mode (where
 * `writeToDisk` is enabled).
 *
 * Registered by both the classic build-output transforms and the RSC branch so
 * `.css?url`/`?url` assets referenced from `links()` resolve in RSC framework
 * mode too.
 */
export const registerSsrAssetRelocation = ({
  api,
  outputClientPath,
  performanceProfiler,
}: {
  api: RsbuildPluginAPI;
  outputClientPath: string;
  performanceProfiler: ReactRouterPerformanceProfiler;
}): void => {
  const relocatedDestinations = new Map<string, string>();
  api.processAssets(
    { stage: 'report', targets: ['node'] },
    async ({ compilation }) => {
      await performanceProfiler.record(
        'node',
        'assets:relocate-ssr-only',
        'ssr-only-assets',
        () =>
          relocateServerAssetsToClient({
            compilation: compilation as unknown as RelocatableAssetCompilation,
            outputClientPath,
            relocatedDestinations,
          })
      );
    }
  );
};

type RegisterBuildOutputTransformsOptions = {
  api: RsbuildPluginAPI;
  resolvedServerOutput: 'module' | 'commonjs';
  performanceProfiler: ReactRouterPerformanceProfiler;
  getLatestServerManifest: () => ReactRouterManifest | null;
  getLatestServerManifestByBundleId: (
    bundleId: string
  ) => ReactRouterManifest | undefined;
  routes: Record<string, Route>;
  pluginOptions: PluginOptions;
  getClientStats: () => ReactRouterManifestStats | undefined;
  appDirectory: string;
  getAssetPrefix: () => string;
  routeChunkOptions: RouteChunkManifestOptions | undefined;
  routeModuleAnalysis?: RouteModuleAnalysisProvider;
  routeTransformExecutor: RouteTransformExecutor;
  routeByFilePath: Map<string, Route>;
  routeChunkConfig: RouteChunkConfig;
  isBuild: boolean;
  splitRouteModules: boolean;
  ssr: boolean;
  isSpaMode: boolean;
  rootRoutePath: string;
  outputClientPath: string;
  devHmrEnabled?: boolean;
  onRouteModuleAnalysis?: (
    resourcePath: string,
    analysis: RouteModuleAnalysis
  ) => void;
};

export const registerBuildOutputTransforms = ({
  api,
  resolvedServerOutput,
  performanceProfiler,
  getLatestServerManifest,
  getLatestServerManifestByBundleId,
  routes,
  pluginOptions,
  getClientStats,
  appDirectory,
  getAssetPrefix,
  routeChunkOptions,
  routeModuleAnalysis,
  routeTransformExecutor,
  routeByFilePath,
  routeChunkConfig,
  isBuild,
  splitRouteModules,
  ssr,
  isSpaMode,
  rootRoutePath,
  outputClientPath,
  devHmrEnabled,
  onRouteModuleAnalysis,
}: RegisterBuildOutputTransformsOptions): void => {
  const rememberRouteModuleAnalysis = (
    args: Parameters<TransformHandler>[0]
  ): void => {
    if (!routeByFilePath.has(args.resourcePath)) {
      return;
    }
    onRouteModuleAnalysis?.(
      args.resourcePath,
      analyzeRouteModuleCode(args.code)
    );
  };

  const transformRouteModule = async (
    args: Parameters<TransformHandler>[0]
  ) => {
    return performanceProfiler.record(
      args.environment?.name,
      'route:module',
      args.resource,
      async () =>
        routeTransformExecutor.run({
          kind: 'routeModule',
          code: args.code,
          resource: args.resource,
          resourcePath: args.resourcePath,
          environmentName: args.environment.name,
          sourceMaps: isSourceMapEnabled(
            args.environment.config.output.sourceMap
          ),
          ssr,
          isBuild,
          isSpaMode,
          rootRoutePath,
          devHmr: devHmrEnabled,
        })
    );
  };

  api.processAssets(
    { stage: 'additional', targets: ['node'] },
    ({ sources, compilation }) => {
      const packageJsonPath = 'package.json';
      const source = new sources.RawSource(
        `{"type": "${resolvedServerOutput}"}`
      );

      if (compilation.getAsset(packageJsonPath)) {
        compilation.updateAsset(packageJsonPath, source);
      } else {
        compilation.emitAsset(packageJsonPath, source);
      }
    }
  );

  registerSsrAssetRelocation({ api, outputClientPath, performanceProfiler });

  api.transform(
    {
      test: /virtual\/react-router\/(browser|server)-manifest/,
    },
    async args =>
      performanceProfiler.record(
        args.environment?.name,
        'manifest:transform',
        args.resource,
        async () => {
          if (args.environment.name === 'web') {
            return {
              code: `window.__reactRouterManifest = "PLACEHOLDER";`,
            };
          }

          const bundleMatch = args.resource.match(
            /virtual\/react-router\/server-manifest(?:-([^?]+))?/
          );
          const bundleId = bundleMatch?.[1]?.replace(/\.js$/, '');
          const latestServerManifest = getLatestServerManifest();
          const manifest =
            (latestServerManifest
              ? ((bundleId && getLatestServerManifestByBundleId(bundleId)) ??
                latestServerManifest)
              : null) ??
            (await getReactRouterManifestForDev(
              routes,
              pluginOptions,
              getClientStats(),
              appDirectory,
              getAssetPrefix(),
              createReactRouterManifestOptions({
                routeChunks: routeChunkOptions,
                routeModuleAnalysis,
              })
            ));
          return {
            code: `export default ${jsesc(manifest, { es6: true })};`,
          };
        }
      )
  );

  api.transform(
    {
      resourceQuery: /__react-router-build-client-route/,
      order: 'post',
    },
    async args => {
      rememberRouteModuleAnalysis(args);
      return performanceProfiler.record(
        args.environment?.name,
        'route:client-entry',
        args.resource,
        async () =>
          routeTransformExecutor.run({
            kind: 'routeClientEntry',
            code: args.code,
            resourcePath: args.resourcePath,
            environmentName: args.environment?.name,
            isBuild,
            routeChunkConfig,
            routeId: routeByFilePath.get(args.resourcePath)?.id,
            devHmr: devHmrEnabled,
          })
      );
    }
  );

  api.transform(
    {
      resourceQuery: /route-chunk=/,
      environments: ['web'],
      order: 'post',
    },
    async args => {
      return performanceProfiler.record(
        args.environment?.name,
        'route:chunk',
        args.resource,
        async () => {
          const routeChunkArtifact = await routeTransformExecutor.run({
            kind: 'routeChunk',
            code: args.code,
            resource: args.resource,
            resourcePath: args.resourcePath,
            isBuild,
            routeChunkConfig,
          });

          // Invariant with the transformRouteModule registration below: in
          // split-chunk production builds, web route modules are transformed
          // HERE (on the main chunk) and the shared registration is scoped to
          // ['node']. If either gate changes, web modules get transformed
          // twice or not at all.
          if (
            !isBuild ||
            getRouteChunkNameFromModuleId(args.resource) !== 'main'
          ) {
            return routeChunkArtifact;
          }

          return routeTransformExecutor.run({
            kind: 'routeModule',
            code: routeChunkArtifact.code,
            resource: args.resource,
            resourcePath: args.resourcePath,
            environmentName: 'web',
            sourceMaps: isSourceMapEnabled(
              args.environment.config.output.sourceMap
            ),
            ssr,
            isBuild,
            isSpaMode,
            rootRoutePath,
          });
        }
      );
    }
  );

  if (isBuild && splitRouteModules) {
    api.transform(
      {
        test: path => routeByFilePath.has(path),
        resourceQuery: {
          not: /__react-router-build-client-route|react-router-route|route-chunk=/,
        },
        environments: ['web'],
        order: 'post',
      },
      async args => {
        return performanceProfiler.record(
          args.environment?.name,
          'route:split-exports',
          args.resource,
          async () =>
            routeTransformExecutor.run({
              kind: 'splitRouteExports',
              code: args.code,
              resourcePath: args.resourcePath,
              routeChunkConfig,
            })
        );
      }
    );
  }

  api.transform(
    {
      test: /[\\/]\.server[\\/]|\.server(\.[cm]?[jt]sx?)?$/,
      environments: ['web'],
    },
    async args =>
      performanceProfiler.record(
        args.environment?.name,
        'module:server-only-guard',
        args.resource,
        async () => {
          const relativePath = relative(process.cwd(), args.resourcePath);
          throw new Error(
            `[${PLUGIN_NAME}] Server-only module referenced by client: ${relativePath}`
          );
        }
      )
  );

  api.transform(
    {
      test: /[\\/]\.client[\\/]|\.client(\.[cm]?[jt]sx?)?$/,
      environments: ['node'],
    },
    async args =>
      performanceProfiler.record(
        args.environment?.name,
        'module:client-only-stub',
        args.resource,
        async () => {
          return routeTransformExecutor.run({
            kind: 'clientOnlyStub',
            code: args.code,
            resourcePath: args.resourcePath,
            resolveExportAllModule:
              typeof args.resolve === 'function'
                ? createBundlerRouteExportResolver(args.resolve)
                : undefined,
          });
        }
      )
  );

  api.transform(
    {
      resourceQuery: /\?react-router-route/,
      order: 'post',
    },
    transformRouteModule
  );

  api.transform(
    {
      test: path => routeByFilePath.has(path),
      resourceQuery: {
        not: /__react-router-build-client-route|react-router-route|route-chunk=/,
      },
      // Invariant with the route-chunk= handler above: when split-chunk
      // production builds transform web modules on the main chunk, this
      // registration must stay scoped to ['node'] so web modules are not
      // transformed twice.
      environments: isBuild && splitRouteModules ? ['node'] : undefined,
      order: 'post',
    },
    transformRouteModule
  );
};
