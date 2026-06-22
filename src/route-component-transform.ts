import {
  NAMED_COMPONENT_EXPORTS,
  NAMED_COMPONENT_EXPORTS_SET,
} from './constants.js';
import type { ParseResult } from 'yuku-parser';

type AnyNode = Record<string, any>;

const getProgram = (ast: ParseResult | AnyNode): AnyNode =>
  (ast as ParseResult).program ?? ast;

const removeFromArray = <T>(array: T[], value: T): void => {
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
  }
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

const exportSpecifier = (local: string, exported: string): AnyNode => ({
  type: 'ExportSpecifier',
  start: 0,
  end: 0,
  local: identifier(local),
  exported: identifier(exported),
  exportKind: 'value',
});

const exportNamedDeclaration = (specifiers: AnyNode[]): AnyNode => ({
  type: 'ExportNamedDeclaration',
  start: 0,
  end: 0,
  declaration: null,
  specifiers,
  source: null,
  attributes: [],
  exportKind: 'value',
});

const getModuleExportName = (
  node: AnyNode | null | undefined
): string | null => {
  if (!node) {
    return null;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal') {
    return String(node.value);
  }
  return null;
};

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

const patternIncludesName = (
  pattern: AnyNode | null | undefined,
  name: string
): boolean => {
  if (!pattern) {
    return false;
  }
  if (pattern.type === 'Identifier') {
    return pattern.name === name;
  }
  if (pattern.type === 'RestElement') {
    return patternIncludesName(pattern.argument, name);
  }
  if (pattern.type === 'AssignmentPattern') {
    return patternIncludesName(pattern.left, name);
  }
  if (pattern.type === 'ArrayPattern') {
    return (pattern.elements ?? []).some((element: AnyNode | null) =>
      patternIncludesName(element, name)
    );
  }
  if (pattern.type === 'ObjectPattern') {
    return (pattern.properties ?? []).some((property: AnyNode) =>
      property.type === 'RestElement'
        ? patternIncludesName(property.argument, name)
        : patternIncludesName(property.value, name)
    );
  }
  return false;
};

const declarationIncludesName = (
  declaration: AnyNode,
  name: string
): boolean => {
  if (declaration.type === 'VariableDeclaration') {
    return (declaration.declarations ?? []).some((declarator: AnyNode) =>
      patternIncludesName(declarator.id, name)
    );
  }
  if (
    (declaration.type === 'FunctionDeclaration' ||
      declaration.type === 'ClassDeclaration') &&
    declaration.id?.name
  ) {
    return declaration.id.name === name;
  }
  if (declaration.type === 'ImportDeclaration') {
    return (declaration.specifiers ?? []).some(
      (specifier: AnyNode) => specifier.local?.name === name
    );
  }
  return false;
};

const hasTopLevelBindingName = (program: AnyNode, name: string): boolean => {
  for (const statement of program.body ?? []) {
    if (statement.type === 'ImportDeclaration') {
      if (declarationIncludesName(statement, name)) {
        return true;
      }
      continue;
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      if (statement.declaration?.id?.name === name) {
        return true;
      }
      continue;
    }

    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (declaration && declarationIncludesName(declaration, name)) {
      return true;
    }
  }
  return false;
};

export const transformRoute = (ast: ParseResult | AnyNode): void => {
  const program = getProgram(ast);
  const usedNames = new Set<string>();
  const hocs: Array<[string, string]> = [];
  const componentWrapperDeclarations: AnyNode[] = [];
  const sourceReexportImports: AnyNode[] = [];
  const sourceReexportDeclarations: AnyNode[] = [];

  function getUid(name: string) {
    let uid = `_${name}`;
    let index = 2;
    while (usedNames.has(uid) || hasTopLevelBindingName(program, uid)) {
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

  for (const statement of [...(program.body ?? [])]) {
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = statement.declaration;
      if (!declaration) {
        continue;
      }
      const uid = getHocUid('withComponentProps');
      if (
        (declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'ClassDeclaration') &&
        declaration.id?.name
      ) {
        const statementIndex = program.body.indexOf(statement);
        program.body.splice(statementIndex, 0, declaration);
        statement.declaration = callExpression(uid, [
          identifier(declaration.id.name),
        ]);
        continue;
      }
      const expression =
        declaration.type === 'FunctionDeclaration'
          ? toFunctionExpression(declaration)
          : declaration.type === 'ClassDeclaration'
            ? toClassExpression(declaration)
            : declaration;
      statement.declaration = callExpression(uid, [expression]);
      continue;
    }

    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }
    if (statement.exportKind === 'type') {
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

    if (statement.source) {
      const importSpecifiers: Array<{ local: string; imported: string }> = [];
      const wrappedExportSpecifiers: AnyNode[] = [];
      statement.specifiers = (statement.specifiers ?? []).filter(
        (specifier: AnyNode) => {
          if (
            specifier.type !== 'ExportSpecifier' ||
            specifier.exportKind === 'type'
          ) {
            return true;
          }
          const exportedName = getExportedName(specifier);
          const importedName = getModuleExportName(specifier.local);
          if (
            !exportedName ||
            !importedName ||
            !isNamedComponentExport(exportedName)
          ) {
            return true;
          }
          const sourceLocalName = getUid(`${exportedName}Source`);
          const wrappedLocalName = getUid(exportedName);
          const uid = getHocUid(`with${exportedName}Props`);
          importSpecifiers.push({
            imported: importedName,
            local: sourceLocalName,
          });
          componentWrapperDeclarations.push(
            variableDeclaration(
              wrappedLocalName,
              callExpression(uid, [identifier(sourceLocalName)])
            )
          );
          wrappedExportSpecifiers.push(
            exportSpecifier(wrappedLocalName, exportedName)
          );
          return false;
        }
      );
      if (importSpecifiers.length > 0) {
        sourceReexportImports.push(
          importDeclaration(importSpecifiers, String(statement.source.value))
        );
        sourceReexportDeclarations.push(
          exportNamedDeclaration(wrappedExportSpecifiers)
        );
        if (statement.specifiers.length === 0) {
          removeFromArray(program.body, statement);
        }
      }
      continue;
    }

    for (const specifier of statement.specifiers ?? []) {
      if (
        specifier.type !== 'ExportSpecifier' ||
        specifier.exportKind === 'type'
      ) {
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

  program.body.unshift(...sourceReexportImports);
  program.body.push(
    ...componentWrapperDeclarations,
    ...sourceReexportDeclarations
  );

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
