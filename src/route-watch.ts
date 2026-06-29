import { watch, type FSWatcher } from 'node:fs';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import type { RsbuildConfig, RsbuildPluginAPI } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { Duration, Effect, Fiber } from 'effect';
import { dirname, resolve } from 'pathe';
import { getCappedPluginConcurrency } from './concurrency.js';
import {
  createDelayedPluginTask,
  DEV_BACKGROUND_STARTUP_DELAY_MS,
  runPluginEffect,
  tryPluginPromise,
} from './effect-runtime.js';
import { configRoutesToRouteManifestEntries } from './manifest.js';
import type { Route } from './types.js';

const ROUTE_RESTART_MARKER_ASSET = '.react-router/route-watch';
const INITIAL_RESTART_MARKER_CONTENT = 'react-router-route-watch';
const ROUTE_TOPOLOGY_RESCAN_DEBOUNCE_MS = 100;
const ROUTE_DIRECTORY_SCAN_CONCURRENCY = getCappedPluginConcurrency();

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

export const createRouteTopologySnapshot = ({
  appDirectory,
  rootRouteFile,
  routeConfig,
}: {
  appDirectory: string;
  rootRouteFile: string;
  routeConfig: RouteConfigEntry[];
}): Set<string> =>
  createRouteManifestSnapshot([
    ['root', { path: '', id: 'root', file: rootRouteFile }],
    ...configRoutesToRouteManifestEntries(appDirectory, routeConfig),
  ]);

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

const readRouteDirectories = (watchDirectory: string): Promise<Set<string>> => {
  return runPluginEffect(readRouteDirectoriesEffect(watchDirectory));
};

