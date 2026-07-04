import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'pathe';

export const DEV_HMR_RUNTIME_MODULE_ID = 'virtual/react-router/hmr-runtime';

export type DevHmrPlanOptions = {
  enabled: true;
  runtimeModule: string;
  onNodeRebuildCommitted: () => void;
};

/**
 * Resolves the `react-refresh/runtime` module that
 * `@rspack/plugin-react-refresh` injects into the web bundle. The resolution
 * walks the same dependency chain the refresh plugin uses so the returned file
 * is the exact runtime instance already present in the browser module graph.
 * Returns `undefined` when React Fast Refresh is unavailable, in which case
 * dev HMR falls back to full reloads.
 */
export const resolveReactRefreshRuntimePath = (
  rootPath: string
): string | undefined => {
  const resolveFrom = (base: string, request: string): string =>
    createRequire(base).resolve(request);
  const rootPackageJson = join(rootPath, 'package.json');
  try {
    // Package entry files (not package.json subpaths, which some of these
    // packages do not export) so the chain matches Node resolution exactly.
    const pluginReactEntry = resolveFrom(
      rootPackageJson,
      '@rsbuild/plugin-react'
    );
    const refreshPluginEntry = resolveFrom(
      pluginReactEntry,
      '@rspack/plugin-react-refresh'
    );
    return resolveFrom(refreshPluginEntry, 'react-refresh/runtime');
  } catch {
    // No fallback resolution: a bare `react-refresh/runtime` resolve from the
    // app root can bind a DIFFERENT physical instance than the one
    // @rspack/plugin-react-refresh injected into the browser graph, making
    // refresh registration a silent no-op. Treat the runtime as unavailable
    // instead - callers fall back to the previous full-reload behavior.
    return undefined;
  }
};

export const hdrRevisionModuleContent = (revision: number): string =>
  `export default ${revision};\n`;

/**
 * The HDR revision module is a real file (not a virtual module) because it
 * must wake the web compiler through the regular file watcher: the browser
 * HMR runtime imports it, so bumping the revision produces a web hot update
 * whenever server code changes, which the client answers by revalidating
 * React Router loader data.
 */
export const getDevHdrRevisionFilePath = (rootPath: string): string =>
  join(rootPath, '.react-router', 'hdr-revision.mjs');

export type DevHdrRevisionSignal = {
  filePath: string;
  /** Writes the initial revision module so the first compile can resolve it. */
  ensure: () => void;
  /** Increments the revision, signaling hot data revalidation to the client. */
  bump: () => void;
};

