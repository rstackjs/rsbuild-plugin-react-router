import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import * as fs from 'node:fs';
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
          paths: expect.stringMatching(
            /build\/client\/\.react-router\/route-watch$/
          ),
          type: 'reload-server',
        },
      ])
    );
  });

  it('emits the route restart marker as a web build asset', async () => {
    const rsbuild = await createStubRsbuild({
      action: 'build',
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    await rsbuild.unwrapConfig();

    const processAssetsCall = rsbuild.processAssets.mock.calls.find(
      ([options]) =>
        options.stage === 'additional' && options.targets?.includes('web')
    );
    expect(processAssetsCall).toBeDefined();

    const handler = processAssetsCall?.[1];
    const emitAsset = rstest.fn();
    const updateAsset = rstest.fn();
    const RawSource = class {
      constructor(private readonly content: string) {}
      source() {
        return this.content;
      }
      size() {
        return this.content.length;
      }
    };

    handler({
      sources: { RawSource },
      compilation: {
        getAsset: rstest.fn().mockReturnValue(undefined),
        emitAsset,
        updateAsset,
      },
    });

    expect(emitAsset).toHaveBeenCalledWith(
      '.react-router/route-watch',
      expect.any(RawSource)
    );
    expect(emitAsset.mock.calls[0][1].source()).not.toBe('');
    expect(updateAsset).not.toHaveBeenCalled();
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

  it('configures web entries to avoid unnecessary entry IIFEs', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(
      config.environments?.web?.tools?.rspack?.optimization?.avoidEntryIife
    ).toBe(true);
  });

  it('reduces file size reporting overhead for large split route builds by default', async () => {
    process.env.RR_TEST_SPLIT_ROUTE_MODULES = 'true';
    process.env.RR_TEST_ROUTE_COUNT = '1024';
    const readFileSync = rstest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('export default function Route() { return null; }');
    try {
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.performance?.printFileSize).toEqual({
        total: true,
        detail: false,
        compressed: false,
      });
    } finally {
      readFileSync.mockRestore();
      delete process.env.RR_TEST_SPLIT_ROUTE_MODULES;
      delete process.env.RR_TEST_ROUTE_COUNT;
    }
  });

  it('keeps explicit object file size reporting config for large split route builds', async () => {
    process.env.RR_TEST_SPLIT_ROUTE_MODULES = 'true';
    process.env.RR_TEST_ROUTE_COUNT = '1024';
    const readFileSync = rstest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('export default function Route() { return null; }');
    try {
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {
          performance: {
            printFileSize: {
              detail: true,
              compressed: true,
            },
          },
        },
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.performance?.printFileSize).toEqual({
        detail: true,
        compressed: true,
      });
    } finally {
      readFileSync.mockRestore();
      delete process.env.RR_TEST_SPLIT_ROUTE_MODULES;
      delete process.env.RR_TEST_ROUTE_COUNT;
    }
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

  it('should allow lazy compilation to be enabled with a boolean', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ lazyCompilation: true })]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toBe(true);
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

    const webEntries = config.environments?.web?.source?.entry;
    expect(webEntries['entry.client']).toEqual(
      expect.stringMatching(/entry\.client/)
    );
    expect(webEntries['virtual/react-router/browser-manifest']).toEqual({
      import: 'virtual/react-router/browser-manifest',
      html: false,
    });
    expect(webEntries['routes/index']).toMatchObject({
      html: false,
    });
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
