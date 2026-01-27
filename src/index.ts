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
      const { $ } = await import('execa');
      $`npx --yes react-router typegen --watch`;
    });

    api.onBeforeBuild(async () => {
      const { $ } = await import('execa');
      $`npx --yes react-router typegen`;
    });

    const jiti = createJiti(process.cwd());

    // Read the react-router.config file first (supports .ts, .js, .mjs, etc.)
    const configPath = findEntryFile(resolve('react-router.config'));
    const configExists = existsSync(configPath);
    const {
      appDirectory = 'app',
      basename = '/',
      buildDirectory = 'build',
      ssr = true,
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

    // Set default routeDiscovery configuration
    const routeDiscovery = { mode: 'lazy', manifestPath: '/__manifest' } as const;

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

    const rootRouteFile = relative(
      appDirectory,
      resolve(appDirectory, 'root.tsx')
    );

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

    // SPA Mode (`ssr:false`) still needs a one-time server render of the root route
    // at build time to generate a hydratable `index.html`, matching React Router's
    // own Vite implementation.
    api.onAfterBuild(async ({ environments }) => {
      if (ssr) {
        return;
      }

      const webEnv = environments.web;
      if (!webEnv) {
        return;
      }

      // We intentionally mirror react-router's `handleSpaMode` logic:
      // 1) Load the server build (even though we don't ship it)
      // 2) Request the basename with the SPA-mode header
      // 3) Write the resulting HTML to `client/index.html`
      const serverBuildDir = resolve(buildDirectory, 'server');
      const serverBuildFile = 'static/js/app.js';
      const serverBuildPath = resolve(serverBuildDir, serverBuildFile);
      const clientBuildDir = resolve(buildDirectory, 'client');

      // In some setups, users might remove the server build output.
      // If it's not present, we can't generate a proper SPA HTML fallback.
      if (!existsSync(serverBuildPath)) {
        console.warn(
          `[${PLUGIN_NAME}] SPA mode is enabled (ssr:false) but the server build was not found at ${serverBuildPath}. ` +
            'Skipping index.html generation.'
        );
        return;
      }

      const buildModule = await import(pathToFileURL(serverBuildPath).toString());
      const requestHandler = createRequestHandler(buildModule, 'production');
      const request = new Request(`http://localhost${basename}`, {
        headers: {
          // Enable SPA mode in the server runtime and only render down to the root
          'X-React-Router-SPA-Mode': 'yes',
        },
      });
      const response = await requestHandler(request);
      const html = await response.text();

      if (response.status !== 200) {
        throw new Error(
          `[${PLUGIN_NAME}] SPA mode: Received a ${response.status} status code from the server build while generating index.html.\n` +
            html
        );
      }

      if (
        !html.includes('window.__reactRouterContext =') ||
        !html.includes('window.__reactRouterRouteModules =')
      ) {
        throw new Error(
          `[${PLUGIN_NAME}] SPA mode: Did you forget to include <Scripts/> in your root route? ` +
            'The pre-rendered HTML cannot hydrate without it.'
        );
      }

      await mkdir(clientBuildDir, { recursive: true });
      await writeFile(resolve(clientBuildDir, 'index.html'), html);

      // Remove server output for SPA mode so the build is deployable as static assets.
      // This matches the behavior of React Router's official Vite plugin.
      await fsExtra.remove(serverBuildDir);
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
          setupMiddlewares: pluginOptions.customServer
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
