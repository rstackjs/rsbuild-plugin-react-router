import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { getReactRouterManifestForDev } from '../src/manifest';
import {
  getRouteChunkEntryName,
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

const createClientStats = (routeId = 'routes/clients') => {
  const assetsByChunkName: Record<string, string[]> = {
    'entry.client': ['static/js/entry.client.js'],
    [routeId]: [`static/js/${routeId}.js`],
  };
  for (const exportName of routeChunkExportNames) {
    assetsByChunkName[getRouteChunkEntryName(routeId, exportName)] = [
      `static/js/${getRouteChunkEntryName(routeId, exportName)}.js`,
    ];
  }
  return { assetsByChunkName };
};

const getManifest = async (
  appDir: string,
  splitRouteModules: boolean | 'enforce',
  isBuild = true
) =>
  getReactRouterManifestForDev(routes, {}, createClientStats(), appDir, '/', {
    splitRouteModules,
    rootRouteFile: 'root.tsx',
    isBuild,
    cache: new Map(),
  });

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
          `/static/js/${getRouteChunkEntryName('routes/clients', exportName)}.js`
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

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