import {
  Analyzer,
  type Module,
  type Symbol as YukuSymbol,
} from 'yuku-analyzer';
import { strip } from 'yuku-codegen';
import { walk } from 'yuku-parser';
import { normalize, relative, resolve } from 'pathe';

type AnyNode = Record<string, any>;

export type RouteChunkExportName =
  | 'clientAction'
  | 'clientLoader'
  | 'clientMiddleware'
  | 'HydrateFallback';

export type RouteChunkName = 'main' | RouteChunkExportName;

export type RouteChunkConfig = {
  splitRouteModules?: boolean | 'enforce';
  appDirectory: string;
  rootRouteFile: string;
};

type RouteChunkCacheEntry<T> = {
  value: T;
  version: string;
};

export type RouteChunkCache = Map<string, RouteChunkCacheEntry<unknown>>;

export type RouteChunkInfo = {
  hasRouteChunks: boolean;
  hasRouteChunkByExportName: Record<RouteChunkExportName, boolean>;
  chunkedExports: RouteChunkExportName[];
};

export const routeChunkExportNames: RouteChunkExportName[] = [
  'clientAction',
  'clientLoader',
  'clientMiddleware',
  'HydrateFallback',
];

export const routeChunkNames: RouteChunkName[] = [
  'main',
  ...routeChunkExportNames,
];

const createRouteChunkExportMap = (
  getValue: (exportName: RouteChunkExportName) => boolean
): Record<RouteChunkExportName, boolean> =>
  Object.fromEntries(
    routeChunkExportNames.map(exportName => [exportName, getValue(exportName)])
  ) as Record<RouteChunkExportName, boolean>;

export const emptyRouteChunkSnippet = (reason: string): string =>
  `Math.random()<0&&console.log(${JSON.stringify(reason)});`;

const routeChunkQueryStringPrefix = '?route-chunk=';

const routeChunkQueryStrings: Record<RouteChunkName, string> = {
  main: `${routeChunkQueryStringPrefix}main`,
  clientAction: `${routeChunkQueryStringPrefix}clientAction`,
  clientLoader: `${routeChunkQueryStringPrefix}clientLoader`,
  clientMiddleware: `${routeChunkQueryStringPrefix}clientMiddleware`,
  HydrateFallback: `${routeChunkQueryStringPrefix}HydrateFallback`,
};

const routeChunkEntrySuffix: Record<RouteChunkExportName, string> = {
  clientAction: 'client-action',
  clientLoader: 'client-loader',
  clientMiddleware: 'client-middleware',
  HydrateFallback: 'hydrate-fallback',
};

const invariant: (value: unknown, message: string) => asserts value = (
  value,
  message
) => {
  if (!value) {
    throw new Error(message);
  }
};

const getOrSetFromCache = <T>(
  cache: RouteChunkCache,
  key: string,
  version: string,
  getValue: () => T
): T => {
  const entry = cache.get(key) as RouteChunkCacheEntry<T> | undefined;
  if (entry?.version === version) {
    return entry.value;
  }
  const value = getValue();
  cache.set(key, { value, version });
  return value;
};

type AnalyzedModule = {
  module: Module;
  // Dependency sets use these node identities. Consumers must shallow-copy
  // any node whose children they narrow instead of mutating this cached AST.
  program: AnyNode;
};

const analyzeCode = (
  code: string,
  cache: RouteChunkCache,
  cacheKey: string
): AnalyzedModule => {
  return getOrSetFromCache(cache, `${cacheKey}::analyzeCode`, code, () => {
    const analyzer = new Analyzer();
    const module = analyzer.addFile(cacheKey, code, {
      lang: 'tsx',
      sourceType: 'module',
      preserveParens: true,
    });
    const errors = module.diagnostics.filter(
      diagnostic => diagnostic.severity === 'error'
    );
    if (errors.length > 0) {
      throw new Error(errors.map(error => error.message).join('\n'));
    }
    return { module, program: module.ast as AnyNode };
  });
};

type ExportDependencies = {
  topLevelStatements: Set<AnyNode>;
  topLevelNonModuleStatements: Set<AnyNode>;
  importedIdentifierNames: Set<string>;
  exportedVariableDeclarators: Set<AnyNode>;
};

const getTopLevelStatementForNode = (
  module: Module,
  node: AnyNode
): AnyNode => {
  let current: AnyNode = node;
  let parent = module.parentOf(current as never) as AnyNode | null;
  while (parent && parent.type !== 'Program') {
    current = parent;
    parent = module.parentOf(current as never) as AnyNode | null;
  }
  invariant(parent?.type === 'Program', 'Expected node to be within Program');
  return current;
};

