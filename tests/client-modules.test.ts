import { resolve } from 'pathe';
import { describe, expect, it } from '@rstest/core';
import { createStubRsbuild } from '@scripts/test-helper';
import { pluginReactRouter } from '../src';

describe('client-only module transforms', () => {
  it('throws when .client module uses export *', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    const plugin = pluginReactRouter();
    await plugin.setup(rsbuild as any);

    const transformCall = (rsbuild.transform as any).mock.calls.find(
      (call: any[]) => call[0].test?.toString().includes('\\.client')
    );
    expect(transformCall).toBeDefined();

    const handler = transformCall?.[1];
    await expect(
      handler({
        environment: { name: 'node' },
        code: "export * from './client-exports';",
        resourcePath: resolve('app/example.client.ts'),
      })
    ).rejects.toThrow('export *');
  });
});
