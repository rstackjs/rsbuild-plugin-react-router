import { readFile } from 'node:fs/promises';
import { langFromPath, parse } from 'yuku-parser';
import { strip } from 'yuku-codegen';

type AnyNode = Record<string, any>;

const parseProgram = (code: string, resourcePath?: string) => {
  const result = parse(code, {
    sourceType: 'module',
    lang: resourcePath ? langFromPath(resourcePath) : 'tsx',
    preserveParens: true,
  });
  const errors = result.diagnostics.filter(
    diagnostic => diagnostic.severity === 'error'
  );
  if (errors.length > 0) {
    throw new Error(errors.map(error => error.message).join('\n'));
  }
  return result.program as AnyNode;
};

const getIdentifierNamesFromPattern = (
  pattern: AnyNode | null | undefined,
  names: string[] = []
): string[] => {
  if (!pattern) {
    return names;
  }
  if (pattern.type === 'Identifier') {
    names.push(pattern.name);
    return names;
  }
  if (pattern.type === 'RestElement') {
    return getIdentifierNamesFromPattern(pattern.argument, names);
  }
  if (pattern.type === 'AssignmentPattern') {
    return getIdentifierNamesFromPattern(pattern.left, names);
  }
  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements ?? []) {
      getIdentifierNamesFromPattern(element, names);
    }
    return names;
  }
  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties ?? []) {
      if (property.type === 'RestElement') {
        getIdentifierNamesFromPattern(property.argument, names);
      } else {
        getIdentifierNamesFromPattern(property.value, names);
      }
    }
  }
  return names;
};

const getExportedName = (node: AnyNode): string | null => {
  if (!node) {
    return null;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal' || node.type === 'StringLiteral') {
    return String(node.value);
  }
  return null;
};

const isTypeOnlyExport = (node: AnyNode): boolean =>
  node.exportKind === 'type' || node.type === 'TSExportAssignment';

const collectExportNames = (program: AnyNode): string[] => {
  const exportNames = new Set<string>();
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportAllDeclaration') {
      const exported = getExportedName(statement.exported);
      if (exported) {
        exportNames.add(exported);
      }
      continue;
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      exportNames.add('default');
      continue;
    }

    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }
    if (isTypeOnlyExport(statement)) {
      continue;
    }

    const declaration = statement.declaration;
    if (declaration) {
      if (declaration.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations ?? []) {
          for (const name of getIdentifierNamesFromPattern(declarator.id)) {
            exportNames.add(name);
          }
        }
      } else if (
        (declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'ClassDeclaration') &&
        declaration.id?.name
      ) {
        exportNames.add(declaration.id.name);
      }
      continue;
    }

    for (const specifier of statement.specifiers ?? []) {
      if (specifier.exportKind === 'type') {
        continue;
      }
      const exported = getExportedName(specifier.exported);
      if (exported) {
        exportNames.add(exported);
      }
    }
  }
  return Array.from(exportNames);
};

const collectExportAllModules = (program: AnyNode): string[] => {
  const modules: string[] = [];
  for (const statement of program.body ?? []) {
    if (statement.type !== 'ExportAllDeclaration') {
      continue;
    }
    if (statement.exported) {
      continue;
    }
    const source = statement.source?.value;
    if (typeof source === 'string') {
      modules.push(source);
    }
  }
  return modules;
};

export const transformToEsm = async (
  code: string,
  resourcePath: string
): Promise<string> => {
  const result = parse(code, {
    sourceType: 'module',
    lang: langFromPath(resourcePath),
    preserveParens: true,
  });
  const transformed = strip(result.program, { comments: 'some' });
  if (transformed.errors.length > 0) {
    throw new Error(transformed.errors.map(error => error.message).join('\n'));
  }
  return transformed.code;
};

export const getExportNames = async (code: string): Promise<string[]> => {
  return collectExportNames(parseProgram(code));
};

export const getExportNamesAndExportAll = async (
  code: string
): Promise<{ exportNames: string[]; exportAllModules: string[] }> => {
  const program = parseProgram(code);
  return {
    exportNames: collectExportNames(program),
    exportAllModules: collectExportAllModules(program),
  };
};

export const getRouteModuleExports = async (
  resourcePath: string
): Promise<string[]> => {
  const source = await readFile(resourcePath, 'utf8');
  const code = await transformToEsm(source, resourcePath);
  return getExportNames(code);
};
