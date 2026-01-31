import { readFile } from 'node:fs/promises';
import { resolve } from 'pathe';
import { describe, expect, it } from '@rstest/core';
import { createStubRsbuild } from '@scripts/test-helper';
import { pluginReactRouter } from '../src';

describe('client-only module transforms', () => {
  it('stubs exports for .client modules using export *', async () => {
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
    const resourcePath = resolve(
      'tests/fixtures/client-modules/example.client.ts'
    );
    const code = await readFile(resourcePath, 'utf8');
    const result = await handler({
      environment: { name: 'node' },
      code,
      resourcePath,
    });

    expect(result.code).toContain('export const foo = undefined;');
    expect(result.code).toContain('export const bar = undefined;');
    expect(result.code).toContain('export const local = undefined;');
    expect(result.code).not.toContain('export default undefined;');
  });
});