const addTopLevelStatement = (
  module: Module,
  dependencies: ExportDependencies,
  node: AnyNode
) => {
  const statement = getTopLevelStatementForNode(module, node);
  dependencies.topLevelStatements.add(statement);
  if (
    statement.type !== 'ImportDeclaration' &&
    !statement.type.startsWith('Export')
  ) {
    dependencies.topLevelNonModuleStatements.add(statement);
  }
};

const getVariableDeclaratorForNode = (
  module: Module,
  node: AnyNode
): AnyNode | null => {
  let current: AnyNode | null = node;
  while (current) {
    if (current.type === 'VariableDeclarator') {
      return current;
    }
    current = module.parentOf(current as never) as AnyNode | null;
  }
  return null;
};

const getExportedName = (exported: AnyNode): string => {
  if (exported.type === 'Identifier') {
    return exported.name;
  }
  return String(exported.value);
};

const setsIntersect = <T>(set1: Set<T>, set2: Set<T>) => {
  let smallerSet = set1;
  let largerSet = set2;
  if (set1.size > set2.size) {
    smallerSet = set2;
    largerSet = set1;
  }
  for (const element of smallerSet) {
    if (largerSet.has(element)) {
      return true;
    }
  }
  return false;
};

const getExportDependencies = (
  code: string,
  cache: RouteChunkCache,
  cacheKey: string
): Map<string, ExportDependencies> => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::getExportDependencies`,
    code,
    () => {
      const { module } = analyzeCode(code, cache, cacheKey);
      const exportDependencies = new Map<string, ExportDependencies>();

      const handleExport = (
        exportName: string,
        exportNode: AnyNode,
        localSymbol: YukuSymbol | null
      ) => {
        const dependencies: ExportDependencies = {
          topLevelStatements: new Set(),
          topLevelNonModuleStatements: new Set(),
          importedIdentifierNames: new Set(),
          exportedVariableDeclarators: new Set(),
        };
        const visitedSymbols = new Set<YukuSymbol>();
        const scannedNodes = new Set<AnyNode>();

        const scanNode = (node: AnyNode) => {
          if (scannedNodes.has(node)) {
            return;
          }
          scannedNodes.add(node);
          walk(node as any, {
            Identifier(node: AnyNode) {
              const reference = module.referenceOf(node as never);
              if (reference?.symbol) {
                visitSymbol(reference.symbol);
              }
            },
          });
        };

        const visitSymbol = (symbol: YukuSymbol) => {
          if (visitedSymbols.has(symbol)) {
            return;
          }
          visitedSymbols.add(symbol);

          for (const declaration of symbol.declarations as AnyNode[]) {
            const statement = getTopLevelStatementForNode(module, declaration);
            addTopLevelStatement(module, dependencies, declaration);
            if (statement.type === 'ImportDeclaration') {
              dependencies.importedIdentifierNames.add(symbol.name);
            }
            const declarator = getVariableDeclaratorForNode(
              module,
              declaration
            );
            if (
              declarator &&
              getTopLevelStatementForNode(module, declarator).type ===
                'ExportNamedDeclaration'
            ) {
              dependencies.exportedVariableDeclarators.add(declarator);
            }
            scanNode(declarator ?? statement);
          }

          for (const reference of symbol.references as any[]) {
            const statement = getTopLevelStatementForNode(
              module,
              reference.node
            );
            addTopLevelStatement(module, dependencies, reference.node);
            const declarator = getVariableDeclaratorForNode(
              module,
              reference.node
            );
            scanNode(declarator ?? statement);
          }
        };

        addTopLevelStatement(module, dependencies, exportNode);

        if (localSymbol) {
          visitSymbol(localSymbol);
        } else {
          const statement = getTopLevelStatementForNode(module, exportNode);
          scanNode(statement);
        }

        exportDependencies.set(exportName, dependencies);
      };

      for (const exp of module.exports as any[]) {
        if (exp.typeOnly || exp.isStar || exp.isExportEquals) {
          continue;
        }
        handleExport(exp.name, exp.node as AnyNode, exp.local ?? null);
      }

      return exportDependencies;
    }
  );
};

const hasChunkableExport = (
  code: string,
  exportName: string,
  cache: RouteChunkCache,
  cacheKey: string
) => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::hasChunkableExport::${exportName}`,
    code,
    () => {
      const exportDependencies = getExportDependencies(code, cache, cacheKey);
      const dependencies = exportDependencies.get(exportName);
      if (!dependencies) {
        return false;
      }
      for (const [
        currentExportName,
        currentDependencies,
      ] of exportDependencies) {
        if (currentExportName === exportName) {
          continue;
        }
        if (
          setsIntersect(
            currentDependencies.topLevelNonModuleStatements,
            dependencies.topLevelNonModuleStatements
          )
        ) {
          return false;
        }
      }
      if (dependencies.exportedVariableDeclarators.size > 1) {
        return false;
      }
      if (dependencies.exportedVariableDeclarators.size > 0) {
        for (const [
          currentExportName,
          currentDependencies,
        ] of exportDependencies) {
          if (currentExportName === exportName) {
            continue;
          }
          if (
            setsIntersect(
              currentDependencies.exportedVariableDeclarators,
              dependencies.exportedVariableDeclarators
            )
          ) {
            return false;
          }
        }
      }
      return true;
    }
  );
};

