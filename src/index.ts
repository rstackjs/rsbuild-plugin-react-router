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
import { relative, resolve } from 'pathe';
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module';
import { generate, parse } from './babel.js';
import { PLUGIN_NAME, SERVER_ONLY_ROUTE_EXPORTS } from './constants.js';
import { createDevServerMiddleware } from './dev-server.js';
import {
  generateWithProps,
  removeExports,
  transformRoute,
  findEntryFile,
} from './plugin-utils.js';
import type { PluginOptions } from './types.js';
import { generateServerBuild } from './server-utils.js';
import {
  getReactRouterManifestForDev,
  configRoutesToRouteManifest,
} from './manifest.js';
import { createModifyBrowserManifestPlugin } from './modify-browser-manifest.js';
import { transformRouteFederation } from './transform-route-federation.js';
import { createRequestHandler } from 'react-router';
import { init, parse as parseExports } from 'es-module-lexer';

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
      }),
      'virtual/react-router/with-props': generateWithProps(),
    });

    api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
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
                'entry.client':
                  finalEntryClientPath +
                  (options.federation ? '?react-router-route-federation' : ''),
                'virtual/react-router/browser-manifest':
                  'virtual/react-router/browser-manifest',
                ...Object.values(routes).reduce((acc: any, route) => {
                  acc[route.file.slice(0, route.file.lastIndexOf('.'))] = {
                    import: `${resolve(
                      appDirectory,
                      route.file
                    )}?${options.federation ? 'react-router-route-federation' : 'react-router-route'}`,
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
                            app:
                              serverAppPath +
                              (options.federation
                                ? '?react-router-route-federation'
                                : ''),
                          }
                        : {
                            app:
                              'virtual/react-router/server-build' +
                              (options.federation
                                ? '?react-router-route-federation'
                                : ''),
                          }),
                      'entry.server':
                        finalEntryServerPath +
                        (options.federation
                          ? '?react-router-route-federation'
                          : ''),
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
                      externals: ['express'],
                      dependencies: ['web'],
                      experiments: {
                        outputModule: pluginOptions.serverOutput === 'module',
                      },
                      externalsType: pluginOptions.serverOutput,
                      output: {
                        chunkFormat: pluginOptions.serverOutput,
                        chunkLoading:
                          pluginOptions.serverOutput === 'module'
                            ? 'import'
                            : options.federation
                              ? 'async-node'
                              : 'require',
                        workerChunkLoading:
                          pluginOptions.serverOutput === 'module'
                            ? 'import'
                            : 'require',
                        wasmLoading: 'fetch',
                        library: { type: pluginOptions.serverOutput },
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
        if (name === 'web') {
          return mergeEnvironmentConfig(config, {
            tools: {
              rspack: rspackConfig => {
                if (rspackConfig.plugins) {
                  rspackConfig.plugins.push(
                    createModifyBrowserManifestPlugin(
                      routes,
                      pluginOptions,
                      appDirectory
                    )
                  );
                }
                return rspackConfig;
              },
            },
          });
        }
        return config;
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
          appDirectory
        );
        return {
          code: `export default ${jsesc(manifest, { es6: true })};`,
        };
      }
    );

    api.transform(
      {
        resourceQuery: /\?react-router-route-federation/,
      },
      async args => {
        return await transformRouteFederation(args);
      }
    );

    api.transform(
      {
        resourceQuery: /\?react-router-route/,
      },
      async args => {
        let code;
        try {
          code = (
            await esbuild.transform(args.code, {
              jsx: 'automatic',
              format: 'esm',
              platform: 'neutral',
              loader: args.resourcePath.endsWith('x') ? 'tsx' : 'ts',
            })
          ).code;
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
          await init;
          const [_, exportSpecifiers] = await parseExports(code);
          const exportNames = exportSpecifiers.map(s => s.n);

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

        return generate(ast, {
          sourceMaps: true,
          filename: args.resource,
          sourceFileName: args.resourcePath,
        });
      }
    );
  },
});
