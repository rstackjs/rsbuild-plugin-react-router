import { expect, it } from '@rstest/core';
import {
  hasUngatedNodeImports,
  transformNodeLazyImports,
} from '../src/dev-node-lazy-transform';

it('wraps nested dynamic imports without changing their arguments or comments', () => {
  const code =
    'export async function load(name) { return import(/* webpackChunkName: "leaf" */ await import(name), { with: { type: "json" } }); }';
  const result = transformNodeLazyImports(code, '/app/input.js', '/runtime.js');
  expect(result.code).toBe(
    'import { gate as __reactRouterNodeGate } from "/runtime.js";\nexport async function load(name) { return __reactRouterNodeGate(import(/* webpackChunkName: "leaf" */ await __reactRouterNodeGate(import(name)), { with: { type: "json" } })); }'
  );
  expect(hasUngatedNodeImports(result.code, '/runtime.js')).toBe(false);
  expect(hasUngatedNodeImports(code, '/runtime.js')).toBe(true);
});

it('preserves context imports, binding collisions, and repeat application', () => {
  const code =
    'const __reactRouterNodeGate = 1; export const load = name => import(`./leaves/${name}.js`);';
  const result = transformNodeLazyImports(code, '/app/input.js', '/runtime.js');
  expect(result.code).toContain(
    'name => __reactRouterNodeGate_(import(`./leaves/${name}.js`))'
  );
  expect(
    transformNodeLazyImports(result.code, '/app/input.js', '/runtime.js').code
  ).toBe(result.code);
});

it('keeps the original source position after adding the gate', async () => {
  const { TraceMap, originalPositionFor } =
    await import('@jridgewell/trace-mapping');
  const result = transformNodeLazyImports(
    'export async function load() {\n  return import("./leaf");\n}\n',
    '/app/input.js',
    '/runtime.js'
  );
  const position = originalPositionFor(new TraceMap(result.map!), {
    line: 3,
    column: result.code.split('\n')[2].indexOf('import('),
  });
  expect(position).toEqual({
    source: '/app/input.js',
    line: 2,
    column: 9,
    name: null,
  });
});
