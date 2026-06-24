import type { RsbuildDevServer, Rspack } from '@rsbuild/core';
import type { ServerBuild } from 'react-router';
import {
  evaluateServerBuilds,
  getEnvironmentStats,
  isSafeOneSidedChange,
  pinServerBuildsToManifests,
  snapshotDependencies,
  type DependencySnapshot,
  type DevCompilationIdentity,
  type DevGraphChanges,
  type DevGraphIdentity,
  type ReactRouterDevBuildPlan,
  type ReactRouterDevManifestSet,
  type ReactRouterServerBuilds,
  type WebArtifact,
} from './dev-runtime-artifacts.js';

export { snapshotDevChangedFiles } from './dev-runtime-artifacts.js';
export type {
  DevChangedFiles,
  DevGraphChanges,
  DevGraphIdentity,
  ReactRouterDevBuildPlan,
  ReactRouterDevManifest,
  ReactRouterDevManifestSet,
} from './dev-runtime-artifacts.js';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

type CommittedGeneration = {
  buildsByEntryName: ReactRouterServerBuilds;
  webIdentity: DevCompilationIdentity;
  nodeIdentity: DevCompilationIdentity;
  web: WebArtifact;
  nodeDependencies: DependencySnapshot;
};

type RuntimeState =
  | {
      kind: 'starting';
      attemptId: number;
      readiness: Deferred<CommittedGeneration>;
    }
  | { kind: 'failed'; attemptId: number; error: Error }
  | {
      kind: 'ready';
      committed: CommittedGeneration;
      pendingAttemptId: number | null;
    }
  | { kind: 'closed'; error: Error };

export type ReactRouterDevRuntime = {
  beginAttempt: () => void;
  captureWeb: (
    compilation: Rspack.Compilation,
    manifestsByEntryName: ReactRouterDevManifestSet
  ) => void;
  finishAttempt: (
    stats: Rspack.Stats | Rspack.MultiStats,
    changes: DevGraphChanges,
    identity: DevGraphIdentity
  ) => Promise<void>;
  failAttempt: (error: Error) => void;
  load: (entryName?: string) => Promise<ServerBuild>;
  close: (error?: Error) => void;
};

type CreateReactRouterDevRuntimeOptions = {
  server: RsbuildDevServer;
  buildPlan: ReactRouterDevBuildPlan;
  onEvaluationError: (error: Error) => void;
  onWarning?: (message: string) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  // Compilation can fail before a request asks for the build. Observe the
  // rejection now while returning the same promise to future callers.
  void promise.catch(() => undefined);
  return { promise, resolve, reject };
};

