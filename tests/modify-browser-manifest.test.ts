import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, rstest } from '@rstest/core';
import {
  collectSubresourceIntegrity,
  createModifyBrowserManifestPlugin,
} from '../src/modify-browser-manifest';

const BROWSER_MANIFEST_PATH =
  'static/js/virtual/react-router/browser-manifest.js';

type ManifestAsset = {
  source: () => string;
};
type StatsJsonOptions = {
  all: false;
  assets: true;
};
type TestStats = {
  assets?: Array<{ name?: string; integrity?: unknown }>;
  assetsByChunkName: Record<string, string[]>;
};
type TestCompilation = {
  assets: Record<string, ManifestAsset>;
  getStats: () => {
    toJson: (options: StatsJsonOptions) => TestStats;
  };
};
type EmitHandler = (
  compilation: TestCompilation,
  callback: (error?: Error) => void
) => Promise<void>;
type TestCompiler = {
  hooks: {
    emit: {
      tapAsync: (name: string, handler: EmitHandler) => void;
    };
  };
};

const runEmit = (
  emit: EmitHandler,
  compilation: TestCompilation
): Promise<void> =>
  new Promise((resolve, reject) => {
    emit(compilation, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    }).catch(reject);
  });

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
      let emit: EmitHandler | undefined;
      let callbackSri: Record<string, string> | true | undefined;
      const toJson = rstest.fn((_options: StatsJsonOptions) => ({
        assetsByChunkName: {
          'entry.client': ['static/js/entry.client.js'],
          root: ['static/js/root.js'],
        },
      }));
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
          onManifest: (manifest, sri) => {
            expect(manifest.sri).toBe(true);
            callbackSri = sri;
          },
        }
      );

      const compiler: TestCompiler = {
        hooks: {
          emit: {
            tapAsync: (_name, handler) => {
              emit = handler;
            },
          },
        },
      };
      plugin.apply(compiler as Parameters<typeof plugin.apply>[0]);

      const compilation: TestCompilation = {
        assets: {
          [BROWSER_MANIFEST_PATH]: {
            source: () => 'window.__reactRouterManifest="PLACEHOLDER";',
          },
        },
        getStats: () => ({
          toJson,
        }),
      };

      if (!emit) {
        throw new Error('Expected manifest plugin to register an emit hook.');
      }

      await runEmit(emit, compilation);

      expect(toJson).toHaveBeenCalledWith({
        all: false,
        assets: true,
      });

      expect(compilation.assets[BROWSER_MANIFEST_PATH].source()).toContain(
        "'sri':true"
      );
      expect(callbackSri).toBe(true);

      const buildManifestAsset = Object.entries(compilation.assets).find(
        ([name]) => /^static\/js\/manifest-[a-f0-9]+\.js$/.test(name)
      );
      expect(buildManifestAsset?.[1].source()).toContain("'sri':true");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
