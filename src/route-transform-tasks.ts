import { basename as pathBasename, relative } from 'pathe';
import { generate, parse } from './yuku.js';
import {
  SERVER_ONLY_ROUTE_EXPORTS,
  SERVER_ONLY_ROUTE_EXPORTS_SET,
} from './constants.js';
import { collectProgramExportNames } from './export-utils.js';
import {
  removeExports,
  removeUnusedImports,
  transformRoute,
} from './plugin-utils.js';
import {
  collectClientOnlyStubExportNames,
  type RouteExportResolver,
} from './route-export-resolution.js';
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
  resolveExportAllModule?: RouteExportResolver;
};

export type RouteModuleTransformTask = BaseRouteTransformTask & {
  kind: 'routeModule';
  resource: string;
  environmentName: string;
  sourceMaps: boolean;
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

const createClientOnlyStub = async (
  task: ClientOnlyStubTransformTask
): Promise<RouteTransformResult> => {
  const exportNames = await collectClientOnlyStubExportNames(
    task.code,
    task.resourcePath,
    task.resolveExportAllModule
  );

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
      ? removeExports(
          ast,
          SERVER_ONLY_ROUTE_EXPORTS,
          SERVER_ONLY_ROUTE_EXPORTS_SET
        )
      : false;
  transformRoute(ast);
  if (removedServerOnlyExports) {
    removeUnusedImports(ast);
  }

  return generate(ast, {
    // Rsbuild merges this map with its downstream SWC transform. Only pay the
    // code-generation cost when this environment actually emits JS maps.
    sourceMaps: task.sourceMaps,
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
