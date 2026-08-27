import { watch, type FSWatcher } from 'node:fs';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import type { RsbuildConfig } from '@rsbuild/core';
import * as Effect from 'effect/Effect';
import type * as Scope from 'effect/Scope';
import { dirname, resolve } from 'pathe';
import { getCappedPluginConcurrency } from './concurrency.js';
import {
  createDelayedPluginTask,
  type PluginEffectRuntime,
  tryPluginPromise,
} from './effect-runtime.js';
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

export type CreateRouteTopologyWatcherOptions = {
  runtime: PluginEffectRuntime;
  watchDirectory: string;
  getRouteTopology: () => Promise<Set<string>>;
  initialRouteTopology?: Set<string>;
  restartMarkerPath: string;
  onError: (error: unknown) => void;
  onRouteTopologyChange?: () => void | Promise<void>;
  watchDirectoryEntry?: WatchDirectoryEntry;
};

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

export const getRouteRestartMarkerPath = (appDirectory: string): string =>
  resolve(appDirectory, '..', ROUTE_RESTART_MARKER_ASSET);

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

const createRouteTopologyWatcherEffect = ({
  runtime,
  watchDirectory,
  getRouteTopology,
  initialRouteTopology,
  restartMarkerPath,
  onError,
  onRouteTopologyChange,
  watchDirectoryEntry: watchDirectoryOverride = defaultWatchDirectoryEntry,
}: CreateRouteTopologyWatcherOptions) =>
  Effect.gen(function* () {
    const discoveredDirectories =
      yield* readRouteDirectoriesEffect(watchDirectory);
    const routeTopology = yield* tryPluginPromise(getRouteTopology).pipe(
      Effect.catchAll(error => {
        if (!initialRouteTopology) return Effect.fail(error);
        onError(error);
        return Effect.succeed(initialRouteTopology);
      })
    );
    const discoveredState: RouteDirectoryState = {
      directories: discoveredDirectories,
      routeTopology,
    };
    let state = {
      ...discoveredState,
      routeTopology: initialRouteTopology ?? discoveredState.routeTopology,
    };
    let closed = false;
    const directoryWatchers = new Map<string, DirectoryWatcher>();

    const touchRestartMarkerEffect = (): Effect.Effect<void, Error, never> =>
      tryPluginPromise(() =>
        mkdir(dirname(restartMarkerPath), { recursive: true })
      ).pipe(
        Effect.zipRight(
          tryPluginPromise(() =>
            writeFile(restartMarkerPath, String(Date.now()))
          )
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
          watcher = watchDirectoryOverride(
            directory,
            () => {
              if (!closed) rescanTask.reschedule();
            },
            error => {
              if (closed) return;
              if (directoryWatchers.get(directory) === watcher) {
                watcher.close();
                directoryWatchers.delete(directory);
              }
              onError(error);
            }
          );
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
        if (closed) return Effect.void;
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
        if (closed) return;
        nextDirectories = yield* readRouteDirectoriesEffect(watchDirectory);
        if (closed) return;
        const nextState = {
          directories: nextDirectories,
          routeTopology: yield* tryPluginPromise(getRouteTopology),
        };
        if (closed) return;
        yield* applyNextStateEffect(nextState);
      }).pipe(
        Effect.catchAll(error =>
          Effect.sync(() => {
            if (nextDirectories && !closed)
              syncDirectoryWatchers(nextDirectories);
            onError(error);
          })
        )
      );
    };

    const rescanTask = createDelayedPluginTask({
      runtime,
      delayMs: ROUTE_TOPOLOGY_RESCAN_DEBOUNCE_MS,
      run: () =>
        Effect.suspend(() => (closed ? Effect.void : runRescanEffect())),
      onError,
    });

    const closeEffect = (): Effect.Effect<void, Error> =>
      tryPluginPromise(() => {
        if (closed) return;
        closed = true;
        for (const watcher of directoryWatchers.values()) {
          watcher.close();
        }
        directoryWatchers.clear();
      }).pipe(Effect.ensuring(rescanTask.cancelEffect()));

    yield* applyNextStateEffect(discoveredState).pipe(
      Effect.catchAll(error => Effect.sync(() => onError(error))),
      Effect.onInterrupt(() => Effect.ignore(closeEffect()))
    );

    return closeEffect;
  });

export const acquireRouteTopologyWatcher = (
  options: CreateRouteTopologyWatcherOptions
): Effect.Effect<() => Effect.Effect<void, Error>, Error, Scope.Scope> =>
  Effect.acquireRelease(createRouteTopologyWatcherEffect(options), close =>
    close().pipe(
      Effect.catchAll(error => Effect.sync(() => options.onError(error)))
    )
  );
