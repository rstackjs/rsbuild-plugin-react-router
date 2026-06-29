import type { ModuleCache } from 'jiti';
import { resolve } from 'pathe';

const normalizePath = (filePath: string): string => resolve(filePath);

const isNodeModulePath = (filePath: string): boolean =>
  filePath.split(/[\\/]/).includes('node_modules');

export const collectConfigImportWatchPaths = (
  configPath: string,
  moduleCache: ModuleCache,
  previousCacheKeys: ReadonlySet<string>
): string[] => {
  const normalizedConfigPath = normalizePath(configPath);
  const watchPaths = new Set<string>();

  for (const [cacheKey, module] of Object.entries(moduleCache)) {
    if (previousCacheKeys.has(cacheKey)) {
      continue;
    }

    const importPath = normalizePath(module?.filename ?? cacheKey);
    if (importPath === normalizedConfigPath || isNodeModulePath(importPath)) {
      continue;
    }

    watchPaths.add(importPath);
  }

  return Array.from(watchPaths);
};

export const clearConfigImportCache = (
  moduleCache: ModuleCache,
  filePaths: readonly string[]
): void => {
  const normalizedFilePaths = new Set(filePaths.map(normalizePath));

  for (const [cacheKey, module] of Object.entries(moduleCache)) {
    const cachedPath = normalizePath(module?.filename ?? cacheKey);
    if (normalizedFilePaths.has(cachedPath)) {
      delete moduleCache[cacheKey];
    }
  }
};
