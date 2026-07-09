import { dirname } from 'pathe';

import { generate, parse } from './yuku.js';
import {
  CLIENT_NON_COMPONENT_EXPORTS,
  SERVER_ONLY_ROUTE_EXPORTS,
} from './constants.js';
import { getExportNames } from './export-utils.js';
import {
  getExportedName,
  getPatternIdentifierNames,
  getProgram,
  type AnyNode,
} from './route-ast.js';
import {
  collectReferencedNames,
  removeExports,
  removeUnusedImports,
} from './route-export-pruning.js';
import { resolveQuerylessRouteImportRequest } from './route-imports.js';
import {
  createEmptyRouteChunkByExportName,
  detectRouteChunks,
  routeChunkExportNames,
  validateRouteChunks,
  type RouteChunkCache,
  type RouteChunkConfig,
  type RouteChunkExportName,
} from './route-chunks.js';
import {
  RSC_CLIENT_COMPONENT_EXPORTS,
  RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS,
  RSC_SERVER_COMPONENT_EXPORTS,
} from './rsc-route-exports.js';
import type { Route } from './types.js';

const ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR = `
import * as ___EnsureClientRouteModuleForHMR_REACT___ from "react";
export function EnsureClientRouteModuleForHMR___() { return ___EnsureClientRouteModuleForHMR_REACT___.createElement(___EnsureClientRouteModuleForHMR_REACT___.Fragment, null) }
`;

const CLIENT_ROUTE_EXPORTS = [
  ...CLIENT_NON_COMPONENT_EXPORTS,
  ...RSC_CLIENT_COMPONENT_EXPORTS,
] as const;

const SERVER_ROUTE_EXPORTS = [
  ...RSC_SERVER_COMPONENT_EXPORTS,
  ...SERVER_ONLY_ROUTE_EXPORTS,
] as const;

const CLIENT_ROUTE_EXPORTS_SET = new Set<string>(CLIENT_ROUTE_EXPORTS);
const SERVER_COMPONENT_EXPORTS_SET = new Set<string>(
  RSC_SERVER_COMPONENT_EXPORTS
);
const SERVER_ROUTE_EXPORTS_SET = new Set<string>(SERVER_ROUTE_EXPORTS);

const CLIENT_CHUNK_QUERY = 'client-route-module';
const SERVER_MODULE_QUERY = 'server-route-module';
const ROUTE_CLIENT_MODULE_CHUNK = 'route';

type RscRouteTransformOptions = {
  code: string;
  resourcePath: string;
  resourceQuery?: string;
  isRootRoute: boolean;
  routeId: string;
  routeByFilePath?: ReadonlyMap<string, Route>;
  routeChunkCache: RouteChunkCache;
  routeChunkConfig: RouteChunkConfig;
  isServerEnvironment: boolean;
  isDev: boolean;
};

type RscRouteTransformResult = {
  code: string;
  map: null | ReturnType<typeof generate>['map'];
};

type RscRouteTransformTarget =
  | { kind: 'client-route-module'; chunk: string }
  | { kind: 'server-route-module' }
  | { kind: 'server-route-entry' }
  | { kind: 'client-route-entry' };

type RscRouteExportPlan = {
  exportNames: readonly string[];
  exportNameSet: ReadonlySet<string>;
  routeChunks: ReturnType<typeof getRouteChunks>;
  sharedClientTarget: string;
  serverTarget: string;
  needsDefaultRootErrorBoundary: boolean;
  clientTargetFor(exportName: string): string;
};

const createResourceQueryParams = (
  resourceQuery: string | undefined
): URLSearchParams =>
  new URLSearchParams((resourceQuery ?? '').replace(/^\?/, ''));

const createRouteModuleQueryParams = (
  resourceQuery: string | undefined
): URLSearchParams => {
  const params = createResourceQueryParams(resourceQuery);
  params.delete(CLIENT_CHUNK_QUERY);
  params.delete(SERVER_MODULE_QUERY);
  return params;
};

