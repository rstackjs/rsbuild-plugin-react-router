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
import { getProgram } from './route-ast.js';

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
  routeId?: string;
  devHmr?: boolean;
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
  devHmr?: boolean;
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

const isComponentishName = (name: string): boolean => /^[A-Z]/.test(name);

type AnyNode = {
  type?: string;
  name?: string;
  body?: { type?: string };
  callee?: { type?: string; name?: string };
  arguments?: Array<AnyNode>;
};

/**
 * Whether an expression that appears as the first argument of a wrapping call
 * resolves to a component, mirroring react-refresh/babel's
 * `findInnerComponents` recursion for the node kinds it accepts as arguments.
 */
const argumentResolvesToComponent = (node: AnyNode | undefined): boolean => {
  switch (node?.type) {
    case 'FunctionExpression':
      return true;
    case 'ArrowFunctionExpression':
      // Babel bails on a curried arrow (an arrow whose body is another arrow):
      // that is a component factory, not a component.
      return node.body?.type !== 'ArrowFunctionExpression';
    case 'Identifier':
      return !!node.name && isComponentishName(node.name);
    case 'CallExpression':
      return callResolvesToComponent(node);
    default:
      return false;
  }
};

/**
 * Whether a `CallExpression` resolves to a component: it must have at least one
 * argument, a callee that is not `Import`/`require*`/`import*`, and a first
 * argument that itself resolves to a component.
 */
const callResolvesToComponent = (node: AnyNode): boolean => {
  const args = node.arguments ?? [];
  if (args.length === 0) {
    return false;
  }
  const callee = node.callee;
  if (!callee || callee.type === 'Import') {
    return false;
  }
  if (callee.type === 'Identifier') {
    const calleeName = callee.name ?? '';
    if (calleeName.startsWith('require') || calleeName.startsWith('import')) {
      return false;
    }
  } else if (callee.type !== 'MemberExpression') {
    return false;
  }
  return argumentResolvesToComponent(args[0]);
};

/**
 * Whether a `VariableDeclarator` initializer resolves to a component, matching
 * react-refresh/babel's accepted init kinds: a non-curried arrow, a function
 * expression, a tagged template, or a qualifying call expression.
 */
const initResolvesToComponent = (init: AnyNode): boolean => {
  switch (init.type) {
    case 'FunctionExpression':
    case 'TaggedTemplateExpression':
      return true;
    case 'ArrowFunctionExpression':
      return init.body?.type !== 'ArrowFunctionExpression';
    case 'CallExpression':
      return callResolvesToComponent(init);
    default:
      return false;
  }
};

const collectDeclaredComponentNames = (
  declaration: {
    type?: string;
    id?: { name?: string };
    declarations?: Array<{
      id?: { type?: string; name?: string };
      init?: AnyNode;
    }>;
  },
  names: Set<string>
): void => {
  if (
    declaration.type === 'FunctionDeclaration' &&
    declaration.id?.name &&
    isComponentishName(declaration.id.name)
  ) {
    names.add(declaration.id.name);
    return;
  }
  if (declaration.type !== 'VariableDeclaration') {
    return;
  }
  const declarators = declaration.declarations ?? [];
  // Babel's react-refresh visitor only registers a `VariableDeclaration` with
  // exactly one declarator; multi-declarator declarations are skipped whole.
  if (declarators.length !== 1) {
    return;
  }
  const [declarator] = declarators;
  if (
    declarator?.id?.type === 'Identifier' &&
    declarator.id.name &&
    isComponentishName(declarator.id.name) &&
    declarator.init &&
    initResolvesToComponent(declarator.init)
  ) {
    names.add(declarator.id.name);
  }
};

/**
 * Names of top-level components that still need a React Fast Refresh
 * registration, following react-refresh/babel's name-based detection.
 *
 * SWC's refresh transform registers components in JSX/TSX sources, but
 * compiled route modules whose JSX was already lowered by an earlier loader
 * (e.g. MDX routes) reach it without JSX syntax and end up unregistered. An
 * unregistered component has no refresh family, so hot updates remount its
 * subtree instead of updating it in place.
 */
const collectUnregisteredComponentNames = (program: {
  body?: Array<{
    type?: string;
    declaration?: Parameters<typeof collectDeclaredComponentNames>[0];
    expression?: {
      type?: string;
      callee?: { type?: string; name?: string };
      arguments?: Array<{ type?: string; value?: unknown }>;
    };
  }>;
}): string[] => {
  const declared = new Set<string>();
  const registered = new Set<string>();
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
      collectDeclaredComponentNames(statement.declaration, declared);
      continue;
    }
    if (
      statement.type === 'ExpressionStatement' &&
      statement.expression?.type === 'CallExpression' &&
      statement.expression.callee?.type === 'Identifier' &&
      statement.expression.callee.name === '$RefreshReg$'
    ) {
      const nameArgument = statement.expression.arguments?.[1];
      if (typeof nameArgument?.value === 'string') {
        registered.add(nameArgument.value);
      }
      continue;
    }
    collectDeclaredComponentNames(
      statement as Parameters<typeof collectDeclaredComponentNames>[0],
      declared
    );
  }
  return [...declared].filter(name => !registered.has(name));
};

const buildComponentRefreshRegistrations = (names: string[]): string => {
  const registrations = names
    .map(
      name =>
        // react-refresh's runtime `register()` tags plain functions *and*
        // non-null exotic objects (memo/forwardRef `$$typeof` wrappers),
        // ignoring everything else safely -- so mirror that guard here. The
        // `typeof` short-circuit keeps this safe even for undeclared names.
        `  if (typeof ${name} === 'function' || (typeof ${name} === 'object' && ${name} !== null)) $RefreshReg$(${name}, ${JSON.stringify(name)});`
    )
    .join('\n');
  return `\nif (typeof $RefreshReg$ === 'function') {\n${registrations}\n}\n`;
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
    const resolvedExportNames = collectProgramExportNames(getProgram(ast));
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

  const result = generate(ast, {
    // Rsbuild merges this map with its downstream SWC transform. Only pay the
    // code-generation cost when this environment actually emits JS maps.
    sourceMaps: task.sourceMaps,
    filename: task.resource,
    sourceFileName: task.resourcePath,
  });

  if (task.devHmr && task.environmentName === 'web' && !task.isBuild) {
    const unregisteredComponents = collectUnregisteredComponentNames(
      getProgram(ast)
    );
    if (unregisteredComponents.length > 0) {
      result.code += buildComponentRefreshRegistrations(unregisteredComponents);
    }
  }

  return result;
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
        routeId: task.routeId,
        devHmr: task.devHmr,
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
