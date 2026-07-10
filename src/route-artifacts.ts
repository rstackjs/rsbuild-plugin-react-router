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

// Shared with the dev manifest differ: exactly the route flags the client HMR
// runtime can patch in place without a full reload.
export const HMR_PATCHABLE_ROUTE_FLAGS = [
  'hasAction',
  'hasClientAction',
  'hasClientLoader',
  'hasClientMiddleware',
  'hasErrorBoundary',
  'hasLoader',
] as const;

type RouteHmrMetadata = Record<
  (typeof HMR_PATCHABLE_ROUTE_FLAGS)[number],
  boolean
>;

export const buildRouteHmrMetadata = (
  exportNames: readonly string[]
): RouteHmrMetadata => {
  const exports = new Set(exportNames);
  return {
    hasAction: exports.has(SERVER_EXPORTS.action),
    hasClientAction: exports.has(CLIENT_EXPORTS.clientAction),
    hasClientLoader: exports.has(CLIENT_EXPORTS.clientLoader),
    hasClientMiddleware: exports.has(CLIENT_EXPORTS.clientMiddleware),
    hasErrorBoundary: exports.has(CLIENT_EXPORTS.ErrorBoundary),
    hasLoader: exports.has(SERVER_EXPORTS.loader),
  };
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
  metadata,
}: {
  routeId: string;
  target: string;
  acceptTarget: string;
  metadata: RouteHmrMetadata;
}): string => {
  const targetJson = JSON.stringify(target);
  const acceptTargetJson = JSON.stringify(acceptTarget);
  return `
import * as __reactRouterRouteModule from ${targetJson};
import {
  registerReactRouterRouteExports as __reactRouterRegisterRouteExports,
  scheduleReactRouterRouteUpdate as __reactRouterScheduleRouteUpdate,
} from "virtual/react-router/hmr-runtime";

const __reactRouterRouteId = ${JSON.stringify(routeId)};
const __reactRouterRouteMetadata = ${JSON.stringify(metadata)};
const __reactRouterGetRouteModule = () => __reactRouterRouteModule;

__reactRouterRegisterRouteExports(
  __reactRouterRouteId,
  __reactRouterRouteModule
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept(${acceptTargetJson}, () => {
    __reactRouterRegisterRouteExports(
      __reactRouterRouteId,
      __reactRouterRouteModule
    );
    __reactRouterScheduleRouteUpdate(
      __reactRouterRouteId,
      __reactRouterRouteMetadata,
      __reactRouterGetRouteModule
    );
  });
  import.meta.webpackHot.accept();
  import.meta.webpackHot.dispose(data => {
    data.__reactRouterRouteShim = true;
  });
  if (
    import.meta.webpackHot.data &&
    import.meta.webpackHot.data.__reactRouterRouteShim
  ) {
    __reactRouterScheduleRouteUpdate(
      __reactRouterRouteId,
      __reactRouterRouteMetadata,
      __reactRouterGetRouteModule
    );
  }
}
`;
};

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
      metadata: buildRouteHmrMetadata(exportNames),
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
