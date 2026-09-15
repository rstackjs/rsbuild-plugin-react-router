import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rspack, type Rspack } from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import {
  createReactRouterManifestStats,
  generateReactRouterManifestForDev,
  type ReactRouterManifestStats,
} from '../src/manifest';

const assetPrefix = 'https://cdn.example.test/build/';
const assetUrl = (asset: string) => `${assetPrefix}${asset}`;

const entrypointStats: ReactRouterManifestStats = {
  assetsByChunkName: {
    'entry.client': [
      'bundles/entry.client-a1.js',
      'bundles/entry-extra-b2.js',
      'bundles/entry.client-a1.js',
    ],
    lazy: ['bundles/lazy-c3.js'],
  },
  entrypointFilesByName: {
    'entry.client': [
      'bundles/runtime-d4.js',
      'bundles/shared-e5.js',
      'bundles/entry.client-a1.js',
      'bundles/shared-e5.js',
      'bundles/entry.client-a1.js.map',
      'styles/shared-f6.css',
    ],
  },
};

const generateEntryManifest = (
  stats: ReactRouterManifestStats | undefined,
  isBuild: boolean
) =>
  generateReactRouterManifestForDev({}, {}, stats, '/app', assetPrefix, {
    isBuild,
  });

describe('manifest entrypoint imports', () => {
  it('includes distinct synchronous JavaScript dependencies in production', async () => {
    const { manifest } = await generateEntryManifest(entrypointStats, true);

    expect(manifest.entry).toEqual({
      module: assetUrl('bundles/entry.client-a1.js'),
      imports: [
        assetUrl('bundles/entry-extra-b2.js'),
        assetUrl('bundles/runtime-d4.js'),
        assetUrl('bundles/shared-e5.js'),
      ],
      css: [assetUrl('styles/shared-f6.css')],
    });
  });

  it('preserves development imports without eager entrypoint JavaScript', async () => {
    const { manifest } = await generateEntryManifest(entrypointStats, false);

    expect(manifest.entry).toEqual({
      module: assetUrl('bundles/entry.client-a1.js'),
      imports: [
        assetUrl('bundles/entry-extra-b2.js'),
      ],
      css: [assetUrl('styles/shared-f6.css')],
    });
  });

  it('does not select a dependency as the module when its own JavaScript is absent', async () => {
    await expect(generateEntryManifest(
      { assetsByChunkName: { 'entry.client': ['styles/entry.css'] },
        entrypointFilesByName: { 'entry.client': ['bundles/runtime-d4.js'] } }, true
    )).rejects.toThrow('emitted no JavaScript asset');
  });

  it('does not preload its fallback module when compilation stats are unavailable', async () => {
    const { manifest } = await generateEntryManifest(undefined, true);

    expect(manifest.entry).toEqual({
      module: assetUrl('static/js/entry.client.js'),
      imports: [],
      css: [],
    });
  });

  it('uses real production entrypoint files without traversing async child chunks', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-manifest-entrypoints-'));
    const appDirectory = join(root, 'app');
    mkdirSync(join(appDirectory, 'routes'), { recursive: true });
    writeFileSync(
      join(appDirectory, 'entry.client.js'),
      `import { shared } from './shared.js';
       export const boot = () => shared();
       export const load = () => import(/* webpackChunkName: "lazy" */ './lazy.js');`
    );
    writeFileSync(
      join(appDirectory, 'routes/page.js'),
      `import { shared } from '../shared.js';
       export default function Page() { return shared(); }`
    );
    writeFileSync(
      join(appDirectory, 'shared.js'),
      `export function shared() { return Math.random(); }`
    );
    writeFileSync(
      join(appDirectory, 'lazy.js'),
      `export const value = 'async';`
    );

    const compiler = rspack({
      mode: 'production',
      context: appDirectory,
      cache: false,
      entry: {
        'entry.client': './entry.client.js',
        'routes/page': './routes/page.js',
      },
      output: {
        path: join(root, 'dist'),
        filename: 'bundles/[name]-[contenthash:8].js',
        chunkFilename: 'bundles/[name]-[contenthash:8].js',
        module: true,
        library: { type: 'module' },
        chunkFormat: 'module',
        chunkLoading: 'import',
      },
      optimization: {
        minimize: false,
        concatenateModules: false,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          cacheGroups: {
            shared: {
              test: /[/\\]shared\.js$/,
              name: 'shared',
              enforce: true,
            },
          },
        },
      },
    });
    compiler.hooks.shouldEmit.tap('ManifestEntrypointImportsTest', () => false);

    try {
      const stats = await new Promise<Rspack.Stats>((resolve, reject) => {
        compiler.run((error, result) => {
          if (error) {
            reject(error);
          } else if (!result || result.hasErrors()) {
            reject(new Error(result?.toString({ all: false, errors: true })));
          } else {
            resolve(result);
          }
        });
      });
      const manifestStats = createReactRouterManifestStats(stats.compilation);
      const getJavaScriptAsset = (name: string): string => {
        const asset = manifestStats?.assetsByChunkName?.[name]?.find(file =>
          file.endsWith('.js')
        );
        if (!asset) {
          throw new Error(`Expected JavaScript for ${name}`);
        }
        return asset;
      };
      const entryModule = getJavaScriptAsset('entry.client');
      const routeModule = getJavaScriptAsset('routes/page');
      const runtime = getJavaScriptAsset('runtime');
      const shared = getJavaScriptAsset('shared');
      const lazy = getJavaScriptAsset('lazy');
      const { manifest } = await generateReactRouterManifestForDev(
        { page: { id: 'page', file: 'routes/page.js', path: 'page' } },
        {},
        manifestStats,
        appDirectory,
        assetPrefix,
        { isBuild: true }
      );

      expect(manifestStats?.entrypointFilesByName?.['entry.client']).toEqual([
        runtime,
        shared,
        entryModule,
      ]);
      expect(manifest.entry.module).toBe(assetUrl(entryModule));
      expect(manifest.routes.page.module).toBe(assetUrl(routeModule));
      expect(manifest.entry.imports).toEqual([
        assetUrl(runtime),
        assetUrl(shared),
      ]);
      expect(manifest.routes.page.imports).toEqual([
        assetUrl(runtime),
        assetUrl(shared),
      ]);
      expect(manifest.entry.imports).not.toContain(assetUrl(lazy));
      expect(manifest.routes.page.imports).not.toContain(assetUrl(lazy));
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close(error => (error ? reject(error) : resolve()));
      });
      rmSync(root, { recursive: true, force: true });
    }
  });
});
