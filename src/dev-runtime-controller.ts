import type {
  RsbuildConfig,
  RsbuildPluginAPI,
  RsbuildDevServer,
  Rspack,
} from '@rsbuild/core';
import type { ServerBuild } from 'react-router';
import { PLUGIN_NAME } from './constants.js';
import {
  createReactRouterDevRuntime,
  loadReactRouterServerBuild,
  registerReactRouterDevRuntime,
  unregisterReactRouterDevRuntime,
  type ReactRouterDevRuntime,
} from './dev-generation.js';
import {
  getEnvironmentStats,
  snapshotDevChangedFiles,
  type DevCompilationIdentity,
  type DevGraphChanges,
  type DevGraphIdentity,
  type ReactRouterDevBuildPlan,
  type ReactRouterDevManifestSet,
} from './dev-runtime-artifacts.js';

type DevCompilerPair = {
  web: Rspack.Compiler;
  node: Rspack.Compiler;
  settledCompilations: WeakSet<Rspack.Compilation>;
  pendingAttempt?: PendingDevCompilation;
  latestCompletedWebIdentity?: DevCompilationIdentity;
  latestWebStart?: CompilationStart;
  latestNodeStart?: CompilationStart;
};

type PendingDevCompilation = {
  stats: Rspack.Stats | Rspack.MultiStats;
  changes: DevGraphChanges;
  identity: DevGraphIdentity;
  webCompilation: Rspack.Compilation;
  nodeCompilation: Rspack.Compilation;
};

type CompilationStart =
  | { status: 'pending' }
  | { status: 'started'; identity: DevCompilationIdentity };

type RuntimeBinding = {
  id: number;
  server: RsbuildDevServer;
  runtime: ReactRouterDevRuntime;
  compilers?: DevCompilerPair;
};

type CloseOutcome = { ok: true } | { ok: false; cause: unknown };

type CloseObservation = {
  binding?: RuntimeBinding;
  promise?: Promise<void>;
  outcome?: CloseOutcome;
};

type ServerSetup = Exclude<
  NonNullable<NonNullable<RsbuildConfig['server']>['setup']>,
  unknown[]
>;

type ControllerState =
  | { status: 'idle' }
  | { status: 'active'; binding: RuntimeBinding }
  | { status: 'closing'; binding: RuntimeBinding }
  | { status: 'terminal'; error: Error };

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

const isLatestStartedCompilation = (
  identity: DevCompilationIdentity | undefined,
  start: CompilationStart | undefined
): boolean =>
  !identity || (start?.status === 'started' && start.identity === identity);

