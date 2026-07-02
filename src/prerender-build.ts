import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import fsExtra from 'fs-extra';
import * as Effect from 'effect/Effect';
import type { RsbuildPluginAPI } from '@rsbuild/core';
import {
  createRequestHandler,
  matchRoutes,
  type ServerBuild,
} from 'react-router';
import { dirname, relative, resolve } from 'pathe';
import { PLUGIN_NAME } from './constants.js';
import { getBuildManifest } from './build-manifest.js';
import {
  generateReactRouterManifestForDev,
  getReactRouterManifestForDev,
  type ReactRouterManifestStats,
  type RouteManifestModuleExports,
} from './manifest.js';
import {
  createPrerenderRoutes,
  getPrerenderConcurrency,
  getSsrFalsePrerenderExportErrors,
  normalizePrerenderMatchPath,
} from './prerender.js';
import type {
  Config,
  ResolvedReactRouterConfig,
} from './react-router-config.js';
import { resolveServerBuildModule } from './server-utils.js';
import type { PluginOptions, Route } from './types.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';

type ReactRouterManifest = Awaited<
  ReturnType<typeof getReactRouterManifestForDev>
>;

type BuildRouteModule = {
  loader?: unknown;
  default?: unknown;
  ErrorBoundary?: unknown;
};

type PrerenderServerBuild = ServerBuild & {
  routes: Record<string, { id?: string; module?: BuildRouteModule }>;
  assets?: {
    routes?: Record<string, { hasLoader?: boolean }>;
  };
  prerender?: string[];
};

type PrerenderBuildApi = Pick<
  RsbuildPluginAPI,
  'logger' | 'getNormalizedConfig'
>;

type RunReactRouterPrerenderBuildOptions = {
  api: PrerenderBuildApi;
  hasWebEnvironment: boolean;
  buildDirectory: string;
  serverBuildFile?: string;
  ssr: boolean;
  isPrerenderEnabled: boolean;
  prerenderConfig: Config['prerender'];
  prerenderPaths: string[];
  basename: string;
  future: ResolvedReactRouterConfig['future'];
  routes: Record<string, Route>;
  latestBrowserManifest: ReactRouterManifest | null;
  latestBrowserManifestModuleExports: RouteManifestModuleExports;
  clientStats: ReactRouterManifestStats | undefined;
  pluginOptions: PluginOptions;
  appDirectory: string;
  assetPrefix: string;
  routeChunkOptions: Parameters<typeof getReactRouterManifestForDev>[5];
  buildManifest: Awaited<ReturnType<typeof getBuildManifest>>;
  resolvedConfigWithRoutes: ResolvedReactRouterConfig;
  buildEnd: Config['buildEnd'];
};

const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);

const getServerBuildPath = async ({
  buildDirectory,
  serverBuildFile,
}: {
  buildDirectory: string;
  serverBuildFile?: string;
}): Promise<{ serverBuildDir: string; serverBuildPath: string }> => {
  const serverBuildDir = resolve(buildDirectory, 'server');
  const defaultServerBuildFile = 'static/js/app.js';
  const configuredServerBuildFile = serverBuildFile || 'index.js';
  const configuredServerBuildPath = resolve(
    serverBuildDir,
    configuredServerBuildFile
  );
  const defaultServerBuildPath = resolve(
    serverBuildDir,
    defaultServerBuildFile
  );

  if (
    configuredServerBuildFile !== defaultServerBuildFile &&
    existsSync(defaultServerBuildPath) &&
    !existsSync(configuredServerBuildPath)
  ) {
    await mkdir(dirname(configuredServerBuildPath), { recursive: true });
    await fsExtra.copy(defaultServerBuildPath, configuredServerBuildPath);
  }

  return {
    serverBuildDir,
    serverBuildPath: existsSync(configuredServerBuildPath)
      ? configuredServerBuildPath
      : defaultServerBuildPath,
  };
};

