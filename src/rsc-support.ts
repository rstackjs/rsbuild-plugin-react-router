import { readFileSync } from 'node:fs';
import { createRequestListener } from '@remix-run/node-fetch-server';
import type { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { relative, resolve } from 'pathe';
import type { Config } from './react-router-config.js';
import type { RouteChunkCache, RouteChunkConfig } from './route-chunks.js';
import type { PluginOptions, Route } from './types.js';
import { getVirtualModuleFilePath } from './virtual-modules.js';
import {
  createRscInternalClientModule,
  createRscRouteConfig,
} from './rsc-route-config.js';
import { transformRscRouteModule } from './rsc-route-transforms.js';

const RSC_VIRTUAL_ALIAS_IDS = [
  'routes',
  'route-discovery',
  'inject-hmr-runtime',
  'basename',
  'react-router-serve-config',
  'bootstrap-scripts',
] as const;

type RscDevServer = {
  environments: {
    node: {
      loadBundle<T>(entryName: string): Promise<T>;
    };
  };
};

type RscServerBuild = {
  default?: {
    fetch?: (request: Request) => Promise<Response>;
  };
};

type RscVirtualModulesOptions = {
  appDirectory: string;
  basename: string;
  buildDirectory: string;
  isBuild: boolean;
  outputClientPath: string;
  publicPath: string;
  routeDiscovery: Config['routeDiscovery'];
  routes: Record<string, Route>;
  ssr: boolean;
};

type RscPluginOptions = Exclude<NonNullable<PluginOptions['rsc']>, boolean>;

type RscDevServerSetup = NonNullable<
  NonNullable<RsbuildConfig['server']>['setup']
>;

type RscRouteTransformProfiler = {
  record<T>(
    environmentName: string | undefined,
    label: string,
    resource: string,
    task: () => Promise<T>
  ): Promise<T>;
};

const mdxRoutePattern = /\.mdx?$/i;

const getPackageVersion = (
  packageName: string,
  resolvePackagePath: (specifier: string) => string | undefined
): string | undefined => {
  const packageJsonPath = resolvePackagePath(`${packageName}/package.json`);
  if (!packageJsonPath) {
    return undefined;
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: unknown;
    };
    return typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined;
  } catch {
    return undefined;
  }
};

