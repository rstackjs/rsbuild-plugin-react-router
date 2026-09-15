import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it } from '@rstest/core';
import { pluginReactRouter } from '../src';
import { getReactRouterManifestForDev } from '../src/manifest';

describe('browser output filenames', () => {
  it.each(['dev', 'build'] as const)(
    'leaves the default browser filename policy to Rsbuild for %s',
    async action => {
      const rsbuild = await createStubRsbuild({ action, rsbuildConfig: {} });
      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.environments.web.output.filename?.js).toBeUndefined();
      expect(config.environments.node.output.filename.js).toBe('[name].js');
    }
  );

  it('preserves global and environment-specific browser filename templates', async () => {
    const rsbuild = await createStubRsbuild({
      action: 'build',
      rsbuildConfig: {
        output: { filename: { js: '[name].[contenthash:8].js' } },
        environments: {
          web: { output: { filename: { js: '[name]-[contenthash:12].js' } } },
        },
      },
    });
    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.output.filename.js).toBe('[name].[contenthash:8].js');
    expect(config.environments.web.output.filename.js).toBe(
      '[name]-[contenthash:12].js'
    );
    expect(config.environments.node.output.filename.js).toBe('[name].js');
  });

  it('uses the emitted browser manifest filename in development', async () => {
    const manifest = await getReactRouterManifestForDev(
      {},
      {},
      {
        assetsByChunkName: {
          'entry.client': ['bundles/entry.client-a1.js'],
          'virtual/react-router/browser-manifest': [
            'bundles/virtual/react-router/browser-manifest-b2.js',
          ],
        },
      },
      '/app',
      'https://cdn.example.test/build/'
    );

    expect(manifest.url).toBe(
      `https://cdn.example.test/build/bundles/virtual/react-router/browser-manifest-b2.js?v=${manifest.version}`
    );
  });

  it('derives the build manifest directory from the asset path, not its query', async () => {
    const manifest = await getReactRouterManifestForDev(
      {},
      {},
      {
        assetsByChunkName: {
          'entry.client': ['bundles/entry.js?version=abc/path'],
        },
      },
      '/app',
      '/assets/',
      { isBuild: true }
    );

    expect(manifest.entry.module).toBe(
      '/assets/bundles/entry.js?version=abc/path'
    );
    expect(manifest.url).toBe(
      `/assets/bundles/manifest-${manifest.version}.js`
    );
  });
});
