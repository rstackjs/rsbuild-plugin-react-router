import { readFileSync, statSync, type Stats } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'pathe';
import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import {
  getExportNamesAndExportAll,
  getRouteModuleAnalysis,
} from './export-utils.js';

const tryStat = (path: string): Stats | null =>
  statSync(path, { throwIfNoEntry: false }) ?? null;

type PackageExportTarget =
  | string
  | PackageExportTarget[]
  | { [condition: string]: PackageExportTarget | undefined }
  | null;

type PackageJson = {
  exports?: PackageExportTarget;
  main?: string;
  module?: string;
};

const PACKAGE_IMPORT_CONDITIONS = new Set(['import', 'node']);
const PACKAGE_RESOLUTION_NOT_APPLICABLE = Symbol(
  'package resolution not applicable'
);

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

const parsePackageSpecifier = (
  specifier: string
): { packageName: string; packageSubpath: string } | null => {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('#')
  ) {
    return null;
  }

  const parts = specifier.split('/');
  const packageName = specifier.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  const packagePathParts = specifier.startsWith('@')
    ? parts.slice(2)
    : parts.slice(1);

  return {
    packageName,
    packageSubpath:
      packagePathParts.length > 0 ? `./${packagePathParts.join('/')}` : '.',
  };
};

const findPackageDirectory = (
  importerPath: string,
  packageName: string
): string | null => {
  let currentDirectory = dirname(importerPath);

  while (true) {
    const packageDirectory = resolve(
      currentDirectory,
      'node_modules',
      packageName
    );
    const packageJsonPath = resolve(packageDirectory, 'package.json');
    if (tryStat(packageJsonPath)?.isFile()) {
      return packageDirectory;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return null;
    }
    currentDirectory = parentDirectory;
  }
};

const readPackageJson = (packageDirectory: string): PackageJson | null => {
  try {
    return JSON.parse(
      readFileSync(resolve(packageDirectory, 'package.json'), 'utf8')
    ) as PackageJson;
  } catch {
    return null;
  }
};

const resolvePackageExportTarget = (
  target: PackageExportTarget | undefined
): string | null => {
  if (!target) {
    return null;
  }

  if (typeof target === 'string') {
    return target;
  }

  if (Array.isArray(target)) {
    for (const nestedTarget of target) {
      const resolvedTarget = resolvePackageExportTarget(nestedTarget);
      if (resolvedTarget) {
        return resolvedTarget;
      }
    }
    return null;
  }

  for (const [condition, nestedTarget] of Object.entries(target)) {
    if (condition === 'default' || PACKAGE_IMPORT_CONDITIONS.has(condition)) {
      const resolvedTarget = resolvePackageExportTarget(nestedTarget);
      if (resolvedTarget) {
        return resolvedTarget;
      }
    }
  }

  return null;
};

const resolvePackageExports = (
  packageDirectory: string,
  packageSubpath: string,
  packageJson: PackageJson
): string | null => {
  const exports = packageJson.exports;
  if (!exports) {
    const entry = packageJson.module ?? packageJson.main;
    return entry
      ? resolvePathWithExtensions(resolve(packageDirectory, entry))
      : null;
  }

  const target =
    typeof exports === 'object' &&
    !Array.isArray(exports) &&
    Object.keys(exports).some(key => key.startsWith('.'))
      ? exports[packageSubpath]
      : packageSubpath === '.'
        ? exports
        : undefined;

  const resolvedTarget = resolvePackageExportTarget(target);
  if (!resolvedTarget || !resolvedTarget.startsWith('./')) {
    return null;
  }

  return resolvePathWithExtensions(resolve(packageDirectory, resolvedTarget));
};

const resolvePackageImport = (
  specifier: string,
  importerPath: string
): string | null | typeof PACKAGE_RESOLUTION_NOT_APPLICABLE => {
  const parsedSpecifier = parsePackageSpecifier(specifier);
  if (!parsedSpecifier) {
    return PACKAGE_RESOLUTION_NOT_APPLICABLE;
  }

  const packageDirectory = findPackageDirectory(
    importerPath,
    parsedSpecifier.packageName
  );
  if (!packageDirectory) {
    return PACKAGE_RESOLUTION_NOT_APPLICABLE;
  }

  const packageJson = readPackageJson(packageDirectory);
  if (!packageJson) {
    return PACKAGE_RESOLUTION_NOT_APPLICABLE;
  }

  if (
    packageJson.exports === undefined &&
    !packageJson.module &&
    !packageJson.main
  ) {
    return PACKAGE_RESOLUTION_NOT_APPLICABLE;
  }

  return resolvePackageExports(
    packageDirectory,
    parsedSpecifier.packageSubpath,
    packageJson
  );
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

  const importResolvedPath = resolvePackageImport(specifier, importerPath);
  if (importResolvedPath !== PACKAGE_RESOLUTION_NOT_APPLICABLE) {
    return importResolvedPath;
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
    new Promise<string | null>(resolvePromise => {
      resolveModule(dirname(importerPath), specifier, (error, resolved) => {
        resolvePromise(error || !resolved ? null : resolved);
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
