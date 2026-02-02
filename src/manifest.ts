import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'pathe';
import type { Route, PluginOptions, RouteManifestItem } from './types.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import type { Rspack } from '@rsbuild/core';
import { combineURLs, createRouteId } from './plugin-utils.js';
import { SERVER_EXPORTS, CLIENT_EXPORTS } from './constants.js';
import {
  detectRouteChunksIfEnabled,
  getRouteChunkEntryName,
  validateRouteChunks,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';
import { getExportNames, transformToEsm } from './export-utils.js';

// Helper functions
export function configRoutesToRouteManifest(
  appDirectory: string,
  routes: RouteConfigEntry[],
  rootId = 'root'
): Record<string, Route> {
  const routeManifest: Record<string, Route> = {};

  function walk(route: RouteConfigEntry, parentId: string) {
    const id = route.id || createRouteId(route.file);
    const manifestItem = {
      id,
      parentId,
      file: isAbsolute(route.file)
        ? relative(appDirectory, route.file)
        : route.file,
      path: route.path,
      index: route.index,
      caseSensitive: route.caseSensitive,
    };

    if (Object.prototype.hasOwnProperty.call(routeManifest, id)) {
      throw new Error(
        `Unable to define routes with duplicate route id: "${id}"`
      );
    }
    routeManifest[id] = manifestItem;

    if (route.children) {
      for (const child of route.children) {
        walk(child, id);
      }
    }
  }

  for (const route of routes) {
    walk(route, rootId);
  }

  return routeManifest;
}

type RouteChunkManifestOptions = {
  splitRouteModules?: boolean | 'enforce';
  rootRouteFile?: string;
  isBuild?: boolean;
  cache?: RouteChunkCache;
};

const DEFAULT_MANIFEST_DIR = 'static/js';

const getManifestDirFromEntryAsset = (entryModulePath?: string): string => {
  if (!entryModulePath) {
    return DEFAULT_MANIFEST_DIR;
  }
  const dir = dirname(entryModulePath);
  return dir === '.' ? DEFAULT_MANIFEST_DIR : dir;
};

export const getReactRouterManifestPath = ({
  version,
  isBuild,
  entryModulePath,
}: {
  version: string;
  isBuild: boolean;
  entryModulePath?: string;
}): string => {
  if (!isBuild) {
    return 'static/js/virtual/react-router/browser-manifest.js';
  }
  const dir = getManifestDirFromEntryAsset(entryModulePath);
  return `${dir}/manifest-${version}.js`;
};

const getManifestVersion = (
  fingerprintedValues: { entry: unknown; routes: unknown },
  isBuild: boolean
): string => {
  if (!isBuild) {
    return String(Math.random());
  }
  return createHash('md5')
    .update(JSON.stringify(fingerprintedValues))
    .digest('hex')
    .slice(0, 8);
};

export async function getReactRouterManifestForDev(
  routes: Record<string, Route>,
  //@ts-ignore
  options: PluginOptions,
  clientStats: Rspack.StatsCompilation | undefined,
  context: string,
  assetPrefix = '/',
  routeChunkOptions?: RouteChunkManifestOptions
): Promise<{
  version: string;
  url: string;
  hmr?: {
    runtime: string;
  };
  entry: {
    module: string;
    imports: string[];
    css: string[];
  };
  sri?: Record<string, string>;
  routes: Record<string, RouteManifestItem>;
}> {
  const result: Record<string, RouteManifestItem> = {};
  const splitRouteModules = routeChunkOptions?.splitRouteModules ?? false;
  const enforceSplitRouteModules = splitRouteModules === 'enforce';
  const isBuild = routeChunkOptions?.isBuild ?? false;
  const routeChunkConfig: RouteChunkConfig | null =
    splitRouteModules && routeChunkOptions?.rootRouteFile
      ? {
          splitRouteModules,
          appDirectory: context,
          rootRouteFile: routeChunkOptions.rootRouteFile,
        }
      : null;

  const getAssetsForChunk = (chunkName: string): string[] => {
    const assets = clientStats?.assetsByChunkName?.[chunkName];
    if (!assets) {
      return [];
    }
    return Array.isArray(assets) ? assets : [assets];
  };

  const getModulePathForChunk = (chunkName: string): string | undefined => {
    const assets = getAssetsForChunk(chunkName);
    const jsAssets = assets.filter(asset => asset.endsWith('.js'));
    return jsAssets[0] ? combineURLs(assetPrefix, jsAssets[0]) : undefined;
  };

  for (const [key, route] of Object.entries(routes)) {
    const assets = getAssetsForChunk(route.id);
    const jsAssets = assets.filter(asset => asset.endsWith('.js')) || [];
    const cssAssets = assets.filter(asset => asset.endsWith('.css')) || [];
    // Read and analyze the route file to check for exports
    const routeFilePath = resolve(context, route.file);
    let exports = new Set<string>();
    let hasRouteChunkByExportName: Record<
      'clientAction' | 'clientLoader' | 'clientMiddleware' | 'HydrateFallback',
      boolean
    > = {
      clientAction: false,
      clientLoader: false,
      clientMiddleware: false,
      HydrateFallback: false,
    };

    try {
      const source = await readFile(routeFilePath, 'utf8');
      const code = await transformToEsm(source, routeFilePath);
      exports = new Set(await getExportNames(code));

      if (isBuild && routeChunkConfig) {
        const { hasRouteChunkByExportName: chunkInfo } =
          await detectRouteChunksIfEnabled(
            routeChunkOptions?.cache,
            routeChunkConfig,
            routeFilePath,
            code
          );
        hasRouteChunkByExportName = chunkInfo;
      }
    } catch (error) {
      console.error(`Failed to analyze route file ${routeFilePath}:`, error);
    }

    const hasClientAction = exports.has(CLIENT_EXPORTS.clientAction);
    const hasClientLoader = exports.has(CLIENT_EXPORTS.clientLoader);
    const hasClientMiddleware = exports.has(CLIENT_EXPORTS.clientMiddleware);
    const hasHydrateFallback = exports.has(CLIENT_EXPORTS.HydrateFallback);
    const hasDefaultExport = exports.has('default');

    if (isBuild && enforceSplitRouteModules && routeChunkConfig) {
      validateRouteChunks({
        config: routeChunkConfig,
        id: routeFilePath,
        valid: {
          clientAction:
            !hasClientAction || hasRouteChunkByExportName.clientAction,
          clientLoader:
            !hasClientLoader || hasRouteChunkByExportName.clientLoader,
          clientMiddleware:
            !hasClientMiddleware || hasRouteChunkByExportName.clientMiddleware,
          HydrateFallback:
            !hasHydrateFallback || hasRouteChunkByExportName.HydrateFallback,
        },
      });
    }

    result[key] = {
      id: route.id,
      parentId: route.parentId,
      path: route.path,
      index: route.index,
      caseSensitive: route.caseSensitive,
      module: combineURLs(assetPrefix, jsAssets[0] || ''),
      clientActionModule:
        isBuild && hasRouteChunkByExportName.clientAction
          ? getModulePathForChunk(
              getRouteChunkEntryName(route.id, 'clientAction')
            )
          : undefined,
      clientLoaderModule:
        isBuild && hasRouteChunkByExportName.clientLoader
          ? getModulePathForChunk(
              getRouteChunkEntryName(route.id, 'clientLoader')
            )
          : undefined,
      clientMiddlewareModule:
        isBuild && hasRouteChunkByExportName.clientMiddleware
          ? getModulePathForChunk(
              getRouteChunkEntryName(route.id, 'clientMiddleware')
            )
          : undefined,
      hydrateFallbackModule:
        isBuild && hasRouteChunkByExportName.HydrateFallback
          ? getModulePathForChunk(
              getRouteChunkEntryName(route.id, 'HydrateFallback')
            )
          : undefined,
      hasAction: exports.has(SERVER_EXPORTS.action),
      hasLoader: exports.has(SERVER_EXPORTS.loader),
      hasClientAction,
      hasClientLoader,
      hasClientMiddleware,
      hasDefaultExport,
      hasErrorBoundary: exports.has(CLIENT_EXPORTS.ErrorBoundary),
      imports: jsAssets.map(asset => combineURLs(assetPrefix, asset)),
      css: cssAssets.map(asset => combineURLs(assetPrefix, asset)),
    };
  }

  const entryAssets = clientStats?.assetsByChunkName?.['entry.client'];
  const entryJsAssets =
    entryAssets?.filter(asset => asset.endsWith('.js')) || [];
  const entryCssAssets =
    entryAssets?.filter(asset => asset.endsWith('.css')) || [];

  const fingerprintedValues = {
    entry: {
      module: combineURLs(assetPrefix, entryJsAssets[0] || ''),
      imports: entryJsAssets.map(asset => combineURLs(assetPrefix, asset)),
      css: entryCssAssets.map(asset => combineURLs(assetPrefix, asset)),
    },
    routes: result,
  };
  const version = getManifestVersion(fingerprintedValues, isBuild);
  const manifestPath = getReactRouterManifestPath({
    version,
    isBuild,
    entryModulePath: entryJsAssets[0],
  });

  return {
    version,
    url: combineURLs(assetPrefix, manifestPath),
    hmr: undefined,
    entry: fingerprintedValues.entry,
    sri: undefined,
    routes: result,
  };
}
