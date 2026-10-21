import { describe, expect, it } from '@rstest/core';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateRemix2ServerBuild, remix2ServerExternals } from '../src/remix2/build.js';
import { validateRemix2Config } from '../src/remix2/config.js';
import { publishRemix2Disk } from '../src/remix2/dev.js';
import { createRemix2Manifest, remix2RouteEntry } from '../src/remix2/manifest.js';
import { transformRemix2Route } from '../src/remix2/route-transform.js';
import type { ResolvedRemix2Config } from '../src/remix2/types.js';
import type { Rspack } from '@rsbuild/core';

const config: ResolvedRemix2Config = {
  rootDirectory: '/app',
  appDirectory: '/app/app',
  entryClientFilePath: '/app/app/entry.client.tsx',
  entryServerFilePath: '/app/app/entry.server.tsx',
  assetsBuildDirectory: '/app/public/build',
  relativeAssetsBuildDirectory: 'public/build',
  serverBuildPath: '/app/build/server.js',
  serverModuleFormat: 'esm',
  publicPath: '/build/',
  routes: { root: { id: 'root', file: 'root.tsx', path: '' } },
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    unstable_singleFetch: false,
    unstable_lazyRouteDiscovery: false,
  },
};

describe('native Remix 2', () => {
  it('prunes server code without wrapping components and keeps original flags for generated client loaders', async () => {
    const result = await transformRemix2Route(`
      import { randomUUID } from 'node:crypto';
      export const loader = () => randomUUID();
      export const action = () => 'action';
      export const headers = () => ({});
      export const Layout = ({ children }) => children;
      export const HydrateFallback = () => null;
      export default function Component() { return null; }
    `, config.routes.root, ({ code, serverExports }) => {
      expect(serverExports).toContain('loader');
      return code + '\nexport const clientLoader = ({ serverLoader }) => serverLoader();';
    });
    expect(result.code).not.toContain('node:crypto');
    expect(result.code).not.toContain('withComponentProps');
    expect(result.analysis.serverExports).toContain('loader');
    expect(result.analysis.serverExports).toContain('action');
    expect(result.analysis.clientExports).toContain('clientLoader');
    expect(result.analysis.clientExports).toContain('Layout');
    expect(result.analysis.clientExports).toContain('HydrateFallback');
    expect(result.analysis.clientExports).not.toContain('loader');
  });

  it('preserves explicit client loaders and fails on ambiguous star exports', async () => {
    const result = await transformRemix2Route(
      'export const clientLoader = () => 1; export const loader = () => 2;',
      config.routes.root
    );
    expect(result.code).toContain('clientLoader');
    await expect(transformRemix2Route('export * from "./other";', config.routes.root)).rejects.toThrow('explicit named');
  });

  it('rejects unsupported request protocols at the config boundary', () => {
    for (const flag of ['unstable_singleFetch', 'unstable_lazyRouteDiscovery'] as const) {
      expect(() => validateRemix2Config({
        ...config, future: { ...config.future, [flag]: true },
      })).toThrow(flag);
    }
  });

  it('emits only the native server-build contract and an assets-only dependency', () => {
    const source = generateRemix2ServerBuild(config, 'development');
    expect(source).toContain('virtual/remix2/assets');
    expect(source).toContain(config.entryServerFilePath);
    expect(source).toContain('isSpaMode = false');
    expect(source).not.toContain('prerender');
    expect(source).not.toContain('@react-router');
  });

  it('honors native dependency bundling and leaves builtins external', () => {
    const results: unknown[] = [];
    const external = remix2ServerExternals({
      ...config, serverDependenciesToBundle: ['linked', /^bundle-/],
    });
    for (const request of ['linked/subpath', 'bundle-one', 'react', 'node:fs']) {
      external({ request }, (...args) => { results.push(args); });
    }
    expect(results).toEqual([[], [], [undefined, 'react', 'module'], [undefined, 'node:fs', 'module']]);
  });

  it('matches alias roots and slash subpaths without widening exact or similarly prefixed aliases', () => {
    const results: unknown[] = [];
    const external = remix2ServerExternals(config, {
      alias: {
        '~': '/app/app',
        'exact$': '/app/exact.ts',
        'array': ['/app/missing', '/app/app'],
        'ignored': false,
      },
    });
    for (const request of [
      '~', '~/state.server', '~other', 'exact', 'exact/subpath',
      'exact-other', 'array/state.server', 'ignored/subpath', 'react',
      '~?query', 'exact?query', 'exact#fragment', 'exact/subpath?query',
    ]) {
      external({ request }, (...args) => { results.push(args); });
    }
    expect(results).toEqual([
      [], [], [undefined, '~other', 'module'], [],
      [undefined, 'exact/subpath', 'module'],
      [undefined, 'exact-other', 'module'], [], [],
      [undefined, 'react', 'module'],
      [], [], [], [undefined, 'exact/subpath?query', 'module'],
    ]);
    const disabled: unknown[] = [];
    remix2ServerExternals(config, { alias: false })(
      { request: 'react' },
      (...args) => { disabled.push(args); }
    );
    expect(disabled).toEqual([[undefined, 'react', 'module']]);
  });

  it('extends the draft before hashing while retaining server and generated client flags', async () => {
    const routeName = remix2RouteEntry('root');
    const compilation = {
      namedChunks: new Map([
        ['entry.client', { files: ['entry.js'] }],
        [routeName, { files: ['root.js'] }],
      ]),
    } as unknown as Rspack.Compilation;
    const analysis = new Map([['root', {
      serverExports: ['loader', 'action'],
      clientExports: ['default', 'clientLoader'],
    }]]);
    const initial = await createRemix2Manifest(compilation, config, analysis);
    const extended = await createRemix2Manifest(compilation, config, analysis, draft => {
      expect(draft.version).toBeUndefined();
      expect(draft.url).toBeUndefined();
      return { ...draft, remixAssets: { helper: '/build/helper.js' } };
    });
    expect(extended.version).not.toBe(initial.version);
    expect(extended.url).toContain(extended.version);
    expect(extended.routes.root.hasLoader).toBe(true);
    expect(extended.routes.root.hasAction).toBe(true);
    expect(extended.routes.root.hasClientLoader).toBe(true);
    expect(extended.remixAssets).toEqual({ helper: '/build/helper.js' });
    await expect(createRemix2Manifest(compilation, config, analysis, draft => {
      draft.routes.root.hasLoader = false;
      return draft;
    })).rejects.toThrow('retain analyzed export flags');
  });

  it('publishes complete disk outputs with a loadable module-format boundary', async () => {
    const root = await mkdtemp(join(tmpdir(), 'remix2-disk-'));
    try {
      for (const esm of [true, false]) {
        const directory = join(root, esm ? 'esm' : 'cjs');
        const entry = join(directory, 'server/index.js');
        await publishRemix2Disk(join(directory, 'client'), entry,
          new Map([['route.js', Buffer.from('export default 1;')]]),
          new Map([
            ['chunk.js', Buffer.from(esm ? 'export default 42;' : 'module.exports = 42;')],
            ['index.js', Buffer.from(esm ? 'export { default as value } from "./chunk.js";' : 'exports.value = require("./chunk.js");')],
          ]), esm);
        expect((await import(pathToFileURL(entry).href)).value).toBe(42);
        expect(await readFile(join(directory, 'client/route.js'), 'utf8')).toBe('export default 1;');
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
