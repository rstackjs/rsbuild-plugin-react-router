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

const codeToAst = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
) => {
  return structuredClone(
    getOrSetFromCache(cache, `${cacheKey}::codeToAst`, code, () =>
      parse(code, { sourceType: 'module' })
    )
  );
};

const assertNodePath: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = (path) => {
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
) => asserts path is NodePath = (path) => {
  invariant(
    path && !Array.isArray(path) && t.isStatement(path.node),
    `Expected a Statement path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

const assertNodePathIsVariableDeclarator: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = (path) => {
  invariant(
    path && !Array.isArray(path) && t.isVariableDeclarator(path.node),
    `Expected a VariableDeclarator path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

const assertNodePathIsPattern: (
  path: NodePath | NodePath[] | null | undefined
) => asserts path is NodePath = (path) => {
  invariant(
    path && !Array.isArray(path) && t.isPattern(path.node),
    `Expected a Pattern path, but got ${
      Array.isArray(path) ? 'an array' : path?.node?.type
    }`
  );
};

type ExportDependencies = {
  topLevelStatements: Set<t.Statement>;
  topLevelNonModuleStatements: Set<t.Statement>;
  importedIdentifierNames: Set<string>;
  exportedVariableDeclarators: Set<t.VariableDeclarator>;
};

const getExportDependencies = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): Map<string, ExportDependencies> => {
  return getOrSetFromCache(cache, `${cacheKey}::getExportDependencies`, code, () => {
    const exportDependencies = new Map<string, ExportDependencies>();
    const ast = codeToAst(code, cache, cacheKey);

    function handleExport(
      exportName: string,
      exportPath: NodePath,
      identifiersPath: NodePath = exportPath
    ) {
      const identifiers = getDependentIdentifiersForPath(identifiersPath);
      const topLevelStatements = new Set<t.Statement>([
        exportPath.node as t.Statement,
        ...getTopLevelStatementsForPaths(identifiers),
      ]);
      const topLevelNonModuleStatements = new Set(
        Array.from(topLevelStatements).filter(
          statement =>
            !t.isImportDeclaration(statement) &&
            !t.isExportDeclaration(statement)
        )
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
      const exportedVariableDeclarators = new Set<t.VariableDeclarator>();
      for (const identifier of identifiers) {
        if (identifier.parentPath?.isVariableDeclarator()) {
          const parentPath = identifier.parentPath;
          if (parentPath.parentPath?.parentPath?.isExportNamedDeclaration()) {
            exportedVariableDeclarators.add(parentPath.node as t.VariableDeclarator);
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
              exportedVariableDeclarators.add(
                currentPath.parentPath.node as t.VariableDeclarator
              );
              break;
            }
            currentPath = currentPath.parentPath;
          }
        }
      }
      exportDependencies.set(exportName, {
        topLevelStatements,
        topLevelNonModuleStatements,
        importedIdentifierNames,
        exportedVariableDeclarators,
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
              const identifiers = getIdentifiersForPatternPath(
                exportedPatternPath
              );
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
        if (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration)) {
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

    return exportDependencies;
  });
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
        getDependentIdentifiersForPath(constantViolation, { visited, identifiers });
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
      getDependentIdentifiersForPath(variableDeclarator, { visited, identifiers });
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

const getTopLevelStatementsForPaths = (paths: Set<NodePath>) => {
  const topLevelStatements = new Set<t.Statement>();
  for (const path of paths) {
    const topLevelStatement = getTopLevelStatementPathForPath(path);
    topLevelStatements.add(topLevelStatement.node as t.Statement);
  }
  return topLevelStatements;
};

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

const hasChunkableExport = (
  code: string,
  exportName: string,
  cache: RouteChunkCache | undefined,
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
      for (const [currentExportName, currentDependencies] of exportDependencies) {
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
        for (const [currentExportName, currentDependencies] of exportDependencies) {
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

const getChunkedExport = (
  code: string,
  exportName: string,
  generateOptions: Record<string, unknown> = {},
  cache: RouteChunkCache | undefined,
  cacheKey: string
): string | undefined => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::getChunkedExport::${exportName}::${JSON.stringify(
      generateOptions
    )}`,
    code,
    () => {
      if (!hasChunkableExport(code, exportName, cache, cacheKey)) {
        return undefined;
      }
      const exportDependencies = getExportDependencies(code, cache, cacheKey);
      const dependencies = exportDependencies.get(exportName);
      invariant(dependencies, 'Expected export to have dependencies');

      const topLevelStatementsArray = Array.from(
        dependencies.topLevelStatements
      );
      const exportedVariableDeclaratorsArray = Array.from(
        dependencies.exportedVariableDeclarators
      );

      const ast = codeToAst(code, cache, cacheKey);
      ast.program.body = ast.program.body
        .filter(node =>
          topLevelStatementsArray.some(statement =>
            t.isNodesEquivalent(node, statement)
          )
        )
        .map(node => {
          if (!t.isImportDeclaration(node)) {
            return node;
          }
          if (dependencies.importedIdentifierNames.size === 0) {
            return null;
          }
          node.specifiers = node.specifiers.filter(specifier =>
            dependencies.importedIdentifierNames.has(specifier.local.name)
          );
          invariant(
            node.specifiers.length > 0,
            'Expected import statement to have used specifiers'
          );
          return node;
        })
        .map(node => {
          if (!t.isExportDeclaration(node)) {
            return node;
          }
          if (t.isExportAllDeclaration(node)) {
            return null;
          }
          if (t.isExportDefaultDeclaration(node)) {
            return exportName === 'default' ? node : null;
          }
          const { declaration } = node;
          if (t.isVariableDeclaration(declaration)) {
            declaration.declarations = declaration.declarations.filter(
              declarationNode =>
                exportedVariableDeclaratorsArray.some(declarator =>
                  t.isNodesEquivalent(declarationNode, declarator)
                )
            );
            if (declaration.declarations.length === 0) {
              return null;
            }
            return node;
          }
          if (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration)) {
            return node.declaration.id?.name === exportName ? node : null;
          }
          if (t.isExportNamedDeclaration(node)) {
            if (node.specifiers.length === 0) {
              return null;
            }
            node.specifiers = node.specifiers.filter(
              specifier => getExportedName(specifier.exported) === exportName
            );
            if (node.specifiers.length === 0) {
              return null;
            }
            return node;
          }
          throw new Error('Unknown export node type');
        })
        .filter(Boolean) as t.Statement[];

      return generate(ast, generateOptions).code;
    }
  );
};

const omitChunkedExports = (
  code: string,
  exportNames: string[],
  generateOptions: Record<string, unknown> = {},
  cache: RouteChunkCache | undefined,
  cacheKey: string
): string | undefined => {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::omitChunkedExports::${exportNames.join(',')}::${JSON.stringify(
      generateOptions
    )}`,
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

      const omittedStatements = new Set<t.Statement>();
      const omittedExportedVariableDeclarators = new Set<t.VariableDeclarator>();

      for (const omittedExportName of omittedExportNames) {
        const dependencies = exportDependencies.get(omittedExportName);
        invariant(dependencies, `Expected dependencies for ${omittedExportName}`);
        for (const statement of dependencies.topLevelNonModuleStatements) {
          omittedStatements.add(statement);
        }
        for (const declarator of dependencies.exportedVariableDeclarators) {
          omittedExportedVariableDeclarators.add(declarator);
        }
      }

      const ast = codeToAst(code, cache, cacheKey);
      const omittedStatementsArray = Array.from(omittedStatements);
      const omittedExportedVariableDeclaratorsArray = Array.from(
        omittedExportedVariableDeclarators
      );
      ast.program.body = ast.program.body
        .filter(node =>
          omittedStatementsArray.every(
            statement => !t.isNodesEquivalent(node, statement)
          )
        )
        .map(node => {
          if (!t.isImportDeclaration(node)) {
            return node;
          }
          if (node.specifiers.length === 0) {
            return node;
          }
          node.specifiers = node.specifiers.filter(specifier => {
            const importedName = specifier.local.name;
            for (const retainedExportName of retainedExportNames) {
              const dependencies = exportDependencies.get(retainedExportName);
              if (dependencies?.importedIdentifierNames?.has(importedName)) {
                return true;
              }
            }
            for (const omittedExportName of omittedExportNames) {
              const dependencies = exportDependencies.get(omittedExportName);
              if (dependencies?.importedIdentifierNames?.has(importedName)) {
                return false;
              }
            }
            return true;
          });
          if (node.specifiers.length === 0) {
            return null;
          }
          return node;
        })
        .map(node => {
          if (!t.isExportDeclaration(node)) {
            return node;
          }
          if (t.isExportAllDeclaration(node)) {
            return node;
          }
          if (t.isExportDefaultDeclaration(node)) {
            return isOmitted('default') ? null : node;
          }
          if (t.isVariableDeclaration(node.declaration)) {
            node.declaration.declarations = node.declaration.declarations.filter(
              declarationNode =>
                omittedExportedVariableDeclaratorsArray.every(
                  declarator => !t.isNodesEquivalent(declarationNode, declarator)
                )
            );
            if (node.declaration.declarations.length === 0) {
              return null;
            }
            return node;
          }
          if (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration)) {
            const declarationId = node.declaration.id;
            invariant(
              declarationId,
              'Expected exported function or class declaration to have a name when not the default export'
            );
            return isOmitted(declarationId.name) ? null : node;
          }
          if (t.isExportNamedDeclaration(node)) {
            if (node.specifiers.length === 0) {
              return node;
            }
            node.specifiers = node.specifiers.filter(specifier => {
              const exportedName = getExportedName(specifier.exported);
              return !isOmitted(exportedName);
            });
            if (node.specifiers.length === 0) {
              return null;
            }
            return node;
          }
          throw new Error('Unknown node type');
        })
        .filter(Boolean) as t.Statement[];

      if (ast.program.body.length === 0) {
        return undefined;
      }
      return generate(ast, generateOptions).code;
    }
  );
};

export const detectRouteChunks = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): RouteChunkInfo => {
  const hasRouteChunkByExportName = Object.fromEntries(
    routeChunkExportNames.map(exportName => [
      exportName,
      hasChunkableExport(code, exportName, cache, cacheKey),
    ])
  ) as Record<RouteChunkExportName, boolean>;
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
  if (chunkName === 'main') {
    return omitChunkedExports(code, routeChunkExportNames, {}, cache, cacheKey);
  }
  return getChunkedExport(code, chunkName, {}, cache, cacheKey);
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
  const chunkName = id
    .split(routeChunkQueryStringPrefix)[1]
    .split('&')[0];
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
    hasRouteChunkByExportName: {
      clientAction: false,
      clientLoader: false,
      clientMiddleware: false,
      HydrateFallback: false,
    } as Record<RouteChunkExportName, boolean>,
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
}) => void = ({
  config,
  id,
  valid,
}) => {
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
