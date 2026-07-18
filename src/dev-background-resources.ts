import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import * as Effect from 'effect/Effect';
import { relative } from 'pathe';
import { PLUGIN_NAME } from './constants.js';
import {
  createDelayedPluginTask,
  DEV_BACKGROUND_STARTUP_DELAY_MS,
  normalizeEffectError,
  type PluginEffectRuntime,
} from './effect-runtime.js';
import {
  acquireLazyCompilationPrewarm,
  normalizeLazyCompilationPrewarmOptions,
} from './lazy-compilation-prewarm.js';
import {
  configRoutesToRouteManifestEntries,
  type ReactRouterManifestForDev,
} from './manifest.js';
import type { RouteTransformExecutor } from './parallel-route-transforms.js';
import {
  acquireRouteTopologyWatcher,
  createRouteManifestSnapshot,
  ensureDevRestartMarker,
  type WatchFileConfig,
} from './route-watch.js';
import type { PluginOptions } from './types.js';

type RegisterReactRouterDevBackgroundResourcesOptions = {
  api: RsbuildPluginAPI;
  runtime: PluginEffectRuntime;
  isBuild: boolean;
  lazyCompilationPrewarm: PluginOptions['unstableLazyCompilationPrewarm'];
  routeTransformExecutor?: RouteTransformExecutor;
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
        type: 'reload-page',
      },
      {
        paths: routeRestartMarkerPath,
        type: 'reload-server',
      }
    );
  }

  return watchFiles;
};

export const registerReactRouterDevBackgroundResources = async ({
  api,
  runtime,
  isBuild,
  lazyCompilationPrewarm,
  routeTransformExecutor,
  routeRestartMarkerPath,
  watchDirectory,
  getRouteTopology,
  initialRouteTopology,
  onRouteTopologyChange,
}: RegisterReactRouterDevBackgroundResourcesOptions): Promise<ReactRouterDevBackgroundResources> => {
  let routeTopologyWatcherStarted = false;

  const reportRouteTopologyWatcherError = (error: unknown): void => {
    api.logger.warn(
      `[${PLUGIN_NAME}] Failed to watch route topology changes: ${String(normalizeEffectError(error))}`
    );
  };

  const routeTopologyWatcherTask = createDelayedPluginTask({
    runtime,
    delayMs: DEV_BACKGROUND_STARTUP_DELAY_MS,
    run: () =>
      acquireRouteTopologyWatcher({
        runtime,
        watchDirectory,
        getRouteTopology,
        initialRouteTopology,
        restartMarkerPath: routeRestartMarkerPath,
        onRouteTopologyChange,
        onError: reportRouteTopologyWatcherError,
      }).pipe(
        Effect.tap(() =>
          Effect.sync(() => (routeTopologyWatcherStarted = true))
        ),
        Effect.asVoid
      ),
    onError: reportRouteTopologyWatcherError,
  });

  const lazyCompilationPrewarmConfig = normalizeLazyCompilationPrewarmOptions(
    lazyCompilationPrewarm
  );
  const lazyCompilationPrewarmController = lazyCompilationPrewarmConfig
    ? await runtime.runPromise(
        acquireLazyCompilationPrewarm({
          runtime,
          config: lazyCompilationPrewarmConfig,
          onError: error =>
            api.logger.warn(
              `[${PLUGIN_NAME}] Lazy compilation prewarm skipped: ${error.message}`
            ),
        })
      )
    : null;

  if (!isBuild) {
    api.onBeforeStartDevServer(async () => {
      await ensureDevRestartMarker(routeRestartMarkerPath);
    });

    api.onAfterStartDevServer(({ port }) => {
      lazyCompilationPrewarmController?.setServerOrigin(
        `http://localhost:${port}`
      );
      lazyCompilationPrewarmController?.schedule();
    });

    api.onAfterDevCompile(() => {
      if (!routeTopologyWatcherStarted) {
        routeTopologyWatcherTask.schedule();
      }
      lazyCompilationPrewarmController?.schedule();
    });

    // Spawn transform workers now so thread startup overlaps Rsbuild's own
    // compiler creation instead of delaying the first route transform.
    routeTransformExecutor?.prewarm();
  }

  return {
    setManifest(manifest) {
      lazyCompilationPrewarmController?.setManifest(manifest);
    },
  };
};
