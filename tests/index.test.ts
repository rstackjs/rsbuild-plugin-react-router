import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it } from '@rstest/core';
import { pluginReactRouter } from '../src';

describe('pluginReactRouter', () => {
  it('should configure basic plugin options', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    // The plugin should not override Rsbuild's HMR defaults.
    expect(config.dev.hmr).toBe(true);
    expect(config.dev.liveReload).toBe(true);
    expect(config.dev.writeToDisk).toBe(true);
    expect(config.dev.lazyCompilation).toBeUndefined();
  });

  it('should restart the dev server when route entries are added', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        dev: {
          watchFiles: {
            paths: 'custom.config.ts',
            type: 'reload-server',
          },
        },
      },
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.watchFiles).toEqual(
      expect.arrayContaining([
        {
          paths: 'custom.config.ts',
          type: 'reload-server',
        },
        {
          paths: expect.stringMatching(/app\/routes\.[cm]?[jt]sx?$/),
          type: 'reload-server',
        },
        {
          paths: expect.stringMatching(/build\/\.react-router-route-watch$/),
          type: 'reload-server',
        },
      ])
    );
  });

  it('should respect server output format', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ serverOutput: 'commonjs' })]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.output.chunkFormat).toBe('commonjs');
    expect(nodeConfig.output.chunkLoading).toBe('require');
    expect(nodeConfig.output.module).toBe(false);
  });

  it('should forward lazy compilation when explicitly configured', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([
      pluginReactRouter({
        lazyCompilation: {
          entries: true,
          imports: true,
        },
      }),
    ]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toEqual({
      entries: true,
      imports: true,
    });
  });

  it('should allow lazy compilation to be disabled', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ lazyCompilation: false })]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toBe(false);
  });

  it('should configure web environment correctly', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const webConfig = config.environments?.web?.tools?.rspack;
    expect(webConfig.experiments.outputModule).toBe(true);
    expect(webConfig.externalsType).toBe('module');
    expect(webConfig.output.chunkFormat).toBe('module');
    expect(webConfig.output.module).toBe(true);
  });

  it('should configure node environment correctly', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.externals).toContain('express');
    expect(nodeConfig.experiments.outputModule).toBe(true);
  });

  it('should use async-node target for federation builds', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        environments: {
          node: {
            tools: {
              rspack: {
                target: 'async-node',
              },
            },
          },
        },
      },
    });

    rsbuild.addPlugins([pluginReactRouter({ federation: true })]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.target).toBe('async-node');
  });
});
