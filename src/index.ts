import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import fsExtra from 'fs-extra';
import type { Config } from '@react-router/dev/config';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import type { RsbuildPlugin, Rspack } from '@rsbuild/core';
import * as esbuild from 'esbuild';
import { createJiti } from 'jiti';
import jsesc from 'jsesc';
import { extname, relative, resolve } from 'pathe';
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module';
import { generate, parse } from './babel.js';
import {
  BUILD_CLIENT_ROUTE_QUERY_STRING,
  CLIENT_ROUTE_EXPORTS,
  JS_LOADERS,
  PLUGIN_NAME,
  SERVER_ONLY_ROUTE_EXPORTS,
} from './constants.js';
import { createDevServerMiddleware } from './dev-server.js';
import {
  generateWithProps,
  removeExports,
  transformRoute,
  findEntryFile,
  normalizeAssetPrefix,
  removeUnusedImports,
} from './plugin-utils.js';
import type { PluginOptions } from './types.js';
import { generateServerBuild } from './server-utils.js';
import {
  getReactRouterManifestForDev,
  configRoutesToRouteManifest,
} from './manifest.js';
import { createModifyBrowserManifestPlugin } from './modify-browser-manifest.js';
import { createRequestHandler } from 'react-router';
import { init, parse as parseExports } from 'es-module-lexer';
import { warnOnClientSourceMaps } from './warnings/warn-on-client-source-maps.js';
import { validatePluginOrderFromConfig } from './validation/validate-plugin-order.js';
import { getSsrExternals } from './ssr-externals.js';

const getEsbuildLoader = (resourcePath: string): esbuild.Loader => {
  const ext = extname(resourcePath) as keyof typeof JS_LOADERS;
  return JS_LOADERS[ext] ?? 'js';
};

const transformToEsm = async (
  code: string,
  resourcePath: string
): Promise<string> => {
  return (
    await esbuild.transform(code, {
      jsx: 'automatic',
      format: 'esm',
      platform: 'neutral',
      loader: getEsbuildLoader(resourcePath),
    })
  ).code;
};

const getExportNames = async (code: string): Promise<string[]> => {
  await init;
  const [, exportSpecifiers] = await parseExports(code);
  return Array.from(
    new Set(exportSpecifiers.map(specifier => specifier.n).filter(Boolean))
  );
};

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

