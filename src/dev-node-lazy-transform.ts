import { rspack, type Rspack } from '@rsbuild/core';
import { parse, traverse } from './yuku.js';

const importsIn = (source: string, runtimeRequest: string) => {
  const ast = parse(source, { lang: 'js' });
  const bindings = new Set<string>();
  const gates = new Set<string>();
  const calls = new Set<number>();
  const imports: { start: number; end: number }[] = [];
  traverse(ast.program, {
    Identifier(node) {
      bindings.add(node.name);
    },
    ImportDeclaration(node) {
      if (node.source.value !== runtimeRequest) return;
      for (const specifier of node.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'gate'
        )
          gates.add(specifier.local.name);
      }
    },
  });
  traverse(ast.program, {
    CallExpression(node) {
      if (
        node.callee.type === 'Identifier' &&
        gates.has(node.callee.name) &&
        node.arguments[0]?.type === 'ImportExpression'
      )
        calls.add(node.arguments[0].start);
    },
    ImportExpression(node) {
      imports.push({ start: node.start, end: node.end });
    },
  });
  return { bindings, imports: imports.filter(node => !calls.has(node.start)) };
};

export const hasUngatedNodeImports = (
  source: string,
  runtimeRequest: string
): boolean => importsIn(source, runtimeRequest).imports.length > 0;

export const transformNodeLazyImports = (
  source: string,
  filename: string,
  runtimeRequest: string
): { code: string; map: Rspack.RawSourceMap | null } => {
  const { bindings, imports } = importsIn(source, runtimeRequest);
  if (!imports.length) return { code: source, map: null };
  let binding = '__reactRouterNodeGate';
  while (bindings.has(binding)) binding += '_';
  const replaced = new rspack.sources.ReplaceSource(
    new rspack.sources.OriginalSource(source, filename)
  );
  for (const node of imports) {
    replaced.insert(node.start, `${binding}(`);
    replaced.insert(node.end, ')');
  }
  const insertion = source.startsWith('#!') ? source.indexOf('\n') + 1 : 0;
  replaced.insert(
    insertion,
    `import { gate as ${binding} } from ${JSON.stringify(runtimeRequest)};\n`
  );
  return {
    code: replaced.source().toString(),
    map: replaced.map() as Rspack.RawSourceMap | null,
  };
};
