import type { RsbuildPluginAPI, TransformHandler } from '@rsbuild/core';
import jsesc from 'jsesc';
import { relative } from 'pathe';
import { PLUGIN_NAME } from './constants.js';
import {
  getReactRouterManifestForDev,
  type ReactRouterManifestStats,
} from './manifest.js';
import type { RouteTransformExecutor } from './parallel-route-transforms.js';
import type { ReactRouterPerformanceProfiler } from './performance.js';
import { createBundlerRouteExportResolver } from './route-export-resolution.js';
import type { RouteChunkConfig } from './route-chunks.js';
import type { PluginOptions, Route } from './types.js';
import { isSourceMapEnabled } from './warnings/warn-on-client-source-maps.js';

type ReactRouterManifest = Awaited<
  ReturnType<typeof getReactRouterManifestForDev>
>;

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
  routeChunkOptions: Parameters<typeof getReactRouterManifestForDev>[5];
  routeTransformExecutor: RouteTransformExecutor;
  routeByFilePath: Map<string, Route>;
  routeChunkConfig: RouteChunkConfig;
  isBuild: boolean;
  splitRouteModules: boolean;
  ssr: boolean;
  isSpaMode: boolean;
  rootRoutePath: string;
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
  routeTransformExecutor,
  routeByFilePath,
  routeChunkConfig,
  isBuild,
  splitRouteModules,
  ssr,
  isSpaMode,
  rootRoutePath,
}: RegisterBuildOutputTransformsOptions): void => {
  const transformRouteModule = async (args: Parameters<TransformHandler>[0]) =>
    performanceProfiler.record(
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
        })
    );

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
              routeChunkOptions
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
    },
    async args =>
      performanceProfiler.record(
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
          })
      )
  );

  api.transform(
    {
      resourceQuery: /route-chunk=/,
      environments: ['web'],
    },
    async args =>
      performanceProfiler.record(
        args.environment?.name,
        'route:chunk',
        args.resource,
        async () =>
          routeTransformExecutor.run({
            kind: 'routeChunk',
            code: args.code,
            resource: args.resource,
            resourcePath: args.resourcePath,
            isBuild,
            routeChunkConfig,
          })
      )
  );

  if (isBuild && splitRouteModules) {
    api.transform(
      {
        test: path => routeByFilePath.has(path),
        resourceQuery: {
          not: /__react-router-build-client-route|react-router-route|route-chunk=/,
        },
        environments: ['web'],
      },
      async args =>
        performanceProfiler.record(
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
        )
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
      order: 'post',
    },
    transformRouteModule
  );
};
