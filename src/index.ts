import { existsSync } from 'node:fs';
import fsExtra from 'fs-extra';
import type { Config } from './react-router-config.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { rspack, type RsbuildPlugin, type Rspack } from '@rsbuild/core';
import { createJiti } from 'jiti';
import { relative, resolve } from 'pathe';

import { getDefaultConcurrency } from './concurrency.js';
import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import { guardReactRouterLazyCompilation } from './lazy-compilation.js';
import {
  findEntryFile,
  normalizeAssetPrefix,
  resolveAppPackagePath,
  resolveEffectiveAssetPrefix,
} from './plugin-utils.js';
import { resolveReactRouterEntryPaths } from './entry-paths.js';
import { registerReactRouterEnvironmentOutput } from './environment-output.js';
import type { PluginOptions, ReactRouterRSCPluginOptions } from './types.js';
import { resolveReactRouterServerBuild } from './server-utils.js';
import { validatePrerenderConfig } from './prerender.js';
import { runReactRouterPrerenderBuild } from './prerender-build.js';
import { runReactRouterRscPrerenderBuild } from './rsc-prerender.js';
import {
  resolveReactRouterConfig,
  resolveRouteDiscoveryConfig,
  type ResolvedReactRouterConfig,
} from './react-router-config.js';
import {
  configRoutesToRouteManifest,
  createReactRouterManifestStats,
  type ReactRouterManifestForDev as ReactRouterManifest,
  type ReactRouterManifestStats,
  type RouteManifestModuleExports,
} from './manifest.js';
import type { RouteModuleAnalysis } from './export-utils.js';
import { registerModifyBrowserManifestAssets } from './modify-browser-manifest.js';
import { registerBuildOutputTransforms } from './build-output-transforms.js';
import { type RouteChunkCache } from './route-chunks.js';
import { getRouteRestartMarkerPath, mergeWatchFiles } from './route-watch.js';
import { validateRouteConfig } from './route-config.js';
import { warnOnClientSourceMaps } from './warnings/warn-on-client-source-maps.js';
import { validatePluginOrderFromConfig } from './validation/validate-plugin-order.js';
import {
  createReactRouterPerformanceProfiler,
  roundMs,
} from './performance.js';
import { mapVirtualModules } from './virtual-modules.js';
import {
  createDevHdrRevisionSignal,
  generateDevHmrRuntimeModule,
  getDevHdrRevisionFilePath,
  resolveReactRefreshRuntimePath,
} from './dev-hmr.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';
import { registerReactRouterTypegen } from './typegen.js';
import { importConfigWithWatchPaths } from './config-imports.js';
import {
  createReactRouterRouteTopology,
  createReactRouterRouteWatchFiles,
  registerReactRouterDevBackgroundResources,
} from './dev-background-resources.js';
import {
  assertReactRouterRscConfigSupport,
  assertReactRouterRscSupport,
  registerReactRouterRscRouteTransforms,
  setupReactRouterRscPlugin,
} from './rsc-support.js';
import { createReactRouterModePlan } from './mode-plan.js';
import { createQuerylessRouteImportPlugin } from './route-imports.js';

export { loadReactRouterServerBuild } from './dev-generation.js';
export { resolveReactRouterServerBuild };
export type { Config as ReactRouterRsbuildConfig } from './react-router-config.js';
export type { PluginOptions, ReactRouterRSCPluginOptions } from './types.js';

const MIN_PARALLEL_ENVIRONMENT_BUILD_SPARE_CORES = 4;

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