export const createReactRouterDevRuntime = ({
  server,
  buildPlan,
  onEvaluationError,
  onWarning = () => undefined,
}: CreateReactRouterDevRuntimeOptions): ReactRouterDevRuntime => {
  let nextAttemptId = 1;
  let state: RuntimeState = {
    kind: 'starting',
    attemptId: 0,
    readiness: createDeferred(),
  };
  const manifestsByCompilation = new WeakMap<
    Rspack.Compilation,
    ReactRouterDevManifestSet
  >();

  const uniqueEntryNames = new Set(buildPlan.entryNames);
  if (
    uniqueEntryNames.size !== buildPlan.entryNames.length ||
    !uniqueEntryNames.has(buildPlan.defaultEntryName)
  ) {
    throw new Error(
      '[rsbuild-plugin-react-router] The development server build plan must contain unique entries and include its default entry.'
    );
  }

  const selectBuild = (
    generation: CommittedGeneration,
    requestedEntryName?: string
  ): ServerBuild => {
    const entryName = requestedEntryName ?? buildPlan.defaultEntryName;
    const build = generation.buildsByEntryName[entryName];
    if (!build) {
      throw new Error(
        `[rsbuild-plugin-react-router] Committed React Router server build ${JSON.stringify(entryName)} was not found.`
      );
    }
    return build;
  };

  const getCurrentAttemptId = (): number | null => {
    if (state.kind === 'starting') {
      return state.attemptId;
    }
    return state.kind === 'ready' ? state.pendingAttemptId : null;
  };

  const isCurrentAttempt = (attemptId: number): boolean =>
    getCurrentAttemptId() === attemptId;

  const rejectAttempt = (
    attemptId: number,
    error: Error,
    report: boolean
  ): void => {
    if (!isCurrentAttempt(attemptId)) {
      return;
    }
    if (state.kind === 'starting') {
      const { readiness } = state;
      state = { kind: 'failed', attemptId, error };
      readiness.reject(error);
    } else if (state.kind === 'ready') {
      state = { ...state, pendingAttemptId: null };
    }
    if (report) {
      onEvaluationError(error);
    }
  };

  const commit = (attemptId: number, committed: CommittedGeneration): void => {
    if (!isCurrentAttempt(attemptId)) {
      return;
    }
    if (state.kind === 'starting') {
      const { readiness } = state;
      state = { kind: 'ready', committed, pendingAttemptId: null };
      readiness.resolve(committed);
    } else if (state.kind === 'ready') {
      state = { kind: 'ready', committed, pendingAttemptId: null };
    }
  };

  const discardUnsafeOneSidedResult = (
    attemptId: number,
    previous: CommittedGeneration,
    webChanged: boolean,
    changes: DevGraphChanges
  ): boolean => {
    const side = webChanged ? 'web-only' : 'node-only';
    const changedFiles = webChanged ? changes.web : changes.node;
    const unchangedDependencies = webChanged
      ? previous.nodeDependencies
      : previous.web.dependencies;
    if (isSafeOneSidedChange(changedFiles, unchangedDependencies)) {
      return false;
    }
    onWarning(
      `[rsbuild-plugin-react-router] Discarded an incomplete ${side} development result and kept the last-good build.`
    );
    rejectAttempt(
      attemptId,
      new Error(`Incomplete ${side} development result.`),
      false
    );
    return true;
  };

  return {
    beginAttempt(): void {
      if (state.kind === 'closed') {
        return;
      }
      const attemptId = nextAttemptId++;
      if (state.kind === 'failed') {
        state = {
          kind: 'starting',
          attemptId,
          readiness: createDeferred(),
        };
      } else if (state.kind === 'starting') {
        state = { ...state, attemptId };
      } else {
        state = { ...state, pendingAttemptId: attemptId };
      }
    },

    captureWeb(compilation, manifestsByEntryName): void {
      if (state.kind !== 'closed') {
        manifestsByCompilation.set(
          compilation,
          structuredClone(manifestsByEntryName)
        );
      }
    },

    async finishAttempt(stats, changes, identity): Promise<void> {
      const attemptId = getCurrentAttemptId();
      if (attemptId === null) {
        return;
      }
      const webStats = getEnvironmentStats(stats, 'web');
      const nodeStats = getEnvironmentStats(stats, 'node');
      if (!webStats || !nodeStats) {
        rejectAttempt(
          attemptId,
          new Error(
            '[rsbuild-plugin-react-router] Development compilation did not provide both web and node results.'
          ),
          true
        );
        return;
      }
      if (
        webStats.compilation.needAdditionalPass ||
        nodeStats.compilation.needAdditionalPass
      ) {
        return;
      }
      if (webStats.hasErrors() || nodeStats.hasErrors()) {
        rejectAttempt(
          attemptId,
          new Error(
            '[rsbuild-plugin-react-router] The React Router development compilation failed.'
          ),
          false
        );
        return;
      }

      const webCompilation = webStats.compilation;
      const nodeCompilation = nodeStats.compilation;
      const webIdentity = identity.web;
      const nodeIdentity = identity.node;
      if (!webIdentity || !nodeIdentity) {
        rejectAttempt(
          attemptId,
          new Error(
            '[rsbuild-plugin-react-router] Development compilation identity was unavailable.'
          ),
          true
        );
        return;
      }
      const previous = state.kind === 'ready' ? state.committed : undefined;
      const webChanged = !previous || previous.webIdentity !== webIdentity;
      const nodeChanged = !previous || previous.nodeIdentity !== nodeIdentity;

      if (!webChanged && !nodeChanged) {
        return;
      }

      if (nodeChanged && identity.nodeWeb !== webIdentity) {
        const message =
          '[rsbuild-plugin-react-router] Discarded web and node results from different compiler cycles and kept the last-good build.';
        if (!previous) {
          return;
        }
        onWarning(message);
        rejectAttempt(attemptId, new Error(message), false);
        return;
      }

      const manifestsByEntryName = webChanged
        ? manifestsByCompilation.get(webCompilation)
        : previous?.web.manifestsByEntryName;
      if (!manifestsByEntryName) {
        rejectAttempt(
          attemptId,
          new Error(
            '[rsbuild-plugin-react-router] The web compilation completed without a matching React Router manifest. Keeping the last-good development build.'
          ),
          true
        );
        return;
      }
      if (
        previous &&
        webChanged !== nodeChanged &&
        discardUnsafeOneSidedResult(attemptId, previous, webChanged, changes)
      ) {
        return;
      }

      try {
        const buildsByEntryName = nodeChanged
          ? await evaluateServerBuilds(server, buildPlan.entryNames)
          : previous!.buildsByEntryName;
        if (!isCurrentAttempt(attemptId)) {
          return;
        }
        const web = webChanged
          ? {
              manifestsByEntryName,
              dependencies: snapshotDependencies(webCompilation),
            }
          : previous!.web;
        commit(attemptId, {
          buildsByEntryName: pinServerBuildsToManifests(
            buildsByEntryName,
            buildPlan.entryNames,
            web.manifestsByEntryName
          ),
          webIdentity,
          nodeIdentity,
          web,
          nodeDependencies: nodeChanged
            ? snapshotDependencies(nodeCompilation)
            : previous!.nodeDependencies,
        });
      } catch (cause) {
        rejectAttempt(
          attemptId,
          cause instanceof Error ? cause : new Error(String(cause)),
          true
        );
      }
    },

    failAttempt(error): void {
      const attemptId = getCurrentAttemptId();
      if (attemptId !== null) {
        rejectAttempt(attemptId, error, false);
      }
    },

    load(entryName?: string): Promise<ServerBuild> {
      if (entryName && !uniqueEntryNames.has(entryName)) {
        return Promise.reject(
          new Error(
            `[rsbuild-plugin-react-router] React Router server build ${JSON.stringify(entryName)} is not part of this development server build plan.`
          )
        );
      }
      if (state.kind === 'ready') {
        return Promise.resolve(selectBuild(state.committed, entryName));
      }
      if (state.kind === 'starting') {
        const selected = state.readiness.promise.then(generation =>
          selectBuild(generation, entryName)
        );
        // Compilation may fail before the request awaiting this selection has
        // a chance to attach its own rejection handler.
        void selected.catch(() => undefined);
        return selected;
      }
      return Promise.reject(state.error);
    },

    close(error?: Error): void {
      if (state.kind === 'closed') {
        return;
      }
      const closeError =
        error ??
        new Error(
          '[rsbuild-plugin-react-router] The development server closed before a React Router build was ready.'
        );
      if (state.kind === 'starting') {
        state.readiness.reject(closeError);
      }
      state = { kind: 'closed', error: closeError };
    },
  };
};

