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
  return `export { ${reexports.join(', ')} } from ${JSON.stringify(target)};`;
};

export const createRouteClientEntryArtifact = async ({
  code,
  resourcePath,
  environmentName,
  isBuild,
  routeChunkCache,
  routeChunkConfig,
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
