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
    let emit:
      | ((compilation: unknown, callback: (error?: Error) => void) => void)
      | undefined;
    const compiler = {
      hooks: {
        emit: {
          tapAsync(_name: string, callback: typeof emit) {
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

      await new Promise<void>((resolve, reject) => {
        emit?.(
          {
            namedChunks: new Map([
              [
                'entry.client',
                { files: new Set(['static/js/entry.client.js']) },
              ],
              ['root', { files: new Set(['static/js/root.js']) }],
              [
                'routes/page',
                { files: new Set(['static/js/routes/page.js']) },
              ],
              ['vendor', ignoredChunk],
            ]),
            assets: {
              'static/js/virtual/react-router/browser-manifest.js': createAsset(
                'window.__reactRouterManifest="PLACEHOLDER";'
              ),
            },
          },
          error => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          }
        );
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
