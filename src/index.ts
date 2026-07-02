import { existsSync, readFileSync } from 'node:fs';
import fsExtra from 'fs-extra';
import type { Config } from './react-router-config.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import {
  rspack,
  type RsbuildEntryDescription,
  type RsbuildPlugin,
  type Rspack,
} from '@rsbuild/core';
import { createJiti } from 'jiti';
import { relative, resolve } from 'pathe';

import { getDefaultConcurrency } from './concurrency.js';
import {
  BUILD_CLIENT_ROUTE_QUERY_STRING,
  JS_EXTENSIONS,
  PLUGIN_NAME,
} from './constants.js';
import { guardReactRouterLazyCompilation } from './lazy-compilation.js';
import { createDevServerMiddleware } from './dev-server.js';
import {
  generateWithProps,
  findEntryFile,
  normalizeAssetPrefix,
} from './plugin-utils.js';
import type { PluginOptions } from './types.js';
import {
  generateServerBuild,
  resolveReactRouterServerBuild,
} from './server-utils.js';
import { resolvePrerenderPaths, validatePrerenderConfig } from './prerender.js';
import { runReactRouterPrerenderBuild } from './prerender-build.js';
import {
  resolveReactRouterConfig,
  type ResolvedReactRouterConfig,
} from './react-router-config.js';
import {
  getReactRouterManifestForDev,
  configRoutesToRouteManifest,
  createReactRouterManifestStats,
  type ReactRouterManifestStats,
  type RouteManifestModuleExports,
} from './manifest.js';
import { registerModifyBrowserManifestAssets } from './modify-browser-manifest.js';
import { registerBuildOutputTransforms } from './build-output-transforms.js';
import {
  getRouteChunkEntryName,
  getRouteChunkModuleId,
  routeChunkExportNames,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';
import {
  createRouteTransformExecutor,
  shouldParallelizeRouteTransforms,
} from './parallel-route-transforms.js';
import { getRouteRestartMarkerPath, mergeWatchFiles } from './route-watch.js';
import { validateRouteConfig } from './route-config.js';
import {
  getBuildManifest,
  getRoutesByServerBundleId,
} from './build-manifest.js';
import {
  createReactRouterNodeEntries,
  createReactRouterServerBuildPlan,
} from './server-build-plan.js';
import { warnOnClientSourceMaps } from './warnings/warn-on-client-source-maps.js';
import { validatePluginOrderFromConfig } from './validation/validate-plugin-order.js';
import { getSsrExternals } from './ssr-externals.js';
import {
  createReactRouterPerformanceProfiler,
  roundMs,
} from './performance.js';
import { mapVirtualModules } from './virtual-modules.js';
import { createReactRouterDevRuntimeController } from './dev-runtime-controller.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';
import { registerReactRouterTypegen } from './typegen.js';
import { importConfigWithWatchPaths } from './config-imports.js';
import {
  createReactRouterRouteTopology,
  createReactRouterRouteWatchFiles,
  registerReactRouterDevBackgroundResources,
} from './dev-background-resources.js';

export { loadReactRouterServerBuild } from './dev-generation.js';
export { resolveReactRouterServerBuild };

const MIN_PARALLEL_ENVIRONMENT_BUILD_SPARE_CORES = 4;

export const shouldParallelizeEnvironmentBuilds = ({
  isBuild,
  spareCoreCount = getDefaultConcurrency(),
}: {
  isBuild: boolean;
  spareCoreCount?: number;
}): boolean =>
  !isBuild && spareCoreCount >= MIN_PARALLEL_ENVIRONMENT_BUILD_SPARE_CORES;

type ModuleFederationPluginLike = {
  name?: string;
  _options?: { experiments?: { asyncStartup?: boolean } };
  options?: { experiments?: { asyncStartup?: boolean } };
};

const ensureFederationAsyncStartup = (
  rspackConfig: Rspack.Configuration | undefined
): void => {
  if (!rspackConfig?.plugins?.length) {
    return;
  }

  for (const plugin of rspackConfig.plugins) {
    if (!plugin || typeof plugin !== 'object') {
      continue;
    }
    const pluginName = (plugin as ModuleFederationPluginLike).name;
    if (pluginName !== 'ModuleFederationPlugin') {
      continue;
    }

    const pluginOptions =
      (plugin as ModuleFederationPluginLike)._options ??
      (plugin as ModuleFederationPluginLike).options;
    if (!pluginOptions) {
      continue;
    }

    pluginOptions.experiments = {
      ...pluginOptions.experiments,
      asyncStartup: true,
    };
  }
};

const cssUrlAssetExtensions =
  /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)$/;
