import { normalize } from 'pathe';
import { existsSync } from 'node:fs';
import { walk, type ParseResult } from 'yuku-parser';
import { NAMED_COMPONENT_EXPORTS, JS_EXTENSIONS } from './constants.js';

type AnyNode = Record<string, any>;

const getProgram = (ast: ParseResult | AnyNode): AnyNode =>
  (ast as ParseResult).program ?? ast;

export function validateDestructuredExports(
  id: AnyNode,
  exportsToRemove: string[]
): void {
  if (id.type === 'ArrayPattern') {
    for (const element of id.elements ?? []) {
      if (!element) {
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
  if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement') {
    return true;
  }
  return false;
};

const isUppercaseName = (name: string): boolean => /^[A-Z]/.test(name);

const collectReferencedNames = (program: AnyNode): Set<string> => {
  const referenced = new Set<string>();
  walk(program as any, {
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
    ExportSpecifier(node: AnyNode) {
      if (node.local?.name && node.exportKind !== 'type') {
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

const collectExportedLocalNames = (program: AnyNode): Set<string> => {
  const names = new Set<string>();
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportDefaultDeclaration') {
      if (statement.declaration?.id?.name) {
        names.add(statement.declaration.id.name);
      }
      continue;
    }
    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }
    if (statement.declaration) {
      for (const name of getDeclaredNames(statement.declaration)) {
        names.add(name);
      }
    }
    for (const specifier of statement.specifiers ?? []) {
      if (specifier.local?.name && specifier.exportKind !== 'type') {
        names.add(specifier.local.name);
      }
    }
  }
  return names;
};

const removeUnusedTopLevelDeclarations = (program: AnyNode): void => {
  let changed = true;
  while (changed) {
    changed = false;
    const referenced = collectReferencedNames(program);
    const exported = collectExportedLocalNames(program);
    for (const statement of [...program.body]) {
      if (statement.type !== 'VariableDeclaration') {
        if (
          (statement.type === 'FunctionDeclaration' ||
            statement.type === 'ClassDeclaration') &&
          statement.id?.name &&
          !referenced.has(statement.id.name) &&
          !exported.has(statement.id.name)
        ) {
          removeFromArray(program.body, statement);
          changed = true;
        }
        continue;
      }
      statement.declarations = statement.declarations.filter(
        (declarator: AnyNode) => {
          const names = getPatternIdentifierNames(declarator.id);
          return Array.from(names).some(
            name => referenced.has(name) || exported.has(name)
          );
        }
      );
      if (statement.declarations.length === 0) {
        removeFromArray(program.body, statement);
        changed = true;
      }
    }
  }
};

export const removeExports = (
  ast: ParseResult | AnyNode,
  exportsToRemove: string[]
): void => {
  const program = getProgram(ast);
  let exportsFiltered = false;
  const removedExportLocalNames = new Set<string>();

  for (const statement of [...program.body]) {
    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.specifiers?.length) {
        statement.specifiers = statement.specifiers.filter(
          (specifier: AnyNode) => {
            if (specifier.type !== 'ExportSpecifier') {
              return true;
            }
            const exportedName = getExportedName(specifier);
            if (exportedName && exportsToRemove.includes(exportedName)) {
              exportsFiltered = true;
              if (specifier.local?.name) {
                removedExportLocalNames.add(specifier.local.name);
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
                exportsFiltered = true;
                removedExportLocalNames.add(declarator.id.name);
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
        removedExportLocalNames.add(declaration.id.name);
        removeFromArray(program.body, statement);
      }
    }

    if (
      statement.type === 'ExportDefaultDeclaration' &&
      exportsToRemove.includes('default')
    ) {
      const declaration = statement.declaration;
      if (declaration?.type === 'Identifier') {
        removedExportLocalNames.add(declaration.name);
      } else if (declaration?.id?.name) {
        removedExportLocalNames.add(declaration.id.name);
      }
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
      (exportsToRemove.includes(left.object.name) ||
        removedExportLocalNames.has(left.object.name))
    ) {
      removeFromArray(program.body, statement);
    }
  }

  if (exportsFiltered || removedExportLocalNames.size > 0) {
    removeUnusedTopLevelDeclarations(program);
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

  function getHocUid(hocName: string) {
    let uid = `_${hocName}`;
    let index = 2;
    while (usedNames.has(uid)) {
      uid = `_${hocName}${index++}`;
    }
    usedNames.add(uid);
    hocs.push([hocName, uid]);
    return identifier(uid);
  }

  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = statement.declaration;
      const expr =
        declaration?.type === 'FunctionDeclaration'
          ? toFunctionExpression(declaration)
          : declaration;
      if (expr && expr.type !== 'ClassDeclaration') {
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
      declaration?.type === 'FunctionDeclaration' &&
      declaration.id?.name &&
      isNamedComponentExport(declaration.id.name)
    ) {
      const name = declaration.id.name;
      const uid = getHocUid(`with${name}Props`);
      statement.declaration = variableDeclaration(
        name,
        callExpression(uid, [toFunctionExpression(declaration)])
      );
    }
  }

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
  return (NAMED_COMPONENT_EXPORTS as readonly string[]).includes(name);
}
