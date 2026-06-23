import type { Rspack } from '@rsbuild/core';
import type {
  ServerBuild,
  UNSAFE_AssetsManifest as AssetsManifest,
} from 'react-router';
import type { RouteManifestModuleExports } from './manifest.js';

export type ReactRouterDevManifest = AssetsManifest & {
  routes: Record<string, unknown>;
  [key: string]: unknown;
};

export type ReactRouterServerBuild = ServerBuild & {
  assets: ReactRouterDevManifest;
  routes: Record<string, { module?: Record<string, unknown> }>;
};

export type ReactRouterWebStage = {
  id: number;
  stats?: Rspack.Stats;
  compilation?: Rspack.Compilation;
  browserManifest: ReactRouterDevManifest;
  serverManifest: ReactRouterDevManifest;
  serverManifestsByBundleId: Readonly<Record<string, ReactRouterDevManifest>>;
  moduleExportsByRouteId: RouteManifestModuleExports;
};

export type ReactRouterNodeStage = {
  id: number;
  stats?: Rspack.Stats;
  buildsByEntryName: Readonly<Record<string, ReactRouterServerBuild>>;
};

export type ReactRouterDevGeneration = {
  id: number;
  web: ReactRouterWebStage;
  node: ReactRouterNodeStage;
};

export class ReactRouterDevGenerationCoordinator {
  private nextStageId = 1;
  private nextGenerationId = 1;
  private latestWebStage: ReactRouterWebStage | null = null;
  private latestNodeStage: ReactRouterNodeStage | null = null;
  private committed: ReactRouterDevGeneration | null = null;
  private lastError: unknown;
  private initialWaiters = new Set<{
    resolve: (generation: ReactRouterDevGeneration) => void;
    reject: (error: unknown) => void;
  }>();

  stageWeb(stage: Omit<ReactRouterWebStage, 'id'>): ReactRouterWebStage {
    const next = {
      ...stage,
      id: this.nextStageId++,
    };
    this.latestWebStage = next;
    return next;
  }

  stageNode(stage: Omit<ReactRouterNodeStage, 'id'>): ReactRouterNodeStage {
    const next = {
      ...stage,
      id: this.nextStageId++,
    };
    this.latestNodeStage = next;
    return next;
  }

  getLatestWebStage(): ReactRouterWebStage | null {
    return this.latestWebStage;
  }

  getLatestNodeStage(): ReactRouterNodeStage | null {
    return this.latestNodeStage;
  }

  getCommitted(): ReactRouterDevGeneration | null {
    return this.committed;
  }

  resetStaging(): void {
    this.latestWebStage = null;
    this.latestNodeStage = null;
  }

  getLastError(): unknown {
    return this.lastError;
  }

  reject(error: unknown): void {
    this.lastError = error;
  }

  commit(
    web: ReactRouterWebStage | null = this.latestWebStage,
    node: ReactRouterNodeStage | null = this.latestNodeStage
  ): ReactRouterDevGeneration {
    if (!web) {
      throw new Error(
        '[rsbuild-plugin-react-router] Cannot commit dev generation before the web manifest is staged.'
      );
    }
    if (!node) {
      throw new Error(
        '[rsbuild-plugin-react-router] Cannot commit dev generation before the node server build is staged.'
      );
    }

    this.validateNodeStage(web, node);

    const generation = {
      id: this.nextGenerationId++,
      web,
      node,
    };
    this.committed = generation;
    this.lastError = undefined;
    this.resolveInitialWaiters(generation);
    return generation;
  }

  waitForInitialCommitted(): Promise<ReactRouterDevGeneration> {
    if (this.committed) {
      return Promise.resolve(this.committed);
    }

    return new Promise((resolve, reject) => {
      this.initialWaiters.add({ resolve, reject });
    });
  }

  close(): void {
    const error = new Error(
      '[rsbuild-plugin-react-router] Dev server closed before a React Router server build was committed.'
    );
    for (const waiter of this.initialWaiters) {
      waiter.reject(error);
    }
    this.initialWaiters.clear();
  }

