import { normalize } from 'pathe';
import { existsSync } from 'node:fs';
import { walk, type ParseResult } from 'yuku-parser';
import {
  NAMED_COMPONENT_EXPORTS,
  NAMED_COMPONENT_EXPORTS_SET,
  JS_EXTENSIONS,
} from './constants.js';

type AnyNode = Record<string, any>;

const getProgram = (ast: ParseResult | AnyNode): AnyNode =>
  (ast as ParseResult).program ?? ast;

export function validateDestructuredExports(
  id: AnyNode,
  exportsToRemove: readonly string[]
): void {
  if (id.type === 'Identifier') {
    if (exportsToRemove.includes(id.name)) {
      throw invalidDestructureError(id.name);
    }
    return;
  }

  if (id.type === 'AssignmentPattern') {
    validateDestructuredExports(id.left, exportsToRemove);
    return;
  }

  if (id.type === 'ArrayPattern') {
    for (const element of id.elements ?? []) {
      if (!element) {
        continue;
      }

      if (element.type === 'AssignmentPattern') {
        validateDestructuredExports(element, exportsToRemove);
        continue;
      }

      if (
        element.type === 'Identifier' &&
        exportsToRemove.includes(element.name)
      ) {
        throw invalidDestructureError(element.name);
      }

      if (
        element.type === 'RestElement' &&
        element.argument.type === 'Identifier' &&
        exportsToRemove.includes(element.argument.name)
      ) {
        throw invalidDestructureError(element.argument.name);
      }

      if (element.type === 'ArrayPattern' || element.type === 'ObjectPattern') {
        validateDestructuredExports(element, exportsToRemove);
      }
    }
  }

  if (id.type === 'ObjectPattern') {
    for (const property of id.properties ?? []) {
      if (!property) {
        continue;
      }

      if (property.type === 'Property') {
        if (
          property.value.type === 'Identifier' &&
          exportsToRemove.includes(property.value.name)
        ) {
          throw invalidDestructureError(property.value.name);
        }

        if (
          property.value.type === 'AssignmentPattern' ||
          property.value.type === 'ArrayPattern' ||
          property.value.type === 'ObjectPattern'
        ) {
          validateDestructuredExports(property.value, exportsToRemove);
        }
      }

      if (
        property.type === 'RestElement' &&
        property.argument.type === 'Identifier' &&
        exportsToRemove.includes(property.argument.name)
      ) {
        throw invalidDestructureError(property.argument.name);
      }
    }
  }
}

export function invalidDestructureError(name: string): Error {
  return new Error(`Cannot remove destructured export "${name}"`);
}

export function toFunctionExpression(decl: AnyNode): AnyNode {
  return {
    ...decl,
    type: 'FunctionExpression',
    declare: undefined,
  };
}

export function toClassExpression(decl: AnyNode): AnyNode {
  return {
    ...decl,
    type: 'ClassExpression',
    declare: undefined,
  };
}

export function combineURLs(baseURL: string, relativeURL: string): string {
  return relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL;
}

export function normalizeAssetPrefix(assetPrefix?: string): string {
  if (!assetPrefix || assetPrefix === 'auto') {
    return '/';
  }
  return assetPrefix.endsWith('/') ? assetPrefix : `${assetPrefix}/`;
}

export function stripFileExtension(file: string): string {
  return file.replace(/\.[^/.]+$/, '');
}

export function createRouteId(file: string): string {
  return normalize(stripFileExtension(file));
}

export function findEntryFile(basePath: string): string {
  for (const ext of JS_EXTENSIONS) {
    const filePath = `${basePath}${ext}`;
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return `${basePath}.tsx`;
}

export function generateWithProps() {
  return `
    import { createElement as h } from "react";
    import { useActionData, useLoaderData, useMatches, useParams, useRouteError } from "react-router";

    export function withComponentProps(Component) {
      return function Wrapped() {
        const props = {
          params: useParams(),
          loaderData: useLoaderData(),
          actionData: useActionData(),
          matches: useMatches(),
        };
        return h(Component, props);
      };
    }

    export function withHydrateFallbackProps(HydrateFallback) {
      return function Wrapped() {
        const props = {
          params: useParams(),
        };
        return h(HydrateFallback, props);
      };
    }

    export function withErrorBoundaryProps(ErrorBoundary) {
      return function Wrapped() {
        const props = {
          params: useParams(),
          loaderData: useLoaderData(),
          actionData: useActionData(),
          error: useRouteError(),
        };
        return h(ErrorBoundary, props);
      };
    }
  `;
}

const removeFromArray = <T>(array: T[], value: T): void => {
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
  }
};