export const pluginReactRouter = (
  options: PluginOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_NAME,

  async setup(api) {
    const defaultOptions = {
      customServer: false,
      serverOutput: 'module' as const,
    };

    const pluginOptions = {
      ...defaultOptions,
      ...options,
    };

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

    // Add processAssets hook to emit package.json for node environment
    if (pluginOptions.serverOutput === 'commonjs') {
      api.processAssets(
        {
          stage: 'additional',
          targets: ['node'],
        },
        async ({ compilation }) => {
          const { RawSource } = compilation.compiler.webpack.sources;
          const packageJsonPath = 'package.json';
          const source = new RawSource(
            JSON.stringify({
              type: 'commonjs',
            })
          );

          if (compilation.getAsset(packageJsonPath)) {
            compilation.updateAsset(packageJsonPath, source);
          } else {
            compilation.emitAsset(packageJsonPath, source);
          }
        }
      );
    }

    // Warn loudly if client source maps are enabled in production builds.
    // (Upstream behavior: react-router:warn-on-client-source-maps)
    api.onBeforeBuild(() => {
      const normalized = api.getNormalizedConfig();
      warnOnClientSourceMaps(normalized, msg => api.logger.warn(msg), 'web');
    });

    // Run typegen on build/dev
    api.onBeforeStartDevServer(async () => {
      const { execa } = await import('execa');
      // Run typegen in background (non-blocking) for watch mode
      const child = execa(
        'npx',
        ['--yes', 'react-router', 'typegen', '--watch'],
        {
          stdio: 'inherit',
          detached: false,
          cleanup: true,
        }
      );
      // Don't await - let it run in the background
      child.catch(() => {
        // Silently ignore errors when the process is killed on server shutdown
      });
    });

    api.onBeforeBuild(async () => {
      const { execa } = await import('execa');
      // Run typegen synchronously before build
      await execa('npx', ['--yes', 'react-router', 'typegen'], {
        stdio: 'inherit',
      });
    });

    const jiti = createJiti(process.cwd());

    // Read the react-router.config file first (supports .ts, .js, .mjs, etc.)
    const configPath = findEntryFile(resolve('react-router.config'));
    const configExists = existsSync(configPath);
    const {
      appDirectory = 'app',
      basename = '/',
      buildDirectory = 'build',
      future = {},
      allowedActionOrigins,
      routeDiscovery: userRouteDiscovery,
      ssr = true,
      prerender: prerenderConfig,
    } = await jiti
      .import<Config>(configPath, {
        default: true,
      })
      .catch(() => {
        if (!configExists) {
          console.warn(
            'No react-router.config found, using default configuration.'
          );
        }
        return {} as Config;
      });

    // React Router defaults to "lazy" route discovery, but "ssr:false" builds
    // have no runtime server to serve manifest patch requests, so we force
    // `mode:"initial"` in SPA mode to avoid any `/__manifest` fetches.
    const routeDiscovery = !ssr
      ? ({ mode: 'initial' } as const)
      : (userRouteDiscovery ??
        ({ mode: 'lazy', manifestPath: '/__manifest' } as const));

    const routesPath = findEntryFile(resolve(appDirectory, 'routes'));

    // Then read the routes
    const routeConfig = await jiti
      .import<RouteConfigEntry[]>(routesPath, {
        default: true,
      })
      .catch(error => {
        console.error('Failed to load routes file:', error);
        console.error('No routes file found in app directory.');
        return [] as RouteConfigEntry[];
      });

    const entryClientPath = findEntryFile(
      resolve(appDirectory, 'entry.client')
    );
    const entryServerPath = findEntryFile(
      resolve(appDirectory, 'entry.server')
    );

    // Check for server app file
    const serverAppPath = findEntryFile(
      resolve(appDirectory, '../server/index')
    );
    const hasServerApp = existsSync(serverAppPath);

    // Add fallback logic for entry files
    const templateDir = resolve(__dirname, 'templates');
    const templateClientPath = resolve(templateDir, 'entry.client.js');
    const templateServerPath = resolve(templateDir, 'entry.server.js');

    // Use template files if user files don't exist
    const finalEntryClientPath = existsSync(entryClientPath)
      ? entryClientPath
      : templateClientPath;
    const finalEntryServerPath = existsSync(entryServerPath)
      ? entryServerPath
      : templateServerPath;

    const rootRoutePath = findEntryFile(resolve(appDirectory, 'root'));
    // React Router's server build expects route files relative to `appDirectory`
    // so it can resolve them correctly during compilation.
    const rootRouteFile = relative(appDirectory, rootRoutePath);

    const routes = {
      root: { path: '', id: 'root', file: rootRouteFile },
      ...configRoutesToRouteManifest(appDirectory, routeConfig),
    };

    const outputClientPath = resolve(buildDirectory, 'client');
    const assetsBuildDirectory = relative(process.cwd(), outputClientPath);

    let clientStats: Rspack.StatsCompilation | undefined;
    api.onAfterEnvironmentCompile(({ stats, environment }) => {
      if (environment.name === 'web') {
        clientStats = stats?.toJson();
      }
      if (pluginOptions.federation && ssr) {
        const serverBuildDir = resolve(buildDirectory, 'server');
        const clientBuildDir = resolve(buildDirectory, 'client');
        if (existsSync(serverBuildDir)) {
          const ssrDir = resolve(clientBuildDir, 'static');
          fsExtra.copySync(serverBuildDir, ssrDir);
        }
      }
    });

    // Determine prerender paths from config
    const getPrerenderPaths = (): string[] => {
      if (!prerenderConfig) return [];
      if (prerenderConfig === true) {
        // When true, prerender all static routes (routes without params)
        const paths = ['/'];
        const addStaticPaths = (
          routeEntries: RouteConfigEntry[],
          prefix = ''
        ) => {
          for (const route of routeEntries) {
            if (route.path) {
              const fullPath = `${prefix}/${route.path}`
                .replace(/\/+/g, '/')
                .replace(/\/$/, '');
              // Skip routes with dynamic segments
              if (!route.path.includes(':') && route.path !== '*') {
                if (fullPath && fullPath !== '/') {
                  paths.push(fullPath);
                }
              }
            }
            if (route.children) {
              const newPrefix = route.path
                ? `${prefix}/${route.path}`.replace(/\/+/g, '/')
                : prefix;
              addStaticPaths(route.children, newPrefix);
            }
          }
        };
        addStaticPaths(routeConfig);
        return paths;
      }
      if (Array.isArray(prerenderConfig)) {
        return prerenderConfig;
      }
      if (
        typeof prerenderConfig === 'object' &&
        'paths' in prerenderConfig &&
        Array.isArray(prerenderConfig.paths)
      ) {
        return prerenderConfig.paths;
      }
      return [];
    };

    const prerenderPaths = getPrerenderPaths();
    const isSpaMode = !ssr && prerenderPaths.length === 0;
    const isPrerenderMode = prerenderPaths.length > 0;

    // Handle SPA mode and prerendering after build
    api.onAfterBuild(async ({ environments }) => {
      // Skip if SSR is enabled and no prerender paths
      if (ssr && !isPrerenderMode) {
        return;
      }

      const webEnv = environments.web;
      if (!webEnv) {
        return;
      }

      const serverBuildDir = resolve(buildDirectory, 'server');
      const serverBuildFile = 'static/js/app.js';
      const serverBuildPath = resolve(serverBuildDir, serverBuildFile);
      const clientBuildDir = resolve(buildDirectory, 'client');

      if (!existsSync(serverBuildPath)) {
        console.warn(
          `[${PLUGIN_NAME}] Server build not found at ${serverBuildPath}. ` +
            'Skipping prerendering.'
        );
        return;
      }

      const buildModule = await import(
        pathToFileURL(serverBuildPath).toString()
      );
      const requestHandler = createRequestHandler(buildModule, 'production');

      // Helper function to prerender a single path
      const prerenderPath = async (
        path: string,
        options: { isSpaFallback?: boolean } = {}
      ): Promise<void> => {
        const url = `http://localhost${basename}${path}`.replace(/\/+/g, '/');
        const headers: Record<string, string> = {};

        if (options.isSpaFallback) {
          headers['X-React-Router-SPA-Mode'] = 'yes';
        }

        const request = new Request(url, { headers });
        const response = await requestHandler(request);
        const html = await response.text();

        if (response.status !== 200) {
          throw new Error(
            `[${PLUGIN_NAME}] Prerender failed for ${path}: Received status ${response.status}\n${html}`
          );
        }

        if (
          !html.includes('window.__reactRouterContext =') ||
          !html.includes('window.__reactRouterRouteModules =')
        ) {
          throw new Error(
            `[${PLUGIN_NAME}] Prerender failed for ${path}: Missing hydration scripts. ` +
              'Did you forget to include <Scripts/> in your root route?'
          );
        }

        // Determine output file path
        let outputPath: string;
        if (path === '/' || path === '') {
          outputPath = resolve(clientBuildDir, 'index.html');
        } else {
          // Create directory structure for the path
          const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
          const pathDir = resolve(clientBuildDir, cleanPath);
          await mkdir(pathDir, { recursive: true });
          outputPath = resolve(pathDir, 'index.html');
        }

        await writeFile(outputPath, html);
        console.log(`[${PLUGIN_NAME}] Prerendered: ${path} -> ${outputPath}`);
      };

      await mkdir(clientBuildDir, { recursive: true });

      if (isSpaMode) {
        // SPA mode: only prerender root as a fallback
        console.log(`[${PLUGIN_NAME}] SPA mode: Generating index.html...`);
        await prerenderPath('/', { isSpaFallback: true });
      } else if (isPrerenderMode) {
        // Prerender mode: prerender all specified paths
        console.log(
          `[${PLUGIN_NAME}] Prerendering ${prerenderPaths.length} path(s)...`
        );
        for (const path of prerenderPaths) {
          await prerenderPath(path);
        }
      }

      // Remove server output for SPA mode and when not using SSR
      // This makes the build deployable as static assets
      if (!ssr) {
        await fsExtra.remove(serverBuildDir);
        console.log(
          `[${PLUGIN_NAME}] Removed server build (static deployment)`
        );
      }
    });

    // Create virtual modules for React Router
    const vmodPlugin = new RspackVirtualModulePlugin({
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
        allowedActionOrigins,
        prerender: prerenderPaths,
        routeDiscovery,
        publicPath: assetPrefix,
      }),
      'virtual/react-router/with-props': generateWithProps(),
    });

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
      assetPrefix = normalizeAssetPrefix(config.output?.assetPrefix);
      const useAsyncNodeChunkLoading =
        options.federation && pluginOptions.serverOutput === 'commonjs';
      const nodeLibraryType =
        pluginOptions.serverOutput === 'commonjs' && options.federation
          ? 'commonjs2'
          : pluginOptions.serverOutput;
      const nodeChunkLoading =
        pluginOptions.serverOutput === 'module'
          ? 'import'
          : useAsyncNodeChunkLoading
            ? 'async-node'
            : 'require';
      return mergeRsbuildConfig(config, {
        output: {
          assetPrefix: config.output?.assetPrefix || '/',
        },
        dev: {
          writeToDisk: true,
          hmr: false,
          liveReload: true,
          // Only add SSR middleware if SSR is enabled and not using a custom server
          // In SPA mode (ssr: false), we just serve static files from the client build
          setupMiddlewares:
            pluginOptions.customServer || !ssr
              ? []
              : [
                  (middlewares, server) => {
                    middlewares.push(createDevServerMiddleware(server));
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
            source: {
              entry: {
                // no query needed when federation is disabled
                'entry.client': finalEntryClientPath,
                'virtual/react-router/browser-manifest':
                  'virtual/react-router/browser-manifest',
                ...Object.values(routes).reduce((acc: any, route) => {
                  acc[route.file.slice(0, route.file.lastIndexOf('.'))] = {
                    import: `${resolve(
                      appDirectory,
                      route.file
                    )}${BUILD_CLIENT_ROUTE_QUERY_STRING}`,
                  };
                  return acc;
                }, {} as any),
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
                experiments: {
                  topLevelAwait: true,
                  outputModule: true,
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
                  runtimeChunk: 'single',
                },
              },
            },
          },
          // Always include node environment, even for SPA mode (`ssr:false`),
          // because React Router still needs a server build to prerender the
          // root route into a hydratable `index.html` at build time.
          ...(true
            ? {
                node: {
                  source: {
                    entry: {
                      ...(hasServerApp
                        ? {
                            app: serverAppPath,
                          }
                        : {
                            app: 'virtual/react-router/server-build',
                          }),
                      'entry.server': finalEntryServerPath,
                    },
                  },
                  output: {
                    distPath: {
                      root: resolve(buildDirectory, 'server'),
                    },
                    target: config.environments?.node?.output?.target || 'node',
                    filename: {
                      js: 'static/js/[name].js',
                    },
                  },
                  tools: {
                    rspack: {
                      target: options.federation ? 'async-node' : 'node',
                      externals: nodeExternals,
                      dependencies: ['web'],
                      experiments: {
                        outputModule: pluginOptions.serverOutput === 'module',
                        ...(options.federation ? { asyncStartup: true } : {}),
                      },
                      externalsType: pluginOptions.serverOutput,
                      output: {
                        chunkFormat: pluginOptions.serverOutput,
                        chunkLoading: nodeChunkLoading,
                        workerChunkLoading: nodeChunkLoading,
                        wasmLoading: 'fetch',
                        library: { type: nodeLibraryType },
                        module: pluginOptions.serverOutput === 'module',
                      },
                      // optimization: {
                      //     runtimeChunk: 'single',
                      // },
                    },
                  },
                },
              }
            : {}),
        },
      });
    });

    // Add environment-specific modifications
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

              if (name === 'web' && rspackConfig.plugins) {
                rspackConfig.plugins.push(
                  createModifyBrowserManifestPlugin(
                    routes,
                    pluginOptions,
                    appDirectory,
                    assetPrefix
                  )
                );
              }
              return rspackConfig;
            },
          },
        });
      }
    );

    api.processAssets(
      { stage: 'additional', targets: ['node'] },
      ({ sources, compilation }) => {
        const packageJsonPath = 'package.json';
        const source = new sources.RawSource(
          `{"type": "${pluginOptions.serverOutput}"}`
        );

        if (compilation.getAsset(packageJsonPath)) {
          compilation.updateAsset(packageJsonPath, source);
        } else {
          compilation.emitAsset(packageJsonPath, source);
        }
      }
    );

    // Add manifest transformations
    api.transform(
      {
        test: /virtual\/react-router\/(browser|server)-manifest/,
      },
      async args => {
        // For browser manifest, return a placeholder that will be modified by the plugin
        if (args.environment.name === 'web') {
          return {
            code: `window.__reactRouterManifest = "PLACEHOLDER";`,
          };
        }

        // For server manifest, use the clientStats as before
        const manifest = await getReactRouterManifestForDev(
          routes,
          pluginOptions,
          clientStats,
          appDirectory,
          assetPrefix
        );
        return {
          code: `export default ${jsesc(manifest, { es6: true })};`,
        };
      }
    );

    api.transform(
      {
        resourceQuery: /__react-router-build-client-route/,
      },
      async args => {
        const code = await transformToEsm(args.code, args.resourcePath);
        const exportNames = await getExportNames(code);
        const isServer = args.environment?.name === 'node';
        const reexports = exportNames.filter(exp => {
          return (
            (CLIENT_ROUTE_EXPORTS as readonly string[]).includes(exp) ||
            (isServer &&
              (SERVER_ONLY_ROUTE_EXPORTS as readonly string[]).includes(exp))
          );
        });
        const target = `${args.resourcePath}?react-router-route`;
        return {
          code: `export { ${reexports.join(', ')} } from ${JSON.stringify(
            target
          )};`,
        };
      }
    );

    api.transform(
      {
        test: /[\\/]\.server[\\/]|\.server(\.[cm]?[jt]sx?)?$/,
      },
      async args => {
        if (args.environment?.name !== 'web') {
          return { code: args.code, map: null };
        }

        const relativePath = relative(process.cwd(), args.resourcePath);
        throw new Error(
          `[${PLUGIN_NAME}] Server-only module referenced by client: ${relativePath}`
        );
      }
    );

    api.transform(
      {
        test: /[\\/]\.client[\\/]|\.client(\.[cm]?[jt]sx?)?$/,
      },
      async args => {
        if (args.environment?.name !== 'node') {
          return { code: args.code, map: null };
        }

        const code = await transformToEsm(args.code, args.resourcePath);
        const exportNames = await getExportNames(code);
        return {
          code: exportNames
            .map(name =>
              name === 'default'
                ? 'export default undefined;'
                : `export const ${name} = undefined;`
            )
            .join('\n'),
          map: null,
        };
      }
    );

    api.transform(
      {
        resourceQuery: /\?react-router-route/,
      },
      async args => {
        let code: string;
        try {
          code = await transformToEsm(args.code, args.resourcePath);
        } catch (error) {
          console.error(args.resourcePath);
          throw error;
        }

        // Match React Router Vite behavior:
        // In SPA mode, server-only route exports are invalid (except root `loader`),
        // and `HydrateFallback` is only allowed on the root route.
        //
        // Important: `es-module-lexer` can't parse TS/TSX directly, so we scan
        // the ESBuild-transformed JS output.
        if (args.environment.name === 'web' && !ssr && isSpaMode) {
          const exportNames = await getExportNames(code);

          const isRootRoute = args.resourcePath === rootRoutePath;

          const invalidServerOnly = exportNames.filter(exp => {
            if (isRootRoute && exp === 'loader') return false;
            return (SERVER_ONLY_ROUTE_EXPORTS as readonly string[]).includes(
              exp
            );
          });

          if (invalidServerOnly.length > 0) {
            const list = invalidServerOnly.map(e => `\`${e}\``).join(', ');
            throw new Error(
              `SPA Mode: ${invalidServerOnly.length} invalid route export(s) in ` +
                `\`${relative(process.cwd(), args.resourcePath)}\`: ${list}. ` +
                `See https://reactrouter.com/how-to/spa for more information.`
            );
          }

          if (!isRootRoute && exportNames.includes('HydrateFallback')) {
            throw new Error(
              `SPA Mode: Invalid \`HydrateFallback\` export found in ` +
                `\`${relative(process.cwd(), args.resourcePath)}\`. ` +
                `\`HydrateFallback\` is only permitted on the root route in SPA Mode. ` +
                `See https://reactrouter.com/how-to/spa for more information.`
            );
          }
        }

        const defaultExportMatch = code.match(
          /\n\s{0,}([\w\d_]+)\sas default,?/
        );
        if (
          defaultExportMatch &&
          typeof defaultExportMatch.index === 'number'
        ) {
          code =
            code.slice(0, defaultExportMatch.index) +
            code.slice(defaultExportMatch.index + defaultExportMatch[0].length);
          code += `\nexport default ${defaultExportMatch[1]};`;
        }

        const ast = parse(code, { sourceType: 'module' });
        if (args.environment.name === 'web') {
          const mutableServerOnlyRouteExports = [...SERVER_ONLY_ROUTE_EXPORTS];
          removeExports(ast, mutableServerOnlyRouteExports);
        }
        transformRoute(ast);
        if (args.environment.name === 'web') {
          removeUnusedImports(ast);
        }

        return generate(ast, {
          sourceMaps: true,
          filename: args.resource,
          sourceFileName: args.resourcePath,
        });
      }
    );
  },
});
