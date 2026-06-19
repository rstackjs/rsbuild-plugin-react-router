import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  createRouteManifestSnapshot,
  ensureDevRestartMarker,
  getRouteRestartMarkerPath,
} from '../src/route-watch';

describe('route watch restart marker', () => {
  it('places the restart marker in the client build output', () => {
    expect(getRouteRestartMarkerPath('/project/build/client')).toBe(
      '/project/build/client/.react-router/route-watch'
    );
  });

  it('creates the restart marker when missing', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    try {
      const markerPath = join(root, 'build/.react-router-route-watch');

      await ensureDevRestartMarker(markerPath);

      expect(readFileSync(markerPath, 'utf8')).not.toBe('');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not rewrite an existing restart marker on dev server startup', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    try {
      const markerPath = join(root, 'build/.react-router-route-watch');
      mkdirSync(join(root, 'build'), { recursive: true });
      writeFileSync(markerPath, 'existing');

      await ensureDevRestartMarker(markerPath);

      expect(readFileSync(markerPath, 'utf8')).toBe('existing');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('route watch topology snapshot', () => {
  it('changes when route topology changes but route files stay the same', () => {
    const baseRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
      'routes/demo': {
        id: 'routes/demo',
        parentId: 'root',
        path: 'demo',
        file: 'routes/demo.tsx',
      },
    };

    const changedRoutes = {
      ...baseRoutes,
      'routes/demo': {
        ...baseRoutes['routes/demo'],
        path: 'renamed-demo',
      },
    };

    expect(createRouteManifestSnapshot(baseRoutes)).not.toEqual(
      createRouteManifestSnapshot(changedRoutes)
    );
  });

  it('is stable for equivalent route manifests with different object insertion order', () => {
    const first = createRouteManifestSnapshot({
      root: { id: 'root', path: '', file: 'root.tsx' },
      'routes/demo': {
        id: 'routes/demo',
        parentId: 'root',
        path: 'demo',
        file: 'routes/demo.tsx',
      },
    });

    const second = createRouteManifestSnapshot({
      'routes/demo': {
        id: 'routes/demo',
        parentId: 'root',
        path: 'demo',
        file: 'routes/demo.tsx',
      },
      root: { id: 'root', path: '', file: 'root.tsx' },
    });

    expect(second).toEqual(first);
  });
});
