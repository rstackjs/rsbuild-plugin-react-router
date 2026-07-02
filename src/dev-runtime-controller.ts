import type { RsbuildConfig, RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import * as Effect from 'effect/Effect';
import type { ServerBuild } from 'react-router';
import { PLUGIN_NAME } from './constants.js';
import {
  beginDevCompilerAttempt,
  clearDevCompilerStart,
  createCompilationIdentityTracker,
  createDevCompilerPair,
  hasPendingCompilation,
  isLatestStartedCompilation,
  markDevCompilerPending,
  resetDevCompilerPair,
  type DevCompilerPair,
} from './dev-runtime-compilation.js';
import {
  createReactRouterDevRuntime,
  loadReactRouterServerBuild,
  registerReactRouterDevRuntime,
  unregisterReactRouterDevRuntime,
} from './dev-generation.js';
import {
  getEnvironmentStats,
  snapshotDevChangedFiles,
  type DevGraphIdentity,
  type DevRuntimeStats,
  type ReactRouterDevBuildPlan,
  type ReactRouterDevManifestSet,
} from './dev-runtime-artifacts.js';
import {
  createDevRuntimeSessionManager,
  type RuntimeBinding,
} from './dev-runtime-session.js';
import {
  normalizeEffectError,
  runPluginEffect,
  tryPluginPromise,
  tryPluginSync,
} from './effect-runtime.js';

type ServerSetup = Exclude<
  NonNullable<NonNullable<RsbuildConfig['server']>['setup']>,
  unknown[]
>;

export type ReactRouterDevRuntimeController = {
  captureWeb: (
    compilation: Rspack.Compilation,
    manifestsByEntryName: ReactRouterDevManifestSet
  ) => void;
  createBuildLoader: (entryName?: string) => () => Promise<ServerBuild>;
};

type CreateControllerOptions = {
  api: RsbuildPluginAPI;
  isBuild: boolean;
  buildPlan: ReactRouterDevBuildPlan;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const CSS_SOURCE_RELOAD_DELAY_MS = 1000;

export const createReactRouterDevRuntimeController = ({
  api,
  isBuild,
  buildPlan,
}: CreateControllerOptions): ReactRouterDevRuntimeController => {
  if (isBuild) {
    return {
      captureWeb() {},
      createBuildLoader() {
        return () =>
          Promise.reject(
            new Error(
              `[${PLUGIN_NAME}] The development server runtime is unavailable during a production build.`
            )
          );
      },
    };
  }

  let scheduledCssAssetOwnershipReload:
    | ReturnType<typeof setTimeout>
    | undefined;
  let lastCssAssetOwnershipReloadAt = 0;
  let reloadAfterCssAssetOwnershipRemoval = false;

  const sendCssAssetOwnershipReload = (): void => {
    const binding = sessions.getActiveBinding();
    if (!binding) {
      return;
    }
    lastCssAssetOwnershipReloadAt = Date.now();
    binding.server.sockWrite('full-reload', { path: '*' });
  };

  const scheduleCssAssetOwnershipReload = (): void => {
    if (scheduledCssAssetOwnershipReload) {
      clearTimeout(scheduledCssAssetOwnershipReload);
    }
    const scheduledAt = Date.now();
    scheduledCssAssetOwnershipReload = setTimeout(() => {
      scheduledCssAssetOwnershipReload = undefined;
      if (lastCssAssetOwnershipReloadAt > scheduledAt) {
        return;
      }
      sendCssAssetOwnershipReload();
    }, CSS_SOURCE_RELOAD_DELAY_MS);
  };

  const closeBinding = (binding: RuntimeBinding, error?: Error): void => {
    if (scheduledCssAssetOwnershipReload) {
      clearTimeout(scheduledCssAssetOwnershipReload);
      scheduledCssAssetOwnershipReload = undefined;
    }
    reloadAfterCssAssetOwnershipRemoval = false;
    const pair = binding.compilers;
    if (pair) {
      resetDevCompilerPair(pair);
    }
    binding.compilers = undefined;
    binding.runtime.close(error);
    unregisterReactRouterDevRuntime(binding.server, binding.runtime);
  };

  const sessions = createDevRuntimeSessionManager(closeBinding);
  const compilationIdentities = createCompilationIdentityTracker();
  const { getCompilationIdentity } = compilationIdentities;

  const finishRuntimeAttemptEffect = (
    binding: RuntimeBinding,
    pair: DevCompilerPair,
    stats: DevRuntimeStats,
    changes: Parameters<RuntimeBinding['runtime']['finishAttempt']>[1],
    identity: Parameters<RuntimeBinding['runtime']['finishAttempt']>[2]
  ): Effect.Effect<void, Error, never> =>
    tryPluginPromise(() =>
      binding.runtime.finishAttempt(stats, changes, identity)
    ).pipe(
      Effect.flatMap(result =>
        tryPluginSync(() => {
          if (
            result === 'retry-node' &&
            sessions.getActiveBinding()?.id === binding.id
          ) {
            pair.node.watching?.invalidate();
          }
        })
      ),
      Effect.catchAll(cause =>
        tryPluginSync(() => {
          if (sessions.getActiveBinding()?.id === binding.id) {
            binding.runtime.failAttempt(normalizeEffectError(cause));
          }
        })
      )
    );

  const finishRuntimeAttempt = (
    binding: RuntimeBinding,
    pair: DevCompilerPair,
    stats: DevRuntimeStats,
    changes: Parameters<RuntimeBinding['runtime']['finishAttempt']>[1],
    identity: Parameters<RuntimeBinding['runtime']['finishAttempt']>[2]
  ): Promise<void> =>
    runPluginEffect(
      finishRuntimeAttemptEffect(binding, pair, stats, changes, identity)
    );

  const flushSettledAttempt = (
    binding: RuntimeBinding,
    pair: DevCompilerPair
  ): void => {
    const pending = pair.pendingAttempt;
    if (
      !pending ||
      sessions.getActiveBinding()?.id !== binding.id ||
      !pair.settledCompilations.has(pending.webCompilation) ||
      !pair.settledCompilations.has(pending.nodeCompilation)
    ) {
      return;
    }
    pair.pendingAttempt = undefined;
    if (
      !isLatestStartedCompilation(pending.identity.web, pair.latestWebStart) ||
      !isLatestStartedCompilation(pending.identity.node, pair.latestNodeStart)
    ) {
      return;
    }
    void finishRuntimeAttempt(
      binding,
      pair,
      pending.stats,
      pending.changes,
      pending.identity
    );
  };

  const rejectUnsupportedCompiler = (reason: string): void => {
    const message = `[${PLUGIN_NAME}] Could not coordinate React Router development output because ${reason}.`;
    api.logger.warn(message);
    const binding = sessions.getActiveBinding();
    if (!binding) {
      return;
    }
    const error = new Error(message);
    sessions.terminate(binding, error);
  };

  // Rsbuild runs server.setup before onBeforeStartDevServer. Prepending the
  // observer here ensures setup callbacks cannot capture an unobserved close.
  api.modifyRsbuildConfig({
    order: 'post',
    handler(config) {
      const existingSetup = config.server?.setup;
      const setup = existingSetup
        ? Array.isArray(existingSetup)
          ? existingSetup
          : [existingSetup]
        : [];
      const observeServer: ServerSetup = context => {
        if (context.action === 'dev') {
          sessions.observeClose(context.server);
        }
      };
      return {
        ...config,
        server: {
          ...config.server,
          setup: [observeServer, ...setup],
        },
      };
    },
  });

  api.onBeforeStartDevServer({
    order: 'pre',
    async handler({ server }) {
      sessions.assertCanStart();
      const runtime = createReactRouterDevRuntime({
        server,
        buildPlan,
        onEvaluationError(error) {
          if (sessions.getActiveBinding()?.runtime !== runtime) {
            return;
          }
          api.logger.error(error.message);
          server.sockWrite('errors', {
            text: [error.message],
            html: escapeHtml(error.message),
          });
        },
        onCssAssetOwnershipChanged(change) {
          if (sessions.getActiveBinding()?.runtime !== runtime) {
            return;
          }
          reloadAfterCssAssetOwnershipRemoval = change === 'removed';
          sendCssAssetOwnershipReload();
        },
        onRouteManifestChanged() {
          if (sessions.getActiveBinding()?.runtime !== runtime) {
            return;
          }
          server.sockWrite('full-reload', { path: '*' });
        },
        onWarning: message => api.logger.warn(message),
      });
      const binding = sessions.createBinding(server, runtime);
      registerReactRouterDevRuntime(server, runtime);
      sessions.bindCloseObservation(binding);
    },
  });

  api.onCloseDevServer({
    order: 'pre',
    handler() {
      const binding = sessions.getActiveBinding();
      if (!binding) {
        return;
      }
      closeBinding(binding);
      sessions.markClosing(binding);
    },
  });

  api.onBeforeDevCompile({
    order: 'pre',
    handler() {
      const binding = sessions.getActiveBinding();
      const pair = binding?.compilers;
      if (!binding || !pair || hasPendingCompilation(pair)) {
        return;
      }
      beginDevCompilerAttempt(pair);
      binding.runtime.beginAttempt();
    },
  });

  api.onAfterCreateCompiler(({ compiler }) => {
    if (!('compilers' in compiler)) {
      rejectUnsupportedCompiler('Rsbuild did not create a multi-compiler');
      return;
    }
    const web = compiler.compilers.find(item => item.name === 'web');
    const node = compiler.compilers.find(item => item.name === 'node');
    if (!web || !node) {
      rejectUnsupportedCompiler('the web or node compiler was missing');
      return;
    }
    const binding = sessions.getActiveBinding();
    if (!binding) {
      return;
    }
    const pair: DevCompilerPair = createDevCompilerPair({ web, node });
    binding.compilers = pair;
    const sessionId = binding.id;
    const runtime = binding.runtime;
    const failCurrentAttempt = (side: 'web' | 'node', error: Error): void => {
      if (sessions.getActiveBinding()?.id === sessionId) {
        if (side === 'web') {
          clearDevCompilerStart(pair, 'latestWebStart');
        } else {
          clearDevCompilerStart(pair, 'latestNodeStart');
        }
        runtime.failAttempt(error);
      }
    };
    const beginCompilerAttempt = (
      side: 'latestWebStart' | 'latestNodeStart'
    ): void => {
      if (
        sessions.getActiveBinding()?.id === sessionId &&
        pair[side]?.status !== 'pending'
      ) {
        // Invalidation can arrive before the aggregate before-compile hook.
        // Supersede any evaluation that could resolve in that gap immediately.
        if (markDevCompilerPending(pair, side)) {
          runtime.beginAttempt();
        }
        if (side === 'latestWebStart' && reloadAfterCssAssetOwnershipRemoval) {
          reloadAfterCssAssetOwnershipRemoval = false;
          scheduleCssAssetOwnershipReload();
        }
      }
    };
    web.hooks.invalid.tap(`${PLUGIN_NAME}:dev-web-invalid`, () =>
      beginCompilerAttempt('latestWebStart')
    );
    node.hooks.invalid.tap(`${PLUGIN_NAME}:dev-node-invalid`, () =>
      beginCompilerAttempt('latestNodeStart')
    );
    web.hooks.done.tap(
      { name: `${PLUGIN_NAME}:dev-web-complete`, stage: -1000 },
      stats => {
        if (sessions.getActiveBinding()?.id !== sessionId) {
          return;
        }
        pair.latestCompletedWebIdentity = getCompilationIdentity(
          stats.compilation
        );
        pair.latestCompletedWebStats = stats;
      }
    );
    node.hooks.done.tap(
      { name: `${PLUGIN_NAME}:dev-node-complete`, stage: -1000 },
      stats => {
        if (sessions.getActiveBinding()?.id === sessionId) {
          pair.latestCompletedNodeStats = stats;
        }
      }
    );
    web.hooks.thisCompilation.tap(
      `${PLUGIN_NAME}:dev-web-compilation`,
      compilation => {
        if (sessions.getActiveBinding()?.id === sessionId) {
          if (pair.currentAttemptIdentity) {
            compilationIdentities.setAttemptIdentityForCompilation(
              compilation,
              pair.currentAttemptIdentity
            );
          }
          pair.latestWebStart = {
            status: 'started',
            identity: getCompilationIdentity(compilation),
          };
          if (reloadAfterCssAssetOwnershipRemoval) {
            reloadAfterCssAssetOwnershipRemoval = false;
            scheduleCssAssetOwnershipReload();
          }
        }
      }
    );
    node.hooks.thisCompilation.tap(
      `${PLUGIN_NAME}:dev-node-web-compilation`,
      compilation => {
        if (sessions.getActiveBinding()?.id !== sessionId) {
          return;
        }
        pair.latestNodeStart = {
          status: 'started',
          identity: getCompilationIdentity(compilation),
        };
        if (pair.currentAttemptIdentity) {
          compilationIdentities.setAttemptIdentityForCompilation(
            compilation,
            pair.currentAttemptIdentity
          );
        }
        if (pair.latestCompletedWebIdentity) {
          compilationIdentities.setWebIdentityForNodeCompilation(
            compilation,
            pair.latestCompletedWebIdentity
          );
        }
      }
    );
    const settleCompilation = (stats: Rspack.Stats): void => {
      if (sessions.getActiveBinding()?.id !== sessionId) {
        return;
      }
      pair.settledCompilations.add(stats.compilation);
      flushSettledAttempt(binding, pair);
    };
    web.hooks.afterDone.tap(
      `${PLUGIN_NAME}:dev-web-settled`,
      settleCompilation
    );
    node.hooks.afterDone.tap(
      `${PLUGIN_NAME}:dev-node-settled`,
      settleCompilation
    );
    web.hooks.failed.tap(`${PLUGIN_NAME}:dev-web-failed`, error =>
      failCurrentAttempt('web', error)
    );
    node.hooks.failed.tap(`${PLUGIN_NAME}:dev-node-failed`, error =>
      failCurrentAttempt('node', error)
    );
  });

  api.onAfterDevCompile(async ({ stats }) => {
    const binding = sessions.getActiveBinding();
    const pair = binding?.compilers;
    if (!binding || !pair) {
      return;
    }
    const webStats =
      getEnvironmentStats(stats, 'web') ?? pair.latestCompletedWebStats;
    const nodeStats =
      getEnvironmentStats(stats, 'node') ?? pair.latestCompletedNodeStats;
    if (
      (webStats && webStats.compilation.compiler !== pair.web) ||
      (nodeStats && nodeStats.compilation.compiler !== pair.node)
    ) {
      return;
    }
    const webIdentity = webStats
      ? getCompilationIdentity(webStats.compilation)
      : undefined;
    const nodeIdentity = nodeStats
      ? getCompilationIdentity(nodeStats.compilation)
      : undefined;
    if (
      !isLatestStartedCompilation(webIdentity, pair.latestWebStart) ||
      !isLatestStartedCompilation(nodeIdentity, pair.latestNodeStart)
    ) {
      return;
    }
    const changes = {
      web: snapshotDevChangedFiles(pair.web),
      node: snapshotDevChangedFiles(pair.node),
    };
    const webAttempt = webStats
      ? compilationIdentities.getAttemptIdentityForCompilation(
          webStats.compilation
        )
      : undefined;
    const nodeAttempt = nodeStats
      ? compilationIdentities.getAttemptIdentityForCompilation(
          nodeStats.compilation
        )
      : undefined;
    const identity: DevGraphIdentity = {
      web: webIdentity,
      node: nodeIdentity,
      nodeWeb: nodeStats
        ? compilationIdentities.getWebIdentityForNodeCompilation(
            nodeStats.compilation
          )
        : undefined,
      attempt:
        webAttempt && nodeAttempt && webAttempt === nodeAttempt
          ? webAttempt
          : undefined,
    };
    const finishStats: DevRuntimeStats =
      webStats && nodeStats ? { web: webStats, node: nodeStats } : stats;
    if (!webStats || !nodeStats) {
      await finishRuntimeAttempt(binding, pair, finishStats, changes, identity);
      return;
    }
    pair.pendingAttempt = {
      stats: finishStats,
      changes,
      identity,
      webCompilation: webStats.compilation,
      nodeCompilation: nodeStats.compilation,
    };
    flushSettledAttempt(binding, pair);
  });

  return {
    captureWeb(compilation, manifestsByEntryName): void {
      const binding = sessions.getActiveBinding();
      if (binding?.compilers?.web === compilation.compiler) {
        binding.runtime.captureWeb(compilation, manifestsByEntryName);
      }
    },

    createBuildLoader(entryName?: string): () => Promise<ServerBuild> {
      const server = sessions.getActiveBinding()?.server;
      if (server) {
        return () => loadReactRouterServerBuild(server, entryName);
      }
      const state = sessions.getState();
      if (state.status === 'terminal') {
        const { error } = state;
        return () => Promise.reject(error);
      }
      return () =>
        Promise.reject(
          new Error(
            `[${PLUGIN_NAME}] The development server runtime is not ready.`
          )
        );
    },
  };
};