const createDataRequestPath = (
  prerenderPath: string,
  trailingSlashAwareDataRequests: boolean
): string => {
  if (trailingSlashAwareDataRequests) {
    return prerenderPath.endsWith('/')
      ? `${prerenderPath}_.data`
      : `${prerenderPath}.data`;
  }

  return prerenderPath === '/'
    ? '/_root.data'
    : `${prerenderPath.replace(/\/$/, '')}.data`;
};

export const createBuildRequestEffect = <T>(
  input: string | URL,
  init: RequestInit | undefined,
  handle: (request: Request) => Promise<T>
): Effect.Effect<T, Error, never> =>
  Effect.acquireUseRelease(
    Effect.sync(() => new AbortController()),
    controller =>
      tryPluginPromise(() =>
        handle(
          new Request(input, {
            ...init,
            signal: controller.signal,
          })
        )
      ),
    controller =>
      Effect.sync(() => {
        controller.abort();
      })
  );

export const withBuildRequest = <T>(
  input: string | URL,
  init: RequestInit | undefined,
  handle: (request: Request) => Promise<T>
): Promise<T> => runPluginEffect(createBuildRequestEffect(input, init, handle));

const prerenderData = async ({
  handler,
  prerenderPath,
  onlyRoutes,
  clientBuildDir,
  basename,
  trailingSlashAwareDataRequests,
  api,
  requestInit,
}: {
  handler: (request: Request) => Promise<Response>;
  prerenderPath: string;
  onlyRoutes: string[] | null;
  clientBuildDir: string;
  basename: string;
  trailingSlashAwareDataRequests: boolean;
  api: PrerenderBuildApi;
  requestInit?: RequestInit;
}): Promise<string> => {
  const dataRequestPath = createDataRequestPath(
    prerenderPath,
    trailingSlashAwareDataRequests
  );
  const normalizedPath = `${basename}${dataRequestPath}`.replace(/\/\/+/g, '/');
  const url = new URL(`http://localhost${normalizedPath}`);
  if (onlyRoutes?.length) {
    url.searchParams.set('_routes', onlyRoutes.join(','));
  }

  return withBuildRequest(url, requestInit, async request => {
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
  });
};

const prerenderRoute = async ({
  handler,
  prerenderPath,
  clientBuildDir,
  basename,
  api,
  requestInit,
}: {
  handler: (request: Request) => Promise<Response>;
  prerenderPath: string;
  clientBuildDir: string;
  basename: string;
  api: PrerenderBuildApi;
  requestInit?: RequestInit;
}): Promise<void> => {
  const normalizedPath = `${basename}${prerenderPath}/`.replace(/\/\/+/g, '/');
  await withBuildRequest(
    `http://localhost${normalizedPath}`,
    requestInit,
    async request => {
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
    }
  );
};

const prerenderResourceRoute = async ({
  handler,
  prerenderPath,
  clientBuildDir,
  basename,
  api,
  requestInit,
}: {
  handler: (request: Request) => Promise<Response>;
  prerenderPath: string;
  clientBuildDir: string;
  basename: string;
  api: PrerenderBuildApi;
  requestInit?: RequestInit;
}): Promise<void> => {
  const normalizedPath = `${basename}${prerenderPath}/`
    .replace(/\/\/+/g, '/')
    .replace(/\/$/g, '');
  await withBuildRequest(
    `http://localhost${normalizedPath}`,
    requestInit,
    async request => {
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
    }
  );
};

const handleSpaMode = async ({
  handler,
  build,
  clientBuildDir,
  basename,
  api,
}: {
  handler: (request: Request) => Promise<Response>;
  build: PrerenderServerBuild;
  clientBuildDir: string;
  basename: string;
  api: PrerenderBuildApi;
}): Promise<void> => {
  await withBuildRequest(
    `http://localhost${basename}`,
    {
      headers: {
        'X-React-Router-SPA-Mode': 'yes',
      },
    },
    async request => {
      const response = await handler(request);
      const html = await response.text();
      const isPrerenderSpaFallback = build.prerender?.includes('/');
      const filename = isPrerenderSpaFallback
        ? '__spa-fallback.html'
        : 'index.html';

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
    }
  );
};

