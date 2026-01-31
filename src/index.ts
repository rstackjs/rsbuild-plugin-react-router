import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import fsExtra from 'fs-extra';
import type { Config } from '@react-router/dev/config';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import type { RsbuildPlugin, Rspack } from '@rsbuild/core';
import { createJiti } from 'jiti';
import jsesc from 'jsesc';
import { dirname, relative, resolve } from 'pathe';
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module';
import { generate, parse } from './babel.js';
import {
  BUILD_CLIENT_ROUTE_QUERY_STRING,
  CLIENT_ROUTE_EXPORTS,
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
import { generateServerBuild, normalizeBuildModule, resolveBuildExports } from './server-utils.js';
import {
  getPrerenderConcurrency,
  resolvePrerenderPaths,
  validatePrerenderConfig,
} from './prerender.js';
import {
  getReactRouterManifestForDev,
  configRoutesToRouteManifest,
} from './manifest.js';
import { createModifyBrowserManifestPlugin } from './modify-browser-manifest.js';
import { createRequestHandler, matchRoutes } from 'react-router';
import {
  getExportNames,
  getRouteModuleExports,
  transformToEsm,
} from './export-utils.js';
import { validateRouteConfig } from './route-config.js';
import { warnOnClientSourceMaps } from './warnings/warn-on-client-source-maps.js';
import { validatePluginOrderFromConfig } from './validation/validate-plugin-order.js';
import { getSsrExternals } from './ssr-externals.js';

const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);

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
    let reactRouterUserConfig: Config = {};
    if (!configExists) {
      console.warn('No react-router.config found, using default configuration.');
    } else {
      const displayPath = relative(process.cwd(), configPath);
      try {
        const imported = await jiti.import<Config>(configPath, { default: true });
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
      appDirectory = 'app',
      basename = '/',
      buildDirectory = 'build',
      future = {},
      allowedActionOrigins,
      routeDiscovery: userRouteDiscovery,
      ssr = true,
      prerender: prerenderConfig,
    } = reactRouterUserConfig;

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

    const routesPath = findEntryFile(resolve(appDirectory, 'routes'));
    if (!existsSync(routesPath)) {
      throw new Error(
        `Route config file not found at "${relative(
          process.cwd(),
          routesPath
        )}".`
      );
    }

    const routeConfigExport = await jiti.import<RouteConfigEntry[]>(routesPath, {
      default: true,
    });
    const validation = validateRouteConfig({
      routeConfigFile: relative(process.cwd(), routesPath),
      routeConfig: routeConfigExport,
    });
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    const routeConfig = validation.routeConfig;

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
    const prerenderPaths = await resolvePrerenderPaths(
      prerenderConfig,
      ssr,
      routeConfig,
      {
        logWarning: true,
        warn: message => api.logger.warn(message),
      }
    );
    const isPrerenderEnabled =
      prerenderConfig !== undefined && prerenderConfig !== false;
    const isSpaMode = !ssr && !isPrerenderEnabled;

    const groupRoutesByParentId = (manifest: Record<string, any>) => {
      const grouped: Record<string, any[]> = {};
      Object.values(manifest).forEach(route => {
        if (!route) return;
        const parentId = route.parentId || '';
        if (!grouped[parentId]) {
          grouped[parentId] = [];
        }
        grouped[parentId].push(route);
      });
      return grouped;
    };

    const createPrerenderRoutes = (
      manifest: Record<string, any>,
      parentId = '',
      grouped = groupRoutesByParentId(manifest)
    ): RouteConfigEntry[] => {
      return (grouped[parentId] || []).map(route => {
        const common = { id: route.id, path: route.path };
        if (route.index) {
          return { index: true, ...common } as RouteConfigEntry;
        }
        return {
          ...common,
          children: createPrerenderRoutes(manifest, route.id, grouped),
        } as RouteConfigEntry;
      });
    };

    const normalizePrerenderMatchPath = (path: string) =>
      `/${path}/`.replace(/^\/\/+/, '/');

    const prerenderData = async (
      handler: (request: Request) => Promise<Response>,
      prerenderPath: string,
      onlyRoutes: string[] | null,
      clientBuildDir: string,
      requestInit?: RequestInit
    ): Promise<string> => {
      let dataRequestPath: string;
      if (future?.unstable_trailingSlashAwareDataRequests) {
        if (prerenderPath.endsWith('/')) {
          dataRequestPath = `${prerenderPath}_.data`;
        } else {
          dataRequestPath = `${prerenderPath}.data`;
        }
      } else {
        dataRequestPath =
          prerenderPath === '/'
            ? '/_root.data'
            : `${prerenderPath.replace(/\/$/, '')}.data`;
      }

      const normalizedPath = `${basename}${dataRequestPath}`.replace(
        /\/\/+/g,
        '/'
      );
      const url = new URL(`http://localhost${normalizedPath}`);
      if (onlyRoutes?.length) {
        url.searchParams.set('_routes', onlyRoutes.join(','));
      }
      const request = new Request(url, requestInit);
      const response = await handler(request);
      const data = await response.text();

      if (response.status !== 200 && response.status !== 202) {
        throw new Error(
          `Prerender (data): Received a ${response.status} status code from ` +
            `\`entry.server.tsx\` while prerendering the \`${prerenderPath}\` path.\n` +
            `${normalizedPath}`
        );
      }

      const outputPath = resolve(clientBuildDir, ...normalizedPath.split('/'));
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, data);
      api.logger.info(
        `Prerender (data): ${prerenderPath} -> ${relative(
          process.cwd(),
          outputPath
        )}`
      );
      return data;
    };

    const prerenderRoute = async (
      handler: (request: Request) => Promise<Response>,
      prerenderPath: string,
      clientBuildDir: string,
      requestInit?: RequestInit
    ): Promise<void> => {
      const normalizedPath = `${basename}${prerenderPath}/`.replace(
        /\/\/+/g,
        '/'
      );
      const request = new Request(`http://localhost${normalizedPath}`, requestInit);
      const response = await handler(request);
      let html = await response.text();

      if (redirectStatusCodes.has(response.status)) {
        const location = response.headers.get('Location');
        const delay = response.status === 302 ? 2 : 0;
        html = `<!doctype html>
<head>
<title>Redirecting to: ${location}</title>
<meta http-equiv="refresh" content="${delay};url=${location}">
<meta name="robots" content="noindex">
</head>
<body>
\t<a href="${location}">
    Redirecting from <code>${normalizedPath}</code> to <code>${location}</code>
  </a>
</body>
</html>`;
      } else if (response.status !== 200) {
        throw new Error(
          `Prerender (html): Received a ${response.status} status code from ` +
            `\`entry.server.tsx\` while prerendering the \`${normalizedPath}\` path.\n` +
            html
        );
      }

      const outputPath = resolve(
        clientBuildDir,
        ...normalizedPath.split('/'),
        'index.html'
      );
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, html);
      api.logger.info(
        `Prerender (html): ${prerenderPath} -> ${relative(
          process.cwd(),
          outputPath
        )}`
      );
    };

    const prerenderResourceRoute = async (
      handler: (request: Request) => Promise<Response>,
      prerenderPath: string,
      clientBuildDir: string,
      requestInit?: RequestInit
    ): Promise<void> => {
      const normalizedPath = `${basename}${prerenderPath}/`
        .replace(/\/\/+/g, '/')
        .replace(/\/$/g, '');
      const request = new Request(`http://localhost${normalizedPath}`, requestInit);
      const response = await handler(request);
      const content = Buffer.from(await response.arrayBuffer());

      if (response.status !== 200) {
        throw new Error(
          `Prerender (resource): Received a ${response.status} status code from ` +
            `\`entry.server.tsx\` while prerendering the \`${normalizedPath}\` path.\n` +
            content.toString('utf8')
        );
      }

      const outputPath = resolve(clientBuildDir, ...normalizedPath.split('/'));
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, content);
      api.logger.info(
        `Prerender (resource): ${prerenderPath} -> ${relative(
          process.cwd(),
          outputPath
        )}`
      );
    };

    const handleSpaMode = async (
      handler: (request: Request) => Promise<Response>,
      build: any,
      clientBuildDir: string
    ): Promise<void> => {
      const request = new Request(`http://localhost${basename}`, {
        headers: {
          'X-React-Router-SPA-Mode': 'yes',
        },
      });
      const response = await handler(request);
      const html = await response.text();
      const isPrerenderSpaFallback = build.prerender?.includes('/');
      const filename = isPrerenderSpaFallback ? '__spa-fallback.html' : 'index.html';

      if (response.status !== 200) {
        if (isPrerenderSpaFallback) {
          throw new Error(
            `Prerender: Received a ${response.status} status code from ` +
              `\`entry.server.tsx\` while prerendering your \`${filename}\` file.\n` +
              html
          );
        }
        throw new Error(
          `SPA Mode: Received a ${response.status} status code from ` +
            `\`entry.server.tsx\` while prerendering your \`${filename}\` file.\n` +
            html
        );
      }

      if (
        !html.includes('window.__reactRouterContext =') ||
        !html.includes('window.__reactRouterRouteModules =')
      ) {
        throw new Error(
          'SPA Mode: Did you forget to include `<Scripts/>` in your root route? ' +
            'Your pre-rendered HTML cannot hydrate without `<Scripts />`.'
        );
      }

      const outputPath = resolve(clientBuildDir, filename);
      await writeFile(outputPath, html);
      const prettyPath = relative(process.cwd(), outputPath);
      if (build.prerender?.length) {
        api.logger.info(`Prerender (html): SPA Fallback -> ${prettyPath}`);
      } else {
        api.logger.info(`SPA Mode: Generated ${prettyPath}`);
      }
    };

    const validateSsrFalsePrerenderExports = async (
      manifest: Awaited<ReturnType<typeof getReactRouterManifestForDev>>,
      prerenderList: string[]
    ) => {
      if (prerenderList.length === 0) {
        return;
      }

      const prerenderRoutes = createPrerenderRoutes(routes);
      const prerenderedRoutes = new Set<string>();
      for (const path of prerenderList) {
        const matches = matchRoutes(
          prerenderRoutes,
          normalizePrerenderMatchPath(path)
        );
        if (!matches) {
          throw new Error(
            `Unable to prerender path because it does not match any routes: ${path}`
          );
        }
        matches.forEach(match => prerenderedRoutes.add(match.route.id as string));
      }

      const routeExports: Record<string, string[]> = {};
      for (const route of Object.values(routes)) {
        const filePath = resolve(appDirectory, route.file);
        routeExports[route.id] = await getRouteModuleExports(filePath);
      }

      const errors: string[] = [];
      for (const [routeId, route] of Object.entries(manifest.routes)) {
        const exports = routeExports[routeId] ?? [];
        const invalidApis: string[] = [];

        if (exports.includes('headers')) invalidApis.push('headers');
        if (exports.includes('action')) invalidApis.push('action');

        if (invalidApis.length > 0) {
          errors.push(
            `Prerender: ${invalidApis.length} invalid route export(s) in ` +
              `\`${routeId}\` when pre-rendering with \`ssr:false\`: ` +
              `${invalidApis.map(api => `\`${api}\``).join(', ')}. ` +
              `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
          );
        }

        if (!prerenderedRoutes.has(routeId)) {
          if (exports.includes('loader')) {
            errors.push(
              `Prerender: 1 invalid route export in \`${routeId}\` when pre-rendering with ` +
                `\`ssr:false\`: \`loader\`. ` +
                `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
            );
          }

          let parentRoute =
            route.parentId && manifest.routes[route.parentId]
              ? manifest.routes[route.parentId]
              : null;
          while (parentRoute && parentRoute.id !== 'root') {
            if (parentRoute.hasLoader && !parentRoute.hasClientLoader) {
              errors.push(
                `Prerender: 1 invalid route export in \`${parentRoute.id}\` when ` +
                  `pre-rendering with \`ssr:false\`: \`loader\`. ` +
                  `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
              );
            }
            parentRoute =
              parentRoute.parentId && parentRoute.parentId !== 'root'
                ? manifest.routes[parentRoute.parentId]
                : null;
          }
        }
      }

      if (errors.length > 0) {
        api.logger.error(errors.join('\n'));
        throw new Error('Invalid route exports found when prerendering with `ssr:false`');
      }
    };

    // Handle SPA mode and prerendering after build
    api.onAfterBuild(async ({ environments }) => {
      if (ssr && !isPrerenderEnabled) {
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

      await mkdir(clientBuildDir, { recursive: true });

      const buildModule = await import(pathToFileURL(serverBuildPath).toString());
      const normalizedBuild = normalizeBuildModule(buildModule as any);
      const build = await resolveBuildExports(normalizedBuild);
      const requestHandler = createRequestHandler(build, 'production');

      if (isPrerenderEnabled) {
        const manifest = await getReactRouterManifestForDev(
          routes,
          pluginOptions,
          clientStats,
          appDirectory,
          assetPrefix
        );
        if (!ssr) {
          await validateSsrFalsePrerenderExports(manifest, prerenderPaths);
        }

        const routeTree = createPrerenderRoutes(routes);
        for (const path of prerenderPaths) {
          const matches = matchRoutes(
            routeTree,
            normalizePrerenderMatchPath(path)
          );
          if (!matches) {
            throw new Error(
              `Unable to prerender path because it does not match any routes: ${path}`
            );
          }
        }

        if (prerenderPaths.length > 0) {
          api.logger.info(
            `Prerender (html): ${prerenderPaths.length} path(s)...`
          );
        }

        const buildRoutes = createPrerenderRoutes(build.routes);
        const concurrency = getPrerenderConcurrency(prerenderConfig);
        const pending = new Set<Promise<void>>();
        const enqueue = async (path: string) => {
          const matches = matchRoutes(
            buildRoutes,
            normalizePrerenderMatchPath(path)
          );
          if (!matches) return;

          const leafRoute = matches[matches.length - 1]?.route as any;
          const manifestRoute = leafRoute ? build.routes?.[leafRoute.id]?.module : null;
          const isResourceRoute =
            manifestRoute && !manifestRoute.default && !manifestRoute.ErrorBoundary;

          if (isResourceRoute) {
            if (manifestRoute.loader) {
              await prerenderData(
                requestHandler,
                path,
                [leafRoute.id],
                clientBuildDir
              );
              await prerenderResourceRoute(
                requestHandler,
                path,
                clientBuildDir
              );
            } else {
              api.logger.warn(
                `⚠️ Skipping prerendering for resource route without a loader: ${leafRoute?.id}`
              );
            }
          } else {
            const hasLoaders = matches.some(match =>
              build.assets?.routes?.[match.route.id]?.hasLoader
            );
            let data: string | undefined;
            if (hasLoaders) {
              data = await prerenderData(
                requestHandler,
                path,
                null,
                clientBuildDir
              );
            }
            await prerenderRoute(
              requestHandler,
              path,
              clientBuildDir,
              data
                ? {
                    headers: {
                      'X-React-Router-Prerender-Data': encodeURI(data),
                    },
                  }
                : undefined
            );
          }
        };

        for (const path of prerenderPaths) {
          const task = enqueue(path);
          pending.add(task);
          task.finally(() => pending.delete(task));
          if (pending.size >= concurrency) {
            await Promise.race(pending);
          }
        }
        await Promise.all(pending);
      }

      if (!ssr) {
        await handleSpaMode(requestHandler, build, clientBuildDir);
      }

      // Remove server output for SPA mode and when not using SSR
      // This makes the build deployable as static assets
      if (!ssr) {
        await fsExtra.remove(serverBuildDir);
        api.logger.info(
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
        const hasExportStar =
          /\bexport\s*\*\s*(?!as\s)from\s*['"]/.test(code);

        if (hasExportStar) {
          throw new Error(
            `[${PLUGIN_NAME}] Client-only module uses \`export * from\`, ` +
              `which cannot be safely stubbed for the server build. ` +
              `Please explicitly re-export named bindings in ` +
              `\`${relative(process.cwd(), args.resourcePath)}\`.`
          );
        }
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
