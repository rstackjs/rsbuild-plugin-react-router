import { describe, expect, it, rstest } from '@rstest/core';
import {
  createChunkAssetResolver,
  createReactRouterManifestStats,
  getManifestAssetType,
} from '../src/manifest-assets';

describe('manifest asset classification', () => {
  it('uses emitted metadata before filename conventions', () => {
    const types = {
      'bundles/entry.payload': 'javascript',
      'bundles/not-code.js': 'asset',
      'styles/main.payload': 'css',
      'styles/extracted.payload': 'extract-css',
    };

    expect(getManifestAssetType('bundles/entry.payload', types)).toBe(
      'javascript'
    );
    expect(getManifestAssetType('bundles/not-code.js', types)).toBe('asset');
    expect(getManifestAssetType('styles/main.payload', types)).toBe('css');
    expect(getManifestAssetType('styles/extracted.payload', types)).toBe('css');
  });

  it.each([
    ['entry.js', 'javascript'],
    ['entry.mjs?1234', 'javascript'],
    ['entry.cjs#fragment', 'javascript'],
    ['styles.css?1234', 'css'],
    ['entry.js.map', undefined],
    ['image.png', undefined],
  ])('classifies %s when metadata is unavailable', (name, expected) => {
    expect(getManifestAssetType(name)).toBe(expected);
  });

  it('reads metadata once for only the selected chunks and entrypoints', () => {
    const assetTypes = new Map([
      ['bundles/entry.client.payload', 'javascript'],
      ['bundles/runtime.payload', 'javascript'],
      ['styles/main.payload', 'css'],
    ]);
    const getAsset = rstest.fn((name: string) => ({
      name,
      info: { assetType: assetTypes.get(name) },
    }));
    const stats = createReactRouterManifestStats(
      {
        namedChunks: new Map([
          [
            'entry.client',
            {
              files: new Set([
                'styles/main.payload',
                'bundles/entry.client.payload',
              ]),
            },
          ],
          ['ignored', { files: new Set(['ignored.js']) }],
        ]),
        entrypoints: new Map([
          [
            'entry.client',
            {
              getFiles: () => [
                'bundles/runtime.payload',
                'bundles/entry.client.payload',
                'styles/main.payload',
              ],
            },
          ],
        ]),
        getAsset,
      },
      new Set(['entry.client'])
    );

    expect(stats?.assetsByChunkName?.['entry.client']).toEqual([
      'bundles/entry.client.payload',
      'styles/main.payload',
    ]);
    expect(stats?.assetTypesByName).toEqual(Object.fromEntries(assetTypes));
    expect(getAsset.mock.calls.map(([name]) => name)).toEqual([
      'styles/main.payload',
      'bundles/entry.client.payload',
      'bundles/runtime.payload',
    ]);
  });

  it('materializes arbitrary emitted names without treating other assets as code', () => {
    const resolve = createChunkAssetResolver(
      {
        assetsByChunkName: {
          'entry.client': [
            'bundles/entry.payload',
            'bundles/not-code.js',
            'styles/main.payload',
          ],
        },
        entrypointFilesByName: {
          'entry.client': ['bundles/runtime.payload', 'bundles/entry.payload'],
        },
        assetTypesByName: {
          'bundles/entry.payload': 'javascript',
          'bundles/runtime.payload': 'javascript',
          'bundles/not-code.js': 'asset',
          'styles/main.payload': 'css',
        },
      },
      true
    );

    expect(resolve('entry.client')).toEqual({
      js: ['bundles/entry.payload', 'bundles/runtime.payload'],
      css: ['styles/main.payload'],
    });
  });

  it('recognizes non-ESM JavaScript in older asset metadata', () => {
    const stats = createReactRouterManifestStats({
      namedChunks: new Map([
        ['entry.client', { files: new Set(['bundles/entry.payload']) }],
      ]),
      getAsset: name => ({ name, info: { javascriptModule: false } }),
    });

    expect(stats?.assetTypesByName).toEqual({
      'bundles/entry.payload': 'javascript',
    });
    expect(createChunkAssetResolver(stats, true)('entry.client').js).toEqual([
      'bundles/entry.payload',
    ]);
  });

  it('prefers explicit asset types over legacy JavaScript metadata', () => {
    const assetInfo: Record<
      string,
      { assetType?: string; javascriptModule: boolean }
    > = {
      'bundles/not-code.js': {
        assetType: 'asset',
        javascriptModule: false,
      },
      'styles/main.payload': {
        assetType: 'css',
        javascriptModule: false,
      },
      'bundles/entry.payload': { javascriptModule: false },
    };
    const stats = createReactRouterManifestStats({
      namedChunks: new Map([
        ['entry.client', { files: new Set(Object.keys(assetInfo)) }],
      ]),
      getAsset: name => ({ name, info: assetInfo[name] }),
    });

    expect(stats?.assetTypesByName).toEqual({
      'bundles/not-code.js': 'asset',
      'styles/main.payload': 'css',
      'bundles/entry.payload': 'javascript',
    });
    expect(createChunkAssetResolver(stats, true)('entry.client')).toEqual({
      js: ['bundles/entry.payload'],
      css: ['styles/main.payload'],
    });
  });
});
