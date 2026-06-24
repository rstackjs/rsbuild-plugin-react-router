import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { createModifyBrowserManifestPlugin } from '../src/modify-browser-manifest';

const createTempApp = () => {
  const root = mkdtempSync(join(tmpdir(), 'rr-modify-manifest-'));
  const appDir = join(root, 'app');
  mkdirSync(join(appDir, 'routes'), { recursive: true });
  writeFileSync(
    join(appDir, 'root.tsx'),
    `export default function Root() { return null; }`
  );
  writeFileSync(
    join(appDir, 'routes/page.tsx'),
    `export default function Page() { return null; }`
  );
  return { root, appDir };
};

const createAsset = (source: string) => ({
  source: () => source,
  size: () => source.length,
});

describe('modify browser manifest plugin', () => {
  it('reports the exact compilation that produced the manifest', async () => {
    const { root, appDir } = createTempApp();
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
    };
    let emit: ((compilation: unknown) => Promise<void>) | undefined;
    let reportedCompilation: unknown;
    const compiler = {
      hooks: {
        emit: {
          tapPromise(_name: string, callback: typeof emit) {
            emit = callback;
          },
        },
      },
    };
    const compilation = {
      namedChunks: new Map([
        ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
        ['root', { files: new Set(['static/js/root.js']) }],
      ]),
      assets: {
        'static/js/virtual/react-router/browser-manifest.js': createAsset(
          'window.__reactRouterManifest="PLACEHOLDER";'
        ),
      },
    };

    try {
      createModifyBrowserManifestPlugin(
        routes,
        {},
        appDir,
        '/',
        undefined,
        {
          onManifest(_manifest, _sri, _exports, context) {
            reportedCompilation = context.compilation;
          },
        }
      ).apply(compiler as never);

      expect(emit).toBeDefined();
      await emit(compilation);

      expect(reportedCompilation).toBe(compilation);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects the promise hook when build route analysis fails', async () => {
    const { root, appDir } = createTempApp();
    writeFileSync(join(appDir, 'routes/page.tsx'), 'export const = broken;');
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/page': {
        id: 'routes/page',
        parentId: 'root',
        file: 'routes/page.tsx',
        path: 'page',
      },
    };
    let emit: ((compilation: unknown) => Promise<void>) | undefined;
    const compiler = {
      hooks: {
        emit: {
          tapPromise(_name: string, callback: typeof emit) {
            emit = callback;
          },
        },
      },
    };

    try {
      createModifyBrowserManifestPlugin(routes, {}, appDir, '/', {
        isBuild: true,
      }).apply(compiler as never);

      expect(emit).toBeDefined();
      await expect(
        emit({
          namedChunks: new Map(),
          assets: {},
        })
      ).rejects.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not read ignored chunk files while creating manifest stats', async () => {
    const { root, appDir } = createTempApp();
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/page': {
        id: 'routes/page',
        parentId: 'root',
        file: 'routes/page.tsx',
        path: 'page',
      },
    };
    let emit: ((compilation: unknown) => Promise<void>) | undefined;
    const compiler = {
      hooks: {
        emit: {
          tapPromise(_name: string, callback: typeof emit) {
            emit = callback;
          },
        },
      },
    };

    try {
      createModifyBrowserManifestPlugin(routes, {}, appDir).apply(
        compiler as never
      );

      const ignoredChunk = {};
      Object.defineProperty(ignoredChunk, 'files', {
        get() {
          throw new Error('ignored chunk files should not be read');
        },
      });

      expect(emit).toBeDefined();
      await emit({
        namedChunks: new Map([
          ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
          ['root', { files: new Set(['static/js/root.js']) }],
          ['routes/page', { files: new Set(['static/js/routes/page.js']) }],
          ['vendor', ignoredChunk],
        ]),
        assets: {
          'static/js/virtual/react-router/browser-manifest.js': createAsset(
            'window.__reactRouterManifest="PLACEHOLDER";'
          ),
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('uses actual manifest chunk names instead of theoretical split route chunks', async () => {
    const { root, appDir } = createTempApp();
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/page': {
        id: 'routes/page',
        parentId: 'root',
        file: 'routes/page.tsx',
        path: 'page',
      },
    };
    let emit: ((compilation: unknown) => Promise<void>) | undefined;
    const compiler = {
      hooks: {
        emit: {
          tapPromise(_name: string, callback: typeof emit) {
            emit = callback;
          },
        },
      },
    };

    try {
      createModifyBrowserManifestPlugin(
        routes,
        {},
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: true,
        },
        {
          manifestChunkNames: new Set(['entry.client', 'root', 'routes/page']),
        }
      ).apply(compiler as never);

      const theoreticalSplitChunk = {};
      Object.defineProperty(theoreticalSplitChunk, 'files', {
        get() {
          throw new Error('theoretical split chunk files should not be read');
        },
      });

      expect(emit).toBeDefined();
      await emit({
        namedChunks: new Map([
          ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
          ['root', { files: new Set(['static/js/root.js']) }],
          ['routes/page', { files: new Set(['static/js/routes/page.js']) }],
          ['routes/page-client-loader', theoreticalSplitChunk],
        ]),
        assets: {
          'static/js/virtual/react-router/browser-manifest.js': createAsset(
            'window.__reactRouterManifest="PLACEHOLDER";'
          ),
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
