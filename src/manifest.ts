import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve } from 'pathe';
import * as Effect from 'effect/Effect';
import type { Route, PluginOptions, RouteManifestItem } from './types.js';
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
import { getCappedPluginConcurrency } from './concurrency.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';

const ROUTE_ANALYSIS_CONCURRENCY = getCappedPluginConcurrency();

/**
 * Structural equivalent of `RouteConfigEntry` from `@react-router/dev/routes`,
 * inlined so the public declaration files do not reference a devDependency
 * (which would fail to resolve for consumers with `skipLibCheck: false`).
 */
export interface RouteConfigEntry {
  id?: string;
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  file: string;
  children?: RouteConfigEntry[];
}

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
  sri?: Record<string, string> | true;
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

type ChunkAssets = {
  js: string[];
  css: string[];
};

type RouteManifestAnalysis = {
  cssAssets: string[];
  exports: Set<string>;
  routeModuleExports: readonly string[];
  hasRouteChunkByExportName: ReturnType<
    typeof createEmptyRouteChunkByExportName
  > | null;
};

const DEFAULT_MANIFEST_DIR = 'static/js';
const CSS_IMPORT_RE = /\.(?:css|less|sass|scss)(?:\?[^'"`]+)?['"`]/;

const createChunkAssetResolver = (
  clientStats: ReactRouterManifestStats | undefined
): ((chunkName: string) => ChunkAssets) => {
  const chunkAssetsByName = new Map<string, ChunkAssets>();

  return (chunkName: string): ChunkAssets => {
    const cached = chunkAssetsByName.get(chunkName);
    if (cached) {
      return cached;
    }

    const assets = clientStats?.assetsByChunkName?.[chunkName];
    if (!assets) {
      const fallback = `${DEFAULT_MANIFEST_DIR}/${chunkName}.js`;
      const result = { js: [fallback], css: [] };
      chunkAssetsByName.set(chunkName, result);
      return result;
    }

    const cssAssets = new Set<string>();
    const jsAssets: string[] = [];
    for (const asset of assets) {
      if (asset.endsWith('.css')) {
        cssAssets.add(asset);
      } else if (asset.endsWith('.js')) {
        jsAssets.push(asset);
      }
    }
    for (const asset of clientStats?.entrypointFilesByName?.[chunkName] ?? []) {
      if (asset.endsWith('.css')) {
        cssAssets.add(asset);
      }
    }
    if (jsAssets.length === 0) {
      jsAssets.push(`${DEFAULT_MANIFEST_DIR}/${chunkName}.js`);
    }

    const result = { js: jsAssets, css: [...cssAssets] };
    chunkAssetsByName.set(chunkName, result);
    return result;
  };
};

const analyzeRouteForManifestEffect = ({
  discoveredCssAssets,
  isBuild,
  routeChunkCache,
  routeChunkConfig,
  routeEntryName,
  routeFilePath,
}: {
  discoveredCssAssets: string[];
  isBuild: boolean;
  routeChunkCache: RouteChunkCache | undefined;
  routeChunkConfig: RouteChunkConfig | null;
  routeEntryName: string;
  routeFilePath: string;
}): Effect.Effect<RouteManifestAnalysis, Error, never> =>
  tryPluginPromise(async () => {
    const { code, exports: exportNames } =
      await getRouteModuleAnalysis(routeFilePath);
    const cssAssets =
      !isBuild && discoveredCssAssets.length === 0 && CSS_IMPORT_RE.test(code)
        ? [
            `${DEFAULT_MANIFEST_DIR.replace('/js', '/css')}/${routeEntryName}.css`,
          ]
        : discoveredCssAssets;
    const chunkInfo =
      isBuild && routeChunkConfig
        ? await detectRouteChunksIfEnabled(
            routeChunkCache,
            routeChunkConfig,
            routeFilePath,
            code
          )
        : null;

    return {
      cssAssets,
      exports: new Set(exportNames),
      routeModuleExports: exportNames,
      hasRouteChunkByExportName: chunkInfo?.hasRouteChunkByExportName ?? null,
    };
  }).pipe(
    Effect.catchAll(error => {
      if (isBuild) {
        return Effect.fail(error);
      }
      return Effect.sync(() => {
        console.error(`Failed to analyze route file ${routeFilePath}:`, error);
        return {
          cssAssets: discoveredCssAssets,
          exports: new Set<string>(),
          routeModuleExports: [],
          hasRouteChunkByExportName: null,
        };
      });
    })
  );

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

function generateReactRouterManifestForDevEffect(
  routes: Record<string, Route>,
  _options: PluginOptions,
  clientStats: ReactRouterManifestStats | undefined,
  context: string,
  assetPrefix: string,
  routeChunkOptions?: RouteChunkManifestOptions
): Effect.Effect<ReactRouterManifestGenerationResult, Error, never> {
  return Effect.gen(function* () {
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

    const getAssetsForChunk = createChunkAssetResolver(clientStats);
    const getModulePathForChunk = (chunkName: string): string | undefined => {
      const { js: jsAssets } = getAssetsForChunk(chunkName);
      return jsAssets[0] ? combineURLs(assetPrefix, jsAssets[0]) : undefined;
    };

    const manifestEntries = yield* Effect.forEach(
      Object.entries(routes),
      ([key, route]) =>
        Effect.gen(function* () {
          const routeEntryName = getRouteEntryName(route);
          const { js: jsAssets, css: discoveredCssAssets } =
            getAssetsForChunk(routeEntryName);
          const routeFilePath = resolve(context, route.file);
          const routeAnalysis = yield* analyzeRouteForManifestEffect({
            discoveredCssAssets,
            isBuild,
            routeChunkCache: routeChunkOptions?.cache,
            routeChunkConfig,
            routeEntryName,
            routeFilePath,
          });

          const hasClientAction = routeAnalysis.exports.has(
            CLIENT_EXPORTS.clientAction
          );
          const hasClientLoader = routeAnalysis.exports.has(
            CLIENT_EXPORTS.clientLoader
          );
          const hasClientMiddleware = routeAnalysis.exports.has(
            CLIENT_EXPORTS.clientMiddleware
          );
          const hasDefaultExport = routeAnalysis.exports.has('default');
          const routeChunkMap = routeAnalysis.hasRouteChunkByExportName;

          if (isBuild && enforceSplitRouteModules && routeChunkConfig) {
            validateRouteChunks({
              config: routeChunkConfig,
              id: routeFilePath,
              valid: buildManifestChunkValidity(
                routeAnalysis.exports,
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
              hasAction: routeAnalysis.exports.has(SERVER_EXPORTS.action),
              hasLoader: routeAnalysis.exports.has(SERVER_EXPORTS.loader),
              hasClientAction,
              hasClientLoader,
              hasClientMiddleware,
              hasDefaultExport,
              hasErrorBoundary: routeAnalysis.exports.has(
                CLIENT_EXPORTS.ErrorBoundary
              ),
              imports: jsAssets.map(asset => combineURLs(assetPrefix, asset)),
              css: routeAnalysis.cssAssets.map(asset =>
                combineURLs(assetPrefix, asset)
              ),
            },
            routeAnalysis.routeModuleExports,
          ] as const;
        }),
      {
        concurrency: Math.max(
          1,
          Math.min(ROUTE_ANALYSIS_CONCURRENCY, Object.keys(routes).length)
        ),
      }
    );

    const routeModuleExportsByRouteId: RouteManifestModuleExports = {};
    for (const [
      key,
      routeManifestItem,
      routeModuleExports,
    ] of manifestEntries) {
      result[key] = routeManifestItem;
      routeModuleExportsByRouteId[key] = routeModuleExports;
    }

    const { js: entryJsAssets, css: entryCssAssets } =
      getAssetsForChunk('entry.client');

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
  });
}

export async function generateReactRouterManifestForDev(
  routes: Record<string, Route>,
  options: PluginOptions,
  clientStats: ReactRouterManifestStats | undefined,
  context: string,
  assetPrefix = '/',
  routeChunkOptions?: RouteChunkManifestOptions
): Promise<ReactRouterManifestGenerationResult> {
  return runPluginEffect(
    generateReactRouterManifestForDevEffect(
      routes,
      options,
      clientStats,
      context,
      assetPrefix,
      routeChunkOptions
    )
  );
}

export async function getReactRouterManifestForDev(
  ...args: Parameters<typeof generateReactRouterManifestForDev>
): Promise<ReactRouterManifestForDev> {
  return (await generateReactRouterManifestForDev(...args)).manifest;
}
