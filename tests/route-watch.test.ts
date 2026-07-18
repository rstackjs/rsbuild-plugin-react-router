import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it, rstest } from '@rstest/core';
import * as Option from 'effect/Option';
import { createPluginEffectRuntime } from '../src/effect-runtime';
import {
  acquireRouteTopologyWatcher,
  createRouteManifestSnapshot,
  ensureDevRestartMarker,
  getRouteRestartMarkerPath,
  type CreateRouteTopologyWatcherOptions,
} from '../src/route-watch';

const routeWatchRuntime = createPluginEffectRuntime();
const createRouteTopologyWatcher = (
  options: Omit<CreateRouteTopologyWatcherOptions, 'runtime'>
) =>
  routeWatchRuntime.runPromise(
    acquireRouteTopologyWatcher({ runtime: routeWatchRuntime, ...options })
  );

afterAll(() => routeWatchRuntime.dispose());

describe('route watch restart marker', () => {
  it('closes all route watchers when the plugin scope is disposed', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    const closeWatcher = rstest.fn();
    const runtime = createPluginEffectRuntime();
    mkdirSync(watchedDirectory, { recursive: true });

    try {
      await runtime.runPromise(
        acquireRouteTopologyWatcher({
          runtime,
          watchDirectory: watchedDirectory,
          restartMarkerPath: markerPath,
          getRouteTopology: async () => new Set(['initial']),
          onError: error => {
            throw error;
          },
          watchDirectoryEntry: () => ({ close: closeWatcher }),
        })
      );

      await runtime.dispose();

      expect(closeWatcher).toHaveBeenCalledTimes(1);
    } finally {
      await runtime.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });

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
      await close();

      expect(readFileSync(markerPath, 'utf8')).toBe(initialMarker);
      expect(closeWatcher).toHaveBeenCalledTimes(1);
    } finally {
      releaseRescan();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not schedule a rescan from a retained directory callback after close', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    const runtime = createPluginEffectRuntime();
    let triggerChange!: () => void;
    const runFork = rstest.spyOn(runtime, 'runFork');
    mkdirSync(watchedDirectory, { recursive: true });

    try {
      const close = await runtime.runPromise(
        acquireRouteTopologyWatcher({
          runtime,
          watchDirectory: watchedDirectory,
          restartMarkerPath: markerPath,
          getRouteTopology: async () => new Set(['initial']),
          onError: error => {
            throw error;
          },
          watchDirectoryEntry: (_directory, onChange) => {
            triggerChange = onChange;
            return { close: () => {} };
          },
        })
      );

      await close();
      runFork.mockClear();
      triggerChange();

      expect(runFork).not.toHaveBeenCalled();
    } finally {
      await runtime.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('finalizes a pending rescan when watcher close fails', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    const runtime = createPluginEffectRuntime();
    const closeError = new Error('watcher close failed');
    const runFork = runtime.runFork;
    let rescanFiber: ReturnType<typeof runtime.runFork> | undefined;
    let triggerChange!: () => void;
    rstest.spyOn(runtime, 'runFork').mockImplementation((effect, options) => {
      const fiber = runFork(effect, options);
      rescanFiber = fiber;
      return fiber;
    });
    mkdirSync(watchedDirectory, { recursive: true });

    try {
      const close = await runtime.runPromise(
        acquireRouteTopologyWatcher({
          runtime,
          watchDirectory: watchedDirectory,
          restartMarkerPath: markerPath,
          getRouteTopology: async () => new Set(['initial']),
          onError: () => {},
          watchDirectoryEntry: (_directory, onChange) => {
            triggerChange = onChange;
            return {
              close: () => {
                throw closeError;
              },
            };
          },
        })
      );

      triggerChange();
      if (!rescanFiber) {
        throw new Error('Expected route watcher rescan to be scheduled.');
      }
      const fiber = rescanFiber;
      expect(Option.isNone(await runtime.runPromise(fiber.poll))).toBe(true);

      await expect(close()).rejects.toThrow(closeError.message);

      expect(Option.isSome(await runtime.runPromise(fiber.poll))).toBe(true);
    } finally {
      await runtime.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('places the restart marker beside the app directory', () => {
    expect(getRouteRestartMarkerPath('/project/app')).toBe(
      resolve('/project', '.react-router/route-watch')
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

  it('reuses discovered topology when initial topology is already current', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    mkdirSync(watchedDirectory, { recursive: true });
    let topologyReads = 0;

    try {
      const close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        initialRouteTopology: new Set(['current']),
        getRouteTopology: async () => {
          topologyReads += 1;
          return new Set(['current']);
        },
        onError: error => {
          throw error;
        },
        watchDirectoryEntry: () => ({ close: () => {} }),
      });
      await close();

      expect(topologyReads).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('uses discovered topology to notify when initial topology is stale', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    mkdirSync(watchedDirectory, { recursive: true });
    let topologyReads = 0;
    const onRouteTopologyChange = rstest.fn();

    try {
      const close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        initialRouteTopology: new Set(['stale']),
        getRouteTopology: async () => {
          topologyReads += 1;
          return new Set(['current']);
        },
        onRouteTopologyChange,
        onError: error => {
          throw error;
        },
        watchDirectoryEntry: () => ({ close: () => {} }),
      });
      await close();

      expect(topologyReads).toBe(1);
      expect(onRouteTopologyChange).toHaveBeenCalledTimes(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('advances topology before reporting synchronous notification failures', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    mkdirSync(watchedDirectory, { recursive: true });
    let topology = new Set(['initial']);
    let triggerChange!: () => void;
    const onRouteTopologyChange = rstest.fn(() => {
      throw new Error('topology notification failed');
    });
    const onError = rstest.fn();

    try {
      const close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        getRouteTopology: async () => topology,
        onRouteTopologyChange,
        onError,
        watchDirectoryEntry: (_directory, onChange) => {
          triggerChange = onChange;
          return { close: () => {} };
        },
      });

      topology = new Set(['changed']);
      triggerChange();
      await expect
        .poll(() => onError.mock.calls.length, { timeout: 2000 })
        .toBe(1);

      triggerChange();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onRouteTopologyChange).toHaveBeenCalledTimes(1);
      await close();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('retains discovered recovery directories when startup topology evaluation fails', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    const markerPath = join(root, 'build/.react-router-route-watch');
    const watchedDirectory = join(root, 'app');
    const helperDirectory = join(watchedDirectory, 'helpers');
    mkdirSync(helperDirectory, { recursive: true });
    const watchedDirectories: string[] = [];
    const onError = rstest.fn();

    try {
      const close = await createRouteTopologyWatcher({
        watchDirectory: watchedDirectory,
        restartMarkerPath: markerPath,
        initialRouteTopology: new Set(['last-good']),
        getRouteTopology: async () => {
          throw new Error('route config failed');
        },
        onError,
        watchDirectoryEntry: directory => {
          watchedDirectories.push(directory);
          return { close: () => {} };
        },
      });
      await close();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(watchedDirectories).toEqual(
        expect.arrayContaining([watchedDirectory, helperDirectory])
      );
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

  it('changes when sibling declaration order changes', () => {
    const first = createRouteManifestSnapshot({
      root: { id: 'root', path: '', file: 'root.tsx' },
      'routes/a': {
        id: 'routes/a',
        parentId: 'root',
        path: ':value',
        file: 'routes/a.tsx',
      },
      'routes/b': {
        id: 'routes/b',
        parentId: 'root',
        path: ':value',
        file: 'routes/b.tsx',
      },
    });

    const second = createRouteManifestSnapshot({
      root: { id: 'root', path: '', file: 'root.tsx' },
      'routes/b': {
        id: 'routes/b',
        parentId: 'root',
        path: ':value',
        file: 'routes/b.tsx',
      },
      'routes/a': {
        id: 'routes/a',
        parentId: 'root',
        path: ':value',
        file: 'routes/a.tsx',
      },
    });

    expect(second).not.toEqual(first);
  });

  it('preserves ordered entries for numeric-like route IDs', () => {
    const first = createRouteManifestSnapshot([
      ['root', { id: 'root', path: '', file: 'root.tsx' }],
      [
        '2',
        {
          id: '2',
          parentId: 'root',
          path: ':value',
          file: 'routes/two.tsx',
        },
      ],
      [
        '1',
        {
          id: '1',
          parentId: 'root',
          path: ':value',
          file: 'routes/one.tsx',
        },
      ],
    ]);

    const second = createRouteManifestSnapshot([
      ['root', { id: 'root', path: '', file: 'root.tsx' }],
      [
        '1',
        {
          id: '1',
          parentId: 'root',
          path: ':value',
          file: 'routes/one.tsx',
        },
      ],
      [
        '2',
        {
          id: '2',
          parentId: 'root',
          path: ':value',
          file: 'routes/two.tsx',
        },
      ],
    ]);

    expect(second).not.toEqual(first);
  });
});
