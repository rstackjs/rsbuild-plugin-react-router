import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { getReactRouterManifestForDev } from '../src/manifest';

const createTempApp = () => {
  const root = mkdtempSync(join(tmpdir(), 'rr-manifest-version-'));
  const appDir = join(root, 'app');
  mkdirSync(appDir, { recursive: true });

  writeFileSync(
    join(appDir, 'root.tsx'),
    `export default function Root() { return null; }`
  );

  return { root, appDir };
};

describe('manifest version', () => {
  it('uses a stable fingerprinted version for build manifests', async () => {
    const { root, appDir } = createTempApp();
    try {
      const routes = {
        root: { id: 'root', file: 'root.tsx', path: '' },
      };
      const clientStats: { assetsByChunkName: Record<string, string[]> } = {
        assetsByChunkName: {
          root: ['static/js/root.js'],
          'entry.client': ['static/js/entry.client.js'],
        },
      };

      const manifestA = await getReactRouterManifestForDev(
        routes,
        {},
        clientStats,
        appDir,
        '/',
        {
          splitRouteModules: false,
          rootRouteFile: 'root.tsx',
          isBuild: true,
        }
      );
      const manifestB = await getReactRouterManifestForDev(
        routes,
        {},
        clientStats,
        appDir,
        '/',
        {
          splitRouteModules: false,
          rootRouteFile: 'root.tsx',
          isBuild: true,
        }
      );

      expect(manifestA.version).toBe(manifestB.version);
      expect(manifestA.version).toMatch(/^[a-f0-9]{8}$/);
      expect(manifestA.url).toBe(
        `/static/js/manifest-${manifestA.version}.js`
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
