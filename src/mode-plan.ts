import type {
  RsbuildConfig,
  RsbuildEntryDescription,
  RsbuildPluginAPI,
  Rspack,
} from '@rsbuild/core';
import { rspack } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { resolve } from 'pathe';
import type {
  Config,
  ResolvedReactRouterConfig,
} from './react-router-config.js';
import type { RouteChunkCache, RouteChunkConfig } from './route-chunks.js';
import type { PluginOptions, Route } from './types.js';
import { createDevServerMiddleware } from './dev-server.js';
import { resolveAppPackagePath } from './plugin-utils.js';
import {
  createRouteTransformExecutor,
  shouldParallelizeRouteTransforms,
} from './parallel-route-transforms.js';
import { createReactRouterNodeEntries } from './server-build-plan.js';
import { getSsrExternals } from './ssr-externals.js';
import {
  createClassicBuildArtifacts,
  createClassicVirtualModules,
  createClassicWebRouteEntries,
  type ClassicBuildArtifacts,
} from './classic-mode.js';
import {
  createReactRouterRscDevServerSetup,
  createReactRouterRscResolveAliases,
  createReactRouterRscVirtualModules,
} from './rsc-support.js';

type RsbuildDevSetupMiddlewares = NonNullable<
  NonNullable<RsbuildConfig['dev']>['setupMiddlewares']
>;
type RsbuildDevSetupMiddleware = Extract<
  RsbuildDevSetupMiddlewares,
  unknown[]
>[number];

type CommonModePlan = {
  routeChunkConfig: RouteChunkConfig;
  manifestChunkNames: Set<string>;
  webEntries: Record<string, string | RsbuildEntryDescription>;
  nodeEntries: Record<string, string | RsbuildEntryDescription>;
  createVirtualModules(publicPath: string): Record<string, string>;
  createResolveConfig(rootPath: string): Rspack.Configuration['resolve'];
  server: RsbuildConfig['server'] | undefined;
  setupMiddlewares: RsbuildDevSetupMiddlewares;
  webExternalsType: 'module' | undefined;
  webOutput: NonNullable<Rspack.Configuration['output']>;
  webOptimization: NonNullable<Rspack.Configuration['optimization']>;
  nodeExternals: string[] | undefined;
  nodeDependencies: { dependencies?: string[] };
};

export type ClassicModePlan = CommonModePlan & {
  kind: 'classic';
  artifacts: ClassicBuildArtifacts;
  routeTransformExecutor: ReturnType<typeof createRouteTransformExecutor>;
  routeChunkOptions: {
    splitRouteModules: Config['splitRouteModules'];
    rootRouteFile: string;
    isBuild: boolean;
    cache: RouteChunkCache;
  };
};

export type RscModePlan = CommonModePlan & {
  kind: 'rsc';
  routeTransformExecutor: undefined;
  routeChunkOptions: undefined;
};

export type ReactRouterModePlan = ClassicModePlan | RscModePlan;

type CreateReactRouterModePlanOptions = {
  api: RsbuildPluginAPI;
  allowedActionOriginsForBuild: string[] | undefined;
  appDirectory: string;
  assetsBuildDirectory: string;
  basename: string;
  buildDirectory: string;
  defaultEntryName: string;
  entryServerPath: string;
  federation?: boolean;
  finalEntryClientPath: string;
  finalEntryRscClientPath: string;
  finalEntryRscPath: string;
  future: Config['future'];
  hasServerApp: boolean;
  isBuild: boolean;
  isRscMode: boolean;
  outputClientPath: string;
  pluginName: string;
  pluginOptions: PluginOptions & {
    customServer: boolean;
    parallelRouteTransform?: PluginOptions['parallelRouteTransform'];
  };
  prerenderConfig: Config['prerender'];
  reactRouterConfig: ResolvedReactRouterConfig;
  routeChunkCache: RouteChunkCache;
  routeConfig: RouteConfigEntry[];
  routeCount: number;
  routeDiscovery: Config['routeDiscovery'];
  routes: Record<string, Route>;
  rootRouteFile: string;
  serverAppPath: string;
  serverBuildFile: string | undefined;
  shouldDependOnWebCompiler: boolean;
  splitRouteModules: Config['splitRouteModules'];
  ssr: boolean;
};

const RSC_LAYERS = rspack.experiments.rsc.Layers;

const createReactRouterPackageAliases = (): Record<string, string> => {
  const reactRouterPath = resolveAppPackagePath('react-router');
  const reactRouterDomPath = resolveAppPackagePath('react-router/dom');
  return {
    ...(reactRouterPath ? { 'react-router$': reactRouterPath } : {}),
    ...(reactRouterDomPath ? { 'react-router/dom$': reactRouterDomPath } : {}),
  };
};