const createClientRouteModuleId = (
  resourcePath: string,
  resourceQuery: string | undefined,
  value: string
): string => {
  const params = createRouteModuleQueryParams(resourceQuery);
  params.set(CLIENT_CHUNK_QUERY, value);
  return `${resourcePath}?${params.toString()}`;
};

const createServerRouteModuleId = (
  resourcePath: string,
  resourceQuery: string | undefined
): string => {
  const params = createRouteModuleQueryParams(resourceQuery);
  params.set(SERVER_MODULE_QUERY, '');
  return `${resourcePath}?${params.toString()}`;
};

const isClientRouteExport = (name: string): boolean =>
  CLIENT_ROUTE_EXPORTS_SET.has(name);

const isServerRouteExport = (name: string): boolean =>
  SERVER_ROUTE_EXPORTS_SET.has(name);

const isServerComponentExport = (name: string): boolean =>
  SERVER_COMPONENT_EXPORTS_SET.has(name);

const isSplittableRouteChunkExport = (
  exportName: string
): exportName is RouteChunkExportName =>
  routeChunkExportNames.includes(exportName as RouteChunkExportName);

const createReexport = (exportName: string, target: string): string =>
  exportName === 'default'
    ? `export { default } from ${JSON.stringify(target)};`
    : `export { ${exportName} } from ${JSON.stringify(target)};`;

const shouldSplitRouteModules = ({
  isRootRoute,
  routeChunkConfig,
}: Pick<
  RscRouteTransformOptions,
  'isRootRoute' | 'routeChunkConfig'
>): boolean => routeChunkConfig.splitRouteModules === 'enforce' && !isRootRoute;

const resolveRscRouteTransformTarget = ({
  resourceQuery,
  isServerEnvironment,
}: Pick<
  RscRouteTransformOptions,
  'resourceQuery' | 'isServerEnvironment'
>): RscRouteTransformTarget => {
  const params = createResourceQueryParams(resourceQuery);
  const clientRouteChunk = params.get(CLIENT_CHUNK_QUERY);
  if (clientRouteChunk) {
    return {
      kind: 'client-route-module',
      chunk: clientRouteChunk,
    };
  }

  if (params.has(SERVER_MODULE_QUERY)) {
    return { kind: 'server-route-module' };
  }

  return {
    kind: isServerEnvironment ? 'server-route-entry' : 'client-route-entry',
  };
};

const getRouteChunks = ({
  code,
  resourcePath,
  isRootRoute,
  routeChunkCache,
}: Pick<
  RscRouteTransformOptions,
  'code' | 'resourcePath' | 'isRootRoute' | 'routeChunkCache'
>) => {
  const emptyRouteChunks = () => ({
    chunkedExports: [] as RouteChunkExportName[],
    hasRouteChunks: false,
    hasRouteChunkByExportName: createEmptyRouteChunkByExportName(),
  });

  if (isRootRoute) {
    return emptyRouteChunks();
  }

  if (!routeChunkExportNames.some(exportName => code.includes(exportName))) {
    return emptyRouteChunks();
  }

  return detectRouteChunks(code, routeChunkCache, resourcePath);
};

const getRouteChunkValidation = (
  exportNames: readonly string[],
  routeChunks: ReturnType<typeof getRouteChunks>
): Record<RouteChunkExportName, boolean> => {
  const exports = new Set(exportNames);
  return Object.fromEntries(
    routeChunkExportNames.map(exportName => [
      exportName,
      !exports.has(exportName) ||
        routeChunks.hasRouteChunkByExportName[exportName],
    ])
  ) as Record<RouteChunkExportName, boolean>;
};

