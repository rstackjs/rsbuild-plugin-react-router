import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { createClassicWebRouteEntries } from '../src/classic-mode';
import type { Route } from '../src/types';

const ROUTE_SOURCE = `export async function clientLoader() { return {}; }
  export default function X() { return null; }`;

/** Lays out `app/root.tsx` plus the given files, keyed by path under the project root. */
const createApp = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'rr-entries-'));
  const appDir = join(root, 'app');
  const allFiles = {
    'app/root.tsx': `export default function Root() { return null; }`,
    ...files,
  };
  for (const [file, source] of Object.entries(allFiles)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  return { root, appDir };
};

describe('createClassicWebRouteEntries', () => {
  it('never emits an entry name that escapes the JS output directory', () => {
    // A shared route package or a `relative()` route table produces a route
    // module that lives outside `app/`.
    const { root, appDir } = createApp({ 'shared/x.tsx': ROUTE_SOURCE });
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

  it('refuses two different route files that sanitize to one entry name', () => {
    const { root, appDir } = createApp({
      'shared/x.tsx': ROUTE_SOURCE,
      'app/__/shared/x.tsx': ROUTE_SOURCE,
    });
    const routes: Record<string, Route> = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      outside: {
        id: 'outside',
        parentId: 'root',
        file: '../shared/x.tsx',
        path: 'outside',
      },
      inside: {
        id: 'inside',
        parentId: 'root',
        file: '__/shared/x.tsx',
        path: 'inside',
      },
    };

    try {
      expect(() =>
        createClassicWebRouteEntries({
          appDirectory: appDir,
          isBuild: true,
          routes,
          splitRouteModules: true,
        })
      ).toThrowError(/both resolve to the entry name "__\/shared\/x"/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('shares one entry between routes that point at the same file', () => {
    // React Router requires explicit ids when two routes reuse a file. Both
    // routes import the very same module, and a route chunk is a pure function
    // of (file, export) — so one entry serves both instead of emitting two
    // byte-identical chunks.
    const { root, appDir } = createApp({ 'app/routes/shared.tsx': ROUTE_SOURCE });

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
