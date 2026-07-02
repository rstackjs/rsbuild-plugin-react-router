import { generate, parse } from './yuku.js';
import { getExportNames } from './export-utils.js';
import { removeExports, removeUnusedImports } from './route-export-pruning.js';
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

const ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR = `
import * as ___EnsureClientRouteModuleForHMR_REACT___ from "react";
export function EnsureClientRouteModuleForHMR___() { return ___EnsureClientRouteModuleForHMR_REACT___.createElement(___EnsureClientRouteModuleForHMR_REACT___.Fragment, null) }
`;

const CLIENT_NON_COMPONENT_EXPORTS = [
  'clientAction',
  'clientLoader',
  'clientMiddleware',
  'handle',
  'meta',
  'links',
  'shouldRevalidate',
] as const;

const CLIENT_ROUTE_EXPORTS = [
  ...CLIENT_NON_COMPONENT_EXPORTS,
  ...RSC_CLIENT_COMPONENT_EXPORTS,
] as const;

const SERVER_COMPONENT_EXPORTS = RSC_SERVER_COMPONENT_EXPORTS;

const SERVER_ROUTE_EXPORTS = [
  ...SERVER_COMPONENT_EXPORTS,
  'loader',
  'action',
  'middleware',
  'headers',
] as const;

const CLIENT_ROUTE_EXPORTS_SET = new Set<string>(CLIENT_ROUTE_EXPORTS);
const SERVER_COMPONENT_EXPORTS_SET = new Set<string>(SERVER_COMPONENT_EXPORTS);
const SERVER_ROUTE_EXPORTS_SET = new Set<string>(SERVER_ROUTE_EXPORTS);

const MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS = RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS;

const CLIENT_CHUNK_QUERY = 'client-route-module';
const SERVER_MODULE_QUERY = 'server-route-module';

