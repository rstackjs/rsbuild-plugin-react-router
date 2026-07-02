import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolve } from 'pathe';
import { describe, expect, it } from '@rstest/core';
import { createStubRsbuild } from '@scripts/test-helper';
import { pluginReactRouter } from '../src';
import {
  collectClientOnlyStubExportNames,
  createBundlerRouteExportResolver,
} from '../src/route-export-resolution';

describe('client-only module transforms', () => {
  const createConditionalClientPackage = async (
    root: string,
    packageName: string
  ): Promise<string> => {
    const packageDirectory = join(root, 'node_modules', packageName);
    await mkdir(packageDirectory, { recursive: true });
    await writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: packageName,
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
    return join(packageDirectory, 'esm.js');
  };

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
    const resolvedPath = await createConditionalClientPackage(
      root,
      'conditional-client-lib'
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
        resolve(
          context: string,
          specifier: string,
          callback: (error: Error | null, resolved?: string) => void
        ) {
          expect(context).toBe(join(root, 'app'));
          expect(specifier).toBe('conditional-client-lib');
          callback(null, resolvedPath);
        },
      });

      expect(result.code).toContain('export const esmOnly = undefined;');
      expect(result.code).toContain('export const shared = undefined;');
      expect(result.code).not.toContain('cjsOnly');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('uses import conditions in the fallback export-all resolver', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rr-client-modules-fallback-'));
    await createConditionalClientPackage(
      root,
      'fallback-conditional-client-lib'
    );
    const resourcePath = join(root, 'app', 'example.client.ts');
    await mkdir(join(root, 'app'), { recursive: true });
    await writeFile(
      resourcePath,
      "export * from 'fallback-conditional-client-lib';"
    );

    try {
      const exportNames = await collectClientOnlyStubExportNames(
        await readFile(resourcePath, 'utf8'),
        resourcePath
      );

      expect(exportNames).toContain('esmOnly');
      expect(exportNames).toContain('shared');
      expect(exportNames).not.toContain('cjsOnly');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not bypass package exports for private export-all subpaths', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rr-client-modules-private-'));
    const packageDirectory = join(root, 'node_modules', 'private-client-lib');
    await mkdir(packageDirectory, { recursive: true });
    await writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: 'private-client-lib',
        exports: {
          '.': './public.js',
        },
        type: 'module',
      })
    );
    await writeFile(join(packageDirectory, 'public.js'), 'export const ok = true;');
    await writeFile(
      join(packageDirectory, 'private.js'),
      'export const hidden = true;'
    );
    const resourcePath = join(root, 'app', 'example.client.ts');
    await mkdir(join(root, 'app'), { recursive: true });
    await writeFile(resourcePath, "export * from 'private-client-lib/private';");

    try {
      await expect(
        collectClientOnlyStubExportNames(
          await readFile(resourcePath, 'utf8'),
          resourcePath
        )
      ).rejects.toThrow('private-client-lib/private');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('uses the Rsbuild transform resolver for export-all modules', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rr-client-modules-resolve-'));
    const appDirectory = join(root, 'app');
    const resourcePath = join(appDirectory, 'example.client.ts');
    const resolvedPath = join(root, 'generated', 'client-exports.ts');
    await mkdir(appDirectory, { recursive: true });
    await mkdir(join(root, 'generated'), { recursive: true });
    await writeFile(resourcePath, "export * from '@client/exports';");
    await writeFile(
      resolvedPath,
      'export const fromResolver = true; export const alsoResolver = true;'
    );

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
        resolve(
          context: string,
          specifier: string,
          callback: (error: Error | null, resolved?: string) => void
        ) {
          expect(context).toBe(appDirectory);
          expect(specifier).toBe('@client/exports');
          callback(null, resolvedPath);
        },
      });

      expect(result.code).toContain('export const fromResolver = undefined;');
      expect(result.code).toContain('export const alsoResolver = undefined;');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('adapts the Rsbuild callback resolver to the route export resolver API', async () => {
    const routeResolver = createBundlerRouteExportResolver(
      (context, specifier, callback) => {
        expect(context).toBe('/app/routes');
        expect(specifier).toBe('@client/exports');
        callback(null, '/app/generated/client-exports.ts');
      }
    );

    await expect(
      routeResolver('@client/exports', '/app/routes/example.client.ts')
    ).resolves.toBe('/app/generated/client-exports.ts');
  });

  it('treats bundler resolver errors and false results as unresolved', async () => {
    const failedResolver = createBundlerRouteExportResolver(
      (_context, _specifier, callback) => {
        callback(new Error('not found'));
      }
    );
    const falseResolver = createBundlerRouteExportResolver(
      (_context, _specifier, callback) => {
        callback(null, false);
      }
    );

    await expect(
      failedResolver('@client/missing', '/app/routes/example.client.ts')
    ).resolves.toBeNull();
    await expect(
      falseResolver('@client/false', '/app/routes/example.client.ts')
    ).resolves.toBeNull();
  });
});
