import type { Rspack } from '@rsbuild/core';
import type { ServerBuild } from 'react-router';
import type {
  DevGraphChanges,
  DevGraphIdentity,
  ReactRouterDevManifest,
} from '../src/dev-generation';

export const noKnownChanges: DevGraphChanges = {
  web: { known: false, files: new Set() },
  node: { known: false, files: new Set() },
};

const identityByCompilation = new WeakMap<Rspack.Compilation, symbol>();

const getCompilationIdentity = (compilation: Rspack.Compilation): symbol => {
  const existing = identityByCompilation.get(compilation);
  if (existing) {
    return existing;
  }
  const identity = Symbol();
  identityByCompilation.set(compilation, identity);
  return identity;
};

export const graphIdentity = (
  webCompilation: Rspack.Compilation,
  nodeCompilation: Rspack.Compilation,
  nodeWebCompilation: Rspack.Compilation = webCompilation
): DevGraphIdentity => ({
  web: getCompilationIdentity(webCompilation),
  node: getCompilationIdentity(nodeCompilation),
  nodeWeb: getCompilationIdentity(nodeWebCompilation),
  attempt: undefined,
});

export type TestServerBuild = ServerBuild & { marker: string };

export const createBuild = (
  marker: string,
  routeIds = ['routes/about', 'routes/home']
): TestServerBuild =>
  ({
    entry: { module: { default: () => new Response() } },
    routes: Object.fromEntries(
      routeIds.map(routeId => [
        routeId,
        { module: { default: () => null } },
      ])
    ),
    assets: { routes: {}, version: marker },
    assetsBuildDirectory: '/app/build/client',
    basename: '/',
    future: {},
    isSpaMode: false,
    marker,
    prerender: [],
    publicPath: '/',
    routeDiscovery: { mode: 'initial' },
    ssr: true,
  }) as unknown as TestServerBuild;

type RouteManifestOptions = Partial<
  Omit<
    ReactRouterDevManifest['routes'][string],
    'css' | 'id' | 'imports' | 'module'
  >
> & { imports?: string[] };

export const createRouteManifest = (
  id: string,
  css: string[],
  { imports = [], ...overrides }: RouteManifestOptions = {}
): ReactRouterDevManifest['routes'][string] => ({
    id,
    module: `/${id}.js`,
    hasAction: false,
    hasLoader: false,
    hasClientAction: false,
    hasClientLoader: false,
    hasClientMiddleware: false,
    hasDefaultExport: true,
    hasErrorBoundary: false,
    imports,
    css,
    ...overrides,
  });

export type DevManifestCss = {
  entry?: string[];
  routes?: Record<string, string[]>;
  routeImports?: Record<string, string[]>;
};

export const createDevManifest = (
  version: string,
  css: DevManifestCss = {}
): ReactRouterDevManifest => ({
  version,
  url: '/manifest',
  entry: { module: '/entry.js', imports: [], css: css.entry ?? [] },
  routes: Object.fromEntries(
    Object.entries(css.routes ?? {}).map(([id, routeCss]) => [
      id,
      createRouteManifest(id, routeCss, { imports: css.routeImports?.[id] }),
    ])
  ),
});

export const createManifestSet = (
  version: string,
  css: DevManifestCss = {}
) => ({
  'static/js/app': createDevManifest(version, css),
});

export const createManifestSetWithRoute = (
  version: string,
  routeId: string,
  route: RouteManifestOptions
) => ({
  'static/js/app': {
    ...createDevManifest(version),
    routes: {
      [routeId]: createRouteManifest(routeId, [], route),
    },
  },
});

export const createCompilation = (
  name: 'web' | 'node',
  dependencies: {
    builds?: string[];
    files?: string[];
    contexts?: string[];
    missing?: string[];
  } = {}
) =>
  ({
    name,
    buildDependencies: new Set(dependencies.builds),
    fileDependencies: new Set(dependencies.files),
    contextDependencies: new Set(dependencies.contexts),
    missingDependencies: new Set(dependencies.missing),
  }) as unknown as Rspack.Compilation;

export const createStats = (
  compilation: Rspack.Compilation,
  hasErrors = false
) =>
  ({
    compilation,
    hasErrors: () => hasErrors,
  }) as Rspack.Stats;

export const createGraphStats = (
  webCompilation: Rspack.Compilation,
  nodeCompilation: Rspack.Compilation,
  errors: { web?: boolean; node?: boolean } = {}
) =>
  ({
    stats: [
      createStats(webCompilation, errors.web),
      createStats(nodeCompilation, errors.node),
    ],
  }) as Rspack.MultiStats;
