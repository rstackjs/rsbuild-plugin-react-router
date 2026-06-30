import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import fsExtra from 'fs-extra';
import type { Config } from './react-router-config.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { rspack, type RsbuildPlugin, type Rspack } from '@rsbuild/core';
import { createJiti } from 'jiti';
import { relative, resolve } from 'pathe';

import { getDefaultConcurrency } from './concurrency.js';
import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import { guardReactRouterLazyCompilation } from './lazy-compilation.js';
import { createDevServerMiddleware } from './dev-server.js';
import { findEntryFile, normalizeAssetPrefix } from './plugin-utils.js';
import { resolveReactRouterEntryPaths } from './entry-paths.js';
import { registerReactRouterEnvironmentOutput } from './environment-output.js';
import type { PluginOptions, ReactRouterRSCPluginOptions } from './types.js';
import { resolveReactRouterServerBuild } from './server-utils.js';
import { validatePrerenderConfig } from './prerender.js';
import { runReactRouterPrerenderBuild } from './prerender-build.js';
import {
  resolveReactRouterConfig,
  resolveRouteDiscoveryConfig,
  type ResolvedReactRouterConfig,
} from './react-router-config.js';
import {
  getReactRouterManifestForDev,
  configRoutesToRouteManifest,
  createReactRouterManifestStats,
  type ReactRouterManifestStats,
  type RouteManifestModuleExports,
} from './manifest.js';
import type { RouteModuleAnalysis } from './export-utils.js';
import { registerModifyBrowserManifestAssets } from './modify-browser-manifest.js';
import { registerBuildOutputTransforms } from './build-output-transforms.js';
import { type RouteChunkCache, type RouteChunkConfig } from './route-chunks.js';
import { createRouteTransformExecutor } from './parallel-route-transforms.js';
import {
  mergeWatchFiles,
  registerRouteTopologyDevWatch,
} from './route-watch.js';
import { validateRouteConfig } from './route-config.js';
import { createReactRouterNodeEntries } from './server-build-plan.js';
import { warnOnClientSourceMaps } from './warnings/warn-on-client-source-maps.js';
import { validatePluginOrderFromConfig } from './validation/validate-plugin-order.js';
import { getSsrExternals } from './ssr-externals.js';
import {
  createReactRouterPerformanceProfiler,
  roundMs,
} from './performance.js';
import { mapVirtualModules } from './virtual-modules.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';
import { registerReactRouterTypegen } from './typegen.js';
import { importConfigWithWatchPaths } from './config-imports.js';
import {
  createClassicBuildArtifacts,
  createClassicVirtualModules,
  createClassicWebRouteEntries,
} from './classic-mode.js';
import {
  assertReactRouterRscSupport,
  createReactRouterRscDevServerSetup,
  createReactRouterRscResolveAliases,
  createReactRouterRscVirtualModules,
  registerReactRouterRscRouteTransforms,
  setupReactRouterRscPlugin,
} from './rsc-support.js';

export { loadReactRouterServerBuild } from './dev-generation.js';
export { resolveReactRouterServerBuild };
export type { PluginOptions, ReactRouterRSCPluginOptions } from './types.js';

const MIN_PARALLEL_ENVIRONMENT_BUILD_SPARE_CORES = 4;
const requireFromApp = createRequire(resolve(process.cwd(), 'package.json'));

const resolveAppPackagePath = (specifier: string): string | undefined => {
  try {
    return requireFromApp.resolve(specifier);
  } catch {
    return undefined;
  }
};

const createReactRouterPackageAliases = ({
  preserveReactRouterExports = false,
}: {
  preserveReactRouterExports?: boolean;
} = {}): Record<string, string> => {
  if (preserveReactRouterExports) {
    return {};
  }

  const reactRouterPath = resolveAppPackagePath('react-router');
  const reactRouterDomPath = resolveAppPackagePath('react-router/dom');
  return {
    ...(reactRouterPath ? { 'react-router$': reactRouterPath } : {}),
    ...(reactRouterDomPath ? { 'react-router/dom$': reactRouterDomPath } : {}),
  };
};

type ReactRouterPresetResolvedConfig = Parameters<
  NonNullable<
    NonNullable<Config['presets']>[number]['reactRouterConfigResolved']
  >