const createExportReferenceMap = (program: ReturnType<typeof getProgram>) => {
  const referencesByExportName = new Map<string, Set<string>>();
  const addReferences = (exportName: string, node: AnyNode) => {
    referencesByExportName.set(exportName, collectReferencedNames(node));
  };

  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportDefaultDeclaration') {
      addReferences('default', statement);
      continue;
    }

    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }

    for (const specifier of statement.specifiers ?? []) {
      if (specifier.type !== 'ExportSpecifier') {
        continue;
      }
      const exportedName = getExportedName(specifier);
      if (exportedName) {
        addReferences(exportedName, specifier);
      }
    }

    const declaration = statement.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations ?? []) {
        for (const name of getPatternIdentifierNames(declarator.id)) {
          addReferences(name, declarator);
        }
      }
      continue;
    }

    if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id?.name
    ) {
      addReferences(declaration.id.name, declaration);
    }
  }

  return referencesByExportName;
};

const collectRouteClientDependencyExports = (
  program: ReturnType<typeof getProgram>,
  plan: RscRouteExportPlan
): Set<string> => {
  const referencesByExportName = createExportReferenceMap(program);
  const dependencyExports = new Set<string>();
  const pending: string[] = [];

  for (const exportName of plan.exportNames) {
    if (isClientRouteExport(exportName)) {
      pending.push(...(referencesByExportName.get(exportName) ?? []));
    }
  }

  while (pending.length > 0) {
    const exportName = pending.pop();
    if (
      !exportName ||
      dependencyExports.has(exportName) ||
      isClientRouteExport(exportName) ||
      isServerRouteExport(exportName)
    ) {
      continue;
    }

    const references = referencesByExportName.get(exportName);
    if (!references) {
      continue;
    }

    dependencyExports.add(exportName);
    pending.push(...references);
  }

  return dependencyExports;
};

const stripPreservedDependencyExports = (
  program: ReturnType<typeof getProgram>,
  dependencyExports: ReadonlySet<string>
): void => {
  if (dependencyExports.size === 0) {
    return;
  }

  for (let index = 0; index < program.body.length; index += 1) {
    const statement = program.body[index];
    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }

    if (statement.specifiers?.length) {
      statement.specifiers = statement.specifiers.filter(
        (specifier: AnyNode) => {
          const exportedName =
            specifier.type === 'ExportSpecifier'
              ? getExportedName(specifier)
              : null;
          return !exportedName || !dependencyExports.has(exportedName);
        }
      );
      if (statement.specifiers.length === 0 && !statement.declaration) {
        program.body.splice(index, 1);
        index -= 1;
        continue;
      }
    }

    const declaration = statement.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      const preservedDeclarations: AnyNode[] = [];
      const exportedDeclarations: AnyNode[] = [];
      for (const declarator of declaration.declarations ?? []) {
        const names = getPatternIdentifierNames(declarator.id);
        if ([...names].some(name => dependencyExports.has(name))) {
          preservedDeclarations.push(declarator);
        } else {
          exportedDeclarations.push(declarator);
        }
      }

      if (preservedDeclarations.length === 0) {
        continue;
      }

      const localDeclaration = {
        ...declaration,
        declarations: preservedDeclarations,
      };
      if (exportedDeclarations.length === 0) {
        program.body[index] = localDeclaration;
        continue;
      }

      program.body.splice(index, 1, localDeclaration, {
        ...statement,
        declaration: {
          ...declaration,
          declarations: exportedDeclarations,
        },
      });
      index += 1;
      continue;
    }

    if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id?.name &&
      dependencyExports.has(declaration.id.name)
    ) {
      program.body[index] = declaration;
    }
  }
};

const validateRouteModuleExports = (exportNames: readonly string[]): void => {
  const exported = new Set(exportNames);
  const errors: string[] = [];
  for (const [
    clientExport,
    serverExport,
  ] of RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS) {
    if (exported.has(clientExport) && exported.has(serverExport)) {
      errors.push(`- ${clientExport} and ${serverExport}`);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      'Invalid route module exports. The following pairs of exports are ' +
        `mutually exclusive and cannot be exported from the same module:\n${errors.join(
          '\n'
        )}`
    );
  }
};

