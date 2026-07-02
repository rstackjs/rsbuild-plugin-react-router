import type { ModuleCache } from 'jiti';
import { createJiti } from 'jiti';
import { resolve } from 'pathe';

type ConfigImporter = Pick<ReturnType<typeof createJiti>, 'import'>;

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

export const importConfigWithWatchPaths = async <T>(
  configPath: string,
  load: (importer: ConfigImporter) => PromiseLike<T> | T = async importer =>
    importer.import<T>(configPath, { default: true })
): Promise<{ value: Awaited<T>; watchPaths: string | string[] }> => {
  const jiti = createJiti(process.cwd(), {
    moduleCache: true,
  });
  const previousCacheKeys = new Set(Object.keys(jiti.cache));
  let importPaths: string[] = [];

  try {
    const value = await load(jiti);
    importPaths = collectConfigImportWatchPaths(
      configPath,
      jiti.cache,
      previousCacheKeys
    );
    return {
      value,
      watchPaths:
        importPaths.length > 0 ? [configPath, ...importPaths] : configPath,
    };
  } finally {
    if (importPaths.length === 0) {
      importPaths = collectConfigImportWatchPaths(
        configPath,
        jiti.cache,
        previousCacheKeys
      );
    }
    clearConfigImportCache(jiti.cache, [configPath, ...importPaths]);
  }
};