const hasPendingCompilation = (pair: DevCompilerPair): boolean =>
  pair.latestWebStart?.status === 'pending' ||
  pair.latestNodeStart?.status === 'pending';

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

  let state: ControllerState = { status: 'idle' };
  let nextSessionId = 1;
  const identityByCompilation = new WeakMap<
    Rspack.Compilation,
    DevCompilationIdentity
  >();
  const webIdentityByNodeCompilation = new WeakMap<
    Rspack.Compilation,
    DevCompilationIdentity
  >();
  const closeObservationByServer = new WeakMap<
    RsbuildDevServer,
    CloseObservation
  >();

  const getCompilationIdentity = (
    compilation: Rspack.Compilation
  ): DevCompilationIdentity => {
    const existing = identityByCompilation.get(compilation);
    if (existing) {
      return existing;
    }
    const identity = Symbol();
    // Keep compact lineage tokens in committed state without retaining entire
    // Rspack compilation graphs across failed rebuilds.
    identityByCompilation.set(compilation, identity);
    return identity;
  };

  const getActiveBinding = (): RuntimeBinding | undefined =>
    state.status === 'active' ? state.binding : undefined;

  const isCurrentBinding = (binding: RuntimeBinding): boolean =>
    (state.status === 'active' || state.status === 'closing') &&
    state.binding === binding;

  const closeBinding = (binding: RuntimeBinding, error?: Error): void => {
    const pair = binding.compilers;
    if (pair) {
      pair.pendingAttempt = undefined;
      pair.latestCompletedWebIdentity = undefined;
      pair.latestWebStart = undefined;
      pair.latestNodeStart = undefined;
    }
    binding.compilers = undefined;
    binding.runtime.close(error);
    unregisterReactRouterDevRuntime(binding.server, binding.runtime);
  };

  const completeClose = (binding: RuntimeBinding): void => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    if (state.status === 'active') {
      closeBinding(binding);
    }
    state = { status: 'idle' };
  };

  const failClose = (binding: RuntimeBinding, cause: unknown): void => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    const error = new Error(
      `[${PLUGIN_NAME}] The previous development server failed to close. Restart the process before retrying because Rsbuild may not have finished tearing down its compiler and watchers.`,
      { cause }
    );
    closeBinding(binding, error);
    state = { status: 'terminal', error };
  };

  const applyCloseOutcome = (
    observation: CloseObservation,
    outcome: CloseOutcome
  ): void => {
    observation.outcome = outcome;
    const { binding } = observation;
    if (!binding) {
      return;
    }
    if (outcome.ok) {
      completeClose(binding);
    } else {
      failClose(binding, outcome.cause);
    }
    observation.binding = undefined;
  };

  const observeClose = (server: RsbuildDevServer): CloseObservation => {
    const existing = closeObservationByServer.get(server);
    if (existing) {
      return existing;
    }
    const observation: CloseObservation = {};
    const close = server.close.bind(server);
    server.close = () => {
      if (observation.promise) {
        return observation.promise;
      }
      let closePromise: Promise<void>;
      try {
        closePromise = close();
      } catch (cause) {
        closePromise = Promise.reject(cause);
      }
      observation.promise = closePromise;
      void closePromise.then(
        () => applyCloseOutcome(observation, { ok: true }),
        cause => applyCloseOutcome(observation, { ok: false, cause })
      );
      return closePromise;
    };
    closeObservationByServer.set(server, observation);
    return observation;
  };

  const bindCloseObservation = (binding: RuntimeBinding): void => {
    const observation = observeClose(binding.server);
    observation.binding = binding;
    if (observation.outcome) {
      applyCloseOutcome(observation, observation.outcome);
    }
  };

  const flushSettledAttempt = (
    binding: RuntimeBinding,
    pair: DevCompilerPair
  ): void => {
    const pending = pair.pendingAttempt;
    if (
      !pending ||
      getActiveBinding()?.id !== binding.id ||
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
    void binding.runtime
      .finishAttempt(pending.stats, pending.changes, pending.identity)
      .catch(cause => {
        if (getActiveBinding()?.id === binding.id) {
          binding.runtime.failAttempt(
            cause instanceof Error ? cause : new Error(String(cause))
          );
        }
      });
  };

  const rejectUnsupportedCompiler = (reason: string): void => {
    const message = `[${PLUGIN_NAME}] Could not coordinate React Router development output because ${reason}.`;
    api.logger.warn(message);
    const binding = getActiveBinding();
    if (!binding) {
      return;
    }
    const error = new Error(message);
    closeBinding(binding, error);
    state = { status: 'terminal', error };
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
          observeClose(context.server);
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
      if (state.status === 'terminal') {
        throw state.error;
      }
      if (state.status === 'active') {
        throw new Error(
          `[${PLUGIN_NAME}] A development server is already active. Await its close() before calling createDevServer() again. If startup failed before returning the server, restart the process before retrying.`
        );
      }
      if (state.status === 'closing') {
        throw new Error(
          `[${PLUGIN_NAME}] The previous development server is still closing. Await its close() before calling createDevServer() again.`
        );
      }
      const runtime = createReactRouterDevRuntime({
        server,
        buildPlan,
        onEvaluationError(error) {
          if (getActiveBinding()?.runtime !== runtime) {
            return;
          }
          api.logger.error(error.message);
          server.sockWrite('errors', {
            text: [error.message],
            html: escapeHtml(error.message),
          });
        },
        onWarning: message => api.logger.warn(message),
      });
      const binding = { id: nextSessionId++, server, runtime };
      state = { status: 'active', binding };
      registerReactRouterDevRuntime(server, runtime);
      bindCloseObservation(binding);
    },
  });

  api.onCloseDevServer({
    order: 'pre',
    handler() {
      if (state.status !== 'active') {
        return;
      }
      const binding = state.binding;
      closeBinding(binding);
      state = { status: 'closing', binding };
    },
  });

  api.onBeforeDevCompile({
    order: 'pre',
    handler() {
      const binding = getActiveBinding();
      const pair = binding?.compilers;
      if (!binding || !pair || hasPendingCompilation(pair)) {
        return;
      }
      pair.pendingAttempt = undefined;
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
    const binding = getActiveBinding();
    if (!binding) {
      return;
    }
    const pair: DevCompilerPair = {
      web,
      node,
      settledCompilations: new WeakSet(),
    };
    binding.compilers = pair;
    const sessionId = binding.id;
    const runtime = binding.runtime;
    const failCurrentAttempt = (side: 'web' | 'node', error: Error): void => {
      if (getActiveBinding()?.id === sessionId) {
        if (side === 'web') {
          pair.latestWebStart = undefined;
        } else {
          pair.latestNodeStart = undefined;
        }
        pair.pendingAttempt = undefined;
        runtime.failAttempt(error);
      }
    };
    const beginCompilerAttempt = (
      side: 'latestWebStart' | 'latestNodeStart'
    ): void => {
      if (
        getActiveBinding()?.id === sessionId &&
        pair[side]?.status !== 'pending'
      ) {
        const attemptAlreadyPending = hasPendingCompilation(pair);
        // Invalidation can arrive before the aggregate before-compile hook.
        // Supersede any evaluation that could resolve in that gap immediately.
        pair[side] = { status: 'pending' };
        pair.pendingAttempt = undefined;
        if (!attemptAlreadyPending) {
          runtime.beginAttempt();
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
        if (getActiveBinding()?.id !== sessionId) {
          return;
        }
        pair.latestCompletedWebIdentity = getCompilationIdentity(
          stats.compilation
        );
      }
    );
    web.hooks.thisCompilation.tap(
      `${PLUGIN_NAME}:dev-web-compilation`,
      compilation => {
        if (getActiveBinding()?.id === sessionId) {
          pair.latestWebStart = {
            status: 'started',
            identity: getCompilationIdentity(compilation),
          };
        }
      }
    );
    node.hooks.thisCompilation.tap(
      `${PLUGIN_NAME}:dev-node-web-compilation`,
      compilation => {
        if (getActiveBinding()?.id !== sessionId) {
          return;
        }
        pair.latestNodeStart = {
          status: 'started',
          identity: getCompilationIdentity(compilation),
        };
        if (pair.latestCompletedWebIdentity) {
          webIdentityByNodeCompilation.set(
            compilation,
            pair.latestCompletedWebIdentity
          );
        }
      }
    );
    const settleCompilation = (stats: Rspack.Stats): void => {
      if (getActiveBinding()?.id !== sessionId) {
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
    const binding = getActiveBinding();
    const pair = binding?.compilers;
    if (!binding || !pair) {
      return;
    }
    const webStats = getEnvironmentStats(stats, 'web');
    const nodeStats = getEnvironmentStats(stats, 'node');
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
    const identity = {
      web: webIdentity,
      node: nodeIdentity,
      nodeWeb: nodeStats
        ? webIdentityByNodeCompilation.get(nodeStats.compilation)
        : undefined,
    };
    if (!webStats || !nodeStats) {
      await binding.runtime.finishAttempt(stats, changes, identity);
      return;
    }
    pair.pendingAttempt = {
      stats,
      changes,
      identity,
      webCompilation: webStats.compilation,
      nodeCompilation: nodeStats.compilation,
    };
    flushSettledAttempt(binding, pair);
  });

  return {
    captureWeb(compilation, manifestsByEntryName): void {
      const binding = getActiveBinding();
      if (binding?.compilers?.web === compilation.compiler) {
        binding.runtime.captureWeb(compilation, manifestsByEntryName);
      }
    },

    createBuildLoader(entryName?: string): () => Promise<ServerBuild> {
      const server = getActiveBinding()?.server;
      if (server) {
        return () => loadReactRouterServerBuild(server, entryName);
      }
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