export const createReactRouterModePlan = async ({
  api,
  allowedActionOriginsForBuild,
  appDirectory,
  assetsBuildDirectory,
  basename,
  buildDirectory,
  defaultEntryName,
  entryServerPath,
  federation,
  finalEntryClientPath,
  finalEntryRscClientPath,
  finalEntryRscPath,
  future,
  hasServerApp,
  isBuild,
  isRscMode,
  outputClientPath,
  pluginName,
  pluginOptions,
  prerenderConfig,
  reactRouterConfig,
  routeChunkCache,
  routeConfig,
  routeCount,
  routeDiscovery,
  routes,
  rootRouteFile,
  serverAppPath,
  serverBuildFile,
  shouldDependOnWebCompiler,
  splitRouteModules,
  ssr,
}: CreateReactRouterModePlanOptions): Promise<ReactRouterModePlan> => {
  if (isRscMode) {
    const rscServerEntryName = (serverBuildFile || 'index.js').replace(
      /\.js$/,
      ''
    );
    return {
      kind: 'rsc',
      routeChunkConfig: {
        splitRouteModules: false,
        appDirectory,
        rootRouteFile,
      },
      routeTransformExecutor: undefined,
      routeChunkOptions: undefined,
      manifestChunkNames: new Set<string>(['index']),
      webEntries: {
        index: {
          import: finalEntryRscClientPath,
          html: false,
        },
      },
      nodeEntries: {
        [rscServerEntryName]: {
          import: finalEntryRscPath,
          layer: RSC_LAYERS.rsc,
        },
      },
      createVirtualModules: (publicPath: string) =>
        createReactRouterRscVirtualModules({
          appDirectory,
          basename,
          buildDirectory,
          isBuild,
          outputClientPath,
          publicPath,
          routeDiscovery,
          routes,
          ssr,
        }),
      createResolveConfig: (rootPath: string) => ({
        modules: [resolve(rootPath, 'node_modules'), 'node_modules'],
        alias: createReactRouterRscResolveAliases(rootPath),
      }),
      server:
        !pluginOptions.customServer && ssr
          ? {
              setup: createReactRouterRscDevServerSetup({
                entryName: rscServerEntryName,
                pluginName,
              }),
            }
          : undefined,
      setupMiddlewares: [],
      webExternalsType: undefined,
      webOutput: {
        chunkFormat: 'array-push',
        chunkLoading: 'jsonp',
        workerChunkLoading: 'import-scripts',
        wasmLoading: 'fetch',
        module: false,
      },
      webOptimization: {
        mangleExports: false,
        splitChunks: false,
        usedExports: false,
        runtimeChunk: false,
      },
      nodeExternals: undefined,
      nodeDependencies: {},
    };
  }

  const routeChunkConfig: RouteChunkConfig = {
    splitRouteModules,
    appDirectory,
    rootRouteFile,
  };
  const routeTransformExecutor = createRouteTransformExecutor({
    parallelRouteTransform:
      pluginOptions.parallelRouteTransform ??
      shouldParallelizeRouteTransforms(routeCount),
    routeChunkCache,
    splitRouteModules: Boolean(splitRouteModules),
    isBuild,
  });
  const routeChunkOptions = {
    splitRouteModules,
    rootRouteFile,
    isBuild,
    cache: routeChunkCache,
  };
  const { manifestChunkNames, webRouteEntries } = createClassicWebRouteEntries({
    appDirectory,
    isBuild,
    routes,
    splitRouteModules: Boolean(splitRouteModules),
  });
  const artifacts = await createClassicBuildArtifacts({
    api,
    defaultEntryName,
    isBuild,
    prerenderConfig,
    reactRouterConfig,
    routeConfig,
    routes,
    rootDirectory: process.cwd(),
    ssr,
  });
  const reactRouterAliases = createReactRouterPackageAliases();
  return {
    kind: 'classic',
    artifacts,
    routeChunkConfig,
    routeTransformExecutor,
    routeChunkOptions,
    manifestChunkNames,
    webEntries: {
      'entry.client': finalEntryClientPath,
      'virtual/react-router/browser-manifest': {
        import: 'virtual/react-router/browser-manifest',
        html: false,
      },
      ...webRouteEntries,
    },
    nodeEntries: createReactRouterNodeEntries({
      hasServerApp,
      isBuild,
      serverAppPath,
      entryServerPath,
      defaultEntryName,
      serverBundleEntries: artifacts.serverBundleEntries,
    }),
    createVirtualModules: (publicPath: string) =>
      createClassicVirtualModules({
        allowedActionOrigins: allowedActionOriginsForBuild,
        appDirectory,
        assetsBuildDirectory,
        basename,
        entryServerPath,
        federation,
        future,
        prerenderPaths: artifacts.prerenderPaths,
        publicPath,
        routeDiscovery,
        routes,
        routesByServerBundleId: artifacts.routesByServerBundleId,
        ssr,
      }),
    createResolveConfig: () =>
      Object.keys(reactRouterAliases).length > 0
        ? { alias: reactRouterAliases }
        : undefined,
    server: undefined,
    setupMiddlewares:
      pluginOptions.customServer || !ssr
        ? []
        : [
            (middlewares: Parameters<RsbuildDevSetupMiddleware>[0]) => {
              middlewares.push(
                createDevServerMiddleware({
                  loadBuild: artifacts.devRuntime.createBuildLoader(),
                })
              );
            },
          ],
    webExternalsType: 'module',
    webOutput: {
      chunkFormat: 'module',
      chunkLoading: 'import',
      workerChunkLoading: 'import',
      wasmLoading: 'fetch',
      library: { type: 'module' },
      module: true,
    },
    webOptimization: {
      avoidEntryIife: true,
      runtimeChunk: 'single',
    },
    nodeExternals: Array.from(
      new Set(['express', ...getSsrExternals(process.cwd())])
    ),
    nodeDependencies: shouldDependOnWebCompiler
      ? { dependencies: ['web'] }
      : {},
  };
};
