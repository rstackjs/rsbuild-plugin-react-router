import type { NodePath } from './babel.js';
import { generate, parse, t, traverse } from './babel.js';
import { normalize, relative, resolve } from 'pathe';

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

export type RouteChunkCacheEntry<T> = {
  value: T;
  version: string;
};

export type RouteChunkCache = Map<string, RouteChunkCacheEntry<unknown>>;

export type RouteChunkInfo = {
  hasRouteChunks: boolean;
  hasRouteChunkByExportName: Record<RouteChunkExportName, boolean>;
  chunkedExports: RouteChunkExportName[];
};

type ExportDependencyIndex = {
  topLevelStatementIndices: ReadonlySet<number>;
  topLevelNonModuleStatementIndices: ReadonlySet<number>;
  importedIdentifierNames: ReadonlySet<string>;
  exportedVariableDeclaratorKeys: ReadonlySet<string>;
};

type RouteChunkAnalysis = {
  readonly ast: t.File;
  readonly exports: ReadonlyMap<string, ExportDependencyIndex>;
  readonly topLevel: readonly t.Statement[];
  readonly chunkableExports: ReadonlySet<RouteChunkExportName>;
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
  cache: RouteChunkCache | undefined,
  key: string,
  version: string,
  getValue: () => T
): T => {
  if (!cache) {
    return getValue();
  }
  const entry = cache.get(key) as RouteChunkCacheEntry<T> | undefined;
  if (entry?.version === version) {
    return entry.value;
  }
  const value = getValue();
  cache.set(key, { value, version });
  return value;
};

const assertNodePath: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = path => {
  invariant(
    path && !Array.isArray(path),
    `Expected a Path, but got ${Array.isArray(path) ? 'an array' : path}`
  );
};

const isNodePathWithNode = (path: unknown): path is NodePath => {
  if (!path || typeof path !== 'object' || Array.isArray(path)) {
    return false;
  }
  if (!('node' in path)) {
    return false;
  }
  return Boolean((path as { node?: unknown }).node);
};

