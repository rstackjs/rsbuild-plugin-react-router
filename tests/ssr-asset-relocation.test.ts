import { describe, expect, it } from '@rstest/core';
import { join } from 'pathe';
import {
  collectRelocatableServerAssets,
  isRelocatableServerAsset,
  relocateServerAssetsToClient,
  type RelocatableAssetCompilation,
  type RelocatableAssetInfo,
} from '../src/ssr-asset-relocation';

type FakeAsset = {
  info: RelocatableAssetInfo;
  buffer: Buffer;
};

const createCompilation = (
  assets: Record<string, FakeAsset>
): RelocatableAssetCompilation & { deleted: string[] } => {
  const store: Record<string, FakeAsset> = { ...assets };
  const deleted: string[] = [];
  return {
    deleted,
    assets: store,
    getAsset(name: string) {
      const asset = store[name];
      if (!asset) {
        return undefined;
      }
      return {
        name,
        source: { buffer: () => asset.buffer },
        info: asset.info,
      };
    },
    deleteAsset(name: string) {
      deleted.push(name);
      delete store[name];
    },
  };
};

describe('isRelocatableServerAsset', () => {
  it('treats asset-module outputs (with sourceFilename) as relocatable', () => {
    expect(
      isRelocatableServerAsset({ sourceFilename: 'app/assets/test.txt?url' })
    ).toBe(true);
    expect(
      isRelocatableServerAsset({ sourceFilename: 'app/assets/test.css' })
    ).toBe(true);
  });

  it('excludes JavaScript chunks even when they carry a sourceFilename', () => {
    expect(
      isRelocatableServerAsset({
        sourceFilename: 'app/entry.server.tsx',
        javascriptModule: true,
      })
    ).toBe(false);
  });

  it('excludes generated files with no sourceFilename (e.g. package.json)', () => {
    expect(isRelocatableServerAsset({})).toBe(false);
    expect(isRelocatableServerAsset(undefined)).toBe(false);
    expect(isRelocatableServerAsset({ javascriptModule: true })).toBe(false);
  });
});

describe('collectRelocatableServerAssets', () => {
  it('returns only static assets, sorted by public path', () => {
    const compilation = createCompilation({
      'static/js/app.js': {
        info: { javascriptModule: true, sourceFilename: 'app/entry.tsx' },
        buffer: Buffer.from('js'),
      },
      'package.json': { info: {}, buffer: Buffer.from('{}') },
      'static/assets/test.4fdcca.txt': {
        info: { sourceFilename: 'app/assets/test.txt?url' },
        buffer: Buffer.from('test'),
      },
      'static/assets/test.454e65.css': {
        info: { sourceFilename: 'app/assets/test.css?url' },
        buffer: Buffer.from('.test{color:red}'),
      },
      'static/js/async/780.js': {
        info: { javascriptModule: true, sourceFilename: 'app/lib.ts' },
        buffer: Buffer.from('chunk'),
      },
    });

    const collected = collectRelocatableServerAssets(compilation);

    expect(collected.map(asset => asset.name)).toEqual([
      'static/assets/test.454e65.css',
      'static/assets/test.4fdcca.txt',
    ]);
  });
});

