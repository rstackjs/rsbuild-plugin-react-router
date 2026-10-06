import { createStubRsbuild } from '@scripts/test-helper';
import { expect, it } from '@rstest/core';
import { pluginReactRouter } from '../src';

it.each([{ rsc: true }, { federation: true }])(
  'rejects an unsupported server lazy compilation mode %j',
  async mode => {
    const rsbuild = await createStubRsbuild({ rsbuildConfig: {} });
    rsbuild.addPlugins([
      pluginReactRouter({ unstableServerLazyCompilation: true, ...mode }),
    ]);
    await expect(rsbuild.unwrapConfig()).rejects.toThrow(
      'only supported for classic SSR without RSC or federation'
    );
  }
);
