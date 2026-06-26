import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve } from 'pathe';
import type { Route, PluginOptions, RouteManifestItem } from './types.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { combineURLs, createRouteId } from './plugin-utils.js';
import { SERVER_EXPORTS, CLIENT_EXPORTS } from './constants.js';
import {
  buildManifestChunkValidity,
  createEmptyRouteChunkByExportName,
  detectRouteChunksIfEnabled,
  getRouteChunkEntryName,
  routeChunkExportNames,
  validateRouteChunks,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';
import { getRouteModuleAnalysis } from './export-utils.js';
import { getDefaultConcurrency, mapWithConcurrency } from './concurrency.js';

const ROUTE_ANALYSIS_CONCURRENCY = Math.max(
  1,
  Math.min(16, getDefaultConcurrency() || 1)
);

export function configRoutesToRouteManifest(
  appDirectory: string,
  routes: RouteConfigEntry[],
  rootId = 'root'
): Record<string, Route> {
  return Object.fromEntries(
    configRoutesToRouteManifestEntries(appDirectory, routes, rootId)
  );
}

export function configRoutesToRouteManifestEntries(
  appDirectory: string,
  routes: RouteConfigEntry[],
  rootId = 'root'
): Array<[string, Route]> {
  const routeManifestEntries: Array<[string, Route]> = [];
  const routeIds = new Set<string>();

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

    if (routeIds.has(id)) {
      throw new Error(
        `Unable to define routes with duplicate route id: "${id}"`
      );
    }
    routeIds.add(id);
    routeManifestEntries.push([id, manifestItem]);

    if (route.children) {
      for (const child of route.children) {
        walk(child, id);
      }
    }
  }

  for (const route of routes) {
    walk(route, rootId);
  }

  return routeManifestEntries;
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

export type ReactRouterManifestStats = {
  assetsByChunkName?: Record<string, string[]>;
  entrypointFilesByName?: Record<string, string[]>;
};

type ReactRouterManifestStatsChunk = {
  files?: Iterable<string>;
};

type ReactRouterManifestStatsEntrypoint = {
  getFiles?: () => Iterable<string>;
};

type ReactRouterManifestStatsCompilation = {
  namedChunks: Iterable<[string, ReactRouterManifestStatsChunk]>;
  entrypoints?: Iterable<[string, ReactRouterManifestStatsEntrypoint]>;
};

type ReactRouterManifestStatsNamedChunks =
  ReactRouterManifestStatsCompilation['namedChunks'] & {
    get?: (chunkName: string) => ReactRouterManifestStatsChunk | undefined;
  };

type ReactRouterManifestStatsEntrypoints = NonNullable<
  ReactRouterManifestStatsCompilation['entrypoints']
> & {
  get?: (
    entrypointName: string
  ) => ReactRouterManifestStatsEntrypoint | undefined;
};

const orderChunkFiles = (chunkName: string, files: string[]): string[] => {
  const ownChunkAsset = `${chunkName}.js`;
  const ownFileIndex = files.findIndex(file => file.endsWith(ownChunkAsset));
  if (ownFileIndex <= 0) {
    return files;
  }

  return [
    files[ownFileIndex],
    ...files.slice(0, ownFileIndex),
    ...files.slice(ownFileIndex + 1),
  ];
};

export const createReactRouterManifestStats = (
  compilation: ReactRouterManifestStatsCompilation | undefined,
  chunkNames?: ReadonlySet<string>
): ReactRouterManifestStats | undefined => {
  if (!compilation) {
    return undefined;
  }

  const assetsByChunkName: Record<string, string[]> = {};
  const entrypointFilesByName: Record<string, string[]> = {};
  const namedChunks =
    compilation.namedChunks as ReactRouterManifestStatsNamedChunks;
  const entrypoints = compilation.entrypoints as
    | ReactRouterManifestStatsEntrypoints
    | undefined;

  if (chunkNames && typeof namedChunks.get === 'function') {
    for (const chunkName of chunkNames) {
      const chunk = namedChunks.get(chunkName);
      if (!chunk) {
        continue;
      }
      const files = Array.from(chunk.files ?? []);
      assetsByChunkName[chunkName] = orderChunkFiles(chunkName, files);
    }
  } else {
    for (const [chunkName, chunk] of namedChunks) {
      if (chunkNames && !chunkNames.has(chunkName)) {
        continue;
      }
      const files = Array.from(chunk.files ?? []);
      assetsByChunkName[chunkName] = orderChunkFiles(chunkName, files);
    }
  }

  if (entrypoints) {
    if (chunkNames && typeof entrypoints.get === 'function') {
      for (const entrypointName of chunkNames) {
        const entrypoint = entrypoints.get(entrypointName);
        if (!entrypoint) {
          continue;
        }
        entrypointFilesByName[entrypointName] = Array.from(
          entrypoint.getFiles?.() ?? []
        );
      }
    } else {
      for (const [entrypointName, entrypoint] of entrypoints) {
        if (chunkNames && !chunkNames.has(entrypointName)) {
          continue;
        }
        entrypointFilesByName[entrypointName] = Array.from(
          entrypoint.getFiles?.() ?? []
        );
      }
    }
  }

  return Object.keys(entrypointFilesByName).length > 0
    ? { assetsByChunkName, entrypointFilesByName }
    : { assetsByChunkName };
};

export type RouteManifestModuleExports = Record<string, readonly string[]>;

export type ReactRouterManifestGenerationResult = {
  manifest: ReactRouterManifestForDev;
  moduleExportsByRouteId: RouteManifestModuleExports;
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

const getRouteEntryName = (route: Route): string => {
  const extensionIndex = route.file.lastIndexOf('.');
  return extensionIndex >= 0 ? route.file.slice(0, extensionIndex) : route.file;
};

export const getReactRouterManifestChunkNames = (
  routes: Record<string, Route>,
  splitRouteModules: boolean | 'enforce' = false
): Set<string> => {
  const chunkNames = new Set<string>(['entry.client']);
  for (const route of Object.values(routes)) {
    chunkNames.add(getRouteEntryName(route));
    if (!splitRouteModules || route.id === 'root') {
      continue;
    }
    for (const exportName of routeChunkExportNames) {
      chunkNames.add(getRouteChunkEntryName(route.id, exportName));
    }
  }
  return chunkNames;
};

export async function generateReactRouterManifestForDev(
  routes: Record<string, Route>,
  _options: PluginOptions,
  clientStats: ReactRouterManifestStats | undefined,
  context: string,
  assetPrefix = '/',
  routeChunkOptions?: RouteChunkManifestOptions
): Promise<ReactRouterManifestGenerationResult> {
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
    const entrypointCssAssets =
      clientStats?.entrypointFilesByName?.[chunkName]?.filter(asset =>
        asset.endsWith('.css')
      ) ?? [];
    const cssAssets = [
      ...assets.filter(asset => asset.endsWith('.css')),
      ...entrypointCssAssets,
    ].filter((asset, index, all) => all.indexOf(asset) === index);
    const nonCssAssets = assets.filter(asset => !asset.endsWith('.css'));

    if (!nonCssAssets.some(asset => asset.endsWith('.js'))) {
      return [
        `${DEFAULT_MANIFEST_DIR}/${chunkName}.js`,
        ...nonCssAssets,
        ...cssAssets,
      ];
    }
    return [...nonCssAssets, ...cssAssets];
  };

  const getModulePathForChunk = (chunkName: string): string | undefined => {
    const assets = getAssetsForChunk(chunkName);
    const jsAssets = assets.filter(asset => asset.endsWith('.js'));
    return jsAssets[0] ? combineURLs(assetPrefix, jsAssets[0]) : undefined;
  };

  const manifestEntries = await mapWithConcurrency(
    Object.entries(routes),
    ROUTE_ANALYSIS_CONCURRENCY,
    async ([key, route]) => {
      const routeEntryName = getRouteEntryName(route);
      const assets = getAssetsForChunk(routeEntryName);
      const jsAssets = assets.filter(asset => asset.endsWith('.js'));
      let cssAssets = assets.filter(asset => asset.endsWith('.css'));
      const routeFilePath = resolve(context, route.file);
      let exports = new Set<string>();
      let routeModuleExports: readonly string[] = [];
      let hasRouteChunkByExportName: ReturnType<
        typeof createEmptyRouteChunkByExportName
      > | null = null;

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
        if (isBuild) {
          throw error;
        }
        console.error(`Failed to analyze route file ${routeFilePath}:`, error);
      }

      const hasClientAction = exports.has(CLIENT_EXPORTS.clientAction);
      const hasClientLoader = exports.has(CLIENT_EXPORTS.clientLoader);
      const hasClientMiddleware = exports.has(CLIENT_EXPORTS.clientMiddleware);
      const hasDefaultExport = exports.has('default');
      const routeChunkMap = hasRouteChunkByExportName;

      if (isBuild && enforceSplitRouteModules && routeChunkConfig) {
        validateRouteChunks({
          config: routeChunkConfig,
          id: routeFilePath,
          valid: buildManifestChunkValidity(
            exports,
            routeChunkMap ?? createEmptyRouteChunkByExportName()
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
          clientActionModule: routeChunkMap?.clientAction
            ? getModulePathForChunk(
                getRouteChunkEntryName(route.id, 'clientAction')
              )
            : undefined,
          clientLoaderModule: routeChunkMap?.clientLoader
            ? getModulePathForChunk(
                getRouteChunkEntryName(route.id, 'clientLoader')
              )
            : undefined,
          clientMiddlewareModule: routeChunkMap?.clientMiddleware
            ? getModulePathForChunk(
                getRouteChunkEntryName(route.id, 'clientMiddleware')
              )
            : undefined,
          hydrateFallbackModule: routeChunkMap?.HydrateFallback
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
    }
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

  return {
    manifest,
    moduleExportsByRouteId: routeModuleExportsByRouteId,
  };
}

export async function getReactRouterManifestForDev(
  ...args: Parameters<typeof generateReactRouterManifestForDev>
): Promise<ReactRouterManifestForDev> {
  return (await generateReactRouterManifestForDev(...args)).manifest;
}