const assertNodePathIsStatement: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = path => {
  invariant(
    path && !Array.isArray(path) && t.isStatement(path.node),
    `Expected a Statement path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

const assertNodePathIsVariableDeclarator: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = path => {
  invariant(
    path && !Array.isArray(path) && t.isVariableDeclarator(path.node),
    `Expected a VariableDeclarator path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

const assertNodePathIsPattern: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = path => {
  invariant(
    path && !Array.isArray(path) && t.isPattern(path.node),
    `Expected a Pattern path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

const getDependentIdentifiersForPath = (
  path: NodePath,
  state?: { visited: Set<NodePath>; identifiers: Set<NodePath> }
): Set<NodePath> => {
  const { visited, identifiers } = state ?? {
    visited: new Set<NodePath>(),
    identifiers: new Set<NodePath>(),
  };
  if (visited.has(path)) {
    return identifiers;
  }
  visited.add(path);
  path.traverse({
    Identifier(pathInner) {
      if (identifiers.has(pathInner)) {
        return;
      }
      identifiers.add(pathInner);
      const binding = pathInner.scope.getBinding(pathInner.node.name);
      if (!binding) {
        return;
      }
      getDependentIdentifiersForPath(binding.path, { visited, identifiers });
      for (const reference of binding.referencePaths) {
        if (reference.isExportNamedDeclaration()) {
          continue;
        }
        getDependentIdentifiersForPath(reference, { visited, identifiers });
      }
      for (const constantViolation of binding.constantViolations) {
        getDependentIdentifiersForPath(constantViolation, {
          visited,
          identifiers,
        });
      }
    },
  });
  const topLevelStatement = getTopLevelStatementPathForPath(path);
  const withinImportStatement = topLevelStatement.isImportDeclaration();
  const withinExportStatement = topLevelStatement.isExportDeclaration();
  if (!withinImportStatement && !withinExportStatement) {
    getDependentIdentifiersForPath(topLevelStatement, { visited, identifiers });
  }
  if (
    withinExportStatement &&
    path.isIdentifier() &&
    (t.isPattern(path.parentPath.node) ||
      t.isPattern(path.parentPath.parentPath?.node))
  ) {
    const variableDeclarator = path.findParent(p => p.isVariableDeclarator());
    if (variableDeclarator) {
      assertNodePath(variableDeclarator);
      getDependentIdentifiersForPath(variableDeclarator, {
        visited,
        identifiers,
      });
    }
  }
  return identifiers;
};

const getTopLevelStatementPathForPath = (path: NodePath) => {
  const ancestry = path.getAncestry();
  const topLevelStatement = ancestry[ancestry.length - 2];
  assertNodePathIsStatement(topLevelStatement);
  return topLevelStatement;
};

const getTopLevelStatementIndexForPath = (
  path: NodePath,
  topLevel: readonly t.Statement[]
) => {
  const topLevelStatement = getTopLevelStatementPathForPath(path);
  const index = topLevel.indexOf(topLevelStatement.node as t.Statement);
  invariant(
    index >= 0,
    'Expected top-level statement to exist in program body'
  );
  return index;
};

const getTopLevelStatementIndicesForPaths = (
  paths: Set<NodePath>,
  topLevel: readonly t.Statement[]
) => {
  const indices = new Set<number>();
  for (const path of paths) {
    indices.add(getTopLevelStatementIndexForPath(path, topLevel));
  }
  return indices;
};

const getExportedVariableDeclaratorKey = (
  path: NodePath,
  topLevel: readonly t.Statement[]
) => {
  const statementIndex = getTopLevelStatementIndexForPath(path, topLevel);
  const declarationPath = path.parentPath;
  invariant(
    declarationPath?.isVariableDeclaration(),
    'Expected exported variable declarator to have a variable declaration parent'
  );
  const declarationIndex = declarationPath.node.declarations.indexOf(
    path.node as t.VariableDeclarator
  );
  invariant(
    declarationIndex >= 0,
    'Expected exported variable declarator to exist in its declaration'
  );
  return `${statementIndex}:${declarationIndex}`;
};

const getExportedVariableDeclaratorKeyForIndex = (
  statementIndex: number,
  declarationIndex: number
) => `${statementIndex}:${declarationIndex}`;

const getIdentifiersForPatternPath = (
  patternPath: NodePath,
  identifiers: Set<NodePath> = new Set()
) => {
  function walk(currentPath: NodePath) {
    if (currentPath.isIdentifier()) {
      identifiers.add(currentPath);
      return;
    }
    if (currentPath.isObjectPattern()) {
      const { properties } = currentPath.node;
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (t.isObjectProperty(property)) {
          const valuePath = currentPath.get(`properties.${i}.value`);
          if (isNodePathWithNode(valuePath)) {
            walk(valuePath);
          }
        } else if (t.isRestElement(property)) {
          const argumentPath = currentPath.get(`properties.${i}.argument`);
          if (isNodePathWithNode(argumentPath)) {
            walk(argumentPath);
          }
        }
      }
    } else if (currentPath.isArrayPattern()) {
      const { elements } = currentPath.node;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element) {
          const elementPath = currentPath.get(`elements.${i}`);
          if (isNodePathWithNode(elementPath)) {
            walk(elementPath);
          }
        }
      }
    } else if (currentPath.isRestElement()) {
      const argumentPath = currentPath.get('argument');
      if (isNodePathWithNode(argumentPath)) {
        walk(argumentPath);
      }
    }
  }
  walk(patternPath);
  return identifiers;
};

const getExportedName = (exported: t.Identifier | t.StringLiteral) => {
  return t.isIdentifier(exported) ? exported.name : exported.value;
};

const setsIntersect = <T>(set1: ReadonlySet<T>, set2: ReadonlySet<T>) => {
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

const getChunkableExports = (
  exportDependencies: ReadonlyMap<string, ExportDependencyIndex>
) => {
  const chunkableExports = new Set<RouteChunkExportName>();

  for (const exportName of routeChunkExportNames) {
    const dependencies = exportDependencies.get(exportName);
    if (!dependencies) {
      continue;
    }

    let isChunkable = true;
    for (const [currentExportName, currentDependencies] of exportDependencies) {
      if (currentExportName === exportName) {
        continue;
      }
      if (
        setsIntersect(
          currentDependencies.topLevelNonModuleStatementIndices,
          dependencies.topLevelNonModuleStatementIndices
        )
      ) {
        isChunkable = false;
        break;
      }
    }
    if (!isChunkable) {
      continue;
    }
    if (dependencies.exportedVariableDeclaratorKeys.size > 1) {
      continue;
    }
    if (dependencies.exportedVariableDeclaratorKeys.size > 0) {
      for (const [
        currentExportName,
        currentDependencies,
      ] of exportDependencies) {
        if (currentExportName === exportName) {
          continue;
        }
        if (
          setsIntersect(
            currentDependencies.exportedVariableDeclaratorKeys,
            dependencies.exportedVariableDeclaratorKeys
          )
        ) {
          isChunkable = false;
          break;
        }
      }
    }
    if (isChunkable) {
      chunkableExports.add(exportName);
    }
  }

  return chunkableExports;
};

const analyzeRouteModule = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): RouteChunkAnalysis => {
  return getOrSetFromCache(cache, `${cacheKey}::analysis`, code, () => {
    const exportDependencies = new Map<string, ExportDependencyIndex>();
    const ast = parse(code, { sourceType: 'module' });
    const topLevel = ast.program.body;

    function handleExport(
      exportName: string,
      exportPath: NodePath,
      identifiersPath: NodePath = exportPath
    ) {
      const identifiers = getDependentIdentifiersForPath(identifiersPath);
      const topLevelStatementIndices = new Set<number>([
        getTopLevelStatementIndexForPath(exportPath, topLevel),
        ...getTopLevelStatementIndicesForPaths(identifiers, topLevel),
      ]);
      const topLevelNonModuleStatementIndices = new Set(
        Array.from(topLevelStatementIndices).filter(index => {
          const statement = topLevel[index];
          return (
            !t.isImportDeclaration(statement) &&
            !t.isExportDeclaration(statement)
          );
        })
      );
      const importedIdentifierNames = new Set<string>();
      for (const identifier of identifiers) {
        if (
          t.isIdentifier(identifier.node) &&
          identifier.parentPath?.parentPath?.isImportDeclaration()
        ) {
          importedIdentifierNames.add(identifier.node.name);
        }
      }
      const exportedVariableDeclaratorKeys = new Set<string>();
      for (const identifier of identifiers) {
        if (identifier.parentPath?.isVariableDeclarator()) {
          const parentPath = identifier.parentPath;
          if (parentPath.parentPath?.parentPath?.isExportNamedDeclaration()) {
            exportedVariableDeclaratorKeys.add(
              getExportedVariableDeclaratorKey(parentPath, topLevel)
            );
            continue;
          }
        }
        const isWithinExportDestructuring = Boolean(
          identifier.findParent(path =>
            Boolean(
              path.isPattern() &&
              path.parentPath?.isVariableDeclarator() &&
              path.parentPath.parentPath?.parentPath?.isExportNamedDeclaration()
            )
          )
        );
        if (isWithinExportDestructuring) {
          let currentPath: NodePath | null = identifier;
          while (currentPath) {
            if (
              currentPath.parentPath?.isVariableDeclarator() &&
              currentPath.parentKey === 'id'
            ) {
              exportedVariableDeclaratorKeys.add(
                getExportedVariableDeclaratorKey(
                  currentPath.parentPath,
                  topLevel
                )
              );
              break;
            }
            currentPath = currentPath.parentPath;
          }
        }
      }
      exportDependencies.set(exportName, {
        topLevelStatementIndices,
        topLevelNonModuleStatementIndices,
        importedIdentifierNames,
        exportedVariableDeclaratorKeys,
      });
    }

    traverse(ast, {
      ExportDeclaration(exportPath) {
        const { node } = exportPath;
        if (t.isExportAllDeclaration(node)) {
          return;
        }
        if (t.isExportDefaultDeclaration(node)) {
          handleExport('default', exportPath);
          return;
        }
        const { declaration } = node;
        if (t.isVariableDeclaration(declaration)) {
          const { declarations } = declaration;
          for (let i = 0; i < declarations.length; i++) {
            const declarator = declarations[i];
            if (t.isIdentifier(declarator.id)) {
              const declaratorPath = exportPath.get(
                `declaration.declarations.${i}`
              );
              assertNodePathIsVariableDeclarator(declaratorPath);
              handleExport(declarator.id.name, exportPath, declaratorPath);
              continue;
            }
            if (t.isPattern(declarator.id)) {
              const exportedPatternPath = exportPath.get(
                `declaration.declarations.${i}.id`
              );
              assertNodePathIsPattern(exportedPatternPath);
              const identifiers =
                getIdentifiersForPatternPath(exportedPatternPath);
              for (const identifier of identifiers) {
                if (!t.isIdentifier(identifier.node)) {
                  continue;
                }
                handleExport(identifier.node.name, exportPath, identifier);
              }
            }
          }
          return;
        }
        if (
          t.isFunctionDeclaration(declaration) ||
          t.isClassDeclaration(declaration)
        ) {
          invariant(
            declaration.id,
            'Expected exported function or class declaration to have a name when not the default export'
          );
          handleExport(declaration.id.name, exportPath);
          return;
        }
        if (t.isExportNamedDeclaration(node)) {
          for (const specifier of node.specifiers) {
            if (t.isIdentifier(specifier.exported)) {
              const name = specifier.exported.name;
              const specifierPath = exportPath
                .get('specifiers')
                .find(path => path.node === specifier);
              invariant(
                specifierPath,
                `Expected to find specifier path for ${name}`
              );
              handleExport(name, exportPath, specifierPath);
            }
          }
          return;
        }
        throw new Error('Unknown export node type');
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(topLevel);
    }

    return {
      ast,
      exports: exportDependencies,
      topLevel,
      chunkableExports: getChunkableExports(exportDependencies),
    };
  });
};

const assertAnalysisBodyLengthUnchanged = (
  analysis: RouteChunkAnalysis,
  expectedLength: number
) => {
  invariant(
    analysis.ast.program.body.length === expectedLength,
    'Expected route chunk analysis program body length to remain unchanged'
  );
};

const createProgramCode = (
  body: t.Statement[],
  generateOptions: Record<string, unknown>
) => generate(t.file(t.program(body)), generateOptions).code;

const cloneImportForNames = (
  node: t.ImportDeclaration,
  importedIdentifierNames: ReadonlySet<string>
) => {
  const clonedNode = t.cloneNode(node, false);
  clonedNode.specifiers = node.specifiers.filter(specifier =>
    importedIdentifierNames.has(specifier.local.name)
  );
  invariant(
    clonedNode.specifiers.length > 0,
    'Expected import statement to have used specifiers'
  );
  return clonedNode;
};

const cloneVariableExportForKeys = (
  node: t.ExportNamedDeclaration,
  statementIndex: number,
  declaratorKeys: ReadonlySet<string>
) => {
  invariant(
    t.isVariableDeclaration(node.declaration),
    'Expected export declaration to contain variable declarations'
  );
  const clonedNode = t.cloneNode(node, false);
  const clonedDeclaration = t.cloneNode(node.declaration, false);
  clonedDeclaration.declarations = node.declaration.declarations.filter(
    (_declarationNode, declarationIndex) =>
      declaratorKeys.has(
        getExportedVariableDeclaratorKeyForIndex(
          statementIndex,
          declarationIndex
        )
      )
  );
  if (clonedDeclaration.declarations.length === 0) {
    return null;
  }
  clonedNode.declaration = clonedDeclaration;
  return clonedNode;
};

const detectRouteChunksFromAnalysis = (
  analysis: RouteChunkAnalysis
): RouteChunkInfo => {
  const hasRouteChunkByExportName = createRouteChunkExportMap(exportName =>
    analysis.chunkableExports.has(exportName)
  );
  const chunkedExports = routeChunkExportNames.filter(
    exportName => hasRouteChunkByExportName[exportName]
  );
  return {
    hasRouteChunks: chunkedExports.length > 0,
    hasRouteChunkByExportName,
    chunkedExports,
  };
};

const getChunkedExportFromAnalysis = (
  analysis: RouteChunkAnalysis,
  exportName: RouteChunkExportName,
  generateOptions: Record<string, unknown> = {}
): string | undefined => {
  if (!analysis.chunkableExports.has(exportName)) {
    return undefined;
  }
  const dependencies = analysis.exports.get(exportName);
  invariant(dependencies, 'Expected export to have dependencies');

  const bodyLength = analysis.topLevel.length;
  const body = analysis.topLevel
    .map((node, statementIndex) => {
      if (!dependencies.topLevelStatementIndices.has(statementIndex)) {
        return null;
      }
      if (t.isImportDeclaration(node)) {
        if (dependencies.importedIdentifierNames.size === 0) {
          return null;
        }
        return cloneImportForNames(node, dependencies.importedIdentifierNames);
      }
      if (!t.isExportDeclaration(node)) {
        return t.cloneNode(node, false);
      }
      if (t.isExportAllDeclaration(node)) {
        return null;
      }
      if (t.isExportDefaultDeclaration(node)) {
        return null;
      }
      const { declaration } = node;
      if (t.isVariableDeclaration(declaration)) {
        return cloneVariableExportForKeys(
          node,
          statementIndex,
          dependencies.exportedVariableDeclaratorKeys
        );
      }
      if (
        t.isFunctionDeclaration(node.declaration) ||
        t.isClassDeclaration(node.declaration)
      ) {
        return node.declaration.id?.name === exportName
          ? t.cloneNode(node, false)
          : null;
      }
      if (t.isExportNamedDeclaration(node)) {
        if (node.specifiers.length === 0) {
          return null;
        }
        const clonedNode = t.cloneNode(node, false);
        clonedNode.specifiers = node.specifiers.filter(
          specifier => getExportedName(specifier.exported) === exportName
        );
        if (clonedNode.specifiers.length === 0) {
          return null;
        }
        return clonedNode;
      }
      throw new Error('Unknown export node type');
    })
    .filter(Boolean) as t.Statement[];

  assertAnalysisBodyLengthUnchanged(analysis, bodyLength);
  return createProgramCode(body, generateOptions);
};

const omitChunkedExportsFromAnalysis = (
  analysis: RouteChunkAnalysis,
  exportNames: string[],
  generateOptions: Record<string, unknown> = {}
): string | undefined => {
  const isOmitted = (exportName: string) =>
    exportNames.includes(exportName) &&
    analysis.chunkableExports.has(exportName as RouteChunkExportName);
  const isRetained = (exportName: string) => !isOmitted(exportName);

  const allExportNames = Array.from(analysis.exports.keys());
  const omittedExportNames = allExportNames.filter(isOmitted);
  const retainedExportNames = allExportNames.filter(isRetained);

  const omittedStatementIndices = new Set<number>();
  const omittedExportedVariableDeclaratorKeys = new Set<string>();

  for (const omittedExportName of omittedExportNames) {
    const dependencies = analysis.exports.get(omittedExportName);
    invariant(dependencies, `Expected dependencies for ${omittedExportName}`);
    for (const statementIndex of dependencies.topLevelNonModuleStatementIndices) {
      omittedStatementIndices.add(statementIndex);
    }
    for (const declaratorKey of dependencies.exportedVariableDeclaratorKeys) {
      omittedExportedVariableDeclaratorKeys.add(declaratorKey);
    }
  }

  const bodyLength = analysis.topLevel.length;
  const body = analysis.topLevel
    .map((node, statementIndex) => {
      if (omittedStatementIndices.has(statementIndex)) {
        return null;
      }
      if (t.isImportDeclaration(node)) {
        if (node.specifiers.length === 0) {
          return t.cloneNode(node, false);
        }
        const clonedNode = t.cloneNode(node, false);
        clonedNode.specifiers = node.specifiers.filter(specifier => {
          const importedName = specifier.local.name;
          for (const retainedExportName of retainedExportNames) {
            const dependencies = analysis.exports.get(retainedExportName);
            if (dependencies?.importedIdentifierNames?.has(importedName)) {
              return true;
            }
          }
          for (const omittedExportName of omittedExportNames) {
            const dependencies = analysis.exports.get(omittedExportName);
            if (dependencies?.importedIdentifierNames?.has(importedName)) {
              return false;
            }
          }
          return true;
        });
        if (clonedNode.specifiers.length === 0) {
          return null;
        }
        return clonedNode;
      }
      if (!t.isExportDeclaration(node)) {
        return t.cloneNode(node, false);
      }
      if (t.isExportAllDeclaration(node)) {
        return t.cloneNode(node, false);
      }
      if (t.isExportDefaultDeclaration(node)) {
        return isOmitted('default') ? null : t.cloneNode(node, false);
      }
      if (t.isVariableDeclaration(node.declaration)) {
        const retainedDeclaratorKeys = new Set<string>();
        for (let i = 0; i < node.declaration.declarations.length; i++) {
          const key = getExportedVariableDeclaratorKeyForIndex(
            statementIndex,
            i
          );
          if (!omittedExportedVariableDeclaratorKeys.has(key)) {
            retainedDeclaratorKeys.add(key);
          }
        }
        return cloneVariableExportForKeys(
          node,
          statementIndex,
          retainedDeclaratorKeys
        );
      }
      if (
        t.isFunctionDeclaration(node.declaration) ||
        t.isClassDeclaration(node.declaration)
      ) {
        const declarationId = node.declaration.id;
        invariant(
          declarationId,
          'Expected exported function or class declaration to have a name when not the default export'
        );
        return isOmitted(declarationId.name) ? null : t.cloneNode(node, false);
      }
      if (t.isExportNamedDeclaration(node)) {
        if (node.specifiers.length === 0) {
          return t.cloneNode(node, false);
        }
        const clonedNode = t.cloneNode(node, false);
        clonedNode.specifiers = node.specifiers.filter(specifier => {
          const exportedName = getExportedName(specifier.exported);
          return !isOmitted(exportedName);
        });
        if (clonedNode.specifiers.length === 0) {
          return null;
        }
        return clonedNode;
      }
      throw new Error('Unknown node type');
    })
    .filter(Boolean) as t.Statement[];

  assertAnalysisBodyLengthUnchanged(analysis, bodyLength);
  if (body.length === 0) {
    return undefined;
  }
  return createProgramCode(body, generateOptions);
};

const getRouteChunkCodeFromAnalysis = (
  analysis: RouteChunkAnalysis,
  chunkName: RouteChunkName
) => {
  if (chunkName === 'main') {
    return omitChunkedExportsFromAnalysis(analysis, routeChunkExportNames, {});
  }
  return getChunkedExportFromAnalysis(analysis, chunkName, {});
};

export const detectRouteChunks = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): RouteChunkInfo =>
  detectRouteChunksFromAnalysis(analyzeRouteModule(code, cache, cacheKey));

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
  return getRouteChunkCodeFromAnalysis(
    analyzeRouteModule(code, cache, cacheKey),
    chunkName
  );
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
