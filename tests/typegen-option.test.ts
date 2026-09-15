import { createStubRsbuild } from '@scripts/test-helper';
import { beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { pluginReactRouter } from '../src';
import { registerReactRouterTypegen } from '../src/typegen';

rstest.mock('../src/typegen', () => ({
  registerReactRouterTypegen: rstest.fn(),
}));

beforeEach(() => {
  rstest.mocked(registerReactRouterTypegen).mockClear();
});

describe('typegen plugin option', () => {
  it.each(['dev', 'build'] as const)(
    'registers type generation by default for %s',
    async action => {
      const rsbuild = await createStubRsbuild({ action, rsbuildConfig: {} });
      rsbuild.addPlugins([pluginReactRouter()]);
      await rsbuild.unwrapConfig();

      expect(registerReactRouterTypegen).toHaveBeenCalledTimes(1);
      expect(registerReactRouterTypegen).toHaveBeenCalledWith(
        rsbuild,
        expect.objectContaining({ appDirectory: expect.any(String) })
      );
    }
  );

  it.each(['dev', 'build'] as const)(
    'lets applications own type generation for %s',
    async action => {
      const rsbuild = await createStubRsbuild({ action, rsbuildConfig: {} });
      rsbuild.addPlugins([pluginReactRouter({ typegen: false })]);
      await rsbuild.unwrapConfig();

      expect(registerReactRouterTypegen).not.toHaveBeenCalled();
    }
  );
});
