import {
  CLIENT_EXPORTS,
  CLIENT_ROUTE_EXPORTS_SET,
  SERVER_ONLY_ROUTE_EXPORTS_SET,
} from './constants.js';
import { getExportNames } from './export-utils.js';
import {
  buildEnforceChunkValidity,
  detectRouteChunksIfEnabled,
  emptyRouteChunkSnippet,
  getRouteChunkIfEnabled,
  getRouteChunkModuleId,
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
  'hasClientAction',
  'hasClientLoader',
  'hasClientMiddleware',
  'hasErrorBoundary',
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
    hasClientAction: exports.has(CLIENT_EXPORTS.clientAction),
    hasClientLoader: exports.has(CLIENT_EXPORTS.clientLoader),
    hasClientMiddleware: exports.has(CLIENT_EXPORTS.clientMiddleware),
    hasErrorBoundary: exports.has(CLIENT_EXPORTS.ErrorBoundary),
  };
};

/**
 * Development-only HMR glue for a web route client entry.
 *
 * The route client entry is the webpack entry for a route, so it must
 * self-accept hot updates to stop them from bubbling into a full reload. The
 * route entry itself must re-run on updates so route metadata (loader/action
 * flags derived from current export names) does not get stuck in an old accept
 * callback while the underlying route module changes.
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

const shouldReexportFromRouteEntry = ({
  chunkedExportSet,
  exportName,
  isServer,
}: {
  chunkedExportSet?: ReadonlySet<string>;
  exportName: string;
  isServer: boolean;
}): boolean => {
  if (chunkedExportSet?.has(exportName)) {
    return false;
  }
  if (isServer) {
    return (
      CLIENT_ROUTE_EXPORTS_SET.has(exportName) ||
      SERVER_ONLY_ROUTE_EXPORTS_SET.has(exportName)
    );
  }
  return CLIENT_ROUTE_EXPORTS_SET.has(exportName);
};

export const buildRouteClientEntryCode = ({
  exportNames,
  chunkedExports,
  sharedChunkedExports = [],
  isServer,
  resourcePath,
  routeId,
  devHmr,
}: {
  exportNames: readonly string[];
  chunkedExports: readonly string[];
  sharedChunkedExports?: readonly string[];
  isServer: boolean;
  resourcePath: string;
  routeId?: string;
  devHmr?: boolean;
}): string => {
  const chunkedExportSet =
    chunkedExports.length > 0 || sharedChunkedExports.length > 0
      ? new Set<string>([...chunkedExports, ...sharedChunkedExports])
      : undefined;
  const target = isServer
    ? resourcePath
    : chunkedExports.length > 0
      ? getRouteChunkModuleId(resourcePath, 'main')
      : `${resourcePath}?react-router-route`;
  const reexports = exportNames
    .filter(exportName =>
      shouldReexportFromRouteEntry({ chunkedExportSet, exportName, isServer })
    )
    .sort();
  const reexportCode = [
    reexports.length > 0
      ? `export { ${reexports.join(', ')} } from ${JSON.stringify(target)};`
      : null,
    ...sharedChunkedExports.map(
      exportName =>
        `export { ${exportName} } from ${JSON.stringify(
          getRouteChunkModuleId(resourcePath, exportName)
        )};`
    ),
  ]
    .filter(Boolean)
    .join('\n');
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
    routeChunkInfo?.exportNames ?? (await getExportNames(code, resourcePath));
  const chunkedExports = routeChunkInfo?.chunkedExports ?? [];
  const sharedChunkedExports = routeChunkInfo?.sharedChunkedExports ?? [];
  return {
    code: buildRouteClientEntryCode({
      exportNames,
      chunkedExports,
      sharedChunkedExports,
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
