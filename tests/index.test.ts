import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import { pluginReactRouter } from '../src';

type ReactRouterTestGlobal = typeof globalThis & {
  __reactRouterTestConfig?: unknown;
};
type PluginSetupApi = Parameters<
  NonNullable<ReturnType<typeof pluginReactRouter>['setup']>
>[0];
type EnvironmentCompileHandler = (args: {
  environment: { name: string };
  stats: {
    toJson: () => {
      assets: never[];
      assetsByChunkName: Record<string, string[]>;
    };
  };
}) => void;
type MockEnvironmentCompileHook = {
  mock: {
    calls: Array<[EnvironmentCompileHandler]>;
  };
};

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

  it('should enable Rsbuild SRI for the web environment when configured', async () => {
    (globalThis as ReactRouterTestGlobal).__reactRouterTestConfig = {
      subResourceIntegrity: true,
    };
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.environments?.web?.security?.sri?.enable).toBe(true);
    expect(config.environments?.node?.security?.sri).toBeUndefined();
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

  it('should serialize only asset stats after web compilation', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });
    const plugin = pluginReactRouter();
    await plugin.setup(rsbuild as PluginSetupApi);

    const onAfterEnvironmentCompile =
      rsbuild.onAfterEnvironmentCompile as MockEnvironmentCompileHook;
    const handler = onAfterEnvironmentCompile.mock.calls[0][0];
    const toJson = rstest.fn().mockReturnValue({
      assets: [],
      assetsByChunkName: {},
    });

    handler({
      environment: { name: 'web' },
      stats: { toJson },
    });

    expect(toJson).toHaveBeenCalledTimes(1);
    expect(toJson).toHaveBeenCalledWith({
      all: false,
      assets: true,
    });
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
