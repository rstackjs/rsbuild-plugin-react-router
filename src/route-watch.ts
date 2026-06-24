import { watch, type FSWatcher } from 'node:fs';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import type { RsbuildConfig } from '@rsbuild/core';
import { dirname, resolve } from 'pathe';
import type { Route } from './types.js';

const ROUTE_RESTART_MARKER_ASSET = '.react-router/route-watch';
const INITIAL_RESTART_MARKER_CONTENT = 'react-router-route-watch';

type RouteManifestSnapshotEntry = Pick<
  Route,
  'caseSensitive' | 'file' | 'id' | 'index' | 'parentId' | 'path'
>;
type RouteManifestSnapshotEntryPair = readonly [
  string,
  RouteManifestSnapshotEntry,
];
type RouteManifestSnapshotEntries =
  | Record<string, RouteManifestSnapshotEntry>
  | ReadonlyArray<RouteManifestSnapshotEntryPair>;

type WatchFilesConfig = NonNullable<
  NonNullable<RsbuildConfig['dev']>['watchFiles']
>;
export type WatchFileConfig =
  | Exclude<WatchFilesConfig, readonly unknown[]>
  | Extract<WatchFilesConfig, readonly unknown[]>[number];

type RouteDirectoryState = {
  directories: Set<string>;
  routeTopology: Set<string>;
};

type DirectoryWatcher = Pick<FSWatcher, 'close'>;
type WatchDirectoryEntry = (
  directory: string,
  onChange: () => void,
  onError: (error: unknown) => void
) => DirectoryWatcher;

const defaultWatchDirectoryEntry: WatchDirectoryEntry = (
  directory,
  onChange,
  onError
) => {
  const watcher = watch(directory, onChange);
  watcher.on('error', onError);
  return watcher;
};

export const mergeWatchFiles = (
  existing: WatchFilesConfig | undefined,
  additions: WatchFileConfig[]
): WatchFilesConfig => {
  if (!existing) {
    return additions as WatchFilesConfig;
  }
  return [
    ...(Array.isArray(existing) ? existing : [existing]),
    ...additions,
  ] as WatchFilesConfig;
};

export const getRouteRestartMarkerPath = (outputClientPath: string): string =>
  resolve(outputClientPath, ROUTE_RESTART_MARKER_ASSET);

export const createRouteManifestSnapshot = (
  routes: RouteManifestSnapshotEntries
): Set<string> =>
  new Set(
    (Array.isArray(routes) ? routes : Object.entries(routes))
      // React Router uses sibling declaration order as a match tiebreaker, so
      // callers that have ordered route config should pass ordered entries
      // instead of a record with numeric-like keys.
      .map(([routeId, route], order) =>
        JSON.stringify([
          order,
          routeId,
          route.id,
          route.parentId ?? null,
          route.path ?? null,
          route.index ?? null,
          route.caseSensitive ?? null,
          route.file,
        ])
      )
  );

export const ensureDevRestartMarker = async (
  restartMarkerPath: string
): Promise<void> => {
  // Dev owns this watched file directly so ordinary rebuilds do not rewrite it
  // and trigger reload loops.
  await mkdir(dirname(restartMarkerPath), { recursive: true });
  try {
    await access(restartMarkerPath);
  } catch {
    await writeFile(restartMarkerPath, INITIAL_RESTART_MARKER_CONTENT);
  }
};

const areSetsEqual = <T>(left: Set<T>, right: Set<T>): boolean => {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
};

const readRouteDirectories = async (
  watchDirectory: string
): Promise<Set<string>> => {
  const directories = new Set<string>();

  const walkDirectory = async (directory: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    directories.add(directory);
    await Promise.all(
      entries.map(async entry => {
        const entryPath = resolve(directory, entry.name);
        if (entry.isDirectory()) {
          await walkDirectory(entryPath);
        }
      })
    );
  };

  await walkDirectory(watchDirectory);
  return directories;
};

