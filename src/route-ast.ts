import type { ParseResult } from 'yuku-parser';

export type AnyNode = Record<string, any>;

export type ProgramNode = AnyNode & {
  body: AnyNode[];
};

export const getProgram = (ast: ParseResult | AnyNode): ProgramNode =>
  ((ast as ParseResult).program ?? ast) as ProgramNode;

export const getPatternIdentifierNames = (
  pattern: AnyNode | null | undefined,
  names: Set<string> = new Set()
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

export const getIdentifierNamesFromPattern = (
  pattern: AnyNode | null | undefined
): string[] => Array.from(getPatternIdentifierNames(pattern));

export const patternIncludesName = (
  pattern: AnyNode | null | undefined,
  name: string
): boolean => getPatternIdentifierNames(pattern).has(name);

export const getExportedName = (
  node: AnyNode | null | undefined
): string | null => {
  const exported = node?.exported ?? node;
  if (!exported) {
    return null;
  }
  if (exported.type === 'Identifier') {
    return exported.name;
  }
  if (exported.type === 'Literal' || exported.type === 'StringLiteral') {
    return String(exported.value);
  }
  return null;
};

export const identifier = (name: string): AnyNode => ({
  type: 'Identifier',
  start: 0,
  end: 0,
  name,
  decorators: [],
  optional: false,
  typeAnnotation: null,
});

export const literal = (value: string): AnyNode => ({
  type: 'Literal',
  start: 0,
  end: 0,
  value,
  raw: JSON.stringify(value),
});

export const callExpression = (callee: AnyNode, args: AnyNode[]): AnyNode => ({
  type: 'CallExpression',
  start: 0,
  end: 0,
  callee,
  arguments: args,
  optional: false,
});

export const importDeclaration = (
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

export const exportSpecifier = (local: string, exported: string): AnyNode => ({
  type: 'ExportSpecifier',
  start: 0,
  end: 0,
  local: identifier(local),
  exported: identifier(exported),
  exportKind: 'value',
});

export const exportNamedDeclaration = (specifiers: AnyNode[]): AnyNode => ({
  type: 'ExportNamedDeclaration',
  start: 0,
  end: 0,
  declaration: null,
  specifiers,
  source: null,
  attributes: [],
  exportKind: 'value',
});

export const variableDeclaration = (name: string, init: AnyNode): AnyNode => ({
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

export const removeFromArray = <T>(array: T[], value: T): void => {
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
  }
};