const createRscRouteExportPlan = async (
  options: RscRouteTransformOptions
): Promise<RscRouteExportPlan> => {
  const exportNames = await getExportNames(options.code);
  const exportNameSet = new Set(exportNames);
  const routeChunks = getRouteChunks(options);
  const sharedClientTarget = createClientRouteModuleId(
    options.resourcePath,
    options.resourceQuery,
    'shared'
  );
  const serverTarget = createServerRouteModuleId(
    options.resourcePath,
    options.resourceQuery
  );

  return {
    exportNames,
    exportNameSet,
    routeChunks,
    sharedClientTarget,
    serverTarget,
    needsDefaultRootErrorBoundary:
      options.isRootRoute &&
      !exportNameSet.has('ErrorBoundary') &&
      !exportNameSet.has('ServerErrorBoundary'),
    clientTargetFor(exportName) {
      if (isSplittableRouteChunkExport(exportName)) {
        const chunkName = routeChunks.hasRouteChunkByExportName[exportName]
          ? exportName
          : ROUTE_CLIENT_MODULE_CHUNK;
        return createClientRouteModuleId(
          options.resourcePath,
          options.resourceQuery,
          chunkName
        );
      }
      if (isClientRouteExport(exportName)) {
        return createClientRouteModuleId(
          options.resourcePath,
          options.resourceQuery,
          ROUTE_CLIENT_MODULE_CHUNK
        );
      }
      return createClientRouteModuleId(
        options.resourcePath,
        options.resourceQuery,
        'shared'
      );
    },
  };
};

const validateRscRouteExportPlan = (
  plan: RscRouteExportPlan,
  options: RscRouteTransformOptions
): void => {
  validateRouteModuleExports(plan.exportNames);
  if (shouldSplitRouteModules(options)) {
    validateRouteChunks({
      config: options.routeChunkConfig,
      id: options.routeId,
      valid: getRouteChunkValidation(plan.exportNames, plan.routeChunks),
    });
  }
};

const createClientRouteEntry = async (
  options: RscRouteTransformOptions
): Promise<RscRouteTransformResult> => {
  const plan = await createRscRouteExportPlan(options);
  validateRscRouteExportPlan(plan, options);
  let needsReactImport = false;

  const reexports = plan.exportNames
    .filter(exportName => !isServerRouteExport(exportName))
    .map(exportName => {
      const target = plan.clientTargetFor(exportName);
      if (exportName === 'HydrateFallback') {
        needsReactImport = true;
        return `export const HydrateFallback = React.lazy(() => import(${JSON.stringify(
          target
        )}).then(mod => ({ default: mod.HydrateFallback })));`;
      }
      if (
        exportName === 'clientAction' ||
        exportName === 'clientLoader' ||
        exportName === 'clientMiddleware'
      ) {
        return `export const ${exportName} = async (...args) => import(${JSON.stringify(
          target
        )}).then(mod => mod.${exportName}(...args));`;
      }
      return createReexport(exportName, target);
    });

  return {
    code: `"use client";\n${
      needsReactImport ? 'import * as React from "react";\n' : ''
    }${reexports.join('\n')}\n`,
    map: null,
  };
};

