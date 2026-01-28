import { describe, expect, it } from 'vitest';
import { parse, traverse } from '../src/babel';
import { removeExports, removeUnusedImports } from '../src/plugin-utils';

function hasTopLevelAssignment(ast: any, textIncludes: string): boolean {
  let found = false;
  traverse(ast, {
    ExpressionStatement(path) {
      if (!path.parentPath.isProgram()) return;
      const expr = path.node.expression;
      if (expr.type !== 'AssignmentExpression') return;
      const raw = path.toString();
      if (raw.includes(textIncludes)) {
        found = true;
      }
    },
  });
  return found;
}

describe('removeExports', () => {
  it('removes top-level property assignment when removed export is referenced by local name', () => {
    const code = `
      const local = () => {};
      export { local as loader };
      local.hydrate = true;
      export const keep = 123;
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    // The export specifier should be gone and the assignment too.
    expect(hasTopLevelAssignment(ast, 'local.hydrate')).toBe(false);
  });

  it('removes top-level property assignment when default export is removed', () => {
    const code = `
      function Root() {}
      export default Root;
      Root.displayName = "Root";
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['default']);

    expect(hasTopLevelAssignment(ast, 'Root.displayName')).toBe(false);
  });

  it('removes unused imports after removing server-only exports', () => {
    const code = `
      import { setTheme } from './theme.server';
      export async function action() {
        return setTheme('dark');
      }
      export function Component() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['action']);
    removeUnusedImports(ast);

    let hasThemeImport = false;
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === './theme.server') {
          hasThemeImport = true;
        }
      },
    });

    expect(hasThemeImport).toBe(false);
  });
});