const DEV_RUNTIME_KEY = Symbol.for(
  'rsbuild-plugin-react-router.dev-runtime.v1'
);

const getRegisteredRuntime = (
  server: RsbuildDevServer
): ReactRouterDevRuntime | undefined =>
  Reflect.get(server, DEV_RUNTIME_KEY) as ReactRouterDevRuntime | undefined;

export const registerReactRouterDevRuntime = (
  server: RsbuildDevServer,
  runtime: ReactRouterDevRuntime
): void => {
  // Symbol.for keeps registration shared when the plugin and public helper are
  // loaded through different ESM and CommonJS package entrypoints.
  Object.defineProperty(server, DEV_RUNTIME_KEY, {
    configurable: true,
    enumerable: false,
    value: runtime,
  });
};

export const unregisterReactRouterDevRuntime = (
  server: RsbuildDevServer,
  runtime: ReactRouterDevRuntime
): void => {
  if (getRegisteredRuntime(server) === runtime) {
    Reflect.deleteProperty(server, DEV_RUNTIME_KEY);
  }
};

export const loadReactRouterServerBuild = (
  server: RsbuildDevServer,
  entryName?: string
): Promise<ServerBuild> => {
  const runtime = getRegisteredRuntime(server);
  if (!runtime) {
    return Promise.reject(
      new Error(
        '[rsbuild-plugin-react-router] This Rsbuild development server is not registered with the React Router plugin. Add pluginReactRouter() before calling loadReactRouterServerBuild().'
      )
    );
  }
  return runtime.load(entryName);
};
