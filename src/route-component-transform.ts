import {
  NAMED_COMPONENT_EXPORTS,
  NAMED_COMPONENT_EXPORTS_SET,
} from './constants.js';
import type { ParseResult } from 'yuku-parser';
import {
  callExpression,
  exportNamedDeclaration,
  exportSpecifier,
  getExportedName,
  getProgram,
  identifier,
  importDeclaration,
  patternIncludesName,
  variableDeclaration,
  type AnyNode,
} from './route-ast.js';

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

const getComponentExportName = (exportedName: string): string | null => {
  if (exportedName === 'default') {
    return 'Component';
  }
  return isNamedComponentExport(exportedName) ? exportedName : null;
};

const getImportInsertionIndex = (program: AnyNode): number => {
  let index = 0;
  for (const statement of program.body ?? []) {
    if (
      statement.type !== 'ExpressionStatement' ||
      (statement.directive === undefined &&
        statement.expression?.type !== 'Literal')
    ) {
      break;
    }
    index += 1;
  }
  return index;
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
      declaration.type === 'ClassDeclaration' ||
      declaration.type === 'TSEnumDeclaration') &&
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
      if (
        declaration.declare === true ||
        declaration.type === 'TSInterfaceDeclaration'
      ) {
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
      const sourceWrapperDeclarations: AnyNode[] = [];
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
          const importedName = getExportedName(specifier.local);
          const componentExportName = exportedName
            ? getComponentExportName(exportedName)
            : null;
          if (!exportedName || !importedName || !componentExportName) {
            return true;
          }
          const sourceLocalName = getUid(`${exportedName}Source`);
          const wrappedLocalName = getUid(exportedName);
          const uid = getHocUid(`with${componentExportName}Props`);
          importSpecifiers.push({
            imported: importedName,
            local: sourceLocalName,
          });
          sourceWrapperDeclarations.push(
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
        const statementIndex = program.body.indexOf(statement);
        const replacementStatements = [
          importDeclaration(importSpecifiers, String(statement.source.value)),
        ];
        if (statement.specifiers.length > 0) {
          replacementStatements.push(statement);
        }
        replacementStatements.push(...sourceWrapperDeclarations);
        replacementStatements.push(
          exportNamedDeclaration(wrappedExportSpecifiers)
        );
        program.body.splice(statementIndex, 1, ...replacementStatements);
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
      const componentExportName = exportedName
        ? getComponentExportName(exportedName)
        : null;
      if (!exportedName || !componentExportName) {
        continue;
      }
      const localName = specifier.local?.name;
      if (!localName) {
        continue;
      }
      const wrappedLocalName = getUid(exportedName);
      const uid = getHocUid(`with${componentExportName}Props`);
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
    program.body.splice(
      getImportInsertionIndex(program),
      0,
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