const getPatternIdentifierNames = (
  pattern: AnyNode | null | undefined,
  names = new Set<string>()
): Set<string> => {
  if (!pattern) {
    return names;
  }
  if (pattern.type === 'Identifier') {
    names.add(pattern.name);
    return names;
  }
  if (pattern.type === 'RestElement') {
    return getPatternIdentifierNames(pattern.argument, names);
  }
  if (pattern.type === 'AssignmentPattern') {
    return getPatternIdentifierNames(pattern.left, names);
  }
  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements ?? []) {
      getPatternIdentifierNames(element, names);
    }
    return names;
  }
  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties ?? []) {
      if (property.type === 'RestElement') {
        getPatternIdentifierNames(property.argument, names);
      } else {
        getPatternIdentifierNames(property.value, names);
      }
    }
  }
  return names;
};

const getDeclaredNames = (node: AnyNode): Set<string> => {
  const names = new Set<string>();
  if (node.type === 'VariableDeclaration') {
    for (const declarator of node.declarations ?? []) {
      getPatternIdentifierNames(declarator.id, names);
    }
  } else if (
    (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') &&
    node.id?.name
  ) {
    names.add(node.id.name);
  } else if (node.type === 'ImportDeclaration') {
    for (const specifier of node.specifiers ?? []) {
      if (specifier.local?.name) {
        names.add(specifier.local.name);
      }
    }
  }
  return names;
};

const isIdentifierDeclaration = (node: AnyNode, parent: AnyNode | null) => {
  if (!parent || node.type !== 'Identifier') {
    return false;
  }
  if (
    (parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ClassDeclaration' ||
      parent.type === 'ClassExpression') &&
    parent.id === node
  ) {
    return true;
  }
  if (parent.type === 'VariableDeclarator') {
    return getPatternIdentifierNames(parent.id).has(node.name);
  }
  if (
    (parent.type === 'ImportSpecifier' ||
      parent.type === 'ImportDefaultSpecifier' ||
      parent.type === 'ImportNamespaceSpecifier') &&
    parent.local === node
  ) {
    return true;
  }
  if (
    (parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression') &&
    (parent.params ?? []).some((param: AnyNode) =>
      getPatternIdentifierNames(param).has(node.name)
    )
  ) {
    return true;
  }
  return false;
};

const isNonReferenceIdentifier = (node: AnyNode, parent: AnyNode | null) => {
  if (!parent || node.type !== 'Identifier') {
    return false;
  }
  if (isIdentifierDeclaration(node, parent)) {
    return true;
  }
  if (
    parent.type === 'MemberExpression' &&
    parent.property === node &&
    !parent.computed
  ) {
    return true;
  }
  if (
    parent.type === 'Property' &&
    parent.key === node &&
    !parent.computed &&
    !parent.shorthand
  ) {
    return true;
  }
  if (
    parent.type === 'MethodDefinition' &&
    parent.key === node &&
    !parent.computed
  ) {
    return true;
  }
  if (
    parent.type === 'ExportSpecifier' ||
    parent.type === 'ExportDefaultSpecifier' ||
    parent.type === 'ExportNamespaceSpecifier'
  ) {
    return true;
  }
  if (parent.type === 'ImportSpecifier' && parent.imported === node) {
    return true;
  }
  if (
    parent.type === 'LabeledStatement' ||
    parent.type === 'BreakStatement' ||
    parent.type === 'ContinueStatement'
  ) {
    return true;
  }
  return false;
};

const isUppercaseName = (name: string): boolean => /^[A-Z]/.test(name);

const collectReferencedNames = (node: AnyNode): Set<string> => {
  const referenced = new Set<string>();
  walk(node as any, {
    Identifier(node: AnyNode, ctx: any) {
      const parent = ctx.parent as AnyNode | null;
      if (!isNonReferenceIdentifier(node, parent)) {
        referenced.add(node.name);
      }
    },
    JSXIdentifier(node: AnyNode, ctx: any) {
      const parent = ctx.parent as AnyNode | null;
      if (!parent || !isUppercaseName(node.name)) {
        return;
      }
      if (
        (parent.type === 'JSXOpeningElement' ||
          parent.type === 'JSXClosingElement') &&
        parent.name === node
      ) {
        referenced.add(node.name);
        return;
      }
      if (parent.type === 'JSXMemberExpression' && parent.object === node) {
        referenced.add(node.name);
      }
    },
    ExportSpecifier(node: AnyNode, ctx: any) {
      const declaration = ctx.parent as AnyNode | null;
      if (
        !declaration?.source &&
        declaration?.exportKind !== 'type' &&
        node.local?.name &&
        node.exportKind !== 'type'
      ) {
        referenced.add(node.local.name);
      }
    },
  });
  return referenced;
};

const getExportedName = (specifier: AnyNode): string | null => {
  const exported = specifier.exported;
  if (!exported) {
    return null;
  }
  if (exported.type === 'Identifier') {
    return exported.name;
  }
  if (exported.type === 'Literal') {
    return String(exported.value);
  }
  return null;
};

type TopLevelDeclaration = {
  referencedNames: Set<string>;
};

type TopLevelDeclarationGraph = {
  declarationsByNode: Map<AnyNode, TopLevelDeclaration>;
  declarationsByName: Map<string, Set<TopLevelDeclaration>>;
};

const createTopLevelDeclarationGraph = (
  program: AnyNode
): TopLevelDeclarationGraph => {
  const declarationsByNode = new Map<AnyNode, TopLevelDeclaration>();
  const declarationsByName = new Map<string, Set<TopLevelDeclaration>>();

  const registerDeclaration = (
    node: AnyNode,
    declarationNode: AnyNode,
    declaredNames: Set<string>
  ) => {
    const declaration: TopLevelDeclaration = {
      referencedNames: collectReferencedNames(declarationNode),
    };
    declarationsByNode.set(node, declaration);
    for (const name of declaredNames) {
      const namedDeclarations = declarationsByName.get(name) ?? new Set();
      namedDeclarations.add(declaration);
      declarationsByName.set(name, namedDeclarations);
    }
  };

  for (const statement of program.body ?? []) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        registerDeclaration(
          declarator,
          declarator,
          getPatternIdentifierNames(declarator.id)
        );
      }
      continue;
    }
    if (
      statement.type === 'FunctionDeclaration' ||
      statement.type === 'ClassDeclaration'
    ) {
      registerDeclaration(statement, statement, getDeclaredNames(statement));
    }
  }

  return { declarationsByNode, declarationsByName };
};

