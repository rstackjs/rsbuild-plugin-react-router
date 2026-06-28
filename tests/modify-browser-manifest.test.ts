import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  collectSubresourceIntegrity,
  createModifyBrowserManifestPlugin,
} from '../src/modify-browser-manifest';

const BROWSER_MANIFEST_PATH =
  'static/js/virtual/react-router/browser-manifest.js';

describe('collectSubresourceIntegrity', () => {
  it('uses official integrity metadata from stats and compilation assets', () => {
    const sri = collectSubresourceIntegrity(
      {
        assets: [
          {
            name: 'static/js/entry.client.js',
            integrity: 'sha384-entry',
          },
          {
            name: 'static/css/entry.client.css',
            integrity: 'sha384-css',
          },
          {
            name: 'static/js/no-integrity.js',
          },
        ],
      },
      {
        getAssets: () => [
          {
            name: 'static/js/route.js',
            info: {
              integrity: 'sha384-route',
            },
          },
          {
            name: '/static/js/already-prefixed.js',
            info: {
              integrity: 'sha384-prefixed',
            },
          },
        ],
      },
      '/assets/'
    );

    expect(sri).toEqual({
      '/assets/static/js/entry.client.js': 'sha384-entry',
      '/assets/static/css/entry.client.css': 'sha384-css',
      '/assets/static/js/route.js': 'sha384-route',
      '/static/js/already-prefixed.js': 'sha384-prefixed',
    });
  });

  it('returns undefined when Rspack does not provide integrity metadata', () => {
    const sri = collectSubresourceIntegrity(
      {
        assets: [
          {
            name: 'static/js/entry.client.js',
          },
        ],
      },
      {
        getAssets: () => [
          {
            name: 'static/js/route.js',
            info: {},
          },
        ],
      }
    );

    expect(sri).toBeUndefined();
  });

  it('emits the browser manifest with the React Router SRI sentinel', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-browser-manifest-'));
    const appDir = join(root, 'app');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
      join(appDir, 'root.tsx'),
      'export default function Root() { return null; }'
    );

    try {
      let emit:
        | ((
            compilation: any,
            callback: (error?: Error) => void
          ) => Promise<void>)
        | undefined;
      const plugin = createModifyBrowserManifestPlugin(
        {
          root: {
            id: 'root',
            file: 'root.tsx',
            path: '',
          },
        },
        {},
        appDir,
        '/',
        {
          splitRouteModules: false,
          rootRouteFile: 'root.tsx',
          isBuild: true,
        },
        {
          subResourceIntegrity: true,
          onManifest: manifest => {
            expect(manifest.sri).toBe(true);
          },
        }
      );

      plugin.apply({
        hooks: {
          emit: {
            tapAsync: (_name: string, handler: typeof emit) => {
              emit = handler;
            },
          },
        },
      } as any);

      const compilation = {
        assets: {
          [BROWSER_MANIFEST_PATH]: {
            source: () => 'window.__reactRouterManifest="PLACEHOLDER";',
          },
        },
        getStats: () => ({
          toJson: () => ({
            assetsByChunkName: {
              'entry.client': ['static/js/entry.client.js'],
              root: ['static/js/root.js'],
            },
          }),
        }),
      };

      await new Promise<void>((resolve, reject) => {
        emit?.(compilation, error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }).catch(reject);
      });

      expect(compilation.assets[BROWSER_MANIFEST_PATH].source()).toContain(
        "'sri':true"
      );

      const buildManifestAsset = Object.entries(compilation.assets).find(
        ([name]) => /^static\/js\/manifest-[a-f0-9]+\.js$/.test(name)
      );
      expect(buildManifestAsset?.[1].source()).toContain("'sri':true");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
