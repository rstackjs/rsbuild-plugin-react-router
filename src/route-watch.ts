import { existsSync, readFileSync, watch, type FSWatcher } from 'node:fs';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import type { ProcessAssetsHandler, RsbuildConfig } from '@rsbuild/core';
import { dirname, resolve } from 'pathe';
import type { Route } from './types.js';

export const ROUTE_RESTART_MARKER_ASSET = '.react-router/route-watch';
const INITIAL_RESTART_MARKER_CONTENT = 'react-router-route-watch';

type RouteManifestSnapshotEntry = Pick<
  Route,
  'caseSensitive' | 'file' | 'id' | 'index' | 'parentId' | 'path'
>;

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

type ProcessAssetsContext = Parameters<ProcessAssetsHandler>[0];
type RouteRestartMarkerAssetOptions = Pick<
  ProcessAssetsContext,
  'compilation' | 'sources'
> & {
  restartMarkerPath: string;
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

const readRestartMarkerContent = (restartMarkerPath: string): string => {
  if (!existsSync(restartMarkerPath)) {
    return INITIAL_RESTART_MARKER_CONTENT;
  }

  try {
    const content = readFileSync(restartMarkerPath, 'utf8');
    return content || INITIAL_RESTART_MARKER_CONTENT;
  } catch {
    return INITIAL_RESTART_MARKER_CONTENT;
  }
};

export const emitRouteRestartMarkerAsset = ({
  restartMarkerPath,
  sources,
  compilation,
}: RouteRestartMarkerAssetOptions): void => {
  const source = new sources.RawSource(
    readRestartMarkerContent(restartMarkerPath)
  );
  if (compilation.getAsset(ROUTE_RESTART_MARKER_ASSET)) {
    compilation.updateAsset(ROUTE_RESTART_MARKER_ASSET, source);
    return;
  }
  compilation.emitAsset(ROUTE_RESTART_MARKER_ASSET, source);
};

export const createRouteManifestSnapshot = (
  routes: Record<string, RouteManifestSnapshotEntry>
): Set<string> =>
  new Set(
    Object.entries(routes)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([routeId, route]) =>
        JSON.stringify([
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
  // Build emits this marker through processAssets. Dev owns the watched file
  // directly so ordinary rebuilds do not rewrite it and trigger reload loops.
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

const readRouteDirectoryState = async ({
  watchDirectory,
  getRouteTopology,
}: {
  watchDirectory: string;
  getRouteTopology: () => Promise<Set<string>>;
}): Promise<RouteDirectoryState> => {
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
  return {
    directories,
    routeTopology: await getRouteTopology(),
  };
};

export const createRouteTopologyWatcher = async ({
  watchDirectory,
  getRouteTopology,
  restartMarkerPath,
  onError,
}: {
  watchDirectory: string;
  getRouteTopology: () => Promise<Set<string>>;
  restartMarkerPath: string;
  onError: (error: unknown) => void;
}): Promise<() => void> => {
  let state = await readRouteDirectoryState({
    watchDirectory,
    getRouteTopology,
  });
  let closed = false;
  let rescanTimer: ReturnType<typeof setTimeout> | undefined;
  let rescanQueue = Promise.resolve();
  const directoryWatchers = new Map<string, FSWatcher>();

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
        const watcher = watch(directory, () => {
          scheduleRescan();
        });
        watcher.on('error', onError);
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

  const runRescan = async (): Promise<void> => {
    if (closed) {
      return;
    }
    try {
      const nextState = await readRouteDirectoryState({
        watchDirectory,
        getRouteTopology,
      });
      syncDirectoryWatchers(nextState.directories);
      if (!areSetsEqual(state.routeTopology, nextState.routeTopology)) {
        state = nextState;
        await touchRestartMarker();
        return;
      }
      state = nextState;
    } catch (error) {
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

  syncDirectoryWatchers(state.directories);

  return () => {
    closed = true;
    if (rescanTimer) {
      clearTimeout(rescanTimer);
    }
    for (const watcher of directoryWatchers.values()) {
      watcher.close();
    }
    directoryWatchers.clear();
  };
};