describe('relocateServerAssetsToClient', () => {
  it('writes missing assets into the client output and strips them from the server build', async () => {
    const outputClientPath = '/build/client';
    const compilation = createCompilation({
      'static/assets/test.4fdcca.txt': {
        info: { sourceFilename: 'app/assets/test.txt?url' },
        buffer: Buffer.from('test'),
      },
      'static/assets/test.454e65.css': {
        info: { sourceFilename: 'app/assets/test.css?url' },
        buffer: Buffer.from('.test{color:red}'),
      },
      'static/js/app.js': {
        info: { javascriptModule: true, sourceFilename: 'app/entry.tsx' },
        buffer: Buffer.from('js'),
      },
      'static/js/async/780.js': {
        info: { javascriptModule: true, sourceFilename: 'app/lib.ts' },
        buffer: Buffer.from('chunk'),
      },
    });

    const mkdirCalls: string[] = [];
    const writes: Array<{ path: string; data: string }> = [];
    const renames: Array<{ from: string; to: string }> = [];

    const result = await relocateServerAssetsToClient({
      compilation,
      outputClientPath,
      existsSyncFn: () => false,
      mkdirFn: async dir => {
        mkdirCalls.push(dir);
      },
      writeFileFn: async (path, data) => {
        writes.push({ path, data: data.toString('utf8') });
      },
      renameFn: async (from, to) => {
        renames.push({ from, to });
      },
    });

    expect(result.written).toEqual([
      'static/assets/test.454e65.css',
      'static/assets/test.4fdcca.txt',
    ]);
    expect(result.skipped).toEqual([]);

    expect(writes.map(write => write.data)).toEqual([
      '.test{color:red}',
      'test',
    ]);
    expect(renames).toEqual([
      {
        from: expect.stringContaining(
          join(outputClientPath, 'static/assets/test.454e65.css.tmp-')
        ),
        to: join(outputClientPath, 'static/assets/test.454e65.css'),
      },
      {
        from: expect.stringContaining(
          join(outputClientPath, 'static/assets/test.4fdcca.txt.tmp-')
        ),
        to: join(outputClientPath, 'static/assets/test.4fdcca.txt'),
      },
    ]);

    // Static assets removed from the server build; JS chunks untouched.
    expect(compilation.deleted.sort()).toEqual([
      'static/assets/test.454e65.css',
      'static/assets/test.4fdcca.txt',
    ]);
    expect(compilation.assets['static/js/app.js']).toBeDefined();
    expect(compilation.assets['static/js/async/780.js']).toBeDefined();
  });

  it('does not overwrite an asset already present in the client build but still strips it from the server', async () => {
    const compilation = createCompilation({
      'static/assets/shared.abc.txt': {
        info: { sourceFilename: 'app/assets/shared.txt?url' },
        buffer: Buffer.from('shared'),
      },
    });

    const writes: string[] = [];

    const result = await relocateServerAssetsToClient({
      compilation,
      outputClientPath: '/build/client',
      existsSyncFn: () => true,
      mkdirFn: async () => undefined,
      readFileFn: async () => Buffer.from('shared'),
      writeFileFn: async path => {
        writes.push(path);
      },
      renameFn: async () => undefined,
    });

    expect(result.written).toEqual([]);
    expect(result.skipped).toEqual(['static/assets/shared.abc.txt']);
    expect(writes).toEqual([]);
    expect(compilation.deleted).toEqual(['static/assets/shared.abc.txt']);
  });

  it('overwrites an existing stale asset atomically', async () => {
    const compilation = createCompilation({
      'static/assets/shared.css': {
        info: { sourceFilename: 'app/assets/shared.css' },
        buffer: Buffer.from('.fresh{color:green}'),
      },
    });
    const writes: Array<{ path: string; data: string }> = [];
    const renames: Array<{ from: string; to: string }> = [];

    const result = await relocateServerAssetsToClient({
      compilation,
      outputClientPath: '/build/client',
      existsSyncFn: () => true,
      mkdirFn: async () => undefined,
      readFileFn: async () => Buffer.from('.stale{color:red}'),
      writeFileFn: async (path, data) => {
        writes.push({ path, data: data.toString('utf8') });
      },
      renameFn: async (from, to) => {
        renames.push({ from, to });
      },
    });

    expect(result.written).toEqual(['static/assets/shared.css']);
    expect(result.skipped).toEqual([]);
    expect(writes).toHaveLength(1);
    expect(writes[0].data).toBe('.fresh{color:green}');
    expect(renames).toEqual([
      {
        from: writes[0].path,
        to: '/build/client/static/assets/shared.css',
      },
    ]);
    expect(compilation.deleted).toEqual(['static/assets/shared.css']);
  });
});