const generateCode = (program: AnyNode): string | undefined => {
  if (program.body.length === 0) {
    return undefined;
  }
  const result = strip(program as any, { comments: 'some' });
  if (result.errors.length > 0) {
    throw new Error(result.errors.map(error => error.message).join('\n'));
  }
  return result.code;
};

const filterImportSpecifiers = (
  node: AnyNode,
  shouldKeep: (importedName: string) => boolean
) => {
  if (node.specifiers.length === 0) {
    return node;
  }
  const specifiers = node.specifiers.filter((specifier: AnyNode) =>
    shouldKeep(specifier.local.name)
  );
  return specifiers.length > 0 ? { ...node, specifiers } : null;
};

const getChunkedExport = (
  code: string,
  exportName: string,
  cache: RouteChunkCache,
  cacheKey: string
): string | undefined => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::getChunkedExport::${exportName}`,
    code,
    () => {
      if (!hasChunkableExport(code, exportName, cache, cacheKey)) {
        return undefined;
      }
      const exportDependencies = getExportDependencies(code, cache, cacheKey);
      const dependencies = exportDependencies.get(exportName);
      invariant(dependencies, 'Expected export to have dependencies');

      const program = analyzeCode(code, cache, cacheKey).program;
      const body = program.body
        .filter((node: AnyNode) => dependencies.topLevelStatements.has(node))
        .map((node: AnyNode) => {
          if (node.type !== 'ImportDeclaration') {
            return node;
          }
          if (dependencies.importedIdentifierNames.size === 0) {
            return null;
          }
          return filterImportSpecifiers(node, importedName =>
            dependencies.importedIdentifierNames.has(importedName)
          );
        })
        .map((node: AnyNode | null) => {
          if (!node || !node.type.startsWith('Export')) {
            return node;
          }
          if (node.type === 'ExportAllDeclaration') {
            return null;
          }
          if (node.type === 'ExportDefaultDeclaration') {
            return exportName === 'default' ? node : null;
          }
          const { declaration } = node;
          if (declaration?.type === 'VariableDeclaration') {
            const declarations = declaration.declarations.filter(
              (declarationNode: AnyNode) =>
                dependencies.exportedVariableDeclarators.has(declarationNode)
            );
            return declarations.length > 0
              ? {
                  ...node,
                  declaration: { ...declaration, declarations },
                }
              : null;
          }
          if (
            declaration?.type === 'FunctionDeclaration' ||
            declaration?.type === 'ClassDeclaration'
          ) {
            return declaration.id?.name === exportName ? node : null;
          }
          if (node.type === 'ExportNamedDeclaration') {
            const specifiers = node.specifiers.filter(
              (specifier: AnyNode) =>
                getExportedName(specifier.exported) === exportName
            );
            return specifiers.length > 0 ? { ...node, specifiers } : null;
          }
          throw new Error('Unknown export node type');
        })
        .filter(Boolean) as AnyNode[];

      return generateCode({ ...program, body });
    }
  );
};

const omitChunkedExports = (
  code: string,
  exportNames: string[],
  cache: RouteChunkCache,
  cacheKey: string
): string | undefined => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::omitChunkedExports::${exportNames.join(',')}`,
    code,
    () => {
      const isChunkable = (exportName: string) =>
        hasChunkableExport(code, exportName, cache, cacheKey);
      const isOmitted = (exportName: string) =>
        exportNames.includes(exportName) && isChunkable(exportName);
      const isRetained = (exportName: string) => !isOmitted(exportName);

      const exportDependencies = getExportDependencies(code, cache, cacheKey);
      const allExportNames = Array.from(exportDependencies.keys());
      const omittedExportNames = allExportNames.filter(isOmitted);
      const retainedExportNames = allExportNames.filter(isRetained);

      const omittedStatements = new Set<AnyNode>();
      const omittedExportedVariableDeclarators = new Set<AnyNode>();

      for (const omittedExportName of omittedExportNames) {
        const dependencies = exportDependencies.get(omittedExportName);
        invariant(
          dependencies,
          `Expected dependencies for ${omittedExportName}`
        );
        for (const statement of dependencies.topLevelNonModuleStatements) {
          omittedStatements.add(statement);
        }
        for (const declarator of dependencies.exportedVariableDeclarators) {
          omittedExportedVariableDeclarators.add(declarator);
        }
      }

      const program = analyzeCode(code, cache, cacheKey).program;
      const body = program.body
        .filter((node: AnyNode) => !omittedStatements.has(node))
        .map((node: AnyNode) => {
          if (node.type !== 'ImportDeclaration') {
            return node;
          }
          return filterImportSpecifiers(node, importedName => {
            for (const retainedExportName of retainedExportNames) {
              const dependencies = exportDependencies.get(retainedExportName);
              if (dependencies?.importedIdentifierNames.has(importedName)) {
                return true;
              }
            }
            for (const omittedExportName of omittedExportNames) {
              const dependencies = exportDependencies.get(omittedExportName);
              if (dependencies?.importedIdentifierNames.has(importedName)) {
                return false;
              }
            }
            return true;
          });
        })
        .map((node: AnyNode | null) => {
          if (!node || !node.type.startsWith('Export')) {
            return node;
          }
          if (node.type === 'ExportAllDeclaration') {
            return node;
          }
          if (node.type === 'ExportDefaultDeclaration') {
            return isOmitted('default') ? null : node;
          }
          if (node.declaration?.type === 'VariableDeclaration') {
            const declarations = node.declaration.declarations.filter(
              (declarationNode: AnyNode) =>
                !omittedExportedVariableDeclarators.has(declarationNode)
            );
            return declarations.length > 0
              ? {
                  ...node,
                  declaration: { ...node.declaration, declarations },
                }
              : null;
          }
          if (
            node.declaration?.type === 'FunctionDeclaration' ||
            node.declaration?.type === 'ClassDeclaration'
          ) {
            return isOmitted(node.declaration.id.name) ? null : node;
          }
          if (node.type === 'ExportNamedDeclaration') {
            const specifiers = node.specifiers.filter((specifier: AnyNode) => {
              const exportedName = getExportedName(specifier.exported);
              return !isOmitted(exportedName);
            });
            return specifiers.length > 0 || node.declaration
              ? { ...node, specifiers }
              : null;
          }
          throw new Error('Unknown node type');
        })
        .filter(Boolean) as AnyNode[];

      return generateCode({ ...program, body });
    }
  );
};

