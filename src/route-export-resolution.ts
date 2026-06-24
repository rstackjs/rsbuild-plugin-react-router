import { statSync, type Stats } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'pathe';
import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import {
  getExportNamesAndExportAll,
  getRouteModuleAnalysis,
} from './export-utils.js';

const tryStat = (path: string): Stats | null =>
  statSync(path, { throwIfNoEntry: false }) ?? null;

const resolveIndexFile = (dirPath: string): string | null => {
  for (const ext of JS_EXTENSIONS) {
    const candidate = resolve(dirPath, `index${ext}`);
    const stats = tryStat(candidate);
    if (stats?.isFile()) {
      return candidate;
    }
  }
  return null;
};

const resolvePathWithExtensions = (basePath: string): string | null => {
  const stats = tryStat(basePath);
  if (stats?.isFile()) {
    return basePath;
  }
  if (stats?.isDirectory()) {
    return resolveIndexFile(basePath);
  }

  for (const ext of JS_EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    const candidateStats = tryStat(candidate);
    if (candidateStats?.isFile()) {
      return candidate;
    }
  }

  return resolveIndexFile(basePath);
};

const resolveExportAllModule = (
  specifier: string,
  importerPath: string
): string | null => {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const basePath = specifier.startsWith('/')
      ? specifier
      : resolve(dirname(importerPath), specifier);
    const resolvedPath = resolvePathWithExtensions(basePath);
    if (resolvedPath) {
      return resolvedPath;
    }
  }

  try {
    return createRequire(importerPath).resolve(specifier);
  } catch {
    return null;
  }
};

export type RouteExportResolver = (
  specifier: string,
  importerPath: string
) => Promise<string | null> | string | null;

export type RouteModuleResolveCallback = (
  error: Error | null,
  resolved?: string | false
) => void;

export type RouteModuleResolver = (
  context: string,
  specifier: string,
  callback: RouteModuleResolveCallback
) => void;

export const createBundlerRouteExportResolver =
  (resolveModule: RouteModuleResolver): RouteExportResolver =>
  (specifier, importerPath) =>
    new Promise<string | null>(resolveResolvedPath => {
      resolveModule(dirname(importerPath), specifier, (error, resolved) => {
        resolveResolvedPath(error || !resolved ? null : resolved);
      });
    });

export const collectClientOnlyStubExportNames = async (
  code: string,
  resourcePath: string,
  resolveModule: RouteExportResolver = resolveExportAllModule
): Promise<Set<string>> => {
  const { exportNames: directExportNames, exportAllModules } =
    await getExportNamesAndExportAll(code);
  const exportNames = new Set(directExportNames);
  const unresolvedExportAll = new Set<string>();
  const visitedModules = new Set<string>();

  const collectExportNamesFromModule = async (
    modulePath: string
  ): Promise<void> => {
    if (visitedModules.has(modulePath)) {
      return;
    }
    visitedModules.add(modulePath);
    const { exports: moduleExportNames, exportAllModules: moduleExportAll } =
      await getRouteModuleAnalysis(modulePath);
    for (const name of moduleExportNames) {
      if (name !== 'default') {
        exportNames.add(name);
      }
    }
    for (const nestedSpecifier of moduleExportAll) {
      const nestedPath = await resolveModule(nestedSpecifier, modulePath);
      if (!nestedPath) {
        unresolvedExportAll.add(nestedSpecifier);
        continue;
      }
      await collectExportNamesFromModule(nestedPath);
    }
  };

  for (const specifier of exportAllModules) {
    const resolvedPath = await resolveModule(specifier, resourcePath);
    if (!resolvedPath) {
      unresolvedExportAll.add(specifier);
      continue;
    }
    await collectExportNamesFromModule(resolvedPath);
  }

  if (unresolvedExportAll.size > 0) {
    throw new Error(
      `[${PLUGIN_NAME}] Client-only module uses \`export * from\` with ` +
        `unresolvable specifier(s): ${Array.from(unresolvedExportAll)
          .map(spec => `\`${spec}\``)
          .join(', ')}. ` +
        `Please explicitly re-export named bindings in ` +
        `\`${relative(process.cwd(), resourcePath)}\`.`
    );
  }

  return exportNames;
};