type RscRouteTransformOptions = {
  code: string;
  resourcePath: string;
  resourceQuery?: string;
  isRootRoute: boolean;
  routeId: string;
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

const hasQuery = (resourceQuery: string | undefined, key: string): boolean =>
  createResourceQueryParams(resourceQuery).has(key);

const getQueryValue = (
  resourceQuery: string | undefined,
  key: string
): string | null => createResourceQueryParams(resourceQuery).get(key);

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
  const clientRouteChunk = getQueryValue(resourceQuery, CLIENT_CHUNK_QUERY);
  if (clientRouteChunk) {
    return {
      kind: 'client-route-module',
      chunk: clientRouteChunk,
    };
  }

  if (hasQuery(resourceQuery, SERVER_MODULE_QUERY)) {
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
  if (isRootRoute) {
    return {
      chunkedExports: [] as RouteChunkExportName[],
      hasRouteChunks: false,
      hasRouteChunkByExportName: createEmptyRouteChunkByExportName(),
    };
  }

  if (!routeChunkExportNames.some(exportName => code.includes(exportName))) {
    return {
      chunkedExports: [] as RouteChunkExportName[],
      hasRouteChunks: false,
      hasRouteChunkByExportName: createEmptyRouteChunkByExportName(),
    };
  }

  return detectRouteChunks(code, routeChunkCache, resourcePath);
};

const getRouteChunkValidation = (
  exportNames: readonly string[],
  routeChunks: ReturnType<typeof getRouteChunks>
): Record<RouteChunkExportName, boolean> => {
  const exports = new Set(exportNames);
  return {
    clientAction:
      !exports.has('clientAction') ||
      routeChunks.hasRouteChunkByExportName.clientAction,
    clientLoader:
      !exports.has('clientLoader') ||
      routeChunks.hasRouteChunkByExportName.clientLoader,
    clientMiddleware:
      !exports.has('clientMiddleware') ||
      routeChunks.hasRouteChunkByExportName.clientMiddleware,
    HydrateFallback:
      !exports.has('HydrateFallback') ||
      routeChunks.hasRouteChunkByExportName.HydrateFallback,
  };
};

const validateRouteModuleExports = (exportNames: readonly string[]): void => {
  const exported = new Set(exportNames);
  const errors: string[] = [];
  for (const [clientExport, serverExport] of MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS) {
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

const createClientRouteEntry = async ({
  code,
  resourcePath,
  resourceQuery,
  isRootRoute,
  routeId,
  routeChunkCache,
  routeChunkConfig,
}: RscRouteTransformOptions): Promise<RscRouteTransformResult> => {
  const exportNames = await getExportNames(code);
  validateRouteModuleExports(exportNames);
  const routeChunks = getRouteChunks({
    code,
    resourcePath,
    isRootRoute,
    routeChunkCache,
  });
  let needsReactImport = false;

  const reexports = exportNames
    .filter(exportName => !isServerRouteExport(exportName))
    .map(exportName => {
      const chunkName = routeChunks.hasRouteChunkByExportName[
        exportName as RouteChunkExportName
      ]
        ? exportName
        : 'shared';
      const target = createClientRouteModuleId(
        resourcePath,
        resourceQuery,
        chunkName
      );
      if (exportName === 'default') {
        return `export { default } from ${JSON.stringify(target)};`;
      }
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
      return `export { ${exportName} } from ${JSON.stringify(target)};`;
    });

  if (shouldSplitRouteModules({ isRootRoute, routeChunkConfig })) {
    validateRouteChunks({
      config: routeChunkConfig,
      id: routeId,
      valid: getRouteChunkValidation(exportNames, routeChunks),
    });
  }

  return {
    code: `"use client";\n${
      needsReactImport ? 'import * as React from "react";\n' : ''
    }${reexports.join('\n')}\n`,
    map: null,
  };
};

const createServerRouteEntry = async ({
  code,
  resourcePath,
  resourceQuery,
  isRootRoute,
  routeId,
  routeChunkCache,
  routeChunkConfig,
}: RscRouteTransformOptions): Promise<RscRouteTransformResult> => {
  const exportNames = await getExportNames(code);
  validateRouteModuleExports(exportNames);
  const routeChunks = getRouteChunks({
    code,
    resourcePath,
    isRootRoute,
    routeChunkCache,
  });

  const clientTarget = createClientRouteModuleId(
    resourcePath,
    resourceQuery,
    'shared'
  );
  const serverTarget = createServerRouteModuleId(resourcePath, resourceQuery);
  const lines: string[] = [];
  let needsReactImport = false;
  const needsDefaultRootErrorBoundary =
    isRootRoute &&
    !exportNames.includes('ErrorBoundary') &&
    !exportNames.includes('ServerErrorBoundary');

  for (const exportName of exportNames) {
    if (isClientRouteExport(exportName)) {
      const chunkName = routeChunks.hasRouteChunkByExportName[
        exportName as RouteChunkExportName
      ]
        ? exportName
        : 'shared';
      const target = createClientRouteModuleId(
        resourcePath,
        resourceQuery,
        chunkName
      );
      lines.push(
        exportName === 'default'
          ? `export { default } from ${JSON.stringify(target)};`
          : `export { ${exportName} } from ${JSON.stringify(target)};`
      );
      continue;
    }
    if (isServerComponentExport(exportName)) {
      needsReactImport = true;
      lines.push(
        `import { ${exportName} as ${exportName}WithoutClientChunk } from ${JSON.stringify(
          serverTarget
        )};`
      );
      lines.push(`export function ${exportName}(props) {`);
      lines.push('  return React.createElement(React.Fragment, null,');
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
    if (isServerRouteExport(exportName)) {
      lines.push(
        `export { ${exportName} } from ${JSON.stringify(serverTarget)};`
      );
      continue;
    }
    lines.push(
      `export { ${exportName} } from ${JSON.stringify(serverTarget)};`
    );
  }

  if (needsDefaultRootErrorBoundary) {
    lines.push(
      `export { ErrorBoundary } from ${JSON.stringify(clientTarget)};`
    );
  }

  if (shouldSplitRouteModules({ isRootRoute, routeChunkConfig })) {
    validateRouteChunks({
      config: routeChunkConfig,
      id: routeId,
      valid: getRouteChunkValidation(exportNames, routeChunks),
    });
  }

  const prefix = needsReactImport
    ? `import * as React from "react";\nimport { EnsureClientRouteModuleForHMR___ } from ${JSON.stringify(
        clientTarget
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
  const exportNames = new Set(await getExportNames(code));
  const routeChunks = getRouteChunks(options);
  const exportsToRemove =
    clientRouteChunk === 'shared'
      ? [...SERVER_ROUTE_EXPORTS, ...routeChunks.chunkedExports]
      : [
          ...SERVER_ROUTE_EXPORTS,
          ...Array.from(exportNames).filter(
            exportName => exportName !== clientRouteChunk
          ),
        ];
  const removed = removeExports(ast, exportsToRemove);
  if (removed) {
    removeUnusedImports(ast);
  }
  const generated = generate(ast, {
    sourceMaps: false,
    filename: sourceFileName,
    sourceFileName,
  });
  let clientModuleCode = `"use client";\n${generated.code}`;

  if (
    clientRouteChunk === 'shared' &&
    options.isRootRoute &&
    !exportNames.has('ErrorBoundary') &&
    !exportNames.has('ServerErrorBoundary')
  ) {
    const hasRootLayout =
      exportNames.has('Layout') || exportNames.has('ServerLayout');
    clientModuleCode += `\nimport { createElement as __rr_createElement } from "react";\n`;
    clientModuleCode += `export function ErrorBoundary() {\n`;
    clientModuleCode += `  return __rr_createElement(${JSON.stringify(
      hasRootLayout ? 'main' : 'div'
    )}, null, "Unexpected Server Error");\n`;
    clientModuleCode += `}\n`;
  }

  return {
    code:
      clientModuleCode +
      (clientRouteChunk === 'shared'
        ? `\n${ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR}`
        : '') +
      (options.isDev
        ? `\nif (import.meta.webpackHot) { import.meta.webpackHot.accept(); }\n`
        : ''),
    map: null,
  };
};

const createServerRouteModule = (
  code: string,
  sourceFileName: string
): RscRouteTransformResult => {
  const ast = parse(code, { sourceType: 'module' });
  const removed = removeExports(ast, CLIENT_ROUTE_EXPORTS);
  if (removed) {
    removeUnusedImports(ast);
  }
  const generated = generate(ast, {
    sourceMaps: false,
    filename: sourceFileName,
    sourceFileName,
  });
  return {
    code: generated.code,
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