export const detectRouteChunks = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): RouteChunkInfo => {
  const analysisCache = cache ?? new Map();
  const hasRouteChunkByExportName = createRouteChunkExportMap(exportName =>
    hasChunkableExport(code, exportName, analysisCache, cacheKey)
  );
  const chunkedExports = Object.entries(hasRouteChunkByExportName)
    .filter(([, isChunked]) => isChunked)
    .map(([exportName]) => exportName as RouteChunkExportName);
  const hasRouteChunks = chunkedExports.length > 0;
  return {
    hasRouteChunks,
    hasRouteChunkByExportName,
    chunkedExports,
  };
};

export const getRouteChunkCode: (
  code: string,
  chunkName: RouteChunkName,
  cache: RouteChunkCache | undefined,
  cacheKey: string
) => string | undefined = (
  code: string,
  chunkName: RouteChunkName,
  cache: RouteChunkCache | undefined,
  cacheKey: string
) => {
  const analysisCache = cache ?? new Map();
  if (chunkName === 'main') {
    return omitChunkedExports(
      code,
      routeChunkExportNames,
      analysisCache,
      cacheKey
    );
  }
  return getChunkedExport(code, chunkName, analysisCache, cacheKey);
};

export const getRouteChunkModuleId = (
  filePath: string,
  chunkName: RouteChunkName
) => `${filePath}${routeChunkQueryStrings[chunkName]}`;

export const isRouteChunkModuleId: (id: string) => boolean = (id: string) =>
  Object.values(routeChunkQueryStrings).some(queryString =>
    id.endsWith(queryString)
  );