const collectLiveTopLevelDeclarations = (
  program: AnyNode,
  graph: TopLevelDeclarationGraph
): Set<TopLevelDeclaration> => {
  const pendingNames: string[] = [];

  for (const statement of program.body ?? []) {
    if (statement.type === 'VariableDeclaration') {
      continue;
    }
    if (graph.declarationsByNode.has(statement)) {
      continue;
    }
    for (const name of collectReferencedNames(statement)) {
      pendingNames.push(name);
    }
  }

  // This is intentionally name-based and conservative: shadowing may retain a
  // declaration, but it must never make a live declaration removable.
  const visitedNames = new Set<string>();
  const liveDeclarations = new Set<TopLevelDeclaration>();
  while (pendingNames.length > 0) {
    const name = pendingNames.pop();
    if (!name || visitedNames.has(name)) {
      continue;
    }
    visitedNames.add(name);
    for (const declaration of graph.declarationsByName.get(name) ?? []) {
      if (!liveDeclarations.has(declaration)) {
        liveDeclarations.add(declaration);
        for (const referencedName of declaration.referencedNames) {
          pendingNames.push(referencedName);
        }
      }
    }
  }

  return liveDeclarations;
};

const declarationReferencesName = (
  declaration: TopLevelDeclaration,
  names: ReadonlySet<string>,
  graph: TopLevelDeclarationGraph,
  cache: Map<TopLevelDeclaration, boolean>,
  visitedNames = new Set<string>()
): boolean => {
  const cached = cache.get(declaration);
  if (cached !== undefined) {
    return cached;
  }

  for (const referencedName of declaration.referencedNames) {
    if (names.has(referencedName)) {
      cache.set(declaration, true);
      return true;
    }
    if (visitedNames.has(referencedName)) {
      continue;
    }
    visitedNames.add(referencedName);
    for (const referencedDeclaration of graph.declarationsByName.get(
      referencedName
    ) ?? []) {
      if (
        declarationReferencesName(
          referencedDeclaration,
          names,
          graph,
          cache,
          visitedNames
        )
      ) {
        cache.set(declaration, true);
        return true;
      }
    }
  }
  cache.set(declaration, false);
  return false;
};

