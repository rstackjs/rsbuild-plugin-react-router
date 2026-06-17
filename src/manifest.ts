import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve } from 'pathe';
import type { Route, PluginOptions, RouteManifestItem } from './types.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import type { Rspack } from '@rsbuild/core';
import { combineURLs, createRouteId } from './plugin-utils.js';
import { SERVER_EXPORTS, CLIENT_EXPORTS } from './constants.js';
import {
  buildManifestChunkValidity,
  createEmptyRouteChunkByExportName,
  detectRouteChunksIfEnabled,
  getRouteChunkEntryName,
  validateRouteChunks,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';
import { getRouteModuleAnalysis } from './export-utils.js';

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

export type ReactRouterManifestForDev = {
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
};

export type RouteManifestModuleExports = Record<string, readonly string[]>;

const routeManifestModuleExports = new WeakMap<
  ReactRouterManifestForDev,
  RouteManifestModuleExports
>();

export const getRouteManifestModuleExports = (
  manifest: ReactRouterManifestForDev
): RouteManifestModuleExports => routeManifestModuleExports.get(manifest) ?? {};

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

const getRouteEntryName = (route: Route): string => {
  const extensionIndex = route.file.lastIndexOf('.');
  return extensionIndex >= 0 ? route.file.slice(0, extensionIndex) : route.file;
};

export async function getReactRouterManifestForDev(
  routes: Record<string, Route>,
  //@ts-ignore
  options: PluginOptions,
  clientStats: Rspack.StatsCompilation | undefined,
  context: string,
  assetPrefix = '/',
  routeChunkOptions?: RouteChunkManifestOptions
): Promise<ReactRouterManifestForDev> {
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
      return [`${DEFAULT_MANIFEST_DIR}/${chunkName}.js`];
    }
    const normalizedAssets = Array.isArray(assets) ? assets : [assets];
    if (!normalizedAssets.some(asset => asset.endsWith('.js'))) {
      return [`${DEFAULT_MANIFEST_DIR}/${chunkName}.js`, ...normalizedAssets];
    }
    return normalizedAssets;
  };

  const getModulePathForChunk = (chunkName: string): string | undefined => {
    const assets = getAssetsForChunk(chunkName);
    const jsAssets = assets.filter(asset => asset.endsWith('.js'));
    return jsAssets[0] ? combineURLs(assetPrefix, jsAssets[0]) : undefined;
  };

  const manifestEntries = await Promise.all(
    Object.entries(routes).map(async ([key, route]) => {
      const routeEntryName = getRouteEntryName(route);
      const assets = getAssetsForChunk(routeEntryName);
      const jsAssets = assets.filter(asset => asset.endsWith('.js')) || [];
      let cssAssets = assets.filter(asset => asset.endsWith('.css')) || [];
      // Read and analyze the route file to check for exports
      const routeFilePath = resolve(context, route.file);
      let exports = new Set<string>();
      let routeModuleExports: string[] = [];
      let hasRouteChunkByExportName = createEmptyRouteChunkByExportName();

      try {
        const { code, exports: exportNames } =
          await getRouteModuleAnalysis(routeFilePath);
        if (
          !isBuild &&
          cssAssets.length === 0 &&
          /\.(?:css|less|sass|scss)(?:\?[^'"`]+)?['"`]/.test(code)
        ) {
          cssAssets = [
            `${DEFAULT_MANIFEST_DIR.replace('/js', '/css')}/${routeEntryName}.css`,
          ];
        }
        routeModuleExports = exportNames;
        exports = new Set(exportNames);

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
      const hasDefaultExport = exports.has('default');

      if (isBuild && enforceSplitRouteModules && routeChunkConfig) {
        validateRouteChunks({
          config: routeChunkConfig,
          id: routeFilePath,
          valid: buildManifestChunkValidity(
            exports,
            hasRouteChunkByExportName
          ),
        });
      }

      return [
        key,
        {
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
        },
        routeModuleExports,
      ] as const;
    })
  );

  const routeModuleExportsByRouteId: RouteManifestModuleExports = {};
  for (const [key, routeManifestItem, routeModuleExports] of manifestEntries) {
    result[key] = routeManifestItem;
    routeModuleExportsByRouteId[key] = routeModuleExports;
  }

  const entryAssets = getAssetsForChunk('entry.client');
  const entryJsAssets = entryAssets.filter(asset => asset.endsWith('.js'));
  const entryCssAssets = entryAssets.filter(asset => asset.endsWith('.css'));

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

  const manifest = {
    version,
    url: combineURLs(assetPrefix, manifestPath),
    hmr: undefined,
    entry: fingerprintedValues.entry,
    sri: undefined,
    routes: result,
  };

  routeManifestModuleExports.set(manifest, routeModuleExportsByRouteId);
  return manifest;
}