const isRouteChunkName = (name: string): name is RouteChunkName =>
  name === 'main' || (routeChunkExportNames as string[]).includes(name);

export const getRouteChunkNameFromModuleId = (
  id: string
): RouteChunkName | null => {
  if (!id.includes(routeChunkQueryStringPrefix)) {
    return null;
  }
  const chunkName = id.split(routeChunkQueryStringPrefix)[1].split('&')[0];
  if (!isRouteChunkName(chunkName)) {
    return null;
  }
  return chunkName;
};

const normalizeRelativeFilePath = (file: string, appDirectory: string) => {
  const fullPath = resolve(appDirectory, file);
  const relativePath = relative(appDirectory, fullPath);
  return normalize(relativePath).split('?')[0];
};

const isRootRouteModuleId = (config: RouteChunkConfig, id: string) =>
  normalizeRelativeFilePath(id, config.appDirectory) === config.rootRouteFile;

export const createEmptyRouteChunkByExportName = (): Record<
  RouteChunkExportName,
  boolean
> => createRouteChunkExportMap(() => false);

export const buildEnforceChunkValidity = (
  exportNames: readonly string[]
): Record<RouteChunkExportName, boolean> => {
  const exportNameSet = new Set(exportNames);
  return createRouteChunkExportMap(
    exportName => !exportNameSet.has(exportName)
  );
};

export const buildManifestChunkValidity = (
  exportNames: ReadonlySet<string>,
  hasRouteChunkByExportName: Readonly<Record<RouteChunkExportName, boolean>>
): Record<RouteChunkExportName, boolean> =>
  createRouteChunkExportMap(
    exportName =>
      !exportNames.has(exportName) || hasRouteChunkByExportName[exportName]
  );

export const detectRouteChunksIfEnabled: (
  cache: RouteChunkCache | undefined,
  config: RouteChunkConfig,
  id: string,
  code: string
) => Promise<RouteChunkInfo> = async (
  cache: RouteChunkCache | undefined,
  config: RouteChunkConfig,
  id: string,
  code: string
) => {
  const noRouteChunks = (): RouteChunkInfo => ({
    chunkedExports: [] as RouteChunkExportName[],
    hasRouteChunks: false,
    hasRouteChunkByExportName: createEmptyRouteChunkByExportName(),
  });

  if (!config.splitRouteModules) {
    return noRouteChunks();
  }
  if (isRootRouteModuleId(config, id)) {
    return noRouteChunks();
  }
  if (!routeChunkExportNames.some(exportName => code.includes(exportName))) {
    return noRouteChunks();
  }

  const cacheKey = normalizeRelativeFilePath(id, config.appDirectory);
  return detectRouteChunks(code, cache, cacheKey);
};

export const getRouteChunkIfEnabled: (
  cache: RouteChunkCache | undefined,
  config: RouteChunkConfig,
  id: string,
  chunkName: RouteChunkName,
  code: string
) => Promise<string | null> = async (
  cache: RouteChunkCache | undefined,
  config: RouteChunkConfig,
  id: string,
  chunkName: RouteChunkName,
  code: string
) => {
  if (!config.splitRouteModules) {
    return null;
  }
  const cacheKey = normalizeRelativeFilePath(id, config.appDirectory);
  return getRouteChunkCode(code, chunkName, cache, cacheKey) ?? null;
};

export const validateRouteChunks: (args: {
  config: RouteChunkConfig;
  id: string;
  valid: Record<RouteChunkExportName, boolean>;
}) => void = ({ config, id, valid }) => {
  if (isRootRouteModuleId(config, id)) {
    return;
  }
  const invalidChunks = Object.entries(valid)
    .filter(([, isValid]) => !isValid)
    .map(([chunkName]) => chunkName);
  if (invalidChunks.length === 0) {
    return;
  }
  const plural = invalidChunks.length > 1;
  throw new Error(
    [
      `Error splitting route module: ${normalizeRelativeFilePath(
        id,
        config.appDirectory
      )}`,
      invalidChunks.map(name => `- ${name}`).join('\n'),
      `${plural ? 'These exports' : 'This export'} could not be split into ${
        plural ? 'their own chunks' : 'its own chunk'
      } because ${plural ? 'they share' : 'it shares'} code with other exports. You should extract any shared code into its own module and then import it within the route module.`,
    ].join('\n\n')
  );
};

export const getRouteChunkEntryName = (
  routeId: string,
  chunkName: RouteChunkExportName
) => `${routeId}-${routeChunkEntrySuffix[chunkName]}`;