export const createRouteTopologyWatcher = async ({
  watchDirectory,
  getRouteTopology,
  initialRouteTopology,
  restartMarkerPath,
  onError,
  onRouteTopologyChange,
  watchDirectoryEntry: watchDirectoryOverride = defaultWatchDirectoryEntry,
}: {
  watchDirectory: string;
  getRouteTopology: () => Promise<Set<string>>;
  initialRouteTopology?: Set<string>;
  restartMarkerPath: string;
  onError: (error: unknown) => void;
  onRouteTopologyChange?: () => void | Promise<void>;
  watchDirectoryEntry?: WatchDirectoryEntry;
}): Promise<() => Promise<void>> => {
  const discoveredDirectories = await readRouteDirectories(watchDirectory);
  let discoveredState: RouteDirectoryState;
  try {
    discoveredState = {
      directories: discoveredDirectories,
      routeTopology: await getRouteTopology(),
    };
  } catch (error) {
    if (!initialRouteTopology) {
      throw error;
    }
    onError(error);
    discoveredState = {
      directories: discoveredDirectories,
      routeTopology: initialRouteTopology,
    };
  }
  let state = {
    ...discoveredState,
    routeTopology: initialRouteTopology ?? discoveredState.routeTopology,
  };
  let closed = false;
  let rescanTimer: ReturnType<typeof setTimeout> | undefined;
  let rescanQueue = Promise.resolve();
  const directoryWatchers = new Map<string, DirectoryWatcher>();

  const touchRestartMarker = async (): Promise<void> => {
    await mkdir(dirname(restartMarkerPath), { recursive: true });
    await writeFile(restartMarkerPath, String(Date.now()));
  };

  const closeRemovedDirectoryWatchers = (
    nextDirectories: Set<string>
  ): void => {
    for (const [directory, watcher] of directoryWatchers) {
      if (!nextDirectories.has(directory)) {
        watcher.close();
        directoryWatchers.delete(directory);
      }
    }
  };

  const watchNewDirectories = (nextDirectories: Set<string>): void => {
    for (const directory of nextDirectories) {
      if (directoryWatchers.has(directory)) {
        continue;
      }
      try {
        let watcher: DirectoryWatcher;
        watcher = watchDirectoryOverride(directory, scheduleRescan, error => {
          if (directoryWatchers.get(directory) === watcher) {
            watcher.close();
            directoryWatchers.delete(directory);
          }
          onError(error);
        });
        directoryWatchers.set(directory, watcher);
      } catch (error) {
        onError(error);
      }
    }
  };

  const syncDirectoryWatchers = (nextDirectories: Set<string>): void => {
    closeRemovedDirectoryWatchers(nextDirectories);
    watchNewDirectories(nextDirectories);
  };

  const applyNextState = async (nextState: RouteDirectoryState) => {
    if (closed) {
      return;
    }
    syncDirectoryWatchers(nextState.directories);
    if (!areSetsEqual(state.routeTopology, nextState.routeTopology)) {
      if (onRouteTopologyChange) {
        // This is a notification boundary, not part of the rescan
        // transaction. A custom-server callback may close this watcher while
        // replacing its compiler, so awaiting it here would deadlock close().
        state = nextState;
        try {
          void Promise.resolve(onRouteTopologyChange()).catch(onError);
        } catch (error) {
          onError(error);
        }
        return;
      } else {
        await touchRestartMarker();
      }
      if (closed) {
        return;
      }
      state = nextState;
      return;
    }
    state = nextState;
  };

  const runRescan = async (): Promise<void> => {
    if (closed) {
      return;
    }
    let nextDirectories: Set<string> | undefined;
    try {
      nextDirectories = await readRouteDirectories(watchDirectory);
      const nextState = {
        directories: nextDirectories,
        routeTopology: await getRouteTopology(),
      };
      if (closed) {
        return;
      }
      await applyNextState(nextState);
    } catch (error) {
      if (nextDirectories && !closed) {
        syncDirectoryWatchers(nextDirectories);
      }
      onError(error);
    }
  };

  const rescan = (): Promise<void> => {
    rescanQueue = rescanQueue.then(runRescan, runRescan);
    return rescanQueue;
  };

  const scheduleRescan = (): void => {
    if (rescanTimer) {
      clearTimeout(rescanTimer);
    }
    rescanTimer = setTimeout(() => {
      rescanTimer = undefined;
      void rescan();
    }, 100);
  };

  try {
    await applyNextState(discoveredState);
  } catch (error) {
    onError(error);
  }

  return async () => {
    if (closed) {
      await rescanQueue;
      return;
    }
    closed = true;
    if (rescanTimer) {
      clearTimeout(rescanTimer);
    }
    for (const watcher of directoryWatchers.values()) {
      watcher.close();
    }
    directoryWatchers.clear();
    await rescanQueue;
    for (const watcher of directoryWatchers.values()) {
      watcher.close();
    }
    directoryWatchers.clear();
  };
};