  private resolveInitialWaiters(generation: ReactRouterDevGeneration): void {
    for (const waiter of this.initialWaiters) {
      waiter.resolve(generation);
    }
    this.initialWaiters.clear();
  }

  private validateNodeStage(
    web: ReactRouterWebStage,
    node: ReactRouterNodeStage
  ): void {
    for (const [entryName, build] of Object.entries(node.buildsByEntryName)) {
      const expectedManifest = getExpectedManifestForEntry(web, entryName);
      const actualManifest = build.assets;
      if (!actualManifest) {
        throw new Error(
          `[rsbuild-plugin-react-router] Server build "${entryName}" does not expose a React Router assets manifest.`
        );
      }
      assertBuildMatchesManifest(entryName, build, expectedManifest);
      build.assets = expectedManifest;
    }
  }
}

const getExpectedManifestForEntry = (
  web: ReactRouterWebStage,
  entryName: string
): ReactRouterDevManifest => {
  const bundleId = entryName.includes('/')
    ? entryName.slice(0, entryName.lastIndexOf('/'))
    : undefined;
  return (
    (bundleId ? web.serverManifestsByBundleId[bundleId] : undefined) ??
    web.serverManifest
  );
};

const assertBuildMatchesManifest = (
  entryName: string,
  build: ReactRouterServerBuild,
  manifest: ReactRouterDevManifest
): void => {
  const manifestRoutes = manifest.routes;
  if (!manifestRoutes || !build.routes) {
    return;
  }

  for (const [routeId, manifestRoute] of Object.entries(manifestRoutes)) {
    if (!manifestRoute || typeof manifestRoute !== 'object') {
      continue;
    }
    const routeModule = build.routes[routeId]?.module;
    if (!routeModule) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build "${entryName}" route "${routeId}" is missing from the evaluated server build.`
      );
    }
    const hasLoader = Boolean(
      (manifestRoute as { hasLoader?: unknown }).hasLoader
    );
    const hasAction = Boolean(
      (manifestRoute as { hasAction?: unknown }).hasAction
    );
    if (hasLoader !== (typeof routeModule.loader === 'function')) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build "${entryName}" route "${routeId}" loader export does not match the staged web manifest.`
      );
    }
    if (hasAction !== (typeof routeModule.action === 'function')) {
      throw new Error(
        `[rsbuild-plugin-react-router] Server build "${entryName}" route "${routeId}" action export does not match the staged web manifest.`
      );
    }
  }
};

const devServerCoordinators = new WeakMap<
  object,
  ReactRouterDevGenerationCoordinator
>();

export const registerReactRouterDevServer = (
  devServer: object,
  coordinator: ReactRouterDevGenerationCoordinator
): void => {
  devServerCoordinators.set(devServer, coordinator);
};

export const unregisterReactRouterDevServer = (devServer: object): void => {
  devServerCoordinators.delete(devServer);
};

export const loadReactRouterServerBuild = async (
  devServer: object,
  entryName?: string
): Promise<ReactRouterServerBuild> => {
  const coordinator = devServerCoordinators.get(devServer);
  if (!coordinator) {
    throw new Error(
      '[rsbuild-plugin-react-router] No React Router dev generation coordinator is registered for this Rsbuild dev server.'
    );
  }

  const generation =
    coordinator.getCommitted() ?? (await coordinator.waitForInitialCommitted());
  const build = selectServerBuild(generation, entryName);
  if (!build) {
    throw new Error(
      entryName
        ? `[rsbuild-plugin-react-router] Committed React Router server build "${entryName}" was not found.`
        : '[rsbuild-plugin-react-router] No committed React Router server build was found.'
    );
  }
  return build;
};

const selectServerBuild = (
  generation: ReactRouterDevGeneration,
  entryName?: string
): ReactRouterServerBuild | undefined => {
  if (entryName) {
    return generation.node.buildsByEntryName[entryName];
  }
  return (
    generation.node.buildsByEntryName['static/js/app'] ??
    generation.node.buildsByEntryName.app ??
    Object.values(generation.node.buildsByEntryName)[0]
  );
};
