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
import type { DevHmrPlanOptions } from './dev-hmr.js';
import type { PluginOptions, Route } from './types.js';
import { createDevServerMiddleware } from './dev-server.js';
import { resolveAppPackagePath } from './plugin-utils.js';
import {
  createRouteTransformExecutor,
  shouldParallelizeRouteTransforms,
} from './parallel-route-transforms.js';
import { resolvePrerenderPaths } from './prerender.js';
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
  prerenderPaths: string[];
  routeTransformExecutor: undefined;
  routeChunkOptions: undefined;
};

export type ReactRouterModePlan = ClassicModePlan | RscModePlan;

// Fields both mode planners need. Mode-specific inputs live on the
// per-mode option types below so each planner owns only what it uses.
type ModePlanContext = {
  allowedActionOriginsForBuild: string[] | undefined;
  api: RsbuildPluginAPI;
  appDirectory: string;
  basename: string;
  customServer: boolean;
  splitRouteModules: Config['splitRouteModules'];
  isBuild: boolean;
  prerenderConfig: Config['prerender'];
  routeConfig: RouteConfigEntry[];
  routeDiscovery: Config['routeDiscovery'];
  routes: Record<string, Route>;
  rootRouteFile: string;
  ssr: boolean;
};

type CreateClassicModePlanOptions = ModePlanContext & {
  assetsBuildDirectory: string;
  devHmr?: DevHmrPlanOptions;
  defaultEntryName: string;
  entryServerPath: string;
  federation?: boolean;
  finalEntryClientPath: string;
  future: Config['future'];
  hasServerApp: boolean;
  parallelRouteTransform?: PluginOptions['parallelRouteTransform'];
  reactRouterConfig: ResolvedReactRouterConfig;
  routeChunkCache: RouteChunkCache;
  routeCount: number;
  serverAppPath: string;
  shouldDependOnWebCompiler: boolean;
};

type CreateRscModePlanOptions = ModePlanContext & {
  buildDirectory: string;
  finalEntryRscClientPath: string;
  finalEntryRscPath: string;
  outputClientPath: string;
  pluginName: string;
  serverBuildFile: string | undefined;
};

type CreateReactRouterModePlanOptions = CreateClassicModePlanOptions &
  CreateRscModePlanOptions & {
    isRscMode: boolean;
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

const createRscModePlan = async ({
  allowedActionOriginsForBuild,
  api,
  appDirectory,
  basename,
  buildDirectory,
  customServer,
  finalEntryRscClientPath,
  finalEntryRscPath,
  isBuild,
  outputClientPath,
  pluginName,
  prerenderConfig,
  routeConfig,
  routeDiscovery,
  routes,
  rootRouteFile,
  serverBuildFile,
  splitRouteModules,
  ssr,
}: CreateRscModePlanOptions): Promise<RscModePlan> => {
  const rscServerEntryName = (serverBuildFile || 'index.js').replace(
    /\.js$/,
    ''
  );
  const prerenderPaths = await resolvePrerenderPaths(
    prerenderConfig,
    ssr,
    routeConfig,
    {
      logWarning: true,
      warn: message => api.logger.warn(message),
    }
  );
  return {
    kind: 'rsc',
    prerenderPaths,
    // RSC route chunking is content-detected; the config value only gates
    // 'enforce' validation, matching upstream's RSC vite plugin.
    routeChunkConfig: {
      splitRouteModules,
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
        allowedActionOrigins: allowedActionOriginsForBuild,
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
      !customServer && ssr
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
};

const createClassicModePlan = async ({
  api,
  allowedActionOriginsForBuild,
  appDirectory,
  assetsBuildDirectory,
  basename,
  customServer,
  defaultEntryName,
  devHmr,
  entryServerPath,
  federation,
  finalEntryClientPath,
  future,
  hasServerApp,
  isBuild,
  parallelRouteTransform,
  prerenderConfig,
  reactRouterConfig,
  routeChunkCache,
  routeConfig,
  routeCount,
  routeDiscovery,
  routes,
  rootRouteFile,
  serverAppPath,
  shouldDependOnWebCompiler,
  splitRouteModules,
  ssr,
}: CreateClassicModePlanOptions): Promise<ClassicModePlan> => {
  const routeChunkConfig: RouteChunkConfig = {
    splitRouteModules,
    appDirectory,
    rootRouteFile,
  };
  const routeTransformExecutor = createRouteTransformExecutor({
    parallelRouteTransform:
      parallelRouteTransform ?? shouldParallelizeRouteTransforms(routeCount),
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
    devHmr: devHmr
      ? {
          enabled: devHmr.enabled,
          onNodeRebuildCommitted: devHmr.onNodeRebuildCommitted,
        }
      : undefined,
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
        devHmrRuntimeModule: devHmr?.runtimeModule,
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
      customServer || !ssr
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

export const createReactRouterModePlan = (
  options: CreateReactRouterModePlanOptions
): Promise<ReactRouterModePlan> =>
  options.isRscMode
    ? createRscModePlan(options)
    : createClassicModePlan(options);
