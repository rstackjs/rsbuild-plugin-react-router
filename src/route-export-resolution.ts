import { readFileSync, statSync, type Stats } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, relative, resolve } from 'pathe';
import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import {
  getExportNamesAndExportAll,
  getRouteModuleAnalysis,
} from './export-utils.js';

type PackageJson = {
  exports?: unknown;
  module?: unknown;
  main?: unknown;
};

type PackageImportResolution =
  | { status: 'resolved'; path: string }
  | { status: 'blocked-by-exports' }
  | { status: 'not-found' };

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

const parsePackageSpecifier = (
  specifier: string
): { packageName: string; subpath: string } | null => {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('node:')
  ) {
    return null;
  }
  const parts = specifier.split('/');
  const packageName = specifier.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  if (!packageName || (specifier.startsWith('@') && parts.length < 2)) {
    return null;
  }
  const rest = parts.slice(packageName.startsWith('@') ? 2 : 1).join('/');
  return {
    packageName,
    subpath: rest ? `./${rest}` : '.',
  };
};

const findPackageDirectory = (
  packageName: string,
  importerPath: string
): string | null => {
  let currentDirectory = dirname(importerPath);
  while (true) {
    const candidate = resolve(currentDirectory, 'node_modules', packageName);
    if (tryStat(candidate)?.isDirectory()) {
      return candidate;
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
    );
  } catch {
    return null;
  }
};

const resolvePackageTarget = (
  packageDirectory: string,
  target: unknown
): string | null => {
  if (typeof target === 'string') {
    return resolvePathWithExtensions(resolve(packageDirectory, target));
  }
  if (Array.isArray(target)) {
    for (const item of target) {
      const resolved = resolvePackageTarget(packageDirectory, item);
      if (resolved) {
        return resolved;
      }
    }
    return null;
  }
  if (target && typeof target === 'object') {
    const conditions = target as Record<string, unknown>;
    for (const condition of ['import', 'default']) {
      const resolved = resolvePackageTarget(
        packageDirectory,
        conditions[condition]
      );
      if (resolved) {
        return resolved;
      }
    }
  }
  return null;
};

const resolvePackageImport = (
  specifier: string,
  importerPath: string
): PackageImportResolution => {
  const parsed = parsePackageSpecifier(specifier);
  if (!parsed) {
    return { status: 'not-found' };
  }
  const packageDirectory = findPackageDirectory(
    parsed.packageName,
    importerPath
  );
  if (!packageDirectory) {
    return { status: 'not-found' };
  }
  const packageJson = readPackageJson(packageDirectory);
  if (!packageJson) {
    return { status: 'not-found' };
  }
  const exportsField = packageJson.exports;
  if ('exports' in packageJson) {
    const hasSubpathExports =
      typeof exportsField === 'object' &&
      !Array.isArray(exportsField) &&
      exportsField !== null &&
      Object.keys(exportsField).some(key => key.startsWith('.'));
    const target =
      parsed.subpath === '.' && !hasSubpathExports
        ? exportsField
        : hasSubpathExports
          ? (exportsField as Record<string, unknown>)[parsed.subpath]
          : undefined;
    const resolved = resolvePackageTarget(packageDirectory, target);
    if (resolved) {
      return { status: 'resolved', path: resolved };
    }
    return { status: 'blocked-by-exports' };
  }
  if (parsed.subpath !== '.') {
    const resolved = resolvePathWithExtensions(
      resolve(packageDirectory, parsed.subpath)
    );
    return resolved
      ? { status: 'resolved', path: resolved }
      : { status: 'not-found' };
  }
  const resolved =
    resolvePackageTarget(packageDirectory, packageJson.module) ??
    resolvePackageTarget(packageDirectory, packageJson.main) ??
    resolveIndexFile(packageDirectory);
  return resolved
    ? { status: 'resolved', path: resolved }
    : { status: 'not-found' };
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

  const packageImport = resolvePackageImport(specifier, importerPath);
  if (packageImport.status === 'resolved') {
    return packageImport.path;
  }
  if (packageImport.status === 'blocked-by-exports') {
    return null;
  }

  try {
    const resolver = createRequire(pathToFileURL(importerPath).href);
    return resolver.resolve(specifier);
  } catch {
    return null;
  }
};

export type RouteExportResolver = (
  specifier: string,
  importerPath: string
) => Promise<string | null> | string | null;

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