const urlAssetResourceQuery =
  /^(?=.*(?:\?|&)url(?:&|$))(?!.*(?:\?|&)(?:raw|inline)(?:&|$))/;

export const pluginReactRouter = (
  options: PluginOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_NAME,

  async setup(api) {
    const defaultOptions = {
      customServer: false,
      lazyCompilation: true,
      serverOutput: 'module' as const,
    };

    const pluginOptions = {
      ...defaultOptions,
      ...options,
    };
    const logPerformance = pluginOptions.logPerformance === true;
    const setupStartMs = logPerformance ? performance.now() : 0;
    const performanceProfiler = createReactRouterPerformanceProfiler({
      enabled: logPerformance,
      log: message => api.logger.info(message),
    });
    const nodeExternals = Array.from(
      new Set(['express', ...getSsrExternals(process.cwd())])
    );

    let assetPrefix = '/';

    // Best-effort configuration validation (upstream: validate-plugin-order).
    // Run during config modification phase so we don't rely on `getRsbuildConfig()`
    // being available during `setup()`.
    api.modifyRsbuildConfig({
      order: 'pre',
      handler(config) {
        const issues = validatePluginOrderFromConfig(config);
        for (const issue of issues) {
          if (issue.kind === 'error') {
            throw new Error(issue.message);
          }
          api.logger.warn(issue.message);
        }
        assetPrefix = normalizeAssetPrefix(config.output?.assetPrefix);
        return config;
      },
    });

    api.onBeforeBuild(() => {
      const normalized = api.getNormalizedConfig();
      warnOnClientSourceMaps(normalized, msg => api.logger.warn(msg), 'web');
    });

    const configPath = findEntryFile(resolve('react-router.config'));
    const configExists = existsSync(configPath);
    let configWatchPaths: string | string[] = configExists
      ? configPath
      : JS_EXTENSIONS.map(extension =>
          resolve(`react-router.config${extension}`)
        );
    let reactRouterUserConfig: Config = {};
    if (!configExists) {
      console.warn(
        'No react-router.config found, using default configuration.'
      );
    } else {
      const displayPath = relative(process.cwd(), configPath);
      try {
        const { value: imported, watchPaths } =
          await importConfigWithWatchPaths<Config>(configPath);
        configWatchPaths = watchPaths;
        if (imported === undefined) {
          throw new Error(`${displayPath} must provide a default export`);
        }
        if (typeof imported !== 'object') {
          throw new Error(`${displayPath} must export a config`);
        }
        reactRouterUserConfig = imported;
      } catch (error) {
        throw new Error(`Error loading ${displayPath}: ${error}`);
      }
    }

    const {
      resolved: resolvedConfig,
      presets: configPresets,
      hasConfiguredServerModuleFormat,
    } = await resolveReactRouterConfig(reactRouterUserConfig);

    const {
      appDirectory,
      basename,
      buildDirectory,
      future,
      allowedActionOrigins,
      routeDiscovery: userRouteDiscovery,
      ssr,
      prerender: prerenderConfig,
      serverBuildFile,
      serverModuleFormat,
      splitRouteModules,
      buildEnd,
    } = resolvedConfig;

    registerReactRouterTypegen(api, { appDirectory });

    const hasExplicitServerOutput = Object.prototype.hasOwnProperty.call(
      options,
      'serverOutput'
    );
    let resolvedServerOutput = pluginOptions.serverOutput;
    if (!hasExplicitServerOutput) {
      resolvedServerOutput =
        serverModuleFormat === 'cjs' ? 'commonjs' : 'module';
    }

    if (
      hasExplicitServerOutput &&
      hasConfiguredServerModuleFormat &&
      serverModuleFormat &&
      (resolvedServerOutput === 'commonjs' ? 'cjs' : 'esm') !==
        serverModuleFormat
    ) {
      api.logger.warn(
        `[${PLUGIN_NAME}] Both \`serverOutput\` and \`serverModuleFormat\` are set. ` +
          `Using \`serverOutput=${resolvedServerOutput}\` and ignoring ` +
          `\`serverModuleFormat=${serverModuleFormat}\`.`
      );
    }

    if (serverBuildFile && !serverBuildFile.endsWith('.js')) {
      throw new Error('The `serverBuildFile` config must end in `.js`.');
    }

    if (serverModuleFormat !== 'esm' && serverModuleFormat !== 'cjs') {
      throw new Error(
        'The `serverModuleFormat` config must be "esm" or "cjs".'
      );
    }

    const prerenderConfigError = validatePrerenderConfig(prerenderConfig);
    if (prerenderConfigError) {
      throw new Error(prerenderConfigError);
    }

    // React Router defaults to "lazy" route discovery, but "ssr:false" builds
    // have no runtime server to serve manifest patch requests, so we force
    // `mode:"initial"` in SPA mode to avoid any `/__manifest` fetches.
    let routeDiscovery: Config['routeDiscovery'];
    if (!userRouteDiscovery) {
      routeDiscovery = ssr
        ? ({ mode: 'lazy', manifestPath: '/__manifest' } as const)
        : ({ mode: 'initial' } as const);
    } else if (userRouteDiscovery.mode === 'initial') {
      routeDiscovery = userRouteDiscovery;
    } else if (userRouteDiscovery.mode === 'lazy') {
      if (!ssr) {
        throw new Error(
          'The `routeDiscovery.mode` config cannot be set to "lazy" when setting `ssr:false`'
        );
      }
      const manifestPath = userRouteDiscovery.manifestPath;
      if (manifestPath && !manifestPath.startsWith('/')) {
        throw new Error(
          'The `routeDiscovery.manifestPath` config must be a root-relative pathname beginning with a slash (i.e., "/__manifest")'
        );
      }
      routeDiscovery = userRouteDiscovery;
    }

    (globalThis as any).__reactRouterAppDirectory = resolve(appDirectory);
    const routesPath = findEntryFile(resolve(appDirectory, 'routes'));
    if (!existsSync(routesPath)) {
      throw new Error(
        `Route config file not found at "${relative(
          process.cwd(),
          routesPath
        )}".`
      );
    }

    const jiti = createJiti(process.cwd(), {
      moduleCache: false,
    });
    const importRouteConfig = async (
      importer: Pick<typeof jiti, 'import'>
    ): Promise<RouteConfigEntry[]> => {
      const routeConfigExport = await importer.import<RouteConfigEntry[]>(
        routesPath,
        {
          default: true,
        }
      );
      const routeConfigValue = await routeConfigExport;
      const validation = validateRouteConfig({
        routeConfigFile: relative(process.cwd(), routesPath),
        routeConfig: routeConfigValue,
      });
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      return validation.routeConfig;
    };
    const loadRouteConfig = () => importRouteConfig(jiti);
    const { value: routeConfig, watchPaths: routeConfigWatchPaths } =
      await importConfigWithWatchPaths(routesPath, importRouteConfig);

    const entryClientPath = findEntryFile(
      resolve(appDirectory, 'entry.client')
    );
    const entryServerPath = findEntryFile(
      resolve(appDirectory, 'entry.server')
    );

    const serverAppPath = findEntryFile(
      resolve(appDirectory, '../server/index')
    );
    const hasServerApp = existsSync(serverAppPath);
    const devServerBuildEntryName = hasServerApp
      ? 'static/js/react-router-server-build'
      : 'static/js/app';

    const templateDir = resolve(__dirname, 'templates');
    const templateClientPath = resolve(templateDir, 'entry.client.js');
    const templateServerPath = resolve(templateDir, 'entry.server.js');

    const finalEntryClientPath = existsSync(entryClientPath)
      ? entryClientPath
      : templateClientPath;
    const finalEntryServerPath = existsSync(entryServerPath)
      ? entryServerPath
      : templateServerPath;

    const getRootRoutePath = () => findEntryFile(resolve(appDirectory, 'root'));
    const rootRoutePath = getRootRoutePath();
    // React Router's server build expects route files relative to `appDirectory`
    // so it can resolve them correctly during compilation.
    const rootRouteFile = relative(appDirectory, rootRoutePath);
    const routeTopology = createReactRouterRouteTopology({
      appDirectory,
      rootRouteFile,
      routeConfig,
      loadRouteConfig,
      getRootRoutePath,
    });

    const routes = {
      root: { path: '', id: 'root', file: rootRouteFile },
      ...configRoutesToRouteManifest(appDirectory, routeConfig),
    };

    const resolvedConfigWithRoutes: ResolvedReactRouterConfig = {
      ...resolvedConfig,
      appDirectory: resolve(appDirectory),
      buildDirectory: resolve(buildDirectory),
      routeDiscovery,
      prerender: prerenderConfig,
      routes,
      unstable_routeConfig: routeConfig,
      allowedActionOrigins: allowedActionOrigins ?? false,
    };

    const { buildEnd: _buildEnd, ...resolvedConfigForPreset } =
      resolvedConfigWithRoutes;
    for (const preset of configPresets) {
      await preset.reactRouterConfigResolved?.({
        reactRouterConfig: resolvedConfigForPreset,
      });
    }

    const isBuild = api.context.action === 'build';
    const shouldDependOnWebCompiler = !shouldParallelizeEnvironmentBuilds({
      isBuild,
    });
    const isPrerenderEnabled =
      prerenderConfig !== undefined && prerenderConfig !== false;
    const isSpaMode = !ssr && !isPrerenderEnabled;
    const routeCount = Object.keys(routes).length;
    const routeChunkConfig: RouteChunkConfig = {
      splitRouteModules,
      appDirectory,
      rootRouteFile,
    };
    const routeChunkCache: RouteChunkCache = new Map();
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
    const outputClientPath = resolve(buildDirectory, 'client');
    const assetsBuildDirectory = relative(process.cwd(), outputClientPath);
    const watchDirectory = resolve(appDirectory);
    const routeRestartMarkerPath = getRouteRestartMarkerPath(outputClientPath);
    const routeWatchFiles = createReactRouterRouteWatchFiles({
      configWatchPaths,
      routeConfigWatchPaths,
      routeRestartMarkerPath,
      onRouteTopologyChange: pluginOptions.onRouteTopologyChange,
    });
    const devBackgroundResources = registerReactRouterDevBackgroundResources({
      api,
      isBuild,
      lazyCompilationPrewarm: pluginOptions.unstableLazyCompilationPrewarm,
      routeTransformExecutor,
      routeRestartMarkerPath,
      watchDirectory,
      getRouteTopology: routeTopology.getRouteTopology,
      initialRouteTopology: routeTopology.initialRouteTopology,
      onRouteTopologyChange: pluginOptions.onRouteTopologyChange,
    });

    type ReactRouterManifest = Awaited<
      ReturnType<typeof getReactRouterManifestForDev>
    >;
    let latestBrowserManifest: ReactRouterManifest | null = null;
    let latestBrowserManifestModuleExports: RouteManifestModuleExports = {};
    let latestServerManifest: ReactRouterManifest | null = null;
    const latestServerManifestsByBundleId: Record<string, ReactRouterManifest> =
      {};

    const stageLatestManifests = (
      manifest: ReactRouterManifest,
      sri: ReactRouterManifest['sri'],
      moduleExportsByRouteId: RouteManifestModuleExports,
      compilation: Rspack.Compilation
    ) => {
      performanceProfiler.recordSync(
        'web',
        'manifest:stage',
        'virtual/react-router/browser-manifest',
        () => {
          latestBrowserManifest = manifest;
          devBackgroundResources.setManifest(manifest);
          latestBrowserManifestModuleExports = moduleExportsByRouteId;
          const baseServerManifest = {
            ...manifest,
            sri,
          };
          latestServerManifest = baseServerManifest;
          const manifestsByEntryName: Record<string, ReactRouterManifest> = {
            [devServerBuildEntryName]: baseServerManifest,
          };

          for (const { bundleId, entryName } of serverBundleEntries) {
            const bundleRoutes = routesByServerBundleId[bundleId];
            if (!bundleRoutes) {
              continue;
            }

            const routeIds = new Set(Object.keys(bundleRoutes));
            const filteredRoutes = Object.fromEntries(
              Object.entries(manifest.routes).filter(([routeId]) =>
                routeIds.has(routeId)
              )
            );
            const bundleManifest = {
              ...baseServerManifest,
              routes: filteredRoutes,
            };
            latestServerManifestsByBundleId[bundleId] = bundleManifest;
            manifestsByEntryName[entryName] = bundleManifest;
          }

          if (!isBuild) {
            devRuntime.captureWeb(compilation, manifestsByEntryName);
          }
        }
      );
    };

    const routeByFilePath = new Map(
      Object.values(routes).map(route => [
        resolve(appDirectory, route.file),
        route,
      ])
    );

    const manifestChunkNames = new Set<string>(['entry.client']);
    const webRouteEntries = Object.values(routes).reduce(
      (acc, route) => {
        const entryName = route.file.slice(0, route.file.lastIndexOf('.'));
        const routeFilePath = resolve(appDirectory, route.file);
        manifestChunkNames.add(entryName);
        acc[entryName] = {
          import: `${routeFilePath}${BUILD_CLIENT_ROUTE_QUERY_STRING}`,
          html: false,
        };

        if (isBuild && splitRouteModules && route.id !== 'root') {
          let source: string;
          try {
            source = readFileSync(routeFilePath, 'utf8');
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              return acc;
            }
            throw error;
          }
          for (const exportName of routeChunkExportNames) {
            if (!source.includes(exportName)) {
              continue;
            }
            const chunkEntryName = getRouteChunkEntryName(route.id, exportName);
            manifestChunkNames.add(chunkEntryName);
            acc[chunkEntryName] = {
              import: getRouteChunkModuleId(routeFilePath, exportName),
              html: false,
            };
          }
        }

        return acc;
      },
      {} as Record<string, RsbuildEntryDescription>
    );
    const buildManifest = await getBuildManifest({
      reactRouterConfig: resolvedConfigWithRoutes,
      routes,
      rootDirectory: process.cwd(),
    });
    const routesByServerBundleId = getRoutesByServerBundleId(
      buildManifest,
      routes
    );
    const serverBuildPlan = createReactRouterServerBuildPlan({
      routesByServerBundleId,
      serverBuildFile,
      defaultEntryName: devServerBuildEntryName,
    });
    const { serverBundleEntries } = serverBuildPlan;
    const devRuntime = createReactRouterDevRuntimeController({
      api,
      isBuild,
      buildPlan: serverBuildPlan,
    });

    let clientStats: ReactRouterManifestStats | undefined;
    api.onAfterEnvironmentCompile(({ stats, environment }) => {
      if (environment.name === 'web') {
        clientStats = createReactRouterManifestStats(
          stats?.compilation,
          manifestChunkNames
        );
      }
      if (pluginOptions.federation && ssr) {
        const serverBuildDir = resolve(buildDirectory, 'server');
        const clientBuildDir = resolve(buildDirectory, 'client');
        if (existsSync(serverBuildDir)) {
          const ssrDir = resolve(clientBuildDir, 'static');
          fsExtra.copySync(serverBuildDir, ssrDir);
        }
      }
      if (logPerformance) {
        performanceProfiler.flush(environment.name, {
          compilerLifecycleMs: roundMs(performance.now() - setupStartMs),
        });
      }
    });

    const prerenderPaths = await resolvePrerenderPaths(
      prerenderConfig,
      ssr,
      routeConfig,
      {
        logWarning: true,
        warn: message => api.logger.warn(message),
      }
    );

    api.onAfterBuild(({ environments }) =>
      runPluginEffect(
        tryPluginPromise(() =>
          runReactRouterPrerenderBuild({
            api,
            hasWebEnvironment: Boolean(environments.web),
            buildDirectory,
            serverBuildFile,
            ssr,
            isPrerenderEnabled,
            prerenderConfig,
            prerenderPaths,
            basename,
            future,
            routes,
            latestBrowserManifest,
            latestBrowserManifestModuleExports,
            clientStats,
            pluginOptions,
            appDirectory,
            assetPrefix,
            routeChunkOptions,
            buildManifest,
            resolvedConfigWithRoutes,
            buildEnd,
          })
        )
      )
    );

    const allowedActionOriginsForBuild =
      allowedActionOrigins === false ? undefined : allowedActionOrigins;

    // Public requests stay bare while Rspack resolves seeded virtual files.
    const createVirtualModulePlugin = (publicPath: string) => {
      const bundleVirtualModules = Object.fromEntries(
        Object.entries(routesByServerBundleId).map(
          ([bundleId, bundleRoutes]) => [
            `virtual/react-router/server-build-${bundleId}`,
            generateServerBuild(bundleRoutes, {
              entryServerPath: finalEntryServerPath,
              assetsBuildDirectory,
              basename,
              appDirectory,
              ssr,
              federation: options.federation,
              future,
              allowedActionOrigins: allowedActionOriginsForBuild,
              prerender: prerenderPaths,
              routeDiscovery,
              publicPath,
              serverManifestId: `virtual/react-router/server-manifest-${bundleId}`,
            }),
          ]
        )
      );
      const bundleManifestModules = Object.fromEntries(
        Object.entries(routesByServerBundleId)
          .filter(
            ([, bundleRoutes]) =>
              bundleRoutes && Object.keys(bundleRoutes).length > 0
          )
          .map(([bundleId]) => [
            `virtual/react-router/server-manifest-${bundleId}`,
            'export default {};',
          ])
      );

      return new rspack.experiments.VirtualModulesPlugin(
        mapVirtualModules({
          'virtual/react-router/browser-manifest': 'export default {};',
          'virtual/react-router/server-manifest': 'export default {};',
          'virtual/react-router/server-build': generateServerBuild(routes, {
            entryServerPath: finalEntryServerPath,
            assetsBuildDirectory,
            basename,
            appDirectory,
            ssr,
            federation: options.federation,
            future,
            allowedActionOrigins: allowedActionOriginsForBuild,
            prerender: prerenderPaths,
            routeDiscovery,
            publicPath,
          }),
          ...bundleVirtualModules,
          ...bundleManifestModules,
          'virtual/react-router/with-props': generateWithProps(),
        })
      );
    };

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      assetPrefix = normalizeAssetPrefix(config.output?.assetPrefix);
      const vmodPlugin = createVirtualModulePlugin(assetPrefix);
      const useAsyncNodeChunkLoading =
        options.federation && resolvedServerOutput === 'commonjs';
      let nodeChunkLoading: 'import' | 'async-node' | 'require' = 'require';
      if (resolvedServerOutput === 'module') {
        nodeChunkLoading = 'import';
      } else if (useAsyncNodeChunkLoading) {
        nodeChunkLoading = 'async-node';
      }
      const nodeEntries = createReactRouterNodeEntries({
        hasServerApp,
        isBuild,
        serverAppPath,
        entryServerPath: finalEntryServerPath,
        defaultEntryName: devServerBuildEntryName,
        serverBundleEntries,
      });

      const configuredLazyCompilation = Object.prototype.hasOwnProperty.call(
        options,
        'lazyCompilation'
      )
        ? pluginOptions.lazyCompilation
        : (config.dev?.lazyCompilation ?? pluginOptions.lazyCompilation);
      const guardedLazyCompilation = guardReactRouterLazyCompilation({
        lazyCompilation: configuredLazyCompilation,
        entryClientPath: finalEntryClientPath,
        prewarmReactRouterModules: Boolean(
          pluginOptions.unstableLazyCompilationPrewarm
        ),
      });
      const lazyCompilation =
        guardedLazyCompilation === undefined
          ? {}
          : { lazyCompilation: guardedLazyCompilation };
      const shouldCompactFileSizeReport =
        isBuild &&
        routeCount >= 256 &&
        (config.performance?.printFileSize === undefined ||
          config.performance.printFileSize === true);

      return mergeRsbuildConfig(config, {
        ...(shouldCompactFileSizeReport
          ? {
              performance: {
                printFileSize: {
                  total: true,
                  detail: false,
                  compressed: false,
                },
              },
            }
          : {}),
        output: {
          assetPrefix: config.output?.assetPrefix || '/',
        },
        dev: {
          writeToDisk: true,
          ...lazyCompilation,
          watchFiles: mergeWatchFiles(config.dev?.watchFiles, routeWatchFiles),
          setupMiddlewares:
            pluginOptions.customServer || !ssr
              ? []
              : [
                  middlewares => {
                    middlewares.push(
                      createDevServerMiddleware({
                        loadBuild: devRuntime.createBuildLoader(),
                      })
                    );
                  },
                ],
        },
        tools: {
          rspack: {
            plugins: [vmodPlugin],
          },
        },
        environments: {
          web: {
            ...(resolvedConfigWithRoutes.subResourceIntegrity
              ? {
                  security: {
                    sri: {
                      enable: true,
                    },
                  },
                }
              : {}),
            source: {
              entry: {
                // no query needed when federation is disabled
                'entry.client': finalEntryClientPath,
                'virtual/react-router/browser-manifest': {
                  import: 'virtual/react-router/browser-manifest',
                  html: false,
                },
                ...webRouteEntries,
              },
            },
            output: {
              filename: {
                js: '[name].js',
              },
              distPath: {
                root: outputClientPath,
              },
            },
            tools: {
              rspack: {
                name: 'web',
                module: {
                  rules: [
                    {
                      resourceQuery: urlAssetResourceQuery,
                      exclude: cssUrlAssetExtensions,
                      type: 'asset/resource',
                    },
                  ],
                },
                ...(options.federation
                  ? {
                      output: {
                        chunkLoading: 'import',
                      },
                    }
                  : {}),
                externalsType: 'module',
                output: {
                  chunkFormat: 'module',
                  chunkLoading: 'import',
                  workerChunkLoading: 'import',
                  wasmLoading: 'fetch',
                  library: { type: 'module' },
                  module: true,
                },
                optimization: {
                  avoidEntryIife: true,
                  runtimeChunk: 'single',
                },
              },
            },
          },
          // Always include node environment, even for SPA mode (`ssr:false`),
          // because React Router still needs a server build to prerender the
          // root route into a hydratable `index.html` at build time.
          node: {
            source: {
              entry: nodeEntries,
            },
            output: {
              distPath: {
                root: resolve(buildDirectory, 'server'),
              },
              target: config.environments?.node?.output?.target || 'node',
              filename: {
                js: '[name].js',
              },
            },
            tools: {
              rspack: {
                target: options.federation ? 'async-node' : 'node',
                module: {
                  rules: [
                    {
                      resourceQuery: urlAssetResourceQuery,
                      exclude: cssUrlAssetExtensions,
                      type: 'asset/resource',
                    },
                  ],
                },
                externals: nodeExternals,
                ...(shouldDependOnWebCompiler ? { dependencies: ['web'] } : {}),
                externalsType: resolvedServerOutput,
                output: {
                  chunkFormat: resolvedServerOutput,
                  chunkLoading: nodeChunkLoading,
                  workerChunkLoading: nodeChunkLoading,
                  wasmLoading: 'fetch',
                  module: resolvedServerOutput === 'module',
                },
              },
            },
          },
        },
      });
    });

    api.modifyEnvironmentConfig(
      async (config, { name, mergeEnvironmentConfig }) => {
        if (name !== 'web' && name !== 'node') {
          return config;
        }

        return mergeEnvironmentConfig(config, {
          tools: {
            rspack: rspackConfig => {
              if (pluginOptions.federation) {
                ensureFederationAsyncStartup(rspackConfig);
              }

              if (name === 'node') {
                const output = rspackConfig.output;
                if (output) {
                  const library = output.library;
                  const libraryOptions =
                    library &&
                    typeof library === 'object' &&
                    !Array.isArray(library)
                      ? library
                      : {};
                  rspackConfig.output = {
                    ...output,
                    library: {
                      ...libraryOptions,
                      type:
                        resolvedServerOutput === 'module'
                          ? 'module'
                          : 'commonjs2',
                    },
                  };
                }
              }

              return rspackConfig;
            },
          },
        });
      }
    );

    registerModifyBrowserManifestAssets(
      api,
      routes,
      pluginOptions,
      appDirectory,
      () => assetPrefix,
      routeChunkOptions,
      {
        subResourceIntegrity: resolvedConfigWithRoutes.subResourceIntegrity,
        future,
        manifestChunkNames,
        onManifest: (manifest, sri, moduleExportsByRouteId, context) =>
          stageLatestManifests(
            manifest,
            sri,
            moduleExportsByRouteId,
            context.compilation
          ),
      }
    );

    registerBuildOutputTransforms({
      api,
      resolvedServerOutput,
      performanceProfiler,
      getLatestServerManifest: () => latestServerManifest,
      getLatestServerManifestByBundleId: bundleId =>
        latestServerManifestsByBundleId[bundleId],
      routes,
      pluginOptions,
      getClientStats: () => clientStats,
      appDirectory,
      getAssetPrefix: () => assetPrefix,
      routeChunkOptions,
      routeTransformExecutor,
      routeByFilePath,
      routeChunkConfig,
      isBuild,
      splitRouteModules: Boolean(splitRouteModules),
      ssr,
      isSpaMode,
      rootRoutePath,
    });
  },
});
