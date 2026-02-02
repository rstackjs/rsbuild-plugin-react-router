import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { getReactRouterManifestForDev } from '../src/manifest';
import { getRouteChunkEntryName } from '../src/route-chunks';

const createTempApp = () => {
  const root = mkdtempSync(join(tmpdir(), 'rr-manifest-'));
  const appDir = join(root, 'app');
  const routesDir = join(appDir, 'routes');
  mkdirSync(routesDir, { recursive: true });

  writeFileSync(
    join(appDir, 'root.tsx'),
    `export default function Root() { return null; }`
  );
  writeFileSync(
    join(routesDir, 'clients.tsx'),
    `export async function clientAction() { return {}; }
     export async function clientLoader() { return {}; }
     export default function Clients() { return null; }`
  );

  return { root, appDir, routesDir };
};

describe('manifest split route modules', () => {
  it('includes clientActionModule when split route modules are enabled for build', async () => {
    const { root, appDir } = createTempApp();
    try {
      const routes = {
        root: { id: 'root', file: 'root.tsx', path: '' },
        'routes/clients': {
          id: 'routes/clients',
          parentId: 'root',
          file: 'routes/clients.tsx',
          path: 'clients',
        },
      };

      const clientActionEntry = getRouteChunkEntryName(
        'routes/clients',
        'clientAction'
      );

      const clientStats: { assetsByChunkName: Record<string, string[]> } = {
        assetsByChunkName: {
          'routes/clients': ['static/js/routes/clients.js'],
          [clientActionEntry]: ['static/js/routes/clients-client-action.js'],
        },
      };

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
        }
      );

      expect(manifest.routes['routes/clients'].hasClientAction).toBe(true);
      expect(manifest.routes['routes/clients'].clientActionModule).toBe(
        '/static/js/routes/clients-client-action.js'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('omits split route module fields in dev mode', async () => {
    const { root, appDir } = createTempApp();
    try {
      const routes = {
        root: { id: 'root', file: 'root.tsx', path: '' },
        'routes/clients': {
          id: 'routes/clients',
          parentId: 'root',
          file: 'routes/clients.tsx',
          path: 'clients',
        },
      };

      const clientStats: { assetsByChunkName: Record<string, string[]> } = {
        assetsByChunkName: {
          'routes/clients': ['static/js/routes/clients.js'],
        },
      };

      const manifest = await getReactRouterManifestForDev(
        routes,
        {},
        clientStats,
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: false,
        }
      );

      expect(manifest.routes['routes/clients'].clientActionModule).toBeUndefined();
      expect(manifest.routes['routes/clients'].clientLoaderModule).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
