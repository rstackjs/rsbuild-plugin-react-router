import { readFile, stat } from 'node:fs/promises';
import { extname } from 'pathe';
import * as esbuild from 'esbuild';
import { init, parse as parseExports } from 'es-module-lexer';
import { JS_LOADERS } from './constants.js';

type TransformCacheEntry = {
  source: string;
  transformed: Promise<string>;
};

type RouteModuleAnalysis = {
  source: string;
  code: string;
  exports: string[];
};

type RouteModuleAnalysisCacheEntry = {
  mtimeMs: number;
  size: number;
  analysis: Promise<RouteModuleAnalysis>;
};

const transformCache = new Map<string, TransformCacheEntry>();
const exportNamesCache = new Map<string, Promise<string[]>>();
const routeModuleAnalysisCache = new Map<
  string,
  RouteModuleAnalysisCacheEntry
>();

const MAX_MODULE_ANALYSIS_CACHE_ENTRIES = 2048;

const setBoundedCacheEntry = <Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value
) => {
  if (!cache.has(key) && cache.size >= MAX_MODULE_ANALYSIS_CACHE_ENTRIES) {
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
  const cached = exportNamesCache.get(code);
  if (cached) {
    return cached;
  }

  const exports = (async () => {
    await init;
    const [, exportSpecifiers] = await parseExports(code);
    return Array.from(
      new Set(exportSpecifiers.map(specifier => specifier.n).filter(Boolean))
    );
  })().catch(error => {
    if (exportNamesCache.get(code) === exports) {
      exportNamesCache.delete(code);
    }
    throw error;
  });

  setBoundedCacheEntry(exportNamesCache, code, exports);
  return exports;
};

export const getExportNamesAndExportAll = async (
  code: string
): Promise<{ exportNames: string[]; exportAllModules: string[] }> => {
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
    const exports = await getExportNames(code);
    return { source, code, exports };
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