const removeNewlyDeadTopLevelDeclarations = (
  program: AnyNode,
  graph: TopLevelDeclarationGraph,
  previouslyLive: ReadonlySet<TopLevelDeclaration>,
  removedExportReferencedNames: ReadonlySet<string>
): void => {
  const currentlyLive = collectLiveTopLevelDeclarations(program, graph);
  const removedReferenceCache = new Map<TopLevelDeclaration, boolean>();
  const isRemovableDeadDeclaration = (node: AnyNode) => {
    const declaration = graph.declarationsByNode.get(node);
    if (!declaration || currentlyLive.has(declaration)) {
      return false;
    }
    return (
      previouslyLive.has(declaration) ||
      declarationReferencesName(
        declaration,
        removedExportReferencedNames,
        graph,
        removedReferenceCache
      )
    );
  };

  program.body = program.body.filter((statement: AnyNode) => {
    if (statement.type === 'VariableDeclaration') {
      statement.declarations = statement.declarations.filter(
        (declarator: AnyNode) => !isRemovableDeadDeclaration(declarator)
      );
      return statement.declarations.length > 0;
    }
    return !isRemovableDeadDeclaration(statement);
  });
};

export const removeExports = (
  ast: ParseResult | AnyNode,
  exportsToRemove: readonly string[]
): void => {
  const program = getProgram(ast);
  const declarationGraph = createTopLevelDeclarationGraph(program);
  const previouslyLive = collectLiveTopLevelDeclarations(
    program,
    declarationGraph
  );
  let exportsChanged = false;
  const removedExportLocalNames = new Set<string>();
  const removedExportReferencedNames = new Set<string>();
  const trackRemovedExportReferences = (node: AnyNode | null | undefined) => {
    if (!node) {
      return;
    }
    const declaration = declarationGraph.declarationsByNode.get(node);
    for (const name of declaration?.referencedNames ??
      collectReferencedNames(node)) {
      removedExportReferencedNames.add(name);
    }
  };

  for (const statement of [...program.body]) {
    if (statement.type === 'ExportAllDeclaration') {
      const exportedName = statement.exported
        ? getExportedName({ exported: statement.exported })
        : null;
      if (!exportedName || exportsToRemove.includes(exportedName)) {
        exportsChanged = true;
        removeFromArray(program.body, statement);
      }
      continue;
    }

    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.specifiers?.length) {
        statement.specifiers = statement.specifiers.filter(
          (specifier: AnyNode) => {
            if (specifier.type !== 'ExportSpecifier') {
              return true;
            }
            const exportedName = getExportedName(specifier);
            if (exportedName && exportsToRemove.includes(exportedName)) {
              exportsChanged = true;
              if (specifier.local?.name) {
                removedExportLocalNames.add(specifier.local.name);
                removedExportReferencedNames.add(specifier.local.name);
              }
              return false;
            }
            return true;
          }
        );
        if (statement.specifiers.length === 0 && !statement.declaration) {
          removeFromArray(program.body, statement);
        }
      }

      const declaration = statement.declaration;
      if (declaration?.type === 'VariableDeclaration') {
        declaration.declarations = declaration.declarations.filter(
          (declarator: AnyNode) => {
            if (declarator.id.type === 'Identifier') {
              if (exportsToRemove.includes(declarator.id.name)) {
                exportsChanged = true;
                removedExportLocalNames.add(declarator.id.name);
                removedExportReferencedNames.add(declarator.id.name);
                trackRemovedExportReferences(declarator);
                return false;
              }
              return true;
            }

            validateDestructuredExports(declarator.id, exportsToRemove);
            return true;
          }
        );
        if (declaration.declarations.length === 0) {
          removeFromArray(program.body, statement);
        }
      }

      if (
        (declaration?.type === 'FunctionDeclaration' ||
          declaration?.type === 'ClassDeclaration') &&
        declaration.id?.name &&
        exportsToRemove.includes(declaration.id.name)
      ) {
        exportsChanged = true;
        removedExportLocalNames.add(declaration.id.name);
        removedExportReferencedNames.add(declaration.id.name);
        trackRemovedExportReferences(statement);
        removeFromArray(program.body, statement);
      }
    }

    if (
      statement.type === 'ExportDefaultDeclaration' &&
      exportsToRemove.includes('default')
    ) {
      exportsChanged = true;
      const declaration = statement.declaration;
      if (declaration?.type === 'Identifier') {
        removedExportLocalNames.add(declaration.name);
        removedExportReferencedNames.add(declaration.name);
      } else if (declaration?.id?.name) {
        removedExportLocalNames.add(declaration.id.name);
        removedExportReferencedNames.add(declaration.id.name);
      }
      trackRemovedExportReferences(statement);
      removeFromArray(program.body, statement);
    }
  }

  for (const statement of [...program.body]) {
    const expression =
      statement.type === 'ExpressionStatement' ? statement.expression : null;
    const left =
      expression?.type === 'AssignmentExpression' ? expression.left : null;
    if (
      left?.type === 'MemberExpression' &&
      left.object?.type === 'Identifier' &&
      removedExportLocalNames.has(left.object.name)
    ) {
      removeFromArray(program.body, statement);
    }
  }

  if (exportsChanged) {
    removeNewlyDeadTopLevelDeclarations(
      program,
      declarationGraph,
      previouslyLive,
      removedExportReferencedNames
    );
  }
};

