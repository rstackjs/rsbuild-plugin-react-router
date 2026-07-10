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
    return undefined;
  }
};

const hdrRevisionModuleContent = (revision: number): string =>
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
 * This mirrors React Router framework HMR contract (see `refresh-utils.mjs` in
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
// Read revision so the import survives sideEffects: false tree-shaking.
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
let pendingRevalidation = false;
let pendingComponentRouteNavigation = false;

function getCurrentRouterPath(router) {
  const basename = router.basename || '/';
  let pathname = window.location.pathname;
  if (basename !== '/' && pathname.startsWith(basename)) {
    pathname = pathname.slice(basename.length) || '/';
    // A trailing-slash basename (e.g. "/mybase/") consumes the leading slash,
    // leaving a relative path that react-router resolves against the current
    // location and doubles. Force it back to absolute.
    if (pathname[0] !== '/') pathname = '/' + pathname;
  }
  return pathname + window.location.search + window.location.hash;
}

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
  pendingRevalidation = true;
  scheduleFlush();
}

function scheduleFlush() {
  if (typeof window === 'undefined') {
    return;
  }
  clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flush, 16);
}

function takePendingRouteUpdates() {
  const updates = Array.from(pendingRouteUpdates, ([routeId, update]) => ({
    routeId,
    update,
  }));
  pendingRouteUpdates.clear();
  return updates;
}

function applyRouteModuleUpdate(routeId, update, routeEntry, routeModules) {
  Object.assign(routeEntry, update.routeMetadata);
  const imported = update.getRouteModuleExports();
  registerReactRouterRouteExports(routeId, imported);
  const current = routeModules[routeId];
  const preserveIdentity = key =>
    imported[key] ? (current && current[key]) || imported[key] : imported[key];
  routeModules[routeId] = {
    ...imported,
    default: preserveIdentity('default'),
    ErrorBoundary: preserveIdentity('ErrorBoundary'),
    HydrateFallback: preserveIdentity('HydrateFallback'),
  };
}

function getRouteById(routes, routeId) {
  for (const route of routes) {
    if (route.id === routeId) {
      return route;
    }
    if (route.children) {
      const child = getRouteById(route.children, routeId);
      if (child) {
        return child;
      }
    }
  }
}

// Deliberate coupling to React Router's private dev API: patching the live
// match objects is the only way to swap route implementations without a
// navigation. The typeof guard below degrades to a no-op if RR removes it.
function patchCurrentRouteMatches(router, routes) {
  if (
    !router.state ||
    !Array.isArray(router.state.matches) ||
    typeof router._internalSetStateDoNotUseOrYouWillBreakYourApp !== 'function'
  ) {
    return;
  }

  let changed = false;
  const matches = router.state.matches.map(match => {
    const route = getRouteById(routes, match.route.id);
    if (!route || route === match.route) {
      return match;
    }
    changed = true;
    return { ...match, route };
  });

  if (changed) {
    router._internalSetStateDoNotUseOrYouWillBreakYourApp({ matches });
  }
}

function applyPendingRouteUpdates(router, routeModules, manifest, context) {
  if (pendingRouteUpdates.size === 0) {
    return { nextManifest: undefined, hmrRoutes: undefined };
  }

  // Clone only entries mutated before the manifest is committed in flush().
  const nextManifest = { ...manifest, routes: { ...manifest.routes } };
  const routesToRevalidate = new Set();
  let shouldRefreshRouteState = false;
  for (const { routeId, update } of takePendingRouteUpdates()) {
    const existingEntry = nextManifest.routes[routeId];
    if (!existingEntry) continue;

    const routeEntry = JSON.parse(JSON.stringify(existingEntry));
    nextManifest.routes[routeId] = routeEntry;
    applyRouteModuleUpdate(routeId, update, routeEntry, routeModules);
    if (
      routeEntry.hasLoader ||
      routeEntry.hasClientLoader ||
      routeEntry.hasClientMiddleware
    ) {
      routesToRevalidate.add(routeId);
    }
    if (
      existingEntry.hasLoader ||
      existingEntry.hasClientLoader ||
      existingEntry.hasClientMiddleware ||
      routeEntry.hasLoader ||
      routeEntry.hasClientLoader ||
      routeEntry.hasClientMiddleware
    ) {
      shouldRefreshRouteState = true;
    }
  }

  let hmrRoutes;
  if (
    typeof router.createRoutesForHMR === 'function' &&
    typeof router._internalSetRoutes === 'function'
  ) {
    hmrRoutes = router.createRoutesForHMR(
      routesToRevalidate,
      nextManifest.routes,
      routeModules,
      context.ssr,
      context.isSpaMode
    );
    router._internalSetRoutes(hmrRoutes);
  }

  return { nextManifest, hmrRoutes, shouldRefreshRouteState };
}

async function revalidateRouter(router) {
  try {
    window.__reactRouterHdrActive = true;
    if (typeof router.revalidate === 'function') {
      await router.revalidate();
      return;
    }
    if (typeof router.navigate === 'function') {
      await router.navigate(getCurrentRouterPath(router), {
        replace: true,
        preventScrollReset: true,
      });
    }
  } finally {
    window.__reactRouterHdrActive = false;
  }
}

async function refreshRouteState(router) {
  if (typeof router.revalidate !== 'function') {
    return;
  }
  try {
    window.__reactRouterHdrActive = true;
    await router.revalidate();
  } finally {
    window.__reactRouterHdrActive = false;
  }
}

async function navigateCurrentRoute(router) {
  if (typeof router.navigate !== 'function') {
    await revalidateRouter(router);
    return;
  }
  await router.navigate(getCurrentRouterPath(router), {
    replace: true,
    preventScrollReset: true,
    defaultShouldRevalidate: false,
  });
}

function performReactRefresh() {
  if (
    RefreshRuntime &&
    typeof RefreshRuntime.performReactRefresh === 'function'
  ) {
    RefreshRuntime.performReactRefresh();
  }
}

async function flush() {
  const router = window.__reactRouterDataRouter;
  const routeModules = window.__reactRouterRouteModules;
  const manifest = window.__reactRouterManifest;
  const context = window.__reactRouterContext;
  if (!router || !routeModules || !manifest || !context) {
    return;
  }

  let shouldRevalidate = pendingRevalidation;
  pendingRevalidation = false;
  const { nextManifest, hmrRoutes, shouldRefreshRouteState } =
    applyPendingRouteUpdates(router, routeModules, manifest, context);
  // Loader updates must be visible during revalidation. Component-only routes
  // stay staged until revalidation completes, matching React Router's HMR flow.
  if (nextManifest && shouldRefreshRouteState) {
    pendingComponentRouteNavigation = false;
    if (hmrRoutes) {
      patchCurrentRouteMatches(router, hmrRoutes);
    }
    Object.assign(manifest, nextManifest);
    await refreshRouteState(router);
    shouldRevalidate = false;
  } else if (nextManifest) {
    await refreshRouteState(router);
    Object.assign(manifest, nextManifest);
    if (hmrRoutes) {
      patchCurrentRouteMatches(router, hmrRoutes);
    }
    // The node compiler also emits an HDR revision for this route edit. If it
    // arrives later, publish it without refetching loader data.
    pendingComponentRouteNavigation = !shouldRevalidate;
    shouldRevalidate = false;
  } else if (shouldRevalidate) {
    if (pendingComponentRouteNavigation) {
      pendingComponentRouteNavigation = false;
      await navigateCurrentRoute(router);
    } else {
      await revalidateRouter(router);
    }
  }
  performReactRefresh();
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
