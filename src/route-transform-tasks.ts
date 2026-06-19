import { statSync, type Stats } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { basename as pathBasename, dirname, relative, resolve } from 'pathe';
import { generate, parse } from './babel.js';
import {
  JS_EXTENSIONS,
  PLUGIN_NAME,
  SERVER_ONLY_ROUTE_EXPORTS,
  SERVER_ONLY_ROUTE_EXPORTS_SET,
} from './constants.js';
import {
  collectProgramExportNames,
  getExportNamesAndExportAll,
  getRouteModuleAnalysis,
} from './export-utils.js';
import {
  removeExports,
  removeUnusedImports,
  transformRoute,
} from './plugin-utils.js';
import {
  createRouteChunkArtifact,
  createRouteClientEntryArtifact,
} from './route-artifacts.js';
import {
  detectRouteChunksIfEnabled,
  getRouteChunkModuleId,
  type RouteChunkCache,
  type RouteChunkConfig,
} from './route-chunks.js';

export type RouteTransformResult = {
  code: string;
  map?: ReturnType<typeof generate>['map'];
};

type BaseRouteTransformTask = {
  code: string;
  resourcePath: string;
};

export type RouteClientEntryTransformTask = BaseRouteTransformTask & {
  kind: 'routeClientEntry';
  environmentName?: string;
  isBuild: boolean;
  routeChunkConfig: RouteChunkConfig;
};

export type RouteChunkTransformTask = BaseRouteTransformTask & {
  kind: 'routeChunk';
  resource: string;
  isBuild: boolean;
  routeChunkConfig: RouteChunkConfig;
};

export type SplitRouteExportsTransformTask = BaseRouteTransformTask & {
  kind: 'splitRouteExports';
  routeChunkConfig: RouteChunkConfig;
};

export type ClientOnlyStubTransformTask = BaseRouteTransformTask & {
  kind: 'clientOnlyStub';
};

export type RouteModuleTransformTask = BaseRouteTransformTask & {
  kind: 'routeModule';
  resource: string;
  environmentName: string;
  ssr: boolean;
  isBuild: boolean;
  isSpaMode: boolean;
  rootRoutePath: string | null;
};

export type RouteTransformTask =
  | RouteClientEntryTransformTask
  | RouteChunkTransformTask
  | SplitRouteExportsTransformTask
  | ClientOnlyStubTransformTask
  | RouteModuleTransformTask;

export type RouteTransformTaskOptions = {
  routeChunkCache?: RouteChunkCache;
};

const defaultRouteChunkCache: RouteChunkCache = new Map();

const getRouteChunkCache = (options?: RouteTransformTaskOptions) =>
  options?.routeChunkCache ?? defaultRouteChunkCache;

const tryStat = (path: string): Stats | null =>
  statSync(path, { throwIfNoEntry: false }) ?? null;

const splitRouteExports = async (
  task: SplitRouteExportsTransformTask,
  options?: RouteTransformTaskOptions
): Promise<RouteTransformResult> => {
  const { exportNames, hasRouteChunks, chunkedExports } =
    await detectRouteChunksIfEnabled(
      getRouteChunkCache(options),
      task.routeChunkConfig,
      task.resourcePath,
      task.code
    );
  if (!hasRouteChunks) {
    return { code: task.code, map: null };
  }

  const chunkedExportSet = new Set<string>(chunkedExports);
  const mainChunkReexports = exportNames
    .filter(name => !chunkedExportSet.has(name))
    .join(', ');
  const chunkBasePath = `./${pathBasename(task.resourcePath)}`;

  return {
    code: [
      mainChunkReexports
        ? `export { ${mainChunkReexports} } from "${getRouteChunkModuleId(
            chunkBasePath,
            'main'
          )}";`
        : null,
      ...chunkedExports.map(
        exportName =>
          `export { ${exportName} } from "${getRouteChunkModuleId(
            chunkBasePath,
            exportName
          )}";`
      ),
    ]
      .filter(Boolean)
      .join('\n'),
    map: null,
  };
};

const resolveIndexFile = (dirPath: string): string | null => {
  for (const ext of JS_EXTENSIONS) {
    const candidate = resolve(dirPath, `index${ext}`);
    const stats = tryStat(candidate);
    if (!stats?.isFile()) {
      continue;
    }
    return candidate;
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
    if (!candidateStats?.isFile()) {
      continue;
    }
    return candidate;
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
    const resolver = createRequire(pathToFileURL(importerPath).href);
    return resolver.resolve(specifier);
  } catch {
    return null;
  }
};

