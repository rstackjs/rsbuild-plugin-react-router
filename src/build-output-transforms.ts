import { existsSync } from 'node:fs';
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
import type { ReactRouterPerformanceProfiler } from './performance.js';
import {
  validateSpaModeRouteExports,
  type RouteTransformRunner,
} from './route-transform-tasks.js';
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
  /** File holding the captured manifests; a dependency of the server-manifest module. */
  serverManifestStampPath: string;
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
  routeTransformRunner: RouteTransformRunner;
  routeByFilePath: Map<string, Route>;
  routeChunkConfig: RouteChunkConfig;
  isBuild: boolean;
  splitRouteModules: boolean;
  useRouteModuleTransformApi: boolean;
  ssr: boolean;
  isSpaMode: boolean;
  rootRoutePath: string;
  outputClientPath: string;
  isDevHmrEnabled?: () => boolean;
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
  serverManifestStampPath,
  getLatestServerManifestByBundleId,
  routes,
  pluginOptions,
  getClientStats,
  appDirectory,
  getAssetPrefix,
  routeChunkOptions,
  routeModuleAnalysis,
  routeTransformRunner,
  routeByFilePath,
  routeChunkConfig,
  isBuild,
  splitRouteModules,
  useRouteModuleTransformApi,
  ssr,
  isSpaMode,
  rootRoutePath,
  outputClientPath,
  isDevHmrEnabled = () => false,
  onRouteModuleAnalysis,
}: RegisterBuildOutputTransformsOptions): void => {
  const rememberRouteModuleAnalysis = (
    args: Parameters<TransformHandler>[0]
  ): void => {
    if (
      args.environment.name !== 'web' ||
      !routeByFilePath.has(args.resourcePath)
    ) {
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
        routeTransformRunner({
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
          devHmr: isDevHmrEnabled(),
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
      test: /virtual\/react-router\/(server-manifest|server-build)/,
      environments: ['node'],
    },
    async args =>
      performanceProfiler.record(
        args.environment?.name,
        'manifest:transform',
        args.resource,
        async () => {
          // Cache identity for a module whose source never changes (#136);
          // see `serverManifestStampPath` in index.ts.
          if (existsSync(serverManifestStampPath)) {
            args.addDependency(serverManifestStampPath);
          } else {
            args.addMissingDependency(serverManifestStampPath);
          }
          // The virtual server build contains the bundle's route table. A
          // partition change must invalidate it alongside the asset manifest.
          if (args.resource.includes('virtual/react-router/server-build')) {
            return { code: args.code };
          }
          const bundleMatch = args.resource.match(
            /virtual\/react-router\/server-manifest(?:-([^?]+))?/
          );
          const bundleId = bundleMatch?.[1]?.replace(/\.js$/, '');
          const latestServerManifest = getLatestServerManifest();
          if (isBuild && !latestServerManifest) {
            throw new Error(
              `[${PLUGIN_NAME}] Production server manifest requested before the browser manifest was finalized.`
            );
          }
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
          routeTransformRunner({
            kind: 'routeClientEntry',
            code: args.code,
            resourcePath: args.resourcePath,
            environmentName: args.environment?.name,
            isBuild,
            routeChunkConfig,
            routeId: routeByFilePath.get(args.resourcePath)?.id,
            devHmr: isDevHmrEnabled(),
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
          const routeChunkName = getRouteChunkNameFromModuleId(args.resource);
          if (isBuild && isSpaMode && routeChunkName === 'main') {
            validateSpaModeRouteExports({
              exportNames: analyzeRouteModuleCode(args.code, args.resourcePath)
                .exports,
              resourcePath: args.resourcePath,
              rootRoutePath,
            });
          }

          const routeChunkArtifact = await routeTransformRunner({
            kind: 'routeChunk',
            code: args.code,
            resource: args.resource,
            resourcePath: args.resourcePath,
            isBuild,
            routeChunkConfig,
          });

          // Main chunks need server-export pruning after chunk extraction;
          // the shared route transform excludes all route-chunk requests.
          if (!isBuild || routeChunkName !== 'main') {
            return routeChunkArtifact;
          }

          return routeTransformRunner({
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
          return routeTransformRunner({
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

  if (useRouteModuleTransformApi || (isBuild && splitRouteModules)) {
    // Explicit route queries and imports tagged after native resolution must
    // select the same loader, so Rspack gives them one module identity.
    api.transform(
      {
        test: path => routeByFilePath.has(path),
        resourceQuery: {
          not: /__react-router-build-client-route|route-chunk=/,
        },
        environments: useRouteModuleTransformApi ? undefined : ['web'],
        order: 'post',
      },
      async args => {
        if (
          isBuild &&
          splitRouteModules &&
          args.environment.name === 'web' &&
          args.resourceQuery !== '?react-router-route'
        ) {
          return performanceProfiler.record(
            args.environment.name,
            'route:split-exports',
            args.resource,
            () =>
              routeTransformRunner({
                kind: 'splitRouteExports',
                code: args.code,
                resourcePath: args.resourcePath,
                routeChunkConfig,
              })
          );
        }
        return useRouteModuleTransformApi
          ? transformRouteModule(args)
          : { code: args.code };
      }
    );
  }
};
