import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

  it('uses import conditions for bare export-all modules', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rr-client-modules-'));
    const packageDirectory = join(
      root,
      'node_modules',
      'conditional-client-lib'
    );
    await mkdir(packageDirectory, { recursive: true });
    await writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: 'conditional-client-lib',
        exports: {
          '.': {
            import: './esm.js',
            require: './cjs.cjs',
          },
        },
        type: 'module',
      })
    );
    await writeFile(
      join(packageDirectory, 'esm.js'),
      'export const esmOnly = true; export const shared = true;'
    );
    await writeFile(
      join(packageDirectory, 'cjs.cjs'),
      'exports.cjsOnly = true; exports.shared = true;'
    );
    const resourcePath = join(root, 'app', 'example.client.ts');
    await mkdir(join(root, 'app'), { recursive: true });
    await writeFile(resourcePath, "export * from 'conditional-client-lib';");

    try {
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
      const result = await handler({
        environment: { name: 'node' },
        code: await readFile(resourcePath, 'utf8'),
        resourcePath,
      });

      expect(result.code).toContain('export const esmOnly = undefined;');
      expect(result.code).toContain('export const shared = undefined;');
      expect(result.code).not.toContain('cjsOnly');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
