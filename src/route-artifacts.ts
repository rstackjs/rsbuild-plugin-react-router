import {
  CLIENT_ROUTE_EXPORTS_SET,
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

type RouteHmrMetadata = {
  hasAction: boolean;
  hasClientAction: boolean;
  hasClientLoader: boolean;
  hasClientMiddleware: boolean;
  hasErrorBoundary: boolean;
  hasLoader: boolean;
};

export const buildRouteHmrMetadata = (
  exportNames: readonly string[]
): RouteHmrMetadata => {
  const exports = new Set(exportNames);
  return {
    hasAction: exports.has('action'),
    hasClientAction: exports.has('clientAction'),
    hasClientLoader: exports.has('clientLoader'),
    hasClientMiddleware: exports.has('clientMiddleware'),
    hasErrorBoundary: exports.has('ErrorBoundary'),
    hasLoader: exports.has('loader'),
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
  metadata,
}: {
  routeId: string;
  target: string;
  metadata: RouteHmrMetadata;
}): string => {
  const targetJson = JSON.stringify(target);
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
  const __reactRouterHot = import.meta.webpackHot;
  __reactRouterHot.accept(${targetJson}, () => {
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
  __reactRouterHot.accept();
  __reactRouterHot.dispose(data => {
    data.__reactRouterRouteShim = true;
  });
  if (__reactRouterHot.data && __reactRouterHot.data.__reactRouterRouteShim) {
    __reactRouterScheduleRouteUpdate(
      __reactRouterRouteId,
      __reactRouterRouteMetadata,
      __reactRouterGetRouteModule
    );
  }
}
`;
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
    routeChunkInfo?.exportNames ?? (await getExportNames(code));
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
    const exportNames = await getExportNames(chunk);
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
