import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import * as Effect from 'effect/Effect';
import { relative } from 'pathe';
import { PLUGIN_NAME } from './constants.js';
import {
  createDelayedPluginTask,
  DEV_BACKGROUND_STARTUP_DELAY_MS,
  normalizeEffectError,
  runPluginEffect,
  tryPluginPromise,
} from './effect-runtime.js';
import {
  createLazyCompilationPrewarmController,
  normalizeLazyCompilationPrewarmOptions,
} from './lazy-compilation-prewarm.js';
import {
  configRoutesToRouteManifestEntries,
  type ReactRouterManifestForDev,
} from './manifest.js';
import type { RouteTransformExecutor } from './parallel-route-transforms.js';
import {
  createRouteManifestSnapshot,
  createRouteTopologyWatcher,
  ensureDevRestartMarker,
  type WatchFileConfig,
} from './route-watch.js';
import type { PluginOptions } from './types.js';

type RegisterReactRouterDevBackgroundResourcesOptions = {
  api: RsbuildPluginAPI;
  isBuild: boolean;
  lazyCompilationPrewarm: PluginOptions['unstableLazyCompilationPrewarm'];
  routeTransformExecutor: RouteTransformExecutor;
  routeRestartMarkerPath: string;
  watchDirectory: string;
  getRouteTopology: () => Promise<Set<string>>;
  initialRouteTopology: Set<string>;
  onRouteTopologyChange: PluginOptions['onRouteTopologyChange'];
};

type ReactRouterDevBackgroundResources = {
  setManifest(manifest: ReactRouterManifestForDev): void;
};

export const createReactRouterRouteTopology = ({
  appDirectory,
  rootRouteFile,
  routeConfig,
  loadRouteConfig,
  getRootRoutePath,
}: {
  appDirectory: string;
  rootRouteFile: string;
  routeConfig: RouteConfigEntry[];
  loadRouteConfig: () => Promise<RouteConfigEntry[]>;
  getRootRoutePath: () => string;
}): {
  initialRouteTopology: Set<string>;
  getRouteTopology: () => Promise<Set<string>>;
} => {
  const createSnapshot = (
    routeFile: string,
    routeConfigEntries: RouteConfigEntry[]
  ): Set<string> =>
    createRouteManifestSnapshot([
      ['root', { path: '', id: 'root', file: routeFile }],
      ...configRoutesToRouteManifestEntries(appDirectory, routeConfigEntries),
    ]);

  return {
    initialRouteTopology: createSnapshot(rootRouteFile, routeConfig),
    async getRouteTopology() {
      const latestRouteConfig = await loadRouteConfig();
      const latestRootRouteFile = relative(appDirectory, getRootRoutePath());
      return createSnapshot(latestRootRouteFile, latestRouteConfig);
    },
  };
};

export const createReactRouterRouteWatchFiles = ({
  configWatchPaths,
  routeConfigWatchPaths,
  routeRestartMarkerPath,
  onRouteTopologyChange,
}: {
  configWatchPaths: string | string[];
  routeConfigWatchPaths: string | string[];
  routeRestartMarkerPath: string;
  onRouteTopologyChange: PluginOptions['onRouteTopologyChange'];
}): WatchFileConfig[] => {
  const watchFiles: WatchFileConfig[] = [
    {
      paths: configWatchPaths,
      type: 'reload-server',
    },
  ];

  if (!onRouteTopologyChange) {
    watchFiles.push(
      {
        paths: routeConfigWatchPaths,
        type: 'reload-server',
      },
      {
        paths: routeRestartMarkerPath,
        type: 'reload-server',
      }
    );
  }

  return watchFiles;
};

const closeAll = async (
  message: string,
  closers: Array<() => Promise<void>>
): Promise<void> => {
  const results = await Promise.allSettled(closers.map(closer => closer()));
  const errors = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    .map(result => normalizeEffectError(result.reason));

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, message);
  }
};

export const registerReactRouterDevBackgroundResources = ({
  api,
  isBuild,
  lazyCompilationPrewarm,
  routeTransformExecutor,
  routeRestartMarkerPath,
  watchDirectory,
  getRouteTopology,
  initialRouteTopology,
  onRouteTopologyChange,
}: RegisterReactRouterDevBackgroundResourcesOptions): ReactRouterDevBackgroundResources => {
  let closeActiveRouteTopologyWatcher: (() => Promise<void>) | undefined;
  let routeTopologyWatcherClosed = false;

  const reportRouteTopologyWatcherError = (error: unknown): void => {
    api.logger.warn(
      `[${PLUGIN_NAME}] Failed to watch route topology changes: ${String(normalizeEffectError(error))}`
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
            getRouteTopology,
            initialRouteTopology,
            restartMarkerPath: routeRestartMarkerPath,
            onRouteTopologyChange,
            onError: reportRouteTopologyWatcherError,
          })
        );
        if (routeTopologyWatcherClosed) {
          yield* tryPluginPromise(() => closeWatcher());
          return;
        }
        closeActiveRouteTopologyWatcher = closeWatcher;
      }),
    onError: reportRouteTopologyWatcherError,
  });

  const scheduleRouteTopologyWatcher = (): void => {
    if (routeTopologyWatcherClosed || closeActiveRouteTopologyWatcher) {
      return;
    }
    routeTopologyWatcherTask.schedule();
  };

  const lazyCompilationPrewarmConfig = normalizeLazyCompilationPrewarmOptions(
    lazyCompilationPrewarm
  );
  const lazyCompilationPrewarmController = lazyCompilationPrewarmConfig
    ? createLazyCompilationPrewarmController({
        config: lazyCompilationPrewarmConfig,
        onError: error =>
          api.logger.warn(
            `[${PLUGIN_NAME}] Lazy compilation prewarm skipped: ${error.message}`
          ),
      })
    : null;

  if (!isBuild) {
    api.onBeforeStartDevServer(() => {
      routeTopologyWatcherClosed = false;
    });

    api.onAfterStartDevServer(({ port }) => {
      lazyCompilationPrewarmController?.setServerOrigin(
        `http://localhost:${port}`
      );
      lazyCompilationPrewarmController?.schedule();
    });

    api.onAfterDevCompile(() => {
      scheduleRouteTopologyWatcher();
      lazyCompilationPrewarmController?.schedule();
    });

    // Spawn transform workers now so thread startup overlaps Rsbuild's own
    // compiler creation instead of delaying the first route transform.
    routeTransformExecutor.prewarm();
  }

  const closeRouteTopologyWatcher = async (): Promise<void> => {
    routeTopologyWatcherClosed = true;
    await runPluginEffect(routeTopologyWatcherTask.cancelEffect());
    await closeActiveRouteTopologyWatcher?.();
    closeActiveRouteTopologyWatcher = undefined;
  };

  const closeLazyCompilationPrewarm = async (): Promise<void> => {
    await runPluginEffect(
      lazyCompilationPrewarmController?.cancelEffect() ?? Effect.void
    );
  };

  const closeRouteTransformExecutor = (): Promise<void> =>
    routeTransformExecutor.close();

  api.onCloseDevServer(() =>
    closeAll(
      '[rsbuild-plugin-react-router] Failed to close dev server resources.',
      [
        closeRouteTopologyWatcher,
        closeLazyCompilationPrewarm,
        closeRouteTransformExecutor,
      ]
    )
  );
  api.onCloseBuild(closeRouteTransformExecutor);

  return {
    setManifest(manifest) {
      lazyCompilationPrewarmController?.setManifest(manifest);
    },
  };
};