const createServerRouteEntry = async (
  options: RscRouteTransformOptions
): Promise<RscRouteTransformResult> => {
  const plan = await createRscRouteExportPlan(options);
  validateRscRouteExportPlan(plan, options);
  const lines: string[] = [];
  let needsReactImport = false;

  for (const exportName of plan.exportNames) {
    if (isClientRouteExport(exportName)) {
      lines.push(createReexport(exportName, plan.clientTargetFor(exportName)));
      continue;
    }
    if (isServerComponentExport(exportName)) {
      needsReactImport = true;
      lines.push(
        `import { ${exportName} as ${exportName}WithoutClientChunk } from ${JSON.stringify(
          plan.serverTarget
        )};`
      );
      lines.push(`export function ${exportName}(props) {`);
      lines.push('  return React.createElement(React.Fragment, null,');
      // The server route module carries the `'use server-entry'` directive, so
      // the rspack RSC runtime wraps its component export with
      // `createServerEntry`, attaching `entryCssFiles` for the CSS the module
      // graph contributes. Render those as stylesheet links at the top of the
      // stream (mirrors upstream's `import.meta.viteRsc.loadCss()`); React's
      // float support hoists them into `<head>`.
      lines.push(
        `    ...(${exportName}WithoutClientChunk.entryCssFiles ?? []).map(href =>`
      );
      lines.push(
        '      React.createElement("link", { key: href, rel: "stylesheet", href: href, precedence: "default" })),'
      );
      lines.push(
        '    React.createElement(EnsureClientRouteModuleForHMR___, null),'
      );
      lines.push(
        `    React.createElement(${exportName}WithoutClientChunk, props),`
      );
      lines.push('  );');
      lines.push('}');
      continue;
    }
    lines.push(createReexport(exportName, plan.serverTarget));
  }

  if (plan.needsDefaultRootErrorBoundary) {
    lines.push(
      `export { ErrorBoundary } from ${JSON.stringify(plan.sharedClientTarget)};`
    );
  }

  const prefix = needsReactImport
    ? `import * as React from "react";\nimport { EnsureClientRouteModuleForHMR___ } from ${JSON.stringify(
        plan.sharedClientTarget
      )};\n`
    : '';
  return {
    code: `${prefix}${lines.join('\n')}\n`,
    map: null,
  };
};

const createClientRouteModule = async (
  code: string,
  sourceFileName: string,
  clientRouteChunk: string,
  options: RscRouteTransformOptions
): Promise<RscRouteTransformResult> => {
  const ast = parse(code, { sourceType: 'module' });
  const program = getProgram(ast);
  const plan = await createRscRouteExportPlan(options);
  if (clientRouteChunk === ROUTE_CLIENT_MODULE_CHUNK) {
    stripPreservedDependencyExports(
      program,
      collectRouteClientDependencyExports(program, plan)
    );
  }
  const exportsToRemove =
    clientRouteChunk === 'shared'
      ? [...SERVER_ROUTE_EXPORTS, ...CLIENT_ROUTE_EXPORTS]
      : clientRouteChunk === ROUTE_CLIENT_MODULE_CHUNK
        ? [
            ...SERVER_ROUTE_EXPORTS,
            ...plan.exportNames.filter(
              exportName => !isClientRouteExport(exportName)
            ),
          ]
        : [
            ...SERVER_ROUTE_EXPORTS,
            ...plan.exportNames.filter(
              exportName => exportName !== clientRouteChunk
            ),
          ];
  const removed = removeExports(ast, exportsToRemove);
  if (removed) {
    removeUnusedImports(ast);
  }
  rewriteRscClientRouteImports(ast, sourceFileName, clientRouteChunk, options);
  const generated = generate(ast, {
    sourceMaps: false,
    filename: sourceFileName,
    sourceFileName,
  });
  let clientModuleCode = `"use client";\n${generated.code}`;

  if (clientRouteChunk === 'shared' && plan.needsDefaultRootErrorBoundary) {
    const hasRootLayout =
      plan.exportNameSet.has('Layout') ||
      plan.exportNameSet.has('ServerLayout');
    clientModuleCode += `\nimport { createElement as __rr_createElement } from "react";\n`;
    clientModuleCode += `export function ErrorBoundary() {\n`;
    clientModuleCode += `  return __rr_createElement(${JSON.stringify(
      hasRootLayout ? 'main' : 'div'
    )}, null, "Unexpected Server Error");\n`;
    clientModuleCode += `}\n`;
  }

  const rscUpdateAction =
    clientRouteChunk === ROUTE_CLIENT_MODULE_CHUNK &&
    plan.exportNameSet.has('default')
      ? 'location.reload();'
      : 'globalThis.__reactRouterDataRouter?.navigate?.(location.pathname + location.search + location.hash, { replace: true, preventScrollReset: true });';

  return {
    code:
      clientModuleCode +
      (clientRouteChunk === 'shared'
        ? `\n${ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR}`
        : '') +
      (options.isDev
        ? `\nif (import.meta.webpackHot) { import.meta.webpackHot.accept(() => { requestAnimationFrame(() => { ${rscUpdateAction} }); }); }\n`
        : ''),
    map: null,
  };
};

