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
import { describe, expect, it, rstest } from '@rstest/core';
import {
  createRouteManifestSnapshot,
  createRouteTopologyWatcher,
  ensureDevRestartMarker,
  getRouteRestartMarkerPath,
} from '../src/route-watch';

describe('route watch restart marker', () => {
  it('allows a topology callback to await watcher shutdown', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    mkdirSync(watchedDirectory, { recursive: true });
    let topology = new Set(['initial']);
    let triggerChange!: () => void;
    let close!: () => Promise<void>;
    let callbackCompleted = false;

    try {
      close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        getRouteTopology: async () => topology,
        onRouteTopologyChange: async () => {
          await close();
          callbackCompleted = true;
        },
        onError: error => {
          throw error;
        },
        watchDirectoryEntry: (_directory, onChange) => {
          triggerChange = onChange;
          return { close: () => {} };
        },
      });

      topology = new Set(['changed']);
      triggerChange();

      await expect.poll(() => callbackCompleted, { timeout: 2000 }).toBe(true);
    } finally {
      await close?.();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not recreate watchers or touch the marker after close', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    mkdirSync(watchedDirectory, { recursive: true });
    await ensureDevRestartMarker(markerPath);
    const initialMarker = readFileSync(markerPath, 'utf8');
    let topologyReads = 0;
    let releaseRescan!: () => void;
    const rescanReleased = new Promise<void>(resolve => {
      releaseRescan = resolve;
    });
    let markRescanStarted!: () => void;
    const rescanStarted = new Promise<void>(resolve => {
      markRescanStarted = resolve;
    });
    let triggerChange!: () => void;
    const closeWatcher = rstest.fn();

    try {
      const close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        onError: error => {
          throw error;
        },
        getRouteTopology: async () => {
          topologyReads += 1;
          if (topologyReads === 1) {
            return new Set(['initial']);
          }
          markRescanStarted();
          await rescanReleased;
          return new Set(['changed']);
        },
        watchDirectoryEntry: (_directory, onChange) => {
          triggerChange = onChange;
          return { close: closeWatcher };
        },
      });

      triggerChange();
      await rescanStarted;
      const closePromise = close();
      releaseRescan();
      await closePromise;

      expect(readFileSync(markerPath, 'utf8')).toBe(initialMarker);
      expect(closeWatcher).toHaveBeenCalled();
    } finally {
      releaseRescan();
      rmSync(root, { recursive: true, force: true });
    }
  });

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