>[0]['reactRouterConfig'];

export const shouldParallelizeEnvironmentBuilds = ({
  isBuild,
  spareCoreCount = getDefaultConcurrency(),
}: {
  isBuild: boolean;
  spareCoreCount?: number;
}): boolean =>
  !isBuild && spareCoreCount >= MIN_PARALLEL_ENVIRONMENT_BUILD_SPARE_CORES;

const cssUrlAssetExtensions =
  /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)$/;
const urlAssetResourceQuery =
  /^(?=.*(?:\?|&)url(?:&|$))(?!.*(?:\?|&)(?:raw|inline)(?:&|$))/;

export const pluginReactRouter = (options: PluginOptions = {}): RsbuildPlugin =>
  createReactRouterPlugin(options);

const RSC_LAYERS = rspack.experiments.rsc.Layers;

const createReactRouterPlugin = (
  options: PluginOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_NAME,

  async setup(api) {
    const defaultOptions = {
      customServer: false,
      rsc: false,
      serverOutput: 'module' as const,
    };

    const pluginOptions = {
      ...defaultOptions,
      ...options,
    };
    const isRscMode = Boolean(pluginOptions.rsc);
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

    registerReactRouterTypegen(api);

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

    const routeDiscovery = resolveRouteDiscoveryConfig({
      ssr,
      userRouteDiscovery,
    });

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

    const {
      devServerBuildEntryName,
      finalEntryClientPath,
      finalEntryRscClientPath,
      finalEntryRscPath,
      finalEntryRscSsrPath,
      finalEntryServerPath,
      hasServerApp,
      serverAppPath,
    } = resolveReactRouterEntryPaths({
      appDirectory,
      templatesDirectory: resolve(__dirname, 'templates'),
    });

    if (isRscMode) {
      assertReactRouterRscSupport({
        pluginName: PLUGIN_NAME,
        resolvePackagePath: resolveAppPackagePath,
      });
      await setupReactRouterRscPlugin({
        api,
        entryRscPath: finalEntryRscPath,
        entrySsrPath: finalEntryRscSsrPath,
        pluginName: PLUGIN_NAME,
        rsc:
          pluginOptions.rsc && pluginOptions.rsc !== true
            ? pluginOptions.rsc
            : true,
      });
    }

    const getRootRoutePath = () => findEntryFile(resolve(appDirectory, 'root'));
    const rootRoutePath = getRootRoutePath();
    // React Router's server build expects route files relative to `appDirectory`
    // so it can resolve them correctly during compilation.
    const rootRouteFile = relative(appDirectory, rootRoutePath);

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
        reactRouterConfig:
          resolvedConfigForPreset as ReactRouterPresetResolvedConfig,
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
      splitRouteModules: isRscMode ? false : splitRouteModules,
      appDirectory,
      rootRouteFile,
    };
    const routeChunkCache: RouteChunkCache = new Map();
    const routeTransformExecutor = isRscMode
      ? undefined
      : createRouteTransformExecutor({
          parallelTransforms: pluginOptions.parallelTransforms,
          routeChunkCache,
          splitRouteModules: Boolean(splitRouteModules),
        });
    const transformedRouteModuleAnalyses = new Map<
      string,
      RouteModuleAnalysis
    >();
    const rememberRouteModuleAnalysis = (
      resourcePath: string,
      analysis: RouteModuleAnalysis
    ) => {
      transformedRouteModuleAnalyses.set(resolve(resourcePath), analysis);
    };
    const routeChunkOptions = isRscMode
      ? undefined
      : {
          splitRouteModules,
          rootRouteFile,
          isBuild,
          cache: routeChunkCache,
          analyzeRouteModule: async (routeFilePath: string) =>
            transformedRouteModuleAnalyses.get(resolve(routeFilePath)),
        };
    const outputClientPath = resolve(buildDirectory, 'client');
    const assetsBuildDirectory = relative(process.cwd(), outputClientPath);
    const routeWatchFiles = isBuild
      ? []
      : registerRouteTopologyDevWatch({
          api,
          appDirectory,
          configWatchPaths,
          getRootRouteFile: () => relative(appDirectory, getRootRoutePath()),
          loadRouteConfig,
          onRouteTopologyChange: pluginOptions.onRouteTopologyChange,
          outputClientPath,
          pluginName: PLUGIN_NAME,
          routeConfig,
          routeConfigWatchPaths,
        });

    if (!isBuild) {
      api.onAfterCreateCompiler(() => {
        routeTransformExecutor?.prewarm();
      });
    }

    const closeRouteTransformExecutor = () =>
      runPluginEffect(tryPluginPromise(() => routeTransformExecutor?.close()));
    api.onCloseBuild(closeRouteTransformExecutor);
    api.onCloseDevServer(closeRouteTransformExecutor);

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
          latestBrowserManifestModuleExports = moduleExportsByRouteId;
          const baseServerManifest = {
            ...manifest,
            sri,
          };
          latestServerManifest = baseServerManifest;
          const manifestsByEntryName: Record<string, ReactRouterManifest> = {
            [devServerBuildEntryName]: baseServerManifest,
          };

          if (!classicBuildArtifacts) {
            return;
          }

          for (const {
            bundleId,
            entryName,
          } of classicBuildArtifacts.serverBundleEntries) {
            const bundleRoutes =
              classicBuildArtifacts.routesByServerBundleId[bundleId];
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
            classicBuildArtifacts.devRuntime.captureWeb(
              compilation,
              manifestsByEntryName
            );
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

    const classicWebRouteEntries = isRscMode
      ? undefined
      : createClassicWebRouteEntries({
          appDirectory,
          isBuild,
          routes,
          splitRouteModules: Boolean(splitRouteModules),
        });
    const manifestChunkNames =
      classicWebRouteEntries?.manifestChunkNames ?? new Set<string>(['index']);
    const webRouteEntries = classicWebRouteEntries?.webRouteEntries ?? {};
    const classicBuildArtifacts = isRscMode
      ? undefined
      : await createClassicBuildArtifacts({
          api,
          defaultEntryName: devServerBuildEntryName,
          isBuild,
          prerenderConfig,
          reactRouterConfig: resolvedConfigWithRoutes,
          routeConfig,
          routes,
          rootDirectory: process.cwd(),
          ssr,
        });
    const rscServerEntryName = (serverBuildFile || 'index.js').replace(
      /\.js$/,
      ''
    );

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

    if (classicBuildArtifacts && routeChunkOptions) {
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
              prerenderPaths: classicBuildArtifacts.prerenderPaths,
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
              buildManifest: classicBuildArtifacts.buildManifest,
              resolvedConfigWithRoutes,
              buildEnd,
            })
          )
        )
      );
    }

    const allowedActionOriginsForBuild =
      allowedActionOrigins === false ? undefined : allowedActionOrigins;

    // Public requests stay bare while Rspack resolves seeded virtual files.
    const createVirtualModulePlugin = (publicPath: string) => {
      const rscVirtualModules: Record<string, string> = isRscMode
        ? createReactRouterRscVirtualModules({
            appDirectory,
            basename,
            buildDirectory,
            isBuild,
            outputClientPath,
            publicPath,
            routeDiscovery,
            routes,
            ssr,
          })
        : {};
      const classicVirtualModules = classicBuildArtifacts
        ? createClassicVirtualModules({
            allowedActionOrigins: allowedActionOriginsForBuild,
            appDirectory,
            assetsBuildDirectory,
            basename,
            entryServerPath: finalEntryServerPath,
            federation: options.federation,
            future,
            prerenderPaths: classicBuildArtifacts.prerenderPaths,
            publicPath,
            routeDiscovery,
            routes,
            routesByServerBundleId:
              classicBuildArtifacts.routesByServerBundleId,
            ssr,
          })
        : {};

      return new rspack.experiments.VirtualModulesPlugin(
        mapVirtualModules({
          ...classicVirtualModules,
          ...rscVirtualModules,
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
      const nodeEntries = classicBuildArtifacts
        ? createReactRouterNodeEntries({
            hasServerApp,
            isBuild,
            serverAppPath,
            entryServerPath: finalEntryServerPath,
            defaultEntryName: devServerBuildEntryName,
            serverBundleEntries: classicBuildArtifacts.serverBundleEntries,
          })
        : {};

      const configuredLazyCompilation =
        pluginOptions.lazyCompilation === undefined
          ? config.dev?.lazyCompilation
          : pluginOptions.lazyCompilation;
      const guardedLazyCompilation = guardReactRouterLazyCompilation({
        lazyCompilation: configuredLazyCompilation,
        entryClientPath: finalEntryClientPath,
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
      const reactRouterAliases = isRscMode
        ? {}
        : createReactRouterPackageAliases();
      const reactRouterRscAliases: Record<string, string> = isRscMode
        ? createReactRouterRscResolveAliases(api.context.rootPath)
        : {};
      const resolveAliases: Record<string, string> = {
        ...reactRouterAliases,
        ...reactRouterRscAliases,
      };

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
        server:
          isRscMode && !pluginOptions.customServer && ssr
            ? {
                setup: createReactRouterRscDevServerSetup({
                  entryName: rscServerEntryName,
                  pluginName: PLUGIN_NAME,
                }),
              }
            : undefined,
        dev: {
          writeToDisk: true,
          ...lazyCompilation,
          watchFiles: mergeWatchFiles(config.dev?.watchFiles, routeWatchFiles),
          setupMiddlewares:
            !classicBuildArtifacts || pluginOptions.customServer || !ssr
              ? []
              : [
                  middlewares => {
                    middlewares.push(
                      createDevServerMiddleware({
                        loadBuild:
                          classicBuildArtifacts.devRuntime.createBuildLoader(),
                      })
                    );
                  },
                ],
        },
        tools: {
          rspack: {
            resolve:
              isRscMode || Object.keys(resolveAliases).length > 0
                ? {
                    ...(isRscMode
                      ? {
                          modules: [
                            resolve(api.context.rootPath, 'node_modules'),
                            'node_modules',
                          ],
                        }
                      : {}),
                    ...(Object.keys(resolveAliases).length > 0
                      ? { alias: resolveAliases }
                      : {}),
                  }
                : undefined,
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
              entry: isRscMode
                ? {
                    index: {
                      import: finalEntryRscClientPath,
                      html: false,
                    },
                  }
                : {
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
                externalsType: isRscMode ? undefined : 'module',
                output: isRscMode
                  ? {
                      chunkFormat: 'array-push',
                      chunkLoading: 'jsonp',
                      workerChunkLoading: 'import-scripts',
                      wasmLoading: 'fetch',
                      module: false,
                    }
                  : {
                      chunkFormat: 'module',
                      chunkLoading: 'import',
                      workerChunkLoading: 'import',
                      wasmLoading: 'fetch',
                      library: { type: 'module' },
                      module: true,
                    },
                optimization: {
                  ...(isRscMode
                    ? {
                        mangleExports: false,
                        splitChunks: false,
                        usedExports: false,
                      }
                    : { avoidEntryIife: true }),
                  runtimeChunk: isRscMode ? false : 'single',
                },
              },
            },
          },
          // Always include node environment, even for SPA mode (`ssr:false`),
          // because React Router still needs a server build to prerender the
          // root route into a hydratable `index.html` at build time.
          node: {
            source: {
              entry: isRscMode
                ? {
                    [rscServerEntryName]: {
                      import: finalEntryRscPath,
                      layer: RSC_LAYERS.rsc,
                    },
                  }
                : nodeEntries,
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
                externals: isRscMode ? undefined : nodeExternals,
                ...(shouldDependOnWebCompiler && !isRscMode
                  ? { dependencies: ['web'] }
                  : {}),
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

    registerReactRouterEnvironmentOutput({
      api,
      federation: pluginOptions.federation,
      resolvedServerOutput,
    });

    if (isRscMode) {
      registerReactRouterRscRouteTransforms({
        api,
        isBuild,
        performanceProfiler,
        routeByFilePath,
        routeChunkCache,
        routeChunkConfig,
      });
    } else {
      if (!routeChunkOptions || !routeTransformExecutor) {
        throw new Error(
          `[${PLUGIN_NAME}] Classic React Router mode was initialized without route transform support.`
        );
      }

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
        onRouteModuleAnalysis: rememberRouteModuleAnalysis,
      });
    }
  },
});

export const pluginReactRouterRSC = (
  options: ReactRouterRSCPluginOptions = {}
): RsbuildPlugin | RsbuildPlugin[] =>
  pluginReactRouter({
    ...options,
    rsc: options.rsc ?? true,
  });
