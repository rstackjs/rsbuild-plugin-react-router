import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Rspack } from '@rsbuild/core';
import { dirname, join } from 'pathe';

import { HMR_PATCHABLE_ROUTE_FLAGS } from './route-artifacts.js';

export const DEV_HMR_RUNTIME_MODULE_ID = 'virtual/react-router/hmr-runtime';

type SwcLoaderOptions = {
  jsc?: { transform?: { react?: { refresh?: boolean } } };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const isSwcLoader = (loader: unknown): boolean =>
  typeof loader === 'string' && loader.includes('builtin:swc-loader');

const hasReactRefresh = (options: unknown): boolean =>
  (options as SwcLoaderOptions | undefined)?.jsc?.transform?.react?.refresh ===
  true;

const readSwcLoaderRefresh = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(readSwcLoaderRefresh);
  }
  if (!isObject(value)) {
    return false;
  }
  if (isSwcLoader(value.loader)) {
    return hasReactRefresh(value.options);
  }
  return Object.values(value).some(readSwcLoaderRefresh);
};

const readRuleSwcRefresh = (rule: unknown): boolean => {
  if (!isObject(rule)) {
    return false;
  }
  if (isSwcLoader(rule.loader)) {
    return hasReactRefresh(rule.options);
  }
  return (
    readSwcLoaderRefresh(rule.use) ||
    readRuleSetSwcRefresh(rule.oneOf) ||
    readRuleSetSwcRefresh(rule.rules)
  );
};

const readRuleSetSwcRefresh = (rules: unknown): boolean =>
  Array.isArray(rules) && rules.some(readRuleSwcRefresh);

export const isRspackSwcReactRefreshEnabled = (
  rspackConfig: Rspack.Configuration
): boolean => readRuleSetSwcRefresh(rspackConfig.module?.rules);

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
export const DEV_HDR_REVISION_RELATIVE_PATH = '.react-router/hdr-revision.mjs';

export const getDevHdrRevisionFilePath = (rootPath: string): string =>
  join(rootPath, DEV_HDR_REVISION_RELATIVE_PATH);

export type DevHdrRevisionSignal = {
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
// Read revision so the import survives sideEffects: false tree-shaking.
import __hdrRevision from ${JSON.stringify(hdrRevisionFilePath)};

void __hdrRevision;

const RefreshRuntime =
  __refreshRuntimeModule && __refreshRuntimeModule.performReactRefresh
    ? __refreshRuntimeModule
    : __refreshRuntimeModule.default;

const pendingRouteUpdates = new Map();
let flushTimeout;
let pendingRevalidation = false;

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
  routeFlags,
  getRouteModuleExports
) {
  pendingRouteUpdates.set(routeId, { routeFlags, getRouteModuleExports });
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

function getRouteMetadata(routeFlags) {
  return {
${HMR_PATCHABLE_ROUTE_FLAGS.map(
  (flag, index) => `    ${flag}: Boolean(routeFlags & ${1 << index}),`
).join('\n')}
  };
}

function applyRouteModuleUpdate(routeId, update, routeEntry, routeModules) {
  Object.assign(routeEntry, getRouteMetadata(update.routeFlags));
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
    return {
      nextManifest: undefined,
      shouldRefreshRouteState: false,
      routesToRevalidate: new Set(),
    };
  }

  // Clone only entries mutated before the manifest is committed in flush().
  const nextManifest = { ...manifest, routes: { ...manifest.routes } };
  const routesToRevalidate = new Set();
  let shouldRefreshRouteState = false;
  for (const { routeId, update } of takePendingRouteUpdates()) {
    const existingEntry = nextManifest.routes[routeId];
    if (!existingEntry) continue;

    // Shallow clone is enough: only top-level flags are mutated below.
    const routeEntry = { ...existingEntry };
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

  if (
    typeof router.createRoutesForHMR === 'function' &&
    typeof router._internalSetRoutes === 'function'
  ) {
    const routes = router.createRoutesForHMR(
      routesToRevalidate,
      nextManifest.routes,
      routeModules,
      context.ssr,
      context.isSpaMode
    );
    router._internalSetRoutes(routes);
    patchCurrentRouteMatches(router, routes);
  }

  return { nextManifest, shouldRefreshRouteState, routesToRevalidate };
}

async function withHdrActive(fn) {
  try {
    window.__reactRouterHdrActive = true;
    await fn();
  } finally {
    window.__reactRouterHdrActive = false;
  }
}

async function revalidateRouter(router) {
  if (typeof router.revalidate === 'function') {
    await withHdrActive(() => router.revalidate());
    return;
  }
  if (typeof router.navigate === 'function') {
    await withHdrActive(() =>
      router.navigate(getCurrentRouterPath(router), {
        replace: true,
        preventScrollReset: true,
      })
    );
  }
}

async function refreshRouteState(router) {
  if (typeof router.revalidate === 'function') {
    await withHdrActive(() => router.revalidate());
  }
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
  const { nextManifest, shouldRefreshRouteState, routesToRevalidate } =
    applyPendingRouteUpdates(router, routeModules, manifest, context);
  if (nextManifest) {
    Object.assign(manifest, nextManifest);
  }
  // Component-only updates do not need a full loader revalidation.
  if (
    shouldRefreshRouteState &&
    (routesToRevalidate.size > 0 || shouldRevalidate)
  ) {
    await refreshRouteState(router);
    shouldRevalidate = false;
  }
  if (shouldRevalidate) {
    await revalidateRouter(router);
  }
  performReactRefresh();
}

if (typeof window !== 'undefined' && import.meta.webpackHot) {
  import.meta.webpackHot.accept(
    ${JSON.stringify(hdrRevisionFilePath)},
    scheduleReactRouterRevalidation
  );
}
`;