export const createDevHdrRevisionSignal = ({
  filePath,
  onError,
}: {
  filePath: string;
  onError?: (error: Error) => void;
}): DevHdrRevisionSignal => {
  let revision = 0;
  let dirEnsured = false;
  const write = (): void => {
    try {
      if (!dirEnsured) {
        mkdirSync(dirname(filePath), { recursive: true });
        dirEnsured = true;
      }
      writeFileSync(filePath, hdrRevisionModuleContent(revision));
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };
  return {
    filePath,
    ensure: write,
    bump() {
      revision += 1;
      write();
    },
  };
};

/**
 * Browser-side HMR runtime shared by all route client entries in development.
 *
 * This mirrors React Router's Vite HMR contract (see `refresh-utils.mjs` in
 * `@react-router/dev`): route module updates are applied by patching
 * `window.__reactRouterRouteModules` while preserving the previous component
 * identities (React Fast Refresh swaps their implementations in place),
 * recreating the client routes with revalidation opt-out, revalidating loader
 * data, and finally performing a React refresh.
 */
export const generateDevHmrRuntimeModule = ({
  reactRefreshRuntimePath,
  hdrRevisionFilePath,
}: {
  reactRefreshRuntimePath: string;
  hdrRevisionFilePath: string;
}): string => `
import * as __refreshRuntimeModule from ${JSON.stringify(reactRefreshRuntimePath)};
// The revision binding must be read so the import survives tree shaking when
// the app package declares "sideEffects": false.
import __hdrRevision from ${JSON.stringify(hdrRevisionFilePath)};

let latestHdrRevision = __hdrRevision;

export function getReactRouterHdrRevision() {
  return latestHdrRevision;
}

const RefreshRuntime =
  __refreshRuntimeModule && __refreshRuntimeModule.performReactRefresh
    ? __refreshRuntimeModule
    : __refreshRuntimeModule.default;

const pendingRouteUpdates = new Map();
let flushTimeout;

export function registerReactRouterRouteExports(routeId, moduleExports) {
  if (
    typeof window === 'undefined' ||
    !RefreshRuntime ||
    typeof RefreshRuntime.register !== 'function'
  ) {
    return;
  }
  for (const key in moduleExports) {
    if (key === '__esModule') continue;
    const exportValue = moduleExports[key];
    if (RefreshRuntime.isLikelyComponentType(exportValue)) {
      RefreshRuntime.register(exportValue, routeId + ' export ' + key);
    }
  }
}

export function scheduleReactRouterRouteUpdate(
  routeId,
  routeMetadata,
  getRouteModuleExports
) {
  pendingRouteUpdates.set(routeId, { routeMetadata, getRouteModuleExports });
  scheduleFlush();
}

export function scheduleReactRouterRevalidation() {
  scheduleFlush();
}

function scheduleFlush() {
  if (typeof window === 'undefined') {
    return;
  }
  clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flush, 16);
}

async function flush() {
  const router = window.__reactRouterDataRouter;
  const routeModules = window.__reactRouterRouteModules;
  const manifest = window.__reactRouterManifest;
  const context = window.__reactRouterContext;
  if (!router || !routeModules || !manifest || !context) {
    return;
  }
  let nextManifest;
  if (pendingRouteUpdates.size > 0) {
    nextManifest = JSON.parse(JSON.stringify(manifest));
    const needsRevalidation = new Set();
    const updatedRouteIds = Array.from(pendingRouteUpdates.keys());
    const updates = Array.from(pendingRouteUpdates.values());
    pendingRouteUpdates.clear();
    for (let index = 0; index < updates.length; index++) {
      const routeId = updatedRouteIds[index];
      const update = updates[index];
      const routeEntry = nextManifest.routes[routeId];
      if (!routeEntry) continue;
      Object.assign(routeEntry, update.routeMetadata);
      const imported = update.getRouteModuleExports();
      registerReactRouterRouteExports(routeId, imported);
      const current = routeModules[routeId];
      // React Fast Refresh updates component implementations in place, so the
      // previous component identities must be preserved to keep their state.
      routeModules[routeId] = {
        ...imported,
        default: imported.default
          ? (current && current.default) || imported.default
          : imported.default,
        ErrorBoundary: imported.ErrorBoundary
          ? (current && current.ErrorBoundary) || imported.ErrorBoundary
          : imported.ErrorBoundary,
        HydrateFallback: imported.HydrateFallback
          ? (current && current.HydrateFallback) || imported.HydrateFallback
          : imported.HydrateFallback,
      };
      if (
        routeEntry.hasLoader ||
        routeEntry.hasClientLoader ||
        routeEntry.hasClientMiddleware
      ) {
        needsRevalidation.add(routeId);
      }
    }
    if (
      typeof router.createRoutesForHMR === 'function' &&
      typeof router._internalSetRoutes === 'function'
    ) {
      const routes = router.createRoutesForHMR(
        needsRevalidation,
        nextManifest.routes,
        routeModules,
        context.ssr,
        context.isSpaMode
      );
      router._internalSetRoutes(routes);
    }
  }
  try {
    window.__reactRouterHdrActive = true;
    await router.revalidate();
  } finally {
    window.__reactRouterHdrActive = false;
  }
  if (nextManifest) {
    Object.assign(manifest, nextManifest);
  }
  if (
    RefreshRuntime &&
    typeof RefreshRuntime.performReactRefresh === 'function'
  ) {
    RefreshRuntime.performReactRefresh();
  }
}

if (typeof window !== 'undefined' && import.meta.webpackHot) {
  import.meta.webpackHot.accept(
    ${JSON.stringify(hdrRevisionFilePath)},
    () => {
      latestHdrRevision = __hdrRevision;
      scheduleReactRouterRevalidation();
    }
  );
}
`;