const createClientOnlyStub = async (
  task: ClientOnlyStubTransformTask
): Promise<RouteTransformResult> => {
  const { exportNames: directExportNames, exportAllModules } =
    await getExportNamesAndExportAll(task.code);
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
      const nestedPath = resolveExportAllModule(nestedSpecifier, modulePath);
      if (!nestedPath) {
        unresolvedExportAll.add(nestedSpecifier);
        continue;
      }
      await collectExportNamesFromModule(nestedPath);
    }
  };

  for (const specifier of exportAllModules) {
    const resolvedPath = resolveExportAllModule(specifier, task.resourcePath);
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
        `\`${relative(process.cwd(), task.resourcePath)}\`.`
    );
  }

  return {
    code: Array.from(exportNames)
      .map(name =>
        name === 'default'
          ? 'export default undefined;'
          : `export const ${name} = undefined;`
      )
      .join('\n'),
    map: null,
  };
};

const transformRouteModule = async (
  task: RouteModuleTransformTask
): Promise<RouteTransformResult> => {
  let code = task.code;

  const defaultExportMatch = code.match(/\n\s{0,}([\w\d_]+)\sas default,?/);
  if (defaultExportMatch && typeof defaultExportMatch.index === 'number') {
    code =
      code.slice(0, defaultExportMatch.index) +
      code.slice(defaultExportMatch.index + defaultExportMatch[0].length);
    code += `\nexport default ${defaultExportMatch[1]};`;
  }

  const ast = parse(code, { sourceType: 'module' });
  if (task.environmentName === 'web' && !task.ssr && task.isSpaMode) {
    const resolvedExportNames = collectProgramExportNames(ast.program);
    const isRootRoute = task.resourcePath === task.rootRoutePath;
    const relativePath = relative(process.cwd(), task.resourcePath);

    const invalidServerOnly = resolvedExportNames.filter(exp => {
      if (isRootRoute && exp === 'loader') return false;
      return SERVER_ONLY_ROUTE_EXPORTS_SET.has(exp);
    });

    if (invalidServerOnly.length > 0) {
      const list = invalidServerOnly.map(e => `\`${e}\``).join(', ');
      throw new Error(
        `SPA Mode: ${invalidServerOnly.length} invalid route export(s) in ` +
          `\`${relativePath}\`: ${list}. ` +
          `See https://reactrouter.com/how-to/spa for more information.`
      );
    }

    if (!isRootRoute && resolvedExportNames.includes('HydrateFallback')) {
      throw new Error(
        `SPA Mode: Invalid \`HydrateFallback\` export found in ` +
          `\`${relativePath}\`. ` +
          `\`HydrateFallback\` is only permitted on the root route in SPA Mode. ` +
          `See https://reactrouter.com/how-to/spa for more information.`
      );
    }
  }

  const removedServerOnlyExports =
    task.environmentName === 'web'
      ? removeExports(ast, SERVER_ONLY_ROUTE_EXPORTS)
      : false;
  transformRoute(ast);
  if (removedServerOnlyExports) {
    removeUnusedImports(ast);
  }

  return generate(ast, {
    sourceMaps: !task.isBuild,
    filename: task.resource,
    sourceFileName: task.resourcePath,
  });
};

export const executeRouteTransformTask = async (
  task: RouteTransformTask,
  options?: RouteTransformTaskOptions
): Promise<RouteTransformResult> => {
  switch (task.kind) {
    case 'routeClientEntry':
      return createRouteClientEntryArtifact({
        code: task.code,
        resourcePath: task.resourcePath,
        environmentName: task.environmentName,
        isBuild: task.isBuild,
        routeChunkCache: getRouteChunkCache(options),
        routeChunkConfig: task.routeChunkConfig,
      });
    case 'routeChunk':
      return createRouteChunkArtifact({
        code: task.code,
        resource: task.resource,
        resourcePath: task.resourcePath,
        isBuild: task.isBuild,
        routeChunkCache: getRouteChunkCache(options),
        routeChunkConfig: task.routeChunkConfig,
      });
    case 'splitRouteExports':
      return splitRouteExports(task, options);
    case 'clientOnlyStub':
      return createClientOnlyStub(task);
    case 'routeModule':
      return transformRouteModule(task);
  }
};
