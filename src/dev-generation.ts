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
  onCssAssetOwnershipChanged?: (change: 'removed' | 'restored') => void;
  onRouteManifestChanged?: () => void;
  onWarning?: (message: string) => void;
};

const collectManifestCssAssetOwnership = (
  manifest: ReactRouterDevManifestSet[string]
): Set<string> => {
  const ownership = new Set<string>();
  for (const asset of manifest.entry?.css ?? []) {
    ownership.add(`entry\0${asset}`);
  }
  for (const [routeId, route] of Object.entries(manifest.routes ?? {})) {
    for (const asset of route.css ?? []) {
      ownership.add(`route\0${routeId}\0${asset}`);
    }
  }
  return ownership;
};

const hasRemovedCssAssetOwnership = (
  previous: ReactRouterDevManifestSet,
  next: ReactRouterDevManifestSet
): boolean => {
  for (const [entryName, previousManifest] of Object.entries(previous)) {
    const previousOwnership =
      collectManifestCssAssetOwnership(previousManifest);
    if (previousOwnership.size === 0) {
      continue;
    }
    const nextManifest = next[entryName];
    if (!nextManifest) {
      return true;
    }
    const nextOwnership = collectManifestCssAssetOwnership(nextManifest);
    for (const owner of previousOwnership) {
      if (!nextOwnership.has(owner)) {
        return true;
      }
    }
  }
  return false;
};

const hasAddedCssAssetOwnership = (
  previous: ReactRouterDevManifestSet,
  next: ReactRouterDevManifestSet
): boolean => hasRemovedCssAssetOwnership(next, previous);

const collectManifestCssAssets = (
  manifest: ReactRouterDevManifestSet[string]
): Set<string> => {
  const assets = new Set(manifest.entry?.css ?? []);
  for (const route of Object.values(manifest.routes ?? {})) {
    for (const asset of route.css ?? []) {
      assets.add(asset);
    }
  }
  return assets;
};

const normalizeManifestForCssOwnershipCheck = (
  manifest: ReactRouterDevManifestSet[string]
) => {
  const cssAssets = collectManifestCssAssets(manifest);
  const nonCssImports = (imports: string[] = []) =>
    imports.filter(importPath => !cssAssets.has(importPath));

  return {
    entry: {
      imports: nonCssImports(manifest.entry?.imports),
      module: manifest.entry?.module,
    },
    routes: Object.fromEntries(
      Object.entries(manifest.routes ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([routeId, route]) => [
          routeId,
          {
            caseSensitive: route.caseSensitive,
            clientActionModule: route.clientActionModule,
            clientLoaderModule: route.clientLoaderModule,
            clientMiddlewareModule: route.clientMiddlewareModule,
            errorBoundary: route.hasErrorBoundary,
            hasAction: route.hasAction,
            hasClientAction: route.hasClientAction,
            hasClientLoader: route.hasClientLoader,
            hasClientMiddleware: route.hasClientMiddleware,
            hasDefaultExport: route.hasDefaultExport,
            hasLoader: route.hasLoader,
            hydrateFallbackModule: route.hydrateFallbackModule,
            id: route.id,
            imports: nonCssImports(route.imports),
            index: route.index,
            module: route.module,
            parentId: route.parentId,
            path: route.path,
          },
        ])
    ),
  };
};

const hasOnlyCssAssetOwnershipChanges = (
  previous: ReactRouterDevManifestSet,
  next: ReactRouterDevManifestSet
): boolean => {
  const previousEntryNames = Object.keys(previous).sort();
  const nextEntryNames = Object.keys(next).sort();
  if (previousEntryNames.join('\0') !== nextEntryNames.join('\0')) {
    return false;
  }
  return previousEntryNames.every(entryName => {
    const previousManifest = normalizeManifestForCssOwnershipCheck(
      previous[entryName]
    );
    const nextManifest = normalizeManifestForCssOwnershipCheck(next[entryName]);
    return JSON.stringify(previousManifest) === JSON.stringify(nextManifest);
  });
};

type DevRouteManifestEntry = NonNullable<
  ReactRouterDevManifestSet[string]['routes']
>[string];

const hasSameRouteMetadata = (
  previous: DevRouteManifestEntry,
  next: DevRouteManifestEntry
): boolean =>
  previous.caseSensitive === next.caseSensitive &&
  previous.clientActionModule === next.clientActionModule &&
  previous.clientLoaderModule === next.clientLoaderModule &&
  previous.clientMiddlewareModule === next.clientMiddlewareModule &&
  previous.hasErrorBoundary === next.hasErrorBoundary &&
  previous.hasAction === next.hasAction &&
  previous.hasClientAction === next.hasClientAction &&
  previous.hasClientLoader === next.hasClientLoader &&
  previous.hasClientMiddleware === next.hasClientMiddleware &&
  previous.hasDefaultExport === next.hasDefaultExport &&
  previous.hasLoader === next.hasLoader &&
  previous.hydrateFallbackModule === next.hydrateFallbackModule &&
  previous.id === next.id &&
  previous.index === next.index &&
  previous.parentId === next.parentId &&
  previous.path === next.path;