export const removeUnusedImports = (ast: ParseResult | AnyNode): void => {
  const program = getProgram(ast);
  const referenced = collectReferencedNames(program);
  for (const statement of [...program.body]) {
    if (statement.type !== 'ImportDeclaration') {
      continue;
    }
    if ((statement.specifiers ?? []).length === 0) {
      continue;
    }
    statement.specifiers = (statement.specifiers ?? []).filter(
      (specifier: AnyNode) => {
        if (specifier.importKind === 'type') {
          return false;
        }
        return !specifier.local?.name || referenced.has(specifier.local.name);
      }
    );
    if (statement.specifiers.length === 0) {
      removeFromArray(program.body, statement);
    }
  }
};

const identifier = (name: string): AnyNode => ({
  type: 'Identifier',
  start: 0,
  end: 0,
  name,
  decorators: [],
  optional: false,
  typeAnnotation: null,
});

const literal = (value: string): AnyNode => ({
  type: 'Literal',
  start: 0,
  end: 0,
  value,
  raw: JSON.stringify(value),
});

const callExpression = (callee: AnyNode, args: AnyNode[]): AnyNode => ({
  type: 'CallExpression',
  start: 0,
  end: 0,
  callee,
  arguments: args,
  optional: false,
});

const importDeclaration = (
  specifiers: Array<{ local: string; imported: string }>,
  source: string
): AnyNode => ({
  type: 'ImportDeclaration',
  start: 0,
  end: 0,
  specifiers: specifiers.map(specifier => ({
    type: 'ImportSpecifier',
    start: 0,
    end: 0,
    imported: identifier(specifier.imported),
    local: identifier(specifier.local),
    importKind: 'value',
  })),
  source: literal(source),
  attributes: [],
  phase: null,
  importKind: 'value',
});