const readRouteDirectoriesEffect = (
  watchDirectory: string
): Effect.Effect<Set<string>, Error, never> => {
  const directories = new Set<string>();
  const walkDirectory = (directory: string): Effect.Effect<void> =>
    tryPluginPromise(() => readdir(directory, { withFileTypes: true })).pipe(
      Effect.catchAll(() => Effect.succeed([])),
      Effect.map(entries => {
        directories.add(directory);
        return entries
          .filter(entry => entry.isDirectory())
          .map(entry => resolve(directory, entry.name));
      }),
      Effect.flatMap(childDirectories =>
        Effect.forEach(childDirectories, walkDirectory, {
          concurrency: ROUTE_DIRECTORY_SCAN_CONCURRENCY,
          discard: true,
        })
      )
    );

  return walkDirectory(watchDirectory).pipe(Effect.as(directories));
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
  let scheduledRescanFiber: ReturnType<typeof Effect.runFork> | undefined;
  let scheduledRescanToken: symbol | undefined;
  let rescanQueue = Promise.resolve();
  const directoryWatchers = new Map<string, DirectoryWatcher>();

  const touchRestartMarkerEffect = (): Effect.Effect<void, Error, never> =>
    tryPluginPromise(() =>
      mkdir(dirname(restartMarkerPath), { recursive: true })
    ).pipe(
      Effect.zipRight(
        tryPluginPromise(() => writeFile(restartMarkerPath, String(Date.now())))
      )
    );

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

  const applyNextStateEffect = (
    nextState: RouteDirectoryState
  ): Effect.Effect<void, Error, never> =>
    Effect.suspend(() => {
      if (closed) {
        return Effect.void;
      }
      syncDirectoryWatchers(nextState.directories);
      if (!areSetsEqual(state.routeTopology, nextState.routeTopology)) {
        if (onRouteTopologyChange) {
          // This is a notification boundary, not part of the rescan
          // transaction. A custom-server callback may close this watcher while
          // replacing its compiler, so awaiting it here would deadlock close().
          state = nextState;
          return Effect.sync(() => {
            try {
              void Promise.resolve(onRouteTopologyChange()).catch(onError);
            } catch (error) {
              onError(error);
            }
          });
        }
        return touchRestartMarkerEffect().pipe(
          Effect.zipRight(
            Effect.sync(() => {
              if (!closed) {
                state = nextState;
              }
            })
          )
        );
      }
      state = nextState;
      return Effect.void;
    });

  const runRescanEffect = (): Effect.Effect<void, never, never> => {
    let nextDirectories: Set<string> | undefined;
    return Effect.gen(function* () {
      if (closed) {
        return;
      }
      nextDirectories = yield* readRouteDirectoriesEffect(watchDirectory);
      if (closed) {
        return;
      }
      const nextState = {
        directories: nextDirectories,
        routeTopology: yield* tryPluginPromise(getRouteTopology),
      };
      if (closed) {
        return;
      }
      yield* applyNextStateEffect(nextState);
    }).pipe(
      Effect.catchAll(error =>
        Effect.sync(() => {
          if (nextDirectories && !closed) {
            syncDirectoryWatchers(nextDirectories);
          }
          onError(error);
        })
      )
    );
  };

  const rescan = (): Promise<void> => {
    rescanQueue = rescanQueue.then(
      () => runPluginEffect(runRescanEffect()),
      () => runPluginEffect(runRescanEffect())
    );
    return rescanQueue;
  };

  const cancelScheduledRescan = (): Promise<void> => {
    const fiber = scheduledRescanFiber;
    scheduledRescanFiber = undefined;
    scheduledRescanToken = undefined;
    if (!fiber) {
      return Promise.resolve();
    }
    return runPluginEffect(Fiber.interrupt(fiber).pipe(Effect.asVoid));
  };

  const scheduleRescan = (): void => {
    const previousFiber = scheduledRescanFiber;
    if (previousFiber) {
      void runPluginEffect(
        Fiber.interrupt(previousFiber).pipe(Effect.asVoid)
      ).catch(onError);
    }

    const token = Symbol();
    scheduledRescanToken = token;
    scheduledRescanFiber = Effect.runFork(
      Effect.sleep(Duration.millis(ROUTE_TOPOLOGY_RESCAN_DEBOUNCE_MS)).pipe(
        Effect.zipRight(
          Effect.suspend(() => {
            if (closed || scheduledRescanToken !== token) {
              return Effect.void;
            }
            return tryPluginPromise(rescan).pipe(Effect.asVoid);
          })
        ),
        Effect.catchAll(error =>
          Effect.sync(() => {
            onError(error);
          })
        ),
        Effect.ensuring(
          Effect.sync(() => {
            if (scheduledRescanToken === token) {
              scheduledRescanFiber = undefined;
              scheduledRescanToken = undefined;
            }
          })
        )
      )
    );
  };

  const applyNextState = async (nextState: RouteDirectoryState) => {
    await runPluginEffect(applyNextStateEffect(nextState));
  };

  try {
    await applyNextState(discoveredState);
  } catch (error) {
    onError(error);
  }

  return async () => {
    if (closed) {
      await cancelScheduledRescan();
      await rescanQueue;
      return;
    }
    closed = true;
    await cancelScheduledRescan();
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

export const registerRouteTopologyDevWatch = ({
  api,
  appDirectory,
  configWatchPaths,
  getRootRouteFile,
  loadRouteConfig,
  onRouteTopologyChange,
  outputClientPath,
  pluginName,
  routeConfig,
  routesPath,
}: {
  api: RsbuildPluginAPI;
  appDirectory: string;
  configWatchPaths: string | string[];
  getRootRouteFile: () => string;
  loadRouteConfig: () => Promise<RouteConfigEntry[]>;
  onRouteTopologyChange?: () => void | Promise<void>;
  outputClientPath: string;
  pluginName: string;
  routeConfig: RouteConfigEntry[];
  routesPath: string;
}): WatchFileConfig[] => {
  const watchDirectory = resolve(appDirectory);
  const routeRestartMarkerPath = getRouteRestartMarkerPath(outputClientPath);
  const getWatchedRouteTopology = async (): Promise<Set<string>> =>
    createRouteTopologySnapshot({
      appDirectory,
      rootRouteFile: getRootRouteFile(),
      routeConfig: await loadRouteConfig(),
    });
  const routeTopologyWatchFiles: WatchFileConfig[] = onRouteTopologyChange
    ? []
    : [
        {
          paths: routesPath,
          type: 'reload-server',
        },
        {
          paths: routeRestartMarkerPath,
          type: 'reload-server',
        },
      ];
  let closeRouteTopologyWatcher: (() => Promise<void>) | undefined;
  let routeTopologyWatcherClosed = false;

  const reportRouteTopologyWatcherError = (error: unknown): void => {
    api.logger.warn(
      `[${pluginName}] Failed to watch route topology changes: ${error}`
    );
  };

  const routeTopologyWatcherTask = createDelayedPluginTask({
    delayMs: DEV_BACKGROUND_STARTUP_DELAY_MS,
    run: () =>
      Effect.gen(function* () {
        yield* tryPluginPromise(() =>
          ensureDevRestartMarker(routeRestartMarkerPath)
        );
        const closeWatcher = yield* tryPluginPromise(() =>
          createRouteTopologyWatcher({
            watchDirectory,
            getRouteTopology: getWatchedRouteTopology,
            initialRouteTopology: createRouteTopologySnapshot({
              appDirectory,
              rootRouteFile: getRootRouteFile(),
              routeConfig,
            }),
            restartMarkerPath: routeRestartMarkerPath,
            onRouteTopologyChange,
            onError: reportRouteTopologyWatcherError,
          })
        );
        if (routeTopologyWatcherClosed) {
          yield* tryPluginPromise(() => closeWatcher());
          return;
        }
        closeRouteTopologyWatcher = closeWatcher;
      }),
    onError: reportRouteTopologyWatcherError,
  });

  const scheduleRouteTopologyWatcher = (): void => {
    if (routeTopologyWatcherClosed || closeRouteTopologyWatcher) {
      return;
    }
    routeTopologyWatcherTask.schedule();
  };

  api.onBeforeStartDevServer(() => {
    routeTopologyWatcherClosed = false;
  });

  api.onAfterDevCompile(() => {
    scheduleRouteTopologyWatcher();
  });

  api.onCloseDevServer(async () => {
    routeTopologyWatcherClosed = true;
    await routeTopologyWatcherTask.cancel();
    await closeRouteTopologyWatcher?.();
    closeRouteTopologyWatcher = undefined;
  });

  return [
    {
      paths: configWatchPaths,
      type: 'reload-server',
    },
    ...routeTopologyWatchFiles,
  ];
};