export const pluginReactRouter = (
  options: PluginOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_NAME,

  async setup(api) {
    const defaultOptions = {
      customServer: false,
      lazyCompilation: true,
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
        return config;
      },
    });

    api.onBeforeBuild(() => {
      const normalized = api.getNormalizedConfig();
      warnOnClientSourceMaps(normalized, msg => api.logger.warn(msg), 'web');
    });

    api.onBeforeCreateCompiler(() => {
      const normalized = api.getNormalizedConfig();
      assetPrefix = resolveEffectiveAssetPrefix({
        dev: normalized.dev,
        output: normalized.output,
        isBuild: api.context.action === 'build',
      });
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

    const routeDiscovery = resolveRouteDiscoveryConfig({
      ssr,
      userRouteDiscovery,
    });

    (globalThis as any).__reactRouterAppDirectory = resolve(appDirectory);
    const routesPath = findEntryFile(resolve(appDirectory, 'routes'));
    if (!existsSync(routesPath)) {
      const missingRoutesPath = relative(
        process.cwd(),
        resolve(appDirectory, 'routes.ts')
      );
      throw new Error(`Route config file not found at "${missingRoutesPath}".`);
    }

    const jiti = createJiti(process.cwd(), {
      moduleCache: false,
    });
    const importRouteConfig = async (
      importer: Pick<typeof jiti, 'import'>
    ): Promise<RouteConfigEntry[]> => {
      const routeConfigFile = relative(resolve(appDirectory), routesPath);
      let routeConfigValue: RouteConfigEntry[];
      try {
        const routeConfigExport = await importer.import<RouteConfigEntry[]>(
          routesPath,
          {
            default: true,
          }
        );
        routeConfigValue = await routeConfigExport;
      } catch (error) {
        // Match upstream: import/evaluation failures (e.g. syntax errors) are
        // reported as an invalid route config rather than a raw loader error.
        throw new Error(
          [
            `Route config in "${routeConfigFile}" is invalid.`,
            '',
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          ].join('\n')
        );
      }
      const validation = validateRouteConfig({
        routeConfigFile,
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
      assertReactRouterRscConfigSupport({
        pluginName: PLUGIN_NAME,
        userConfig: reactRouterUserConfig,
      });
      await setupReactRouterRscPlugin({
        api,
        entryRscPath: finalEntryRscPath,
        entrySsrPath: finalEntryRscSsrPath,
        pluginName: PLUGIN_NAME,
        rsc: typeof pluginOptions.rsc === 'object' ? pluginOptions.rsc : {},
      });
    }

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
    const routeChunkCache: RouteChunkCache = new Map();
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
    const routeModuleAnalysis = async (routeFilePath: string) =>
      transformedRouteModuleAnalyses.get(resolve(routeFilePath));
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
    let latestBrowserManifest: ReactRouterManifest | null = null;
    let latestBrowserManifestModuleExports: RouteManifestModuleExports = {};
    let latestServerManifest: ReactRouterManifest | null = null;
    const latestServerManifestsByBundleId: Record<string, ReactRouterManifest> =
      {};

    const routeByFilePath = new Map(
      Object.values(routes).map(route => [
        resolve(appDirectory, route.file),
        route,
      ])
    );
    const allowedActionOriginsForBuild =
      allowedActionOrigins === false ? undefined : allowedActionOrigins;

    const devHmrRefreshRuntimePath =
      isBuild || isRscMode
        ? undefined
        : resolveReactRefreshRuntimePath(api.context.rootPath);
    const devHdrSignal = devHmrRefreshRuntimePath
      ? createDevHdrRevisionSignal({
          filePath: getDevHdrRevisionFilePath(api.context.rootPath),
          onError: error =>
            api.logger.debug(
              `[${PLUGIN_NAME}] Failed to signal hot data revalidation: ${error.message}`
            ),
        })
      : undefined;
    devHdrSignal?.ensure();
    const devHmrEnabled = devHmrRefreshRuntimePath !== undefined;

    const commonModeOptions = {
      api,
      allowedActionOriginsForBuild,
      appDirectory,
      basename,
      customServer: pluginOptions.customServer,
      isBuild,
      prerenderConfig,
      routeConfig,
      routeDiscovery,
      routes,
      rootRouteFile,
      splitRouteModules,
      ssr,
    };
    const modePlan = await (isRscMode
      ? createReactRouterModePlan({
          ...commonModeOptions,
          isRscMode: true,
          buildDirectory,
          finalEntryRscClientPath,
          finalEntryRscPath,
          outputClientPath,
          pluginName: PLUGIN_NAME,
          serverBuildFile,
        })
      : createReactRouterModePlan({
          ...commonModeOptions,
          isRscMode: false,
          assetsBuildDirectory,
          defaultEntryName: devServerBuildEntryName,
          entryServerPath: finalEntryServerPath,
          federation: options.federation,
          finalEntryClientPath,
          future,
          hasServerApp,
          parallelRouteTransform: pluginOptions.parallelRouteTransform,
          reactRouterConfig: resolvedConfigWithRoutes,
          routeChunkCache,
          routeCount,
          serverAppPath,
          shouldDependOnWebCompiler,
          devHmr:
            devHmrRefreshRuntimePath && devHdrSignal
              ? {
                  enabled: true,
                  runtimeModule: generateDevHmrRuntimeModule({
                    reactRefreshRuntimePath: devHmrRefreshRuntimePath,
                    hdrRevisionFilePath: devHdrSignal.filePath,
                  }),
                  onNodeRebuildCommitted: () => devHdrSignal.bump(),
                }
              : undefined,
        }));

    const { manifestChunkNames } = modePlan;

    const devBackgroundResources = registerReactRouterDevBackgroundResources({
      api,
      isBuild,
      lazyCompilationPrewarm: pluginOptions.unstableLazyCompilationPrewarm,
      routeTransformExecutor:
        modePlan.kind === 'classic'
          ? modePlan.routeTransformExecutor
          : undefined,
      routeRestartMarkerPath,
      watchDirectory,
      getRouteTopology: routeTopology.getRouteTopology,
      initialRouteTopology: routeTopology.initialRouteTopology,
      onRouteTopologyChange: pluginOptions.onRouteTopologyChange,
    });

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

          if (modePlan.kind !== 'classic') {
            return;
          }

          for (const { bundleId, entryName } of modePlan.artifacts
            .serverBundleEntries) {
            const bundleRoutes =
              modePlan.artifacts.routesByServerBundleId[bundleId];
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
            modePlan.artifacts.devRuntime.captureWeb(
              compilation,
              manifestsByEntryName
            );
          }
        }
      );
    };

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

    if (modePlan.kind === 'classic') {
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
              prerenderPaths: modePlan.artifacts.prerenderPaths,
              basename,
              future,
              routes,
              latestBrowserManifest,
              latestBrowserManifestModuleExports,
              clientStats,
              pluginOptions,
              appDirectory,
              assetPrefix,
              routeChunkOptions: modePlan.routeChunkOptions,
              routeModuleAnalysis,
              buildManifest: modePlan.artifacts.buildManifest,
              resolvedConfigWithRoutes,
              buildEnd,
            })
          )
        )
      );
    } else {
      api.onAfterBuild(({ environments }) =>
        runPluginEffect(
          tryPluginPromise(() =>
            runReactRouterRscPrerenderBuild({
              api,
              hasWebEnvironment: Boolean(environments.web),
              buildDirectory,
              serverBuildFile,
              ssr,
              prerenderConfig,
              prerenderPaths: modePlan.prerenderPaths,
              basename,
            })
          )
        )
      );
    }

    // Public requests stay bare while Rspack resolves seeded virtual files.
    const createVirtualModulePlugin = (publicPath: string) => {
      return new rspack.experiments.VirtualModulesPlugin(
        mapVirtualModules(modePlan.createVirtualModules(publicPath))
      );
    };

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      const vmodPlugin = createVirtualModulePlugin(
        normalizeAssetPrefix(config.output?.assetPrefix)
      );
      const useAsyncNodeChunkLoading =
        options.federation && resolvedServerOutput === 'commonjs';
      let nodeChunkLoading: 'import' | 'async-node' | 'require' = 'require';
      if (resolvedServerOutput === 'module') {
        nodeChunkLoading = 'import';
      } else if (useAsyncNodeChunkLoading) {
        nodeChunkLoading = 'async-node';
      }
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
      const resolveConfig = modePlan.createResolveConfig(api.context.rootPath);
      type SourceMapConfig =
        | NonNullable<NonNullable<typeof config.output>['sourceMap']>
        | undefined;
      const hasConfiguredNodeJsSourceMap = (
        sourceMap: SourceMapConfig
      ): boolean =>
        sourceMap === false ||
        sourceMap === true ||
        (typeof sourceMap === 'object' &&
          sourceMap !== null &&
          sourceMap.js !== undefined);
      const hasConfiguredNodeSourceMap =
        hasConfiguredNodeJsSourceMap(config.output?.sourceMap) ||
        hasConfiguredNodeJsSourceMap(
          config.environments?.node?.output?.sourceMap
        );

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
        server: modePlan.server,
        dev: {
          writeToDisk: true,
          ...lazyCompilation,
          watchFiles: mergeWatchFiles(config.dev?.watchFiles, routeWatchFiles),
        },
        tools: {
          rspack: {
            resolve: resolveConfig,
            plugins: [
              vmodPlugin,
              createQuerylessRouteImportPlugin(routeByFilePath),
            ],
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
              entry: modePlan.webEntries,
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
                resolve: resolveConfig,
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
                externalsType: modePlan.webExternalsType,
                output: modePlan.webOutput,
                optimization: modePlan.webOptimization,
              },
            },
          },
          // Always include node environment, even for SPA mode (`ssr:false`),
          // because React Router still needs a server build to prerender the
          // root route into a hydratable `index.html` at build time.
          node: {
            source: {
              entry: modePlan.nodeEntries,
            },
            output: {
              ...(!isBuild && !hasConfiguredNodeSourceMap
                ? {
                    sourceMap: {
                      js: 'inline-source-map',
                    },
                  }
                : {}),
              distPath: {
                root: resolve(buildDirectory, 'server'),
              },
              target: config.environments?.node?.output?.target || 'node',
              filename: {
                js: '[name].js',
                css: (pathData: Rspack.PathData) => {
                  const sourceName = pathData.chunk?.name ?? '[name]';
                  if (!isBuild) {
                    return `${sourceName}.css`;
                  }
                  const baseName =
                    sourceName.split(/[\\/]/).pop() || sourceName;
                  return `../assets/${baseName}.[contenthash:10].css`;
                },
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
                externals: modePlan.nodeExternals,
                ...modePlan.nodeDependencies,
                externalsType: resolvedServerOutput,
                output: {
                  chunkFormat: resolvedServerOutput,
                  chunkLoading: nodeChunkLoading,
                  workerChunkLoading: nodeChunkLoading,
                  wasmLoading: 'fetch',
                  module: resolvedServerOutput === 'module',
                  chunkFilename: 'static/js/async/[name].js',
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

    if (modePlan.kind === 'rsc') {
      registerReactRouterRscRouteTransforms({
        api,
        isBuild,
        performanceProfiler,
        routeByFilePath,
        routeChunkCache,
        routeChunkConfig: modePlan.routeChunkConfig,
      });
    } else {
      registerModifyBrowserManifestAssets(
        api,
        routes,
        pluginOptions,
        appDirectory,
        () => assetPrefix,
        modePlan.routeChunkOptions,
        {
          subResourceIntegrity: resolvedConfigWithRoutes.subResourceIntegrity,
          future,
          manifestChunkNames,
          routeModuleAnalysis,
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
        routeChunkOptions: modePlan.routeChunkOptions,
        routeModuleAnalysis,
        routeTransformExecutor: modePlan.routeTransformExecutor,
        routeByFilePath,
        routeChunkConfig: modePlan.routeChunkConfig,
        isBuild,
        splitRouteModules: Boolean(modePlan.routeChunkConfig.splitRouteModules),
        ssr,
        isSpaMode,
        rootRoutePath,
        outputClientPath,
        devHmrEnabled,
        onRouteModuleAnalysis: rememberRouteModuleAnalysis,
      });
    }
  },
});

export const pluginReactRouterRSC = (
  options: ReactRouterRSCPluginOptions = {}
): RsbuildPlugin =>
  pluginReactRouter({
    ...options,
    rsc: options.rsc ?? true,
  });
