import { basename } from 'pathe';

import {
  CLIENT_EXPORTS,
  CLIENT_ROUTE_EXPORTS_SET,
  SERVER_EXPORTS,
  SERVER_ONLY_ROUTE_EXPORTS_SET,
} from './constants.js';
import { getExportNames } from './export-utils.js';
import {
  buildEnforceChunkValidity,
  detectRouteChunksIfEnabled,
  emptyRouteChunkSnippet,
  getRouteChunkIfEnabled,
  getRouteChunkNameFromModuleId,
  shouldAnalyzeRouteChunks,
  validateRouteChunks,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';

export type RouteClientEntryArtifactOptions = {
  code: string;
  resourcePath: string;
  environmentName?: string;
  isBuild: boolean;
  routeChunkCache?: RouteChunkCache;
  routeChunkConfig: RouteChunkConfig;
  /** React Router route id for this route module, when known. */
  routeId?: string;
  /** Emit development HMR/HDR glue into web route client entries. */
  devHmr?: boolean;
};

type RouteClientEntryArtifact = {
  code: string;
};

export type RouteChunkArtifactOptions = {
  code: string;
  resource: string;
  resourcePath: string;
  isBuild: boolean;
  routeChunkCache?: RouteChunkCache;
  routeChunkConfig: RouteChunkConfig;
};

type RouteChunkArtifact = {
  code: string;
  map: null;
};

// Exactly the route-manifest flags the client HMR runtime can patch in place
// without a full reload. Array order defines the bit layout shared by the
// encoder below and the decoder emitted in `generateDevHmrRuntimeModule`.
export const HMR_PATCHABLE_ROUTE_FLAGS = [
  'hasAction',
  'hasClientAction',
  'hasClientLoader',
  'hasClientMiddleware',
  'hasErrorBoundary',
  'hasLoader',
] as const;

const HMR_FLAG_EXPORT_NAME: Record<
  (typeof HMR_PATCHABLE_ROUTE_FLAGS)[number],
  string
> = {
  hasAction: SERVER_EXPORTS.action,
  hasClientAction: CLIENT_EXPORTS.clientAction,
  hasClientLoader: CLIENT_EXPORTS.clientLoader,
  hasClientMiddleware: CLIENT_EXPORTS.clientMiddleware,
  hasErrorBoundary: CLIENT_EXPORTS.ErrorBoundary,
  hasLoader: SERVER_EXPORTS.loader,
};

export const buildRouteHmrFlags = (exportNames: readonly string[]): number => {
  const exports = new Set(exportNames);
  let flags = 0;
  HMR_PATCHABLE_ROUTE_FLAGS.forEach((flag, index) => {
    if (exports.has(HMR_FLAG_EXPORT_NAME[flag])) flags |= 1 << index;
  });
  return flags;
};

/**
 * Development-only HMR glue for a web route client entry.
 *
 * The route client entry is the webpack entry for a route, so it must
 * self-accept hot updates to stop them from bubbling into a full reload. It
 * also accepts updates of the underlying route module and forwards fresh
 * exports plus route metadata (loader/action flags derived from the current
 * export names) to the shared HMR runtime, which applies the React Router
 * route-module update contract and revalidates loader data.
 */
const buildRouteClientEntryHmrCode = ({
  routeId,
  target,
  acceptTarget,
  flags,
}: {
  routeId: string;
  target: string;
  acceptTarget: string;
  flags: number;
}): string => {
  const targetJson = JSON.stringify(target);
  const acceptTargetJson = JSON.stringify(acceptTarget);
  return `
import * as __rrm from ${targetJson};
import {
  registerReactRouterRouteExports as __rrr,
  scheduleReactRouterRouteUpdate as __rru,
} from "virtual/react-router/hmr-runtime";

const __rrid = ${JSON.stringify(routeId)};
const __rrf = ${flags};
const __rrg = () => __rrm;
const __rru0 = () => {
  __rrr(__rrid, __rrm);
  __rru(__rrid, __rrf, __rrg);
};

__rrr(__rrid, __rrm);

if (import.meta.webpackHot) {
  const __rrh = import.meta.webpackHot;
  __rrh.accept(${acceptTargetJson}, __rru0);
  __rrh.accept();
  __rrh.dispose(data => { data.__rr = true; });
  if (__rrh.data && __rrh.data.__rr) __rru0();
}
`;
};

// The accept target is spelled relative (`./name?react-router-route`) while
// the import above uses the absolute resource path; both resolve to the same
// module because the client entry replaces the route file in place, so its
// resolution context is the route's own directory.
const createRouteHmrAcceptTarget = (resourcePath: string): string => {
  return `./${basename(resourcePath)}?react-router-route`;
};

export const buildRouteClientEntryCode = ({
  exportNames,
  chunkedExports,
  isServer,
  resourcePath,
  routeId,
  devHmr,
}: {
  exportNames: readonly string[];
  chunkedExports: readonly string[];
  isServer: boolean;
  resourcePath: string;
  routeId?: string;
  devHmr?: boolean;
}): string => {
  const chunkedExportSet =
    chunkedExports.length > 0 ? new Set<string>(chunkedExports) : undefined;
  const reexports = exportNames
    .filter(exp => {
      if (chunkedExportSet?.has(exp)) {
        return false;
      }
      return (
        CLIENT_ROUTE_EXPORTS_SET.has(exp) ||
        (isServer && SERVER_ONLY_ROUTE_EXPORTS_SET.has(exp))
      );
    })
    .sort();
  const target = `${resourcePath}?react-router-route`;
  const reexportCode = `export { ${reexports.join(', ')} } from ${JSON.stringify(target)};`;
  if (!devHmr || isServer || routeId === undefined) {
    return reexportCode;
  }
  return (
    reexportCode +
    buildRouteClientEntryHmrCode({
      routeId,
      target,
      acceptTarget: createRouteHmrAcceptTarget(resourcePath),
      flags: buildRouteHmrFlags(exportNames),
    })
  );
};

export const createRouteClientEntryArtifact = async ({
  code,
  resourcePath,
  environmentName,
  isBuild,
  routeChunkCache,
  routeChunkConfig,
  routeId,
  devHmr,
}: RouteClientEntryArtifactOptions): Promise<RouteClientEntryArtifact> => {
  const isServer = environmentName === 'node';
  const mightHaveRouteChunks =
    !isServer &&
    isBuild &&
    shouldAnalyzeRouteChunks(routeChunkConfig, resourcePath, code);
  const routeChunkInfo = mightHaveRouteChunks
    ? await detectRouteChunksIfEnabled(
        routeChunkCache,
        routeChunkConfig,
        resourcePath,
        code
      )
    : null;
  const exportNames =
    routeChunkInfo?.exportNames ?? (await getExportNames(code, resourcePath));
  const chunkedExports = routeChunkInfo?.chunkedExports ?? [];
  return {
    code: buildRouteClientEntryCode({
      exportNames,
      chunkedExports,
      isServer,
      resourcePath,
      routeId,
      devHmr: devHmr && !isBuild,
    }),
  };
};

export const createRouteChunkArtifact = async ({
  code,
  resource,
  resourcePath,
  isBuild,
  routeChunkCache,
  routeChunkConfig,
}: RouteChunkArtifactOptions): Promise<RouteChunkArtifact> => {
  const splitRouteModules = routeChunkConfig.splitRouteModules;
  if (!isBuild || !splitRouteModules) {
    return {
      code: emptyRouteChunkSnippet(),
      map: null,
    };
  }

  const chunkName = getRouteChunkNameFromModuleId(resource);
  if (!chunkName) {
    throw new Error(`Invalid route chunk name in "${resource}"`);
  }
  if (chunkName !== 'main' && !code.includes(chunkName)) {
    return {
      code: emptyRouteChunkSnippet(),
      map: null,
    };
  }

  const chunk = await getRouteChunkIfEnabled(
    routeChunkCache,
    routeChunkConfig,
    resourcePath,
    chunkName,
    code
  );

  if (splitRouteModules === 'enforce' && chunkName === 'main' && chunk) {
    const exportNames = await getExportNames(chunk, resourcePath);
    validateRouteChunks({
      config: routeChunkConfig,
      id: resourcePath,
      valid: buildEnforceChunkValidity(exportNames),
    });
  }

  return {
    code: chunk ?? emptyRouteChunkSnippet(),
    map: null,
  };
};
