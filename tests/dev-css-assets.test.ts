import { describe, expect, it } from '@rstest/core';
import { rspack, type Rspack } from '@rsbuild/core';
import { stripDevCssVersion, versionDevCssAssets } from '../src/dev-css-assets';
import {
  createChunkAssetResolver,
  type ReactRouterManifestStats,
} from '../src/manifest-assets';

describe('immutable development CSS assets', () => {
  it('retains original bytes across edits and exact restoration', () => {
    const retained = new Map<string, Rspack.sources.Source>();
    const emit = (value: string) => {
      const source = new rspack.sources.RawSource(value);
      const stats: ReactRouterManifestStats = {
        assetsByChunkName: {
          'entry.client': ['main.js', 'styles/main.css'],
          route: ['route.js', 'styles/main.css'],
        },
      };
      versionDevCssAssets(
        {
          getAsset: name =>
            name === 'styles/main.css'
              ? { name, source, info: { contenthash: 'stale-metadata' } }
              : undefined,
          emitAsset: (name, asset) => {
            retained.set(name, asset);
          },
        },
        stats
      );
      const resolver = createChunkAssetResolver(stats, false);
      expect(resolver('entry.client').css).toEqual(resolver('route').css);
      return resolver('route').css[0];
    };
    const original = emit('original');
    const edited = emit('edited');
    expect(edited).not.toBe(original);
    expect(retained.get(original)?.source()).toBe('original');
    expect(retained.get(edited)?.source()).toBe('edited');
    expect(emit('original')).toBe(original);
    expect(stripDevCssVersion(original)).toBe('styles/main.css');
  });

  it('normalizes only reserved aliases, preserving query parameters and fragments', () => {
    const hash = 'a'.repeat(64);
    expect(
      stripDevCssVersion(
        `/base/a.css.__react_router_css_${hash}.css?theme=dark%20blue#part`
      )
    ).toBe('/base/a.css?theme=dark%20blue#part');
    expect(stripDevCssVersion('/a.css?version=1')).toBe('/a.css?version=1');
    expect(stripDevCssVersion('/a.css.__react_router_css_invalid.css')).toBe(
      '/a.css.__react_router_css_invalid.css'
    );
  });

  it('supports custom CSS filenames and preserves relative asset directories', () => {
    const stats: ReactRouterManifestStats = {
      assetsByChunkName: { route: ['route.js', 'styles/custom-output'] },
      assetTypesByName: { 'styles/custom-output': 'extract-css' },
    };
    const source = new rspack.sources.RawSource(
      'body { background: url(./image.png); }'
    );
    const emitted = new Map<string, Rspack.sources.Source>();
    versionDevCssAssets(
      {
        getAsset: name =>
          name === 'styles/custom-output'
            ? { name, source, info: {} }
            : undefined,
        emitAsset: (name, asset) => {
          emitted.set(name, asset);
        },
      },
      stats
    );
    const url = createChunkAssetResolver(stats, false)('route').css[0];
    expect(url).toMatch(
      /^styles\/custom-output\.__react_router_css_[a-f0-9]{64}\.css$/
    );
    expect(emitted.get(url)?.source()).toBe(source.source());
  });
});
