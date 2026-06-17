import { readFile, stat } from 'node:fs/promises';
import { extname } from 'pathe';
import * as esbuild from 'esbuild';
import { init, parse as parseExports } from 'es-module-lexer';
import { JS_LOADERS } from './constants.js';
import {
  detectRouteChunksIfEnabled,
  type RouteChunkCache,
  type RouteChunkConfig,
  type RouteChunkInfo,
} from './route-chunks.js';

type TransformCacheEntry = {
  source: string;
  transformed: Promise<string>;
};

export type BundlerRouteAnalysis = {
  code: string;
  getExportNames: () => Promise<string[]>;
  getRouteChunkInfo: (
    cache: RouteChunkCache | undefined,
    config: RouteChunkConfig
  ) => Promise<RouteChunkInfo>;
};

type BundlerRouteAnalysisCacheEntry = {
  source: string;
  analysis: Promise<BundlerRouteAnalysis>;
};

type RouteModuleAnalysis = {
  source: string;
  code: string;
  exports: string[];
  exportAllModules: string[];
};

type RouteModuleAnalysisCacheEntry = {
  mtimeMs: number;
  size: number;
  analysis: Promise<RouteModuleAnalysis>;
};

const transformCache = new Map<string, TransformCacheEntry>();
const exportInfoCache = new Map<
  string,
  Promise<{ exportNames: string[]; exportAllModules: string[] }>
>();
const bundlerRouteAnalysisCache = new Map<
  string,
  BundlerRouteAnalysisCacheEntry
>();
const routeModuleAnalysisCache = new Map<
  string,
  RouteModuleAnalysisCacheEntry
>();

const MAX_EXPORT_UTILS_CACHE_ENTRIES = 2048;

const setBoundedCacheEntry = <Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value
) => {
  if (!cache.has(key) && cache.size >= MAX_EXPORT_UTILS_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
  cache.set(key, value);
};

const getEsbuildLoader = (resourcePath: string): esbuild.Loader => {
  const ext = extname(resourcePath) as keyof typeof JS_LOADERS;
  return JS_LOADERS[ext] ?? 'js';
};

const getRouteChunkConfigCacheKey = (config: RouteChunkConfig) =>
  `${String(config.splitRouteModules ?? false)}\0${config.appDirectory}\0${config.rootRouteFile}`;

export const transformToEsm = async (
  code: string,
  resourcePath: string
): Promise<string> => {
  const cached = transformCache.get(resourcePath);
  if (cached?.source === code) {
    return cached.transformed;
  }

  const transformed = esbuild
    .transform(code, {
      jsx: 'automatic',
      format: 'esm',
      platform: 'neutral',
      loader: getEsbuildLoader(resourcePath),
    })
    .then(result => result.code)
    .catch(error => {
      if (transformCache.get(resourcePath)?.transformed === transformed) {
        transformCache.delete(resourcePath);
      }
      throw error;
    });

  setBoundedCacheEntry(transformCache, resourcePath, {
    source: code,
    transformed,
  });
  return transformed;
};

export const getExportNames = async (code: string): Promise<string[]> => {
  return (await getExportNamesAndExportAll(code)).exportNames;
};

export const getBundlerRouteAnalysis = async (
  source: string,
  resourcePath: string
): Promise<BundlerRouteAnalysis> => {
  const cached = bundlerRouteAnalysisCache.get(resourcePath);
  if (cached?.source === source) {
    return cached.analysis;
  }

  const analysis = (async () => {
    const code = await transformToEsm(source, resourcePath);
    let exportNames: Promise<string[]> | undefined;
    const routeChunkInfoCache = new Map<string, Promise<RouteChunkInfo>>();

    return {
      code,
      getExportNames: () => {
        exportNames ??= getExportNames(code);
        return exportNames;
      },
      getRouteChunkInfo: (
        cache: RouteChunkCache | undefined,
        config: RouteChunkConfig
      ) => {
        const cacheKey = getRouteChunkConfigCacheKey(config);
        const cachedRouteChunkInfo = routeChunkInfoCache.get(cacheKey);
        if (cachedRouteChunkInfo) {
          return cachedRouteChunkInfo;
        }

        const routeChunkInfo = detectRouteChunksIfEnabled(
          cache,
          config,
          resourcePath,
          code
        ).catch(error => {
          if (routeChunkInfoCache.get(cacheKey) === routeChunkInfo) {
            routeChunkInfoCache.delete(cacheKey);
          }
          throw error;
        });

        routeChunkInfoCache.set(cacheKey, routeChunkInfo);
        return routeChunkInfo;
      },
    };
  })().catch(error => {
    if (bundlerRouteAnalysisCache.get(resourcePath)?.analysis === analysis) {
      bundlerRouteAnalysisCache.delete(resourcePath);
    }
    throw error;
  });

  setBoundedCacheEntry(bundlerRouteAnalysisCache, resourcePath, {
    source,
    analysis,
  });
  return analysis;
};

export const getExportNamesAndExportAll = async (
  code: string
): Promise<{ exportNames: string[]; exportAllModules: string[] }> => {
  const cached = exportInfoCache.get(code);
  if (cached) {
    return cached;
  }

  const exportInfo = (async () => {
    await init;
    const [imports, exportSpecifiers] = await parseExports(code);
    const exportNames = new Set<string>();
    for (const specifier of exportSpecifiers) {
      if (specifier.n) {
        exportNames.add(specifier.n);
      }
    }
    const exportAllModules: string[] = [];
    for (const entry of imports) {
      if (!entry.n) {
        continue;
      }
      const statement = code.slice(entry.ss, entry.se);
      if (/^\s*export\s*\*\s*from\s*['"]/.test(statement)) {
        exportAllModules.push(entry.n);
      }
    }
    return { exportNames: Array.from(exportNames), exportAllModules };
  })().catch(error => {
    if (exportInfoCache.get(code) === exportInfo) {
      exportInfoCache.delete(code);
    }
    throw error;
  });

  setBoundedCacheEntry(exportInfoCache, code, exportInfo);
  return exportInfo;
};

export const getRouteModuleAnalysis = async (
  resourcePath: string
): Promise<RouteModuleAnalysis> => {
  const stats = await stat(resourcePath);
  const cached = routeModuleAnalysisCache.get(resourcePath);
  if (cached?.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
    return cached.analysis;
  }

  const analysis = (async () => {
    const source = await readFile(resourcePath, 'utf8');
    const code = await transformToEsm(source, resourcePath);
    const { exportNames, exportAllModules } =
      await getExportNamesAndExportAll(code);
    return { source, code, exports: exportNames, exportAllModules };
  })().catch(error => {
    if (routeModuleAnalysisCache.get(resourcePath)?.analysis === analysis) {
      routeModuleAnalysisCache.delete(resourcePath);
    }
    throw error;
  });

  setBoundedCacheEntry(routeModuleAnalysisCache, resourcePath, {
    mtimeMs: stats.mtimeMs,
    size: stats.size,
    analysis,
  });
  return analysis;
};

export const getRouteModuleExports = async (
  resourcePath: string
): Promise<string[]> => {
  return (await getRouteModuleAnalysis(resourcePath)).exports;
};
