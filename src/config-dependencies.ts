import type { ModuleCache } from 'jiti';
import { resolve } from 'pathe';

const normalizePath = (filePath: string): string => resolve(filePath);

const isNodeModulePath = (filePath: string): boolean =>
  filePath.split(/[\\/]/).includes('node_modules');

export const collectConfigDependencyWatchPaths = (
  configPath: string,
  moduleCache: ModuleCache,
  previousCacheKeys: ReadonlySet<string> = new Set()
): string[] => {
  const normalizedConfigPath = normalizePath(configPath);
  const dependencies = new Set<string>();

  for (const [cacheKey, module] of Object.entries(moduleCache)) {
    if (previousCacheKeys.has(cacheKey)) {
      continue;
    }

    const dependencyPath = normalizePath(module?.filename ?? cacheKey);
    if (
      dependencyPath === normalizedConfigPath ||
      isNodeModulePath(dependencyPath)
    ) {
      continue;
    }

    dependencies.add(dependencyPath);
  }

  return Array.from(dependencies);
};

export const clearConfigModuleCache = (
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
