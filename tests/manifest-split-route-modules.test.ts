import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { getReactRouterManifestForDev } from '../src/manifest';
import {
  getRouteChunkEntryName,
  getRouteEntryBaseName,
  routeChunkExportNames,
  type RouteChunkExportName,
} from '../src/route-chunks';

const clientExportFixtures: Record<RouteChunkExportName, string> = {
  clientAction: `export async function clientAction() { return {}; }`,
  clientLoader: `export async function clientLoader() { return {}; }`,
  clientMiddleware: `export async function clientMiddleware() { return null; }`,
  HydrateFallback: `export function HydrateFallback() { return null; }`,
};

type ManifestModuleField =
  | 'clientActionModule'
  | 'clientLoaderModule'
  | 'clientMiddlewareModule'
  | 'hydrateFallbackModule';

const moduleFieldByExportName: Record<
  RouteChunkExportName,
  ManifestModuleField
> = {
  clientAction: 'clientActionModule',
  clientLoader: 'clientLoaderModule',
  clientMiddleware: 'clientMiddlewareModule',
  HydrateFallback: 'hydrateFallbackModule',
};

const createTempApp = (routeCode?: string, rootCode?: string) => {
  const root = mkdtempSync(join(tmpdir(), 'rr-manifest-'));
  const appDir = join(root, 'app');
  const routesDir = join(appDir, 'routes');
  mkdirSync(routesDir, { recursive: true });

  writeFileSync(
    join(appDir, 'root.tsx'),
    rootCode ?? `export default function Root() { return null; }`
  );
  writeFileSync(
    join(routesDir, 'clients.tsx'),
    routeCode ??
      `export async function clientAction() { return {}; }
       export async function clientLoader() { return {}; }
       export default function Clients() { return null; }`
  );

  return { root, appDir };
};

const routes = {
  root: { id: 'root', file: 'root.tsx', path: '' },
  'routes/clients': {
    id: 'routes/clients',
    parentId: 'root',
    file: 'routes/clients.tsx',
    path: 'clients',
  },
};

const clientsRoute = { file: 'routes/clients.tsx' };

const createClientStats = (appDirectory: string, route = clientsRoute) => {
  const entryName = getRouteEntryBaseName(route, appDirectory);
  const assetsByChunkName: Record<string, string[]> = {
    'entry.client': ['static/js/entry.client.js'],
    [entryName]: [`static/js/${entryName}.js`],
  };
  for (const exportName of routeChunkExportNames) {
    const chunkName = getRouteChunkEntryName(route, exportName, appDirectory);
    assetsByChunkName[chunkName] = [`static/js/${chunkName}.js`];
  }
  return { assetsByChunkName };
};

const getManifest = async (
  appDir: string,
  splitRouteModules: boolean | 'enforce',
  isBuild = true
) =>
  getReactRouterManifestForDev(
    routes,
    {},
    createClientStats(appDir),
    appDir,
    '/',
    {
      splitRouteModules,
      rootRouteFile: 'root.tsx',
      isBuild,
      cache: new Map(),
    }
  );

