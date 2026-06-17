import {
  CLIENT_ROUTE_EXPORTS_SET,
  SERVER_ONLY_ROUTE_EXPORTS_SET,
} from './constants.js';
import {
  getBundlerRouteAnalysis,
  getExportNames,
  transformToEsm,
} from './export-utils.js';
import {
  buildEnforceChunkValidity,
  emptyRouteChunkSnippet,
  getRouteChunkIfEnabled,
  getRouteChunkNameFromModuleId,
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

export const buildRouteClientEntryCode = ({
  exportNames,
  chunkedExports,
  isServer,
  resourcePath,
}: {
  exportNames: readonly string[];
  chunkedExports: readonly string[];
  isServer: boolean;
  resourcePath: string;
}): { code: string; reexports: string[] } => {
  const chunkedExportSet =
    chunkedExports.length > 0 ? new Set<string>(chunkedExports) : undefined;
  const reexports = exportNames.filter(exp => {
    if (chunkedExportSet?.has(exp)) {
      return false;
    }
    return (
      CLIENT_ROUTE_EXPORTS_SET.has(exp) ||
      (isServer && SERVER_ONLY_ROUTE_EXPORTS_SET.has(exp))
    );
  });
  const target = `${resourcePath}?react-router-route`;
  return {
    code: `export { ${reexports.join(', ')} } from ${JSON.stringify(target)};`,
    reexports,
  };
};

export const createRouteClientEntryArtifact = async ({
  code,
  resourcePath,
  environmentName,
  isBuild,
  routeChunkCache,
  routeChunkConfig,
}: RouteClientEntryArtifactOptions): Promise<RouteClientEntryArtifact> => {
  const analysis = await getBundlerRouteAnalysis(code, resourcePath);
  const exportNames = await analysis.getExportNames();
  const isServer = environmentName === 'node';
  const splitRouteModules = routeChunkConfig.splitRouteModules;
  const chunkedExports =
    !isServer && isBuild && splitRouteModules
      ? (await analysis.getRouteChunkInfo(routeChunkCache, routeChunkConfig))
          .chunkedExports
      : [];
  return {
    code: buildRouteClientEntryCode({
      exportNames,
      chunkedExports,
      isServer,
      resourcePath,
    }).code,
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
      code: emptyRouteChunkSnippet('Split route modules disabled'),
      map: null,
    };
  }

  const chunkName = getRouteChunkNameFromModuleId(resource);
  if (!chunkName) {
    throw new Error(`Invalid route chunk name in "${resource}"`);
  }

  const transformed = await transformToEsm(code, resourcePath);
  const chunk = await getRouteChunkIfEnabled(
    routeChunkCache,
    routeChunkConfig,
    resourcePath,
    chunkName,
    transformed
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
    code: chunk ?? emptyRouteChunkSnippet(`No ${chunkName} chunk`),
    map: null,
  };
};
