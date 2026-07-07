import { walk, type ParseResult } from 'yuku-parser';
import {
  getExportedName,
  getPatternIdentifierNames,
  getProgram,
  removeFromArray,
  type AnyNode,
  type ProgramNode,
} from './route-ast.js';

export function validateDestructuredExports(
  id: AnyNode,
  exportsToRemove: readonly string[]
): void {
  validateBindingTarget(id, new Set(exportsToRemove));
}

export function invalidDestructureError(name: string): Error {
  return new Error(`Cannot remove destructured export "${name}"`);
}

const assertAllowedBindingName = (
  name: string,
  exportsToRemove: ReadonlySet<string>
): void => {
  if (exportsToRemove.has(name)) {
    throw invalidDestructureError(name);
  }
};

const validateRestElement = (
  element: AnyNode,
  exportsToRemove: ReadonlySet<string>
): void => {
  if (element.argument?.type === 'Identifier' && element.argument.name) {
    assertAllowedBindingName(element.argument.name, exportsToRemove);
  }
};

const validateObjectProperty = (
  property: AnyNode,
  exportsToRemove: ReadonlySet<string>
): void => {
  if (property.type === 'RestElement') {
    validateRestElement(property, exportsToRemove);
    return;
  }
  if (property.type === 'Property') {
    validateBindingTarget(
      property.value as AnyNode | null | undefined,
      exportsToRemove
    );
  }
};

const validateBindingTarget = (
  node: AnyNode | null | undefined,
  exportsToRemove: ReadonlySet<string>
): void => {
  if (!node) {
    return;
  }

  switch (node.type) {
    case 'Identifier':
      if (node.name) {
        assertAllowedBindingName(node.name, exportsToRemove);
      }
      return;
    case 'AssignmentPattern':
      validateBindingTarget(node.left, exportsToRemove);
      return;
    case 'ArrayPattern':
      for (const element of node.elements ?? []) {
        if (element?.type === 'RestElement') {
          validateRestElement(element, exportsToRemove);
        } else {
          validateBindingTarget(element, exportsToRemove);
        }
      }
      return;
    case 'ObjectPattern':
      for (const property of node.properties ?? []) {
        validateObjectProperty(property, exportsToRemove);
      }
  }
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
    return Boolean(
      node.name && getPatternIdentifierNames(parent.id).has(node.name)
    );
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
    node.name
  ) {
    const name = node.name;
    return (parent.params ?? []).some((param: AnyNode) =>
      getPatternIdentifierNames(param).has(name)
    );
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
  walk(node as never, {
    Identifier(node, ctx) {
      const current = node as unknown as AnyNode;
      const parent = (ctx as { parent?: unknown }).parent as AnyNode | null;
      if (!isNonReferenceIdentifier(current, parent) && current.name) {
        referenced.add(current.name);
      }
    },
    JSXIdentifier(node, ctx) {
      const current = node as unknown as AnyNode;
      const parent = (ctx as { parent?: unknown }).parent as AnyNode | null;
      if (!parent) {
        return;
      }
      if (parent.type === 'JSXMemberExpression' && parent.object === current) {
        if (current.name) {
          referenced.add(current.name);
        }
        return;
      }
      if (!current.name || !isUppercaseName(current.name)) {
        return;
      }
      if (
        (parent.type === 'JSXOpeningElement' ||
          parent.type === 'JSXClosingElement') &&
        parent.name === current
      ) {
        referenced.add(current.name);
        return;
      }
    },
    ExportSpecifier(node, ctx) {
      const current = node as unknown as AnyNode;
      const declaration = (ctx as { parent?: unknown })
        .parent as AnyNode | null;
      if (
        !declaration?.source &&
        declaration?.exportKind !== 'type' &&
        current.local?.name &&
        current.exportKind !== 'type'
      ) {
        referenced.add(current.local.name);
      }
    },
  });
  return referenced;
};

type TopLevelDeclaration = {
  referencedNames: Set<string>;
};