describe('manifest split route modules', () => {
  it.each(routeChunkExportNames)(
    'includes %sModule when the export is splittable in build mode',
    async (exportName: RouteChunkExportName) => {
      const { root, appDir } = createTempApp(`
        ${clientExportFixtures[exportName]}
        export default function Clients() { return null; }
      `);
      try {
        const manifest = await getManifest(appDir, true);
        const field = moduleFieldByExportName[exportName];

        expect(manifest.routes['routes/clients'][field]).toBe(
          `/static/js/${getRouteChunkEntryName(clientsRoute, exportName, appDir)}.js`
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

  it('includes CSS emitted by split route chunks', async () => {
    const { root, appDir } = createTempApp(`
      import styles from './clients.module.css';
      export async function clientLoader() {
        return styles.root;
      }
      export default function Clients() { return null; }
    `);
    writeFileSync(join(appDir, 'routes/clients.module.css'), '.root {}');
    const clientStats = createClientStats(appDir);
    clientStats.assetsByChunkName[
      getRouteChunkEntryName(clientsRoute, 'clientLoader', appDir)
    ]?.push('static/css/routes/clients-client-loader.css');

    try {
      const manifest = await getReactRouterManifestForDev(
        routes,
        {},
        clientStats,
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: true,
          cache: new Map(),
        }
      );

      expect(manifest.routes['routes/clients'].css).toEqual([
        '/static/css/routes/clients-client-loader.css',
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('omits split route module fields in dev mode', async () => {
    const { root, appDir } = createTempApp();
    try {
      const manifest = await getManifest(appDir, true, false);

      expect(manifest.routes['routes/clients'].clientActionModule).toBeUndefined();
      expect(manifest.routes['routes/clients'].clientLoaderModule).toBeUndefined();
      expect(
        manifest.routes['routes/clients'].clientMiddlewareModule
      ).toBeUndefined();
      expect(
        manifest.routes['routes/clients'].hydrateFallbackModule
      ).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('omits a module field for a client export that is present but not splittable', async () => {
    const { root, appDir } = createTempApp(`
      const shared = () => null;
      export default function Clients() { return shared(); }
      export async function clientAction() { return shared(); }
    `);
    try {
      const manifest = await getManifest(appDir, true);

      expect(manifest.routes['routes/clients'].hasClientAction).toBe(true);
      expect(manifest.routes['routes/clients'].clientActionModule).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('throws in enforce mode when a present client export is not splittable', async () => {
    const { root, appDir } = createTempApp(`
      const shared = () => null;
      export default function Clients() { return shared(); }
      export async function clientAction() { return shared(); }
    `);
    try {
      await expect(getManifest(appDir, 'enforce')).rejects.toThrowError(
        /Error splitting route module[\s\S]*clientAction/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not throw outside enforce mode when a present client export is not splittable', async () => {
    const { root, appDir } = createTempApp(`
      const shared = () => null;
      export default function Clients() { return shared(); }
      export async function clientAction() { return shared(); }
    `);
    try {
      const manifest = await getManifest(appDir, true);

      expect(manifest.routes['routes/clients'].hasClientAction).toBe(true);
      expect(manifest.routes['routes/clients'].clientActionModule).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('keeps the app directory out of asset URLs when route ids are absolute', async () => {
    // `relative(import.meta.dirname)` resolves route files to absolute paths, so
    // React Router relativizes `file` but derives an *absolute* route id. The id
    // is an opaque runtime identifier and must never become a filename.
    const { root, appDir } = createTempApp();
    const absoluteId = `${appDir}/routes/clients`;
    const routesWithAbsoluteId = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      [absoluteId]: {
        id: absoluteId,
        parentId: 'root',
        file: 'routes/clients.tsx',
        path: 'clients',
      },
    };

    try {
      const manifest = await getReactRouterManifestForDev(
        routesWithAbsoluteId,
        {},
        createClientStats(appDir),
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: true,
          cache: new Map(),
        }
      );
      const route = manifest.routes[absoluteId];

      expect(route.clientLoaderModule).toBe(
        '/static/js/routes/clients-client-loader.js'
      );
      expect(route.clientActionModule).toBe(
        '/static/js/routes/clients-client-action.js'
      );

      // The route id stays absolute — that is the runtime contract, and changing
      // it would break `useRouteLoaderData(id)` and `matches[].id`.
      expect(route.id).toBe(absoluteId);

      // No URL may carry the developer's checkout path, and none may contain the
      // `static/js//` double slash that an entry name starting with `/` produced.
      const urls = [
        route.module,
        route.clientActionModule,
        route.clientLoaderModule,
        route.clientMiddlewareModule,
        route.hydrateFallbackModule,
        ...route.imports,
        ...route.css,
      ].filter((url): url is string => typeof url === 'string');

      expect(urls.filter(url => url.includes(appDir))).toEqual([]);
      expect(urls.filter(url => url.includes('static/js//'))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves routes sharing a file to the same chunk asset', async () => {
    // React Router requires explicit ids when two routes reuse a file. Both
    // resolve to one chunk, because a route chunk is a pure function of
    // (file, export) — previously they produced two byte-identical chunks.
    const { root, appDir } = createTempApp();
    const sharedRoutes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      a: { id: 'a', parentId: 'root', file: 'routes/clients.tsx', path: 'a' },
      b: { id: 'b', parentId: 'root', file: 'routes/clients.tsx', path: 'b' },
    };

    try {
      const manifest = await getReactRouterManifestForDev(
        sharedRoutes,
        {},
        createClientStats(appDir),
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: true,
          cache: new Map(),
        }
      );

      expect(manifest.routes.a.clientLoaderModule).toBe(
        '/static/js/routes/clients-client-loader.js'
      );
      expect(manifest.routes.b.clientLoaderModule).toBe(
        manifest.routes.a.clientLoaderModule
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not add route chunk module fields for the root route', async () => {
    const { root, appDir } = createTempApp(
      `export default function Clients() { return null; }`,
      `export async function clientAction() { return {}; }
       export default function Root() { return null; }`
    );
    try {
      const manifest = await getManifest(appDir, true);

      expect(manifest.routes.root.hasClientAction).toBe(true);
      expect(manifest.routes.root.clientActionModule).toBeUndefined();
      expect(manifest.routes.root.clientLoaderModule).toBeUndefined();
      expect(manifest.routes.root.clientMiddlewareModule).toBeUndefined();
      expect(manifest.routes.root.hydrateFallbackModule).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