const rewriteRouteImportSource = (
  statement: AnyNode,
  sourceFileName: string,
  clientRouteChunk: string,
  options: RscRouteTransformOptions
): void => {
  const source = statement.source;
  if (!source || typeof source.value !== 'string' || !options.routeByFilePath) {
    return;
  }
  const resolved = resolveQuerylessRouteImportRequest({
    compilerName: options.isServerEnvironment ? 'node' : 'web',
    context: dirname(sourceFileName),
    issuer: `${sourceFileName}?client-route-module=${clientRouteChunk}`,
    request: source.value,
    routeByFilePath: options.routeByFilePath,
  });
  if (resolved) {
    source.value = resolved;
    source.raw = JSON.stringify(resolved);
  }
};

const rewriteRscClientRouteImports = (
  ast: ReturnType<typeof parse>,
  sourceFileName: string,
  clientRouteChunk: string,
  options: RscRouteTransformOptions
): void => {
  for (const statement of getProgram(ast).body ?? []) {
    if (
      statement.type === 'ImportDeclaration' ||
      statement.type === 'ExportAllDeclaration' ||
      statement.type === 'ExportNamedDeclaration'
    ) {
      rewriteRouteImportSource(
        statement,
        sourceFileName,
        clientRouteChunk,
        options
      );
    }
  }
};

const createServerRouteModule = async (
  code: string,
  sourceFileName: string
): Promise<RscRouteTransformResult> => {
  const ast = parse(code, { sourceType: 'module' });
  const removedClientLogicExports = removeExports(
    ast,
    CLIENT_NON_COMPONENT_EXPORTS
  );
  const removedClientComponentExports = removeExports(
    ast,
    RSC_CLIENT_COMPONENT_EXPORTS,
    new Set(RSC_CLIENT_COMPONENT_EXPORTS),
    { pruneDeadDeclarations: false }
  );
  const removed = removedClientLogicExports || removedClientComponentExports;
  if (removed) {
    removeUnusedImports(ast);
  }
  const generated = generate(ast, {
    sourceMaps: false,
    filename: sourceFileName,
    sourceFileName,
  });
  // Server-first routes import their CSS from the server (RSC) layer, so it
  // never reaches the client compilation's `<Links>`. Mark modules that export
  // a server component with the `'use server-entry'` directive so the rspack
  // RSC runtime records the module graph's CSS in `entryCssFiles`; the server
  // route entry then streams those links (see `createServerRouteEntry`).
  const exportNames = new Set(await getExportNames(code));
  const hasServerComponentExport = RSC_SERVER_COMPONENT_EXPORTS.some(name =>
    exportNames.has(name)
  );
  return {
    code: hasServerComponentExport
      ? `'use server-entry';\n${generated.code}`
      : generated.code,
    map: null,
  };
};

export const transformRscRouteModule = async (
  options: RscRouteTransformOptions
): Promise<RscRouteTransformResult> => {
  const target = resolveRscRouteTransformTarget(options);
  switch (target.kind) {
    case 'client-route-module':
      return createClientRouteModule(
        options.code,
        options.resourcePath,
        target.chunk,
        options
      );
    case 'server-route-module':
      return createServerRouteModule(options.code, options.resourcePath);
    case 'server-route-entry':
      return createServerRouteEntry(options);
    case 'client-route-entry':
      return createClientRouteEntry(options);
  }
};
