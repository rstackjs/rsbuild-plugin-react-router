import { describe, expect, it } from '@rstest/core';
import { generate, parse, traverse } from '../src/babel';
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

  it('does not treat imported names as local references', () => {
    const code = `
      import {
        loaderDependency as dependency,
        unrelated as loaderDependency,
      } from './data.server';
      export function loader() {
        return dependency();
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);
    removeUnusedImports(ast);

    expect(generate(ast).code).not.toContain('./data.server');
  });

  it('keeps top-level declarations referenced from JSX after removing exports', () => {
    const code = `
      export function loader() {
        return null;
      }

      function ProgressBar() {
        return null;
      }

      export default function Route() {
        return <ProgressBar />;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;

    expect(result).toContain('function ProgressBar');
    expect(result).toContain('<ProgressBar');
  });

  it('removes cascading dead declarators from the same statement', () => {
    const code = `
      const leaf = 1, middle = leaf;
      export function loader() {
        return middle;
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).not.toContain('leaf');
    expect(result).not.toContain('middle');
    expect(result).not.toContain('loader');
    expect(result).toContain('Route');
  });

  it('removes every declaration in a deep dead dependency chain', () => {
    const helperCount = 64;
    const helpers = Array.from({ length: helperCount }, (_, index) => {
      const value =
        index === helperCount - 1 ? '1' : `helper${index + 1}()`;
      return `const helper${index} = () => ${value};`;
    }).join('\n');
    const code = `
      ${helpers}
      export function loader() {
        return helper0();
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).not.toMatch(/\bhelper\d+\b/);
    expect(result).toContain('Route');
  });

  it('preserves declarations that were already unused before export removal', () => {
    const code = `
      import { register } from './registry';
      const registration = register();
      export function loader() {
        return null;
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);
    removeUnusedImports(ast);

    const result = generate(ast).code;
    expect(result).toContain("import { register } from './registry'");
    expect(result).toContain('const registration = register()');
    expect(result).not.toContain('loader');
  });

  it('removes pre-existing unused declarations that reference removed export locals', () => {
    const code = `
      const leaked = loader;
      export function loader() {
        return null;
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).not.toContain('leaked');
    expect(result).not.toContain('loader');
    expect(result).toContain('Route');
  });

  it('removes pre-existing unused declarations that retain server-only imports', () => {
    const code = `
      import { readSecret } from './data.server';
      const leaked = readSecret();
      export function loader() {
        return readSecret();
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);
    removeUnusedImports(ast);

    const result = generate(ast).code;
    expect(result).not.toContain('./data.server');
    expect(result).not.toContain('leaked');
    expect(result).not.toContain('readSecret');
    expect(result).toContain('Route');
  });

  it('removes multiple pre-existing unused declarations through shared removed export dependencies', () => {
    const code = `
      const shared = () => loader();
      const first = () => shared();
      const second = () => shared();
      export function loader() {
        return null;
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).not.toContain('shared');
    expect(result).not.toContain('first');
    expect(result).not.toContain('second');
    expect(result).not.toContain('loader');
    expect(result).toContain('Route');
  });

  it('does not treat an exported alias as a reference to its exported name', () => {
    const code = `
      const loader = register();
      const implementation = () => null;
      export { implementation as loader };
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).toContain('const loader = register()');
    expect(result).not.toContain('implementation');
  });

  it('removes a dead declaration cycle reached only by a removed export', () => {
    const code = `
      const first = () => second();
      const second = () => first();
      export function loader() {
        return first();
      }
      export default function Route() {
        return null;
      }
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['loader']);

    const result = generate(ast).code;
    expect(result).not.toContain('first');
    expect(result).not.toContain('second');
    expect(result).toContain('Route');
  });

  it('removes dependencies of an anonymous default export', () => {
    const code = `
      const render = () => null;
      export default () => render();
    `;

    const ast = parse(code, { sourceType: 'module' });
    removeExports(ast, ['default']);

    expect(generate(ast).code).not.toContain('render');
  });
});