const assertValidSsrFalsePrerenderExports = ({
  routes,
  manifestRoutes,
  routeExports,
  prerenderPaths,
  api,
}: {
  routes: Record<string, Route>;
  manifestRoutes: ReactRouterManifest['routes'];
  routeExports: RouteManifestModuleExports;
  prerenderPaths: string[];
  api: PrerenderBuildApi;
}) => {
  const errors = getSsrFalsePrerenderExportErrors({
    routes,
    manifestRoutes,
    routeExports,
    prerenderPaths,
  });
  if (errors.length > 0) {
    api.logger.error(errors.join('\n'));
    throw new Error(
      'Invalid route exports found when prerendering with `ssr:false`'
    );
  }
};

const validatePrerenderPathMatches = (
  routes: Record<string, Route>,
  prerenderPaths: string[]
): void => {
  const routeTree = createPrerenderRoutes(routes);
  for (const path of prerenderPaths) {
    const matches = matchRoutes(routeTree, normalizePrerenderMatchPath(path));
    if (!matches) {
      throw new Error(
        `Unable to prerender path because it does not match any routes: ${path}`
      );
    }
  }
};

export const createBoundedPrerenderTasksEffect = (
  prerenderPaths: string[],
  concurrency: number,
  renderPath: (path: string) => Effect.Effect<void, Error, never>
): Effect.Effect<void, Error, never> =>
  Effect.forEach(prerenderPaths, renderPath, { concurrency, discard: true });

const createPrerenderPathEffect = ({
  path,
  build,
  buildRoutes,
  requestHandler,
  clientBuildDir,
  options,
}: {
  path: string;
  build: PrerenderServerBuild;
  buildRoutes: ReturnType<typeof createPrerenderRoutes>;
  requestHandler: (request: Request) => Promise<Response>;
  clientBuildDir: string;
  options: RunReactRouterPrerenderBuildOptions;
}): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    const { api, basename, future } = options;
    const matches = matchRoutes(buildRoutes, normalizePrerenderMatchPath(path));
    if (!matches) {
      return;
    }

    const leafRoute = matches[matches.length - 1]?.route;
    const routeId = leafRoute?.id;
    const manifestRoute = routeId ? build.routes?.[routeId]?.module : null;
    const isResourceRoute =
      manifestRoute && !manifestRoute.default && !manifestRoute.ErrorBoundary;

    if (isResourceRoute) {
      if (manifestRoute.loader && routeId) {
        yield* tryPluginPromise(() =>
          prerenderData({
            handler: requestHandler,
            prerenderPath: path,
            onlyRoutes: [routeId],
            clientBuildDir,
            basename,
            trailingSlashAwareDataRequests:
              future.unstable_trailingSlashAwareDataRequests,
            api,
          })
        );
        yield* tryPluginPromise(() =>
          prerenderResourceRoute({
            handler: requestHandler,
            prerenderPath: path,
            clientBuildDir,
            basename,
            api,
          })
        );
      } else {
        yield* Effect.sync(() => {
          api.logger.warn(
            `⚠️ Skipping prerendering for resource route without a loader: ${routeId}`
          );
        });
      }
      return;
    }

    const hasLoaders = matches.some(match => {
      const matchedRouteId = match.route.id;
      if (!matchedRouteId) {
        return false;
      }
      return build.assets?.routes?.[matchedRouteId]?.hasLoader;
    });
    const data = hasLoaders
      ? yield* tryPluginPromise(() =>
          prerenderData({
            handler: requestHandler,
            prerenderPath: path,
            onlyRoutes: null,
            clientBuildDir,
            basename,
            trailingSlashAwareDataRequests:
              future.unstable_trailingSlashAwareDataRequests,
            api,
          })
        )
      : undefined;

    yield* tryPluginPromise(() =>
      prerenderRoute({
        handler: requestHandler,
        prerenderPath: path,
        clientBuildDir,
        basename,
        api,
        requestInit: data
          ? {
              headers: {
                'X-React-Router-Prerender-Data': encodeURI(data),
              },
            }
          : undefined,
      })
    );
  });