const variableDeclaration = (name: string, init: AnyNode): AnyNode => ({
  type: 'VariableDeclaration',
  start: 0,
  end: 0,
  kind: 'const',
  declare: false,
  declarations: [
    {
      type: 'VariableDeclarator',
      start: 0,
      end: 0,
      id: identifier(name),
      init,
      definite: false,
    },
  ],
});

const collectUsedNames = (program: AnyNode): Set<string> => {
  const names = new Set<string>();
  walk(program as any, {
    Identifier(node: AnyNode) {
      names.add(node.name);
    },
  });
  return names;
};

export const transformRoute = (ast: ParseResult | AnyNode): void => {
  const program = getProgram(ast);
  const usedNames = collectUsedNames(program);
  const hocs: Array<[string, string]> = [];
  const componentWrapperDeclarations: AnyNode[] = [];

  function getUid(name: string) {
    let uid = `_${name}`;
    let index = 2;
    while (usedNames.has(uid)) {
      uid = `_${name}${index++}`;
    }
    usedNames.add(uid);
    return uid;
  }

  function getHocUid(hocName: string) {
    const uid = getUid(hocName);
    hocs.push([hocName, uid]);
    return identifier(uid);
  }

  function wrapNamedComponentDeclaration(name: string, declaration: AnyNode) {
    const uid = getHocUid(`with${name}Props`);
    const expression =
      declaration.type === 'FunctionDeclaration'
        ? toFunctionExpression(declaration)
        : declaration.type === 'ClassDeclaration'
          ? toClassExpression(declaration)
          : declaration;
    return variableDeclaration(name, callExpression(uid, [expression]));
  }

  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = statement.declaration;
      const expr =
        declaration?.type === 'FunctionDeclaration'
          ? toFunctionExpression(declaration)
          : declaration?.type === 'ClassDeclaration'
            ? toClassExpression(declaration)
          : declaration;
      if (expr) {
        const uid = getHocUid('withComponentProps');
        statement.declaration = callExpression(uid, [expr]);
      }
      continue;
    }

    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }
    const declaration = statement.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations ?? []) {
        if (
          declarator.id?.type !== 'Identifier' ||
          !declarator.init ||
          !isNamedComponentExport(declarator.id.name)
        ) {
          continue;
        }
        const uid = getHocUid(`with${declarator.id.name}Props`);
        declarator.init = callExpression(uid, [declarator.init]);
      }
      continue;
    }

    if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id?.name &&
      isNamedComponentExport(declaration.id.name)
    ) {
      const name = declaration.id.name;
      statement.declaration = wrapNamedComponentDeclaration(name, declaration);
      continue;
    }

    for (const specifier of statement.specifiers ?? []) {
      if (specifier.type !== 'ExportSpecifier' || specifier.exportKind === 'type') {
        continue;
      }
      const exportedName = getExportedName(specifier);
      if (!exportedName || !isNamedComponentExport(exportedName)) {
        continue;
      }
      const localName = specifier.local?.name;
      if (!localName) {
        continue;
      }
      const wrappedLocalName = getUid(exportedName);
      const uid = getHocUid(`with${exportedName}Props`);
      componentWrapperDeclarations.push(
        variableDeclaration(
          wrappedLocalName,
          callExpression(uid, [identifier(localName)])
        )
      );
      specifier.local = identifier(wrappedLocalName);
    }
  }

  program.body.push(...componentWrapperDeclarations);

  if (hocs.length > 0) {
    program.body.unshift(
      importDeclaration(
        hocs.map(([name, local]) => ({ imported: name, local })),
        'virtual/react-router/with-props'
      )
    );
  }
};

function isNamedComponentExport(
  name: string
): name is (typeof NAMED_COMPONENT_EXPORTS)[number] {
  return NAMED_COMPONENT_EXPORTS_SET.has(name);
}