const hasRouteManifestMetadataChanges = (
  previous: ReactRouterDevManifestSet,
  next: ReactRouterDevManifestSet
): boolean => {
  const previousEntryNames = Object.keys(previous);
  if (previousEntryNames.length !== Object.keys(next).length) {
    return true;
  }
  for (const entryName of previousEntryNames) {
    const nextManifest = next[entryName];
    if (!nextManifest) {
      return true;
    }
    const previousRoutes = previous[entryName].routes ?? {};
    const nextRoutes = nextManifest.routes ?? {};
    const previousRouteIds = Object.keys(previousRoutes);
    if (previousRouteIds.length !== Object.keys(nextRoutes).length) {
      return true;
    }
    for (const routeId of previousRouteIds) {
      const previousRoute = previousRoutes[routeId];
      const nextRoute = nextRoutes[routeId];
      if (!nextRoute || !hasSameRouteMetadata(previousRoute, nextRoute)) {
        return true;
      }
    }
  }
  return false;
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
  onCssAssetOwnershipChanged = () => undefined,
  onRouteManifestChanged = () => undefined,
  onWarning = () => undefined,
}: CreateReactRouterDevRuntimeOptions): ReactRouterDevRuntime => {
  let nextAttemptId = 1;
  let reloadAfterCssRemoval = false;
  let state: RuntimeState = {
    kind: 'starting',
    attemptId: 0,
    readiness: createDeferred(),
  };
  const manifestsByCompilation = new WeakMap<
    Rspack.Compilation,
    ReactRouterDevManifestSet
  >();

  const notifyCssAssetOwnershipChanged = (
    change: 'removed' | 'restored'
  ): void => {
    try {
      onCssAssetOwnershipChanged(change);
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause);
      onWarning(
        `[rsbuild-plugin-react-router] Failed to notify the browser after CSS asset ownership changed: ${reason}`
      );
    }
  };

  const notifyRouteManifestChanged = (): void => {
    try {
      onRouteManifestChanged();
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause);
      onWarning(
        `[rsbuild-plugin-react-router] Failed to notify the browser after route manifest metadata changed: ${reason}`
      );
    }
  };

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

  const commit = (
    attemptId: number,
    committed: CommittedGeneration
  ): boolean => {
    if (!isCurrentAttempt(attemptId)) {
      return false;
    }
    if (state.kind === 'starting') {
      const { readiness } = state;
      state = { kind: 'ready', committed, pendingAttemptId: null };
      readiness.resolve(committed);
    } else if (state.kind === 'ready') {
      state = { kind: 'ready', committed, pendingAttemptId: null };
    }
    return true;
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
      const cssAssetsRemoved =
        !!previous &&
        webChanged &&
        hasRemovedCssAssetOwnership(
          previous.web.manifestsByEntryName,
          manifestsByEntryName
        );
      const cssAssetsAdded =
        !!previous &&
        webChanged &&
        hasAddedCssAssetOwnership(
          previous.web.manifestsByEntryName,
          manifestsByEntryName
        );
      const cssOnlyWebManifestChange =
        (cssAssetsRemoved || cssAssetsAdded) &&
        hasOnlyCssAssetOwnershipChanges(
          previous.web.manifestsByEntryName,
          manifestsByEntryName
        );
      const routeManifestMetadataChanged =
        !!previous &&
        webChanged &&
        hasRouteManifestMetadataChanges(
          previous.web.manifestsByEntryName,
          manifestsByEntryName
        );
      const reusePreviousNodeBuild = !!previous && cssOnlyWebManifestChange;

      if (
        nodeChanged &&
        identity.nodeWeb !== webIdentity &&
        !reusePreviousNodeBuild
      ) {
        const message =
          '[rsbuild-plugin-react-router] Discarded web and node results from different compiler cycles and kept the last-good build.';
        if (!previous) {
          return;
        }
        onWarning(message);
        rejectAttempt(attemptId, new Error(message), false);
        return;
      }

      const shouldEvaluateNode = nodeChanged && !reusePreviousNodeBuild;
      if (
        previous &&
        webChanged !== shouldEvaluateNode &&
        !cssOnlyWebManifestChange &&
        discardUnsafeOneSidedResult(attemptId, previous, webChanged, changes)
      ) {
        return;
      }

      try {
        const buildsByEntryName = shouldEvaluateNode
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
        const committed = commit(attemptId, {
          buildsByEntryName: pinServerBuildsToManifests(
            buildsByEntryName,
            buildPlan.entryNames,
            web.manifestsByEntryName
          ),
          webIdentity,
          nodeIdentity: shouldEvaluateNode
            ? nodeIdentity
            : previous!.nodeIdentity,
          web,
          nodeDependencies: shouldEvaluateNode
            ? snapshotDependencies(nodeCompilation)
            : previous!.nodeDependencies,
        });
        if (!committed) {
          return;
        }
        if (cssAssetsRemoved) {
          reloadAfterCssRemoval = !cssAssetsAdded;
          notifyCssAssetOwnershipChanged('removed');
        } else if (cssAssetsAdded) {
          if (reloadAfterCssRemoval) {
            notifyCssAssetOwnershipChanged('restored');
          }
          reloadAfterCssRemoval = false;
        }
        if (routeManifestMetadataChanged) {
          notifyRouteManifestChanged();
        }
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