const runPrerenderPaths = async ({
  build,
  requestHandler,
  clientBuildDir,
  options,
}: {
  build: PrerenderServerBuild;
  requestHandler: (request: Request) => Promise<Response>;
  clientBuildDir: string;
  options: RunReactRouterPrerenderBuildOptions;
}): Promise<void> => {
  const { prerenderConfig, prerenderPaths } = options;
  const buildRoutes = createPrerenderRoutes(build.routes);
  const concurrency = getPrerenderConcurrency(prerenderConfig);

  await runPluginEffect(
    createBoundedPrerenderTasksEffect(prerenderPaths, concurrency, path =>
      createPrerenderPathEffect({
        path,
        build,
        buildRoutes,
        requestHandler,
        clientBuildDir,
        options,
      })
    )
  );
};

export const runReactRouterPrerenderBuild = async (
  options: RunReactRouterPrerenderBuildOptions
): Promise<void> => {
  if (!options.hasWebEnvironment) {
    return;
  }

  const {
    api,
    buildDirectory,
    serverBuildFile,
    ssr,
    isPrerenderEnabled,
    prerenderPaths,
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
    basename,
  } = options;
  const { serverBuildDir, serverBuildPath } = await getServerBuildPath({
    buildDirectory,
    serverBuildFile,
  });
  const clientBuildDir = resolve(buildDirectory, 'client');

  if (!existsSync(serverBuildPath)) {
    console.warn(
      `[${PLUGIN_NAME}] Server build not found at ${serverBuildPath}. ` +
        'Skipping prerendering.'
    );
    return;
  }

  await mkdir(clientBuildDir, { recursive: true });

  if (!ssr || isPrerenderEnabled) {
    process.env.IS_RR_BUILD_REQUEST = 'yes';
    const buildModule = await import(pathToFileURL(serverBuildPath).toString());
    const build = (await resolveServerBuildModule(
      buildModule,
      `Server build ${JSON.stringify(serverBuildPath)}`
    )) as PrerenderServerBuild;
    const requestHandler = createRequestHandler(build, 'production');

    if (isPrerenderEnabled) {
      if (!ssr) {
        const generated = latestBrowserManifest
          ? {
              manifest: latestBrowserManifest,
              moduleExportsByRouteId: latestBrowserManifestModuleExports,
            }
          : await generateReactRouterManifestForDev(
              routes,
              pluginOptions,
              clientStats,
              appDirectory,
              assetPrefix,
              routeChunkOptions
            );
        assertValidSsrFalsePrerenderExports({
          routes,
          manifestRoutes: generated.manifest.routes,
          routeExports: generated.moduleExportsByRouteId,
          prerenderPaths,
          api,
        });
      }

      validatePrerenderPathMatches(routes, prerenderPaths);

      if (prerenderPaths.length > 0) {
        api.logger.info(
          `Prerender (html): ${prerenderPaths.length} path(s)...`
        );
      }

      await runPrerenderPaths({
        build,
        requestHandler,
        clientBuildDir,
        options,
      });
    }

    if (!ssr) {
      await handleSpaMode({
        handler: requestHandler,
        build,
        clientBuildDir,
        basename,
        api,
      });
    }
  }

  if (!ssr) {
    await fsExtra.remove(serverBuildDir);
    api.logger.info(
      `[${PLUGIN_NAME}] Removed server build (static deployment)`
    );
  }

  if (buildEnd) {
    await buildEnd({
      buildManifest,
      reactRouterConfig: resolvedConfigWithRoutes,
      viteConfig: api.getNormalizedConfig(),
    });
  }
};