const supportsReactRouterRsc = (version: string | undefined): boolean => {
  const match = version?.match(/^(\d+)\.(\d+)\./);
  if (!match) {
    return false;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return major >= 8 || (major === 7 && minor >= 18);
};

export const assertReactRouterRscSupport = ({
  pluginName,
  resolvePackagePath,
}: {
  pluginName: string;
  resolvePackagePath: (specifier: string) => string | undefined;
}): void => {
  const reactRouterVersion = getPackageVersion(
    'react-router',
    resolvePackagePath
  );
  if (!supportsReactRouterRsc(reactRouterVersion)) {
    throw new Error(
      `[${pluginName}] React Router RSC mode requires react-router >=7.18.0 or >=8.0.0.`
    );
  }

  for (const specifier of [
    'react-server-dom-rspack/client.browser',
    'rsbuild-plugin-rsc',
  ]) {
    if (!resolvePackagePath(specifier)) {
      throw new Error(
        `[${pluginName}] React Router RSC mode requires \`${specifier}\` to be installed.`
      );
    }
  }
};

export const setupReactRouterRscPlugin = async ({
  api,
  entryRscPath,
  entrySsrPath,
  pluginName,
  rsc,
}: {
  api: Parameters<RsbuildPlugin['setup']>[0];
  entryRscPath: string;
  entrySsrPath: string;
  pluginName: string;
  rsc: true | RscPluginOptions;
}): Promise<void> => {
  const { PLUGIN_RSC_NAME, pluginRSC } = await import('rsbuild-plugin-rsc');
  if (api.isPluginExists(PLUGIN_RSC_NAME)) {
    api.logger.warn(
      `[${pluginName}] The "${PLUGIN_RSC_NAME}" plugin is already registered. ` +
        'Skipping built-in RSC setup.'
    );
    return;
  }

  const userRscOptions: RscPluginOptions = rsc === true ? {} : rsc;
  await pluginRSC({
    ...userRscOptions,
    environments: {
      server: 'node',
      client: 'web',
    },
    layers: {
      rsc: [entryRscPath],
      ssr: [entrySsrPath],
      ...userRscOptions.layers,
    },
  }).setup(api);
};

const shouldBypassRscDevRequest = (request: {
  method?: string;
  url?: string;
}): boolean => {
  if (!request.url) {
    return true;
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return true;
  }

  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  if (pathname.startsWith('/__rsbuild_')) {
    return true;
  }
  if (pathname.endsWith('.rsc') || pathname.endsWith('.manifest')) {
    return false;
  }
  return pathname !== '/' && /\.[a-z0-9]+$/i.test(pathname);
};

export const createReactRouterRscResolveAliases = (
  rootPath: string
): Record<string, string> => ({
  ...Object.fromEntries(
    RSC_VIRTUAL_ALIAS_IDS.flatMap(id => {
      const moduleId = `virtual/react-router/unstable_rsc/${id}`;
      const modulePath = resolve(rootPath, getVirtualModuleFilePath(moduleId));
      return [
        [`virtual:react-router/unstable_rsc/${id}`, modulePath],
        [moduleId, modulePath],
      ];
    })
  ),
  'react-router/internal/react-server-client': resolve(
    rootPath,
    getVirtualModuleFilePath('virtual/react-router/rsc-internal-client')
  ),
});

export const createReactRouterRscVirtualModules = ({
  appDirectory,
  basename,
  buildDirectory,
  isBuild,
  outputClientPath,
  publicPath,
  routeDiscovery,
  routes,
  ssr,
}: RscVirtualModulesOptions): Record<string, string> => {
  const rscAssetsBuildDirectory = relative(
    resolve(buildDirectory, 'server'),
    outputClientPath
  );
  const bootstrapPublicPath = publicPath.endsWith('/')
    ? publicPath
    : `${publicPath}/`;

  return {
    'virtual/react-router/unstable_rsc/routes': createRscRouteConfig({
      appDirectory,
      routes,
    }),
    'virtual/react-router/unstable_rsc/route-discovery': `export default ${JSON.stringify(
      ssr === false ? { mode: 'initial' } : (routeDiscovery ?? { mode: 'lazy' })
    )};`,
    'virtual/react-router/unstable_rsc/inject-hmr-runtime': !isBuild
      ? `if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
  import.meta.webpackHot.on("rsc:update", () => {
    requestAnimationFrame(() => {
      globalThis.__reactRouterDataRouter?.revalidate?.();
    });
  });
}`
      : '',
    'virtual/react-router/unstable_rsc/basename': `export default ${JSON.stringify(
      basename
    )};`,
    'virtual/react-router/unstable_rsc/react-router-serve-config': `export default ${JSON.stringify(
      {
        assetsBuildDirectory: rscAssetsBuildDirectory,
        publicPath,
      }
    )};`,
    'virtual/react-router/unstable_rsc/bootstrap-scripts': `export default ${JSON.stringify(
      [`${bootstrapPublicPath}static/js/index.js`]
    )};`,
    'virtual/react-router/rsc-internal-client': createRscInternalClientModule(),
  };
};

export const createReactRouterRscDevServerSetup = ({
  entryName,
  pluginName,
}: {
  entryName: string;
  pluginName: string;
}): RscDevServerSetup => {
  return ({ server }) => {
    const devServer = server as unknown as RscDevServer;
    const listener = createRequestListener(async request => {
      const build =
        await devServer.environments.node.loadBundle<RscServerBuild>(entryName);
      const handler = build.default?.fetch;
      if (typeof handler !== 'function') {
        throw new Error(
          `[${pluginName}] RSC server build must default-export an object with a fetch function.`
        );
      }
      return handler(request);
    });

    server.middlewares.use((req, res, next) => {
      if (shouldBypassRscDevRequest(req)) {
        next();
        return;
      }
      Promise.resolve(listener(req, res)).catch(next);
    });
  };
};

export const registerReactRouterRscRouteTransforms = ({
  api,
  isBuild,
  performanceProfiler,
  routeByFilePath,
  routeChunkCache,
  routeChunkConfig,
}: {
  api: Parameters<RsbuildPlugin['setup']>[0];
  isBuild: boolean;
  performanceProfiler: RscRouteTransformProfiler;
  routeByFilePath: Map<string, Route>;
  routeChunkCache: RouteChunkCache;
  routeChunkConfig: RouteChunkConfig;
}): void => {
  const transformRoute = async (
    args: Parameters<Parameters<typeof api.transform>[1]>[0]
  ) => {
    const route = routeByFilePath.get(resolve(args.resourcePath));
    if (!route) {
      return { code: args.code };
    }

    return performanceProfiler.record(
      args.environment?.name,
      'rsc:route',
      args.resource,
      () =>
        transformRscRouteModule({
          code: args.code,
          resourcePath: args.resourcePath,
          resourceQuery: args.resourceQuery,
          isRootRoute: route.id === 'root',
          routeId: route.id,
          routeChunkCache,
          routeChunkConfig,
          isServerEnvironment: args.environment.name === 'node',
          isDev: !isBuild,
        })
    );
  };

  api.transform(
    {
      test: path =>
        routeByFilePath.has(resolve(path)) && !mdxRoutePattern.test(path),
      order: 'pre',
    },
    transformRoute
  );

  api.transform(
    {
      test: path =>
        routeByFilePath.has(resolve(path)) && mdxRoutePattern.test(path),
      order: 'post',
    },
    transformRoute
  );
};