type TopLevelDeclarationGraph = {
  declarationsByNode: Map<AnyNode, TopLevelDeclaration>;
  declarationsByName: Map<string, Set<TopLevelDeclaration>>;
};

const createTopLevelDeclarationGraph = (
  program: ProgramNode
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

  for (const statement of [...(program.body ?? [])]) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations ?? []) {
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
  program: ProgramNode,
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
  program: ProgramNode,
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
      statement.declarations = (statement.declarations ?? []).filter(
        (declarator: AnyNode) => !isRemovableDeadDeclaration(declarator)
      );
      return statement.declarations.length > 0;
    }
    return !isRemovableDeadDeclaration(statement);
  });
};

const hasRemovableExport = (
  program: ProgramNode,
  exportsToRemove: ReadonlySet<string>
): boolean => {
  const removesNamedExports = [...exportsToRemove].some(
    name => name !== 'default'
  );
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportAllDeclaration') {
      const exportedName = statement.exported
        ? getExportedName({ exported: statement.exported })
        : null;
      if (exportedName && exportsToRemove.has(exportedName)) {
        return true;
      }
      if (!exportedName && removesNamedExports) {
        return true;
      }
      continue;
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      if (exportsToRemove.has('default')) {
        return true;
      }
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
      if (exportedName && exportsToRemove.has(exportedName)) {
        return true;
      }
    }

    const declaration = statement.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations ?? []) {
        for (const name of getPatternIdentifierNames(declarator.id)) {
          if (exportsToRemove.has(name)) {
            return true;
          }
        }
      }
      continue;
    }

    if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id?.name &&
      exportsToRemove.has(declaration.id.name)
    ) {
      return true;
    }
  }
  return false;
};

export const removeExports = (
  ast: ParseResult | AnyNode,
  exportsToRemove: readonly string[],
  exportsToRemoveSet: ReadonlySet<string> = new Set(exportsToRemove),
  options: { pruneDeadDeclarations?: boolean } = {}
): boolean => {
  const program = getProgram(ast);
  if (!hasRemovableExport(program, exportsToRemoveSet)) {
    return false;
  }

  const declarationGraph = createTopLevelDeclarationGraph(program);
  const previouslyLive = collectLiveTopLevelDeclarations(
    program,
    declarationGraph
  );
  let exportsChanged = false;
  const removedExportLocalNames = new Set<string>();
  const removedExportReferencedNames = new Set<string>();
  const removesNamedExports = exportsToRemove.some(name => name !== 'default');
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
      if (exportedName && exportsToRemoveSet.has(exportedName)) {
        exportsChanged = true;
        removeFromArray(program.body, statement);
      }
      if (!exportedName && removesNamedExports) {
        throw new Error(
          'Cannot remove named exports from `export *`; use explicit named re-exports.'
        );
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
            if (exportedName && exportsToRemoveSet.has(exportedName)) {
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
        declaration.declarations = (declaration.declarations ?? []).filter(
          (declarator: AnyNode) => {
            const id = declarator.id;
            if (id?.type === 'Identifier') {
              if (id.name && exportsToRemoveSet.has(id.name)) {
                exportsChanged = true;
                removedExportLocalNames.add(id.name);
                removedExportReferencedNames.add(id.name);
                trackRemovedExportReferences(declarator);
                return false;
              }
              return true;
            }

            if (id) {
              validateDestructuredExports(id, exportsToRemove);
            }
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
        exportsToRemoveSet.has(declaration.id.name)
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
      exportsToRemoveSet.has('default')
    ) {
      exportsChanged = true;
      const declaration = statement.declaration;
      if (declaration?.type === 'Identifier' && declaration.name) {
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
      left.object.name &&
      removedExportLocalNames.has(left.object.name)
    ) {
      removeFromArray(program.body, statement);
    }
  }

  if (exportsChanged && options.pruneDeadDeclarations !== false) {
    removeNewlyDeadTopLevelDeclarations(
      program,
      declarationGraph,
      previouslyLive,
      removedExportReferencedNames
    );
  }

  return exportsChanged;
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
