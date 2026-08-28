import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { createClassicWebRouteEntries } from '../src/classic-mode';
import type { Route } from '../src/types';

const ROUTE_SOURCE = `export async function clientLoader() { return {}; }
  export default function X() { return null; }`;

/**
 * Lays out a project whose route module lives *outside* `app/`, which is what a
 * shared route package or a `relative()` route table produces.
 */
const createAppWithOutsideRoute = () => {
  const root = mkdtempSync(join(tmpdir(), 'rr-entries-'));
  const appDir = join(root, 'app');
  const sharedDir = join(root, 'shared');
  mkdirSync(appDir, { recursive: true });
  mkdirSync(sharedDir, { recursive: true });

  writeFileSync(
    join(appDir, 'root.tsx'),
    `export default function Root() { return null; }`
  );
  writeFileSync(join(sharedDir, 'x.tsx'), ROUTE_SOURCE);

  return { root, appDir };
};

describe('createClassicWebRouteEntries', () => {
  it('never emits an entry name that escapes the JS output directory', () => {
    const { root, appDir } = createAppWithOutsideRoute();
    const routes: Record<string, Route> = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'shared/x': {
        id: 'shared/x',
        parentId: 'root',
        file: '../shared/x.tsx',
        path: 'x',
      },
    };

    try {
      const { webRouteEntries } = createClassicWebRouteEntries({
        appDirectory: appDir,
        isBuild: true,
        routes,
        splitRouteModules: true,
      });

      expect(Object.keys(webRouteEntries).sort()).toEqual([
        '__/shared/x',
        '__/shared/x-client-loader',
        'root',
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('shares one entry between routes that point at the same file', () => {
    // React Router requires explicit ids when two routes reuse a file. Both
    // routes import the very same module, and a route chunk is a pure function
    // of (file, export) — so one entry serves both instead of emitting two
    // byte-identical chunks.
    const root = mkdtempSync(join(tmpdir(), 'rr-entries-'));
    const appDir = join(root, 'app');
    mkdirSync(join(appDir, 'routes'), { recursive: true });
    writeFileSync(
      join(appDir, 'root.tsx'),
      `export default function Root() { return null; }`
    );
    writeFileSync(join(appDir, 'routes', 'shared.tsx'), ROUTE_SOURCE);

    const routes: Record<string, Route> = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      a: { id: 'a', parentId: 'root', file: 'routes/shared.tsx', path: 'a' },
      b: { id: 'b', parentId: 'root', file: 'routes/shared.tsx', path: 'b' },
    };

    try {
      const { webRouteEntries } = createClassicWebRouteEntries({
        appDirectory: appDir,
        isBuild: true,
        routes,
        splitRouteModules: true,
      });

      expect(Object.keys(webRouteEntries).sort()).toEqual([
        'root',
        'routes/shared',
        'routes/shared-client-loader',
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
