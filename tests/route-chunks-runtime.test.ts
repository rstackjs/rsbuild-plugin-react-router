import { runInNewContext } from 'node:vm';
import { rspack } from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import { detectRouteChunks, getRouteChunkCode } from '../src/route-chunks';

const routeId = 'routes/runtime.tsx';

const runExport = (
  code: string | undefined,
  exportName: string,
  globals: Record<string, unknown> = {}
): unknown => {
  if (code === undefined) {
    throw new Error('Expected a generated route chunk');
  }
  const output = rspack.experiments.swc.transformSync(code, {
    filename: routeId,
    jsc: {
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true, decorators: true },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        react: { runtime: 'classic' },
      },
    },
    module: { type: 'commonjs' },
  });
  const exports: Record<string, unknown> = {};
  runInNewContext(output.code, { exports, ...globals });
  const exported = exports[exportName];
  if (typeof exported !== 'function') {
    throw new Error(`Expected callable export ${exportName}`);
  }
  return exported();
};

describe('route chunk runtime dependencies', () => {
  it('emits a working client loader when only its return type is shared', () => {
    const code = `
      type LoaderData = { value: string };
      export const clientLoader: () => LoaderData = () => ({ value: 'client' });
      export function loader(): LoaderData { return { value: 'server' }; }
      export default function Route() { return null; }
    `;

    const client = getRouteChunkCode(code, 'clientLoader', undefined, routeId);
    const main = getRouteChunkCode(code, 'main', undefined, routeId);

    expect(runExport(client, 'clientLoader')).toEqual({ value: 'client' });
    expect(main).not.toContain('export function loader');
    expect(runExport(code, 'loader')).toEqual({ value: 'server' });
  });

  it.each([
    ['Helpers', 'helper.Nested.run()'],
    ['Helpers.Nested.run', 'helper()'],
  ])('keeps the runtime import-equals alias %s', (target, call) => {
    const code = `
      namespace Helpers {
        export namespace Nested {
          export function run() { return 'value'; }
        }
      }
      import helper = ${target};
      export const clientLoader = () => ${call};
      export default function Route() { return null; }
    `;

    const chunk = getRouteChunkCode(code, 'clientLoader', undefined, routeId);

    expect(runExport(chunk, 'clientLoader')).toBe('value');
  });

  it('keeps reverse import-equals consumers with their namespace', () => {
    const code = `
      type Data = string;
      declare function record(value: string): void;
      namespace Helpers { export const run = () => 'value'; }
      import helper = Helpers.run;
      record(helper());
      export const clientLoader: () => Data = () => Helpers.run();
      export function loader(): Data { return 'server'; }
      export default function Route() { return null; }
    `;
    const recorded: unknown[] = [];
    const globals = { record: (value: unknown) => recorded.push(value) };
    const client = getRouteChunkCode(code, 'clientLoader', undefined, routeId);
    const main = getRouteChunkCode(code, 'main', undefined, routeId);

    expect(runExport(client, 'clientLoader', globals)).toBe('value');
    expect(recorded).toEqual(['value']);
    expect(runExport(main, 'default', globals)).toBeNull();
    expect(recorded).toEqual(['value']);
  });

  it('keeps reverse consumers of an ordinary local alias', () => {
    const code = `
      type Data = string;
      declare function record(value: string): void;
      const helpers = { run: () => 'value' };
      const helper = helpers.run;
      record(helper());
      export const clientLoader: () => Data = () => helpers.run();
      export function loader(): Data { return 'server'; }
      export default function Route() { return null; }
    `;
    const recorded: unknown[] = [];
    const globals = { record: (value: unknown) => recorded.push(value) };
    const client = getRouteChunkCode(code, 'clientLoader', undefined, routeId);
    const main = getRouteChunkCode(code, 'main', undefined, routeId);

    expect(runExport(client, 'clientLoader', globals)).toBe('value');
    expect(recorded).toEqual(['value']);
    expect(runExport(main, 'default', globals)).toBeNull();
    expect(recorded).toEqual(['value']);
  });

  it('follows every binding in a non-exported declaration statement', () => {
    const code = `
      type Data = string;
      declare function record(value: string): void;
      const makeSibling = () => 'side effect';
      const helper = () => 'value', sibling = makeSibling();
      record(sibling);
      export const clientLoader: () => Data = () => helper();
      export function loader(): Data { return 'server'; }
      export default function Route() { return null; }
    `;
    const recorded: unknown[] = [];
    const globals = { record: (value: unknown) => recorded.push(value) };
    const client = getRouteChunkCode(code, 'clientLoader', undefined, routeId);
    const main = getRouteChunkCode(code, 'main', undefined, routeId);

    expect(runExport(client, 'clientLoader', globals)).toBe('value');
    expect(recorded).toEqual(['side effect']);
    expect(runExport(main, 'default', globals)).toBeNull();
    expect(recorded).toEqual(['side effect']);
  });

  it('does not split a namespace shared through a runtime import alias', () => {
    const code = `
      namespace Helpers { export const run = () => 'value'; }
      import helper = Helpers.run;
      export const clientLoader = () => Helpers.run();
      export default function Route() { return helper(); }
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual(
      []
    );
  });

  it('still erases type-only import-equals dependencies', () => {
    const code = `
      import type Types = require('./types');
      export const clientLoader = (): Types.Data => ({ value: 'client' });
      export function loader(): Types.Data { return { value: 'server' }; }
      export default function Route() { return null; }
    `;

    const chunk = getRouteChunkCode(code, 'clientLoader', undefined, routeId);

    expect(runExport(chunk, 'clientLoader')).toEqual({ value: 'client' });
  });

  it.each([
    ['function Component() { return "rendered"; }', '<Component />'],
    ['const UI = { Component: () => "rendered" };', '<UI.Component />'],
  ])('keeps the runtime JSX dependency in %s', (declaration, element) => {
    const code = `
      type Rendered = unknown;
      ${declaration}
      export function HydrateFallback(): Rendered { return ${element}; }
      export default function Route(): Rendered { return null; }
    `;
    const React = { createElement: (component: () => unknown) => component() };
    const chunk = getRouteChunkCode(
      code,
      'HydrateFallback',
      undefined,
      routeId
    );

    expect(runExport(chunk, 'HydrateFallback', { React })).toBe('rendered');
  });

  it('does not split a JSX component shared with the default export', () => {
    const code = `
      type Rendered = unknown;
      function Component() { return null; }
      export function HydrateFallback(): Rendered { return <Component />; }
      export default function Route(): Rendered { return <Component />; }
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual(
      []
    );
  });

  it.each([
    [
      'function',
      'export function helper(): Data { return "value"; }',
      'helper()',
    ],
    [
      'class',
      'export class Helper { value: Data = "value"; }',
      'new Helper().value',
    ],
    ['enum', 'export enum Value { Current = "value" }', 'Value.Current'],
    [
      'namespace',
      'export namespace Helpers { export const value: Data = "value"; }',
      'Helpers.value',
    ],
  ])(
    'does not split a shared exported %s binding',
    (_kind, declaration, value) => {
      const code = `
      type Data = string;
      ${declaration}
      export const clientLoader: () => Data = () => ${value};
      export function loader(): Data { return 'server'; }
      export default function Route() { return null; }
    `;

      expect(
        detectRouteChunks(code, undefined, routeId).chunkedExports
      ).toEqual([]);
      expect(
        runExport(
          getRouteChunkCode(code, 'main', undefined, routeId),
          'clientLoader'
        )
      ).toBe('value');
    }
  );

  it.each([
    'export default function Route(): Data { return clientLoader(); }',
    'export default (): Data => clientLoader();',
    'export default clientLoader;',
  ])('keeps an exported function used by %s', defaultExport => {
    const code = `
      type Data = string;
      export function clientLoader(): Data { return 'value'; }
      ${defaultExport}
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual(
      []
    );
    expect(
      runExport(getRouteChunkCode(code, 'main', undefined, routeId), 'default')
    ).toBe('value');
  });

  it('keeps a named default declaration used by a client loader', () => {
    const code = `
      type Data = string;
      export default function helper(): Data { return 'value'; }
      export const clientLoader: () => Data = () => helper();
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual(
      []
    );
    expect(
      runExport(
        getRouteChunkCode(code, 'main', undefined, routeId),
        'clientLoader'
      )
    ).toBe('value');
  });

  it('still splits independent exported functions', () => {
    const code = `
      export function clientLoader() { return 'client'; }
      export function loader() { return 'server'; }
      export default function Route() { return null; }
    `;

    expect(
      runExport(
        getRouteChunkCode(code, 'clientLoader', undefined, routeId),
        'clientLoader'
      )
    ).toBe('client');
    expect(
      runExport(code, 'loader')
    ).toBe('server');
  });

  it('still narrows exported sibling declarators with nested local bindings', () => {
    const code = `
      export const clientLoader = () => {
        const value = 'client';
        return value;
      }, serverHelper = () => 'server';
      export const loader = () => serverHelper();
    `;

    expect(
      runExport(
        getRouteChunkCode(code, 'clientLoader', undefined, routeId),
        'clientLoader'
      )
    ).toBe('client');
    expect(
      runExport(code, 'loader')
    ).toBe('server');
  });

  it('still splits exports that share an ordinary import', () => {
    const code = `
      import { json } from 'react-router';
      export const clientLoader = () => json('client');
      export const loader = () => json('server');
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual([
      'clientLoader',
    ]);
  });

  it('still splits aliases of ordinary imported bindings', () => {
    const code = `
      import { load } from './shared';
      export { load as clientLoader };
      export default load;
    `;

    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual([
      'clientLoader',
    ]);
    expect(
      getRouteChunkCode(code, 'clientLoader', undefined, routeId)
    ).toContain('clientLoader');
  });

  it('keeps setup statements for an imported client loader', () => {
    const code = `
      import { load } from './shared';
      load.hydrate = true;
      export { load as clientLoader };
      export default function Route() { return null; }
    `;
    const load = Object.assign(() => 'value', { hydrate: false });
    const chunk = getRouteChunkCode(code, 'clientLoader', undefined, routeId);

    expect(
      runExport(chunk, 'clientLoader', { require: () => ({ load }) })
    ).toBe('value');
    expect(load.hydrate).toBe(true);
  });

  it('keeps imported loader setup with a component that consumes it', () => {
    const code = `
      import { load } from './shared';
      load.hydrate = true;
      export { load as clientLoader };
      export default function Route() { return load.hydrate; }
    `;
    const load = Object.assign(() => 'value', { hydrate: false });
    const main = getRouteChunkCode(code, 'main', undefined, routeId);
    expect(runExport(main, 'default', { require: () => ({ load }) })).toBe(
      true
    );
    expect(detectRouteChunks(code, undefined, routeId).chunkedExports).toEqual(
      []
    );
  });

  it('preserves type-name hygiene for legacy decorator metadata', () => {
    const code = `
      type Service = string;
      function decorate(..._args: unknown[]) {}
      function make() {
        const Service = class {};
        class Consumer {
          @decorate
          prop!: Service;
        }
        return [Consumer, Service];
      }
      export const clientLoader = (_arg: Service) => make();
      export default function Route() { return null; }
    `;
    const metadataTypes: unknown[] = [];
    const Reflect = {
      metadata(key: string, value: unknown) {
        if (key === 'design:type') metadataTypes.push(value);
        return () => {};
      },
    };
    const chunk = getRouteChunkCode(code, 'clientLoader', undefined, routeId);
    const result = runExport(chunk, 'clientLoader', { Reflect });
    const metadataType = metadataTypes[0];

    expect(metadataTypes).toHaveLength(1);
    if (typeof metadataType !== 'function' || !Array.isArray(result)) {
      throw new Error('Expected constructor metadata and the returned classes');
    }
    expect(metadataType.name).toBe('Object');
    expect(metadataType).not.toBe(result[1]);
  });
});
