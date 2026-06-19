import { describe, expect, it } from '@rstest/core';
import { parse } from '../src/babel';
import {
  getBundlerRouteAnalysis,
  getExportNamesAndExportAll,
  transformToEsm,
} from '../src/export-utils';

const routeChunkConfig = {
  splitRouteModules: true as const,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

describe('getBundlerRouteAnalysis', () => {
  it('reuses source code, export names, and chunk info for the same source', async () => {
    const source = `
      export const clientAction = async () => {};
      export default function Route() { return null; }
    `;
    const resourcePath = '/app/routes/demo.tsx';

    const first = await getBundlerRouteAnalysis(source, resourcePath);
    const second = await getBundlerRouteAnalysis(source, resourcePath);

    expect(second).toBe(first);
    expect(second.code).toBe(first.code);
    expect(second.exportNames).toBe(first.exportNames);
    expect(second.getRouteChunkInfo(undefined, routeChunkConfig)).toBe(
      first.getRouteChunkInfo(undefined, routeChunkConfig)
    );

    expect(first.code).toBe(source);
    expect(first.exportNames).toEqual(['clientAction', 'default']);
    await expect(
      first.getRouteChunkInfo(undefined, routeChunkConfig)
    ).resolves.toMatchObject({
      hasRouteChunks: true,
      chunkedExports: ['clientAction'],
    });
  });

  it('replaces the cached analysis when the source changes for the same resource', async () => {
    const resourcePath = '/app/routes/demo.tsx';

    const initial = await getBundlerRouteAnalysis(
      `export const clientAction = async () => {};`,
      resourcePath
    );
    const updated = await getBundlerRouteAnalysis(
      `export const clientLoader = async () => {};`,
      resourcePath
    );

    expect(updated).not.toBe(initial);
    expect(updated.exportNames).toEqual(['clientLoader']);
  });

  it('collects runtime exports and export-all modules from the initial parse', async () => {
    const analysis = await getBundlerRouteAnalysis(
      `
        export type LoaderData = { value: string };
        export interface RouteHandle { title: string }
        export type * from './types';
        export type * as typeHelpers from './type-helpers';
        export * from './shared';
        export * as helpers from './helpers';
        export const loader = () => null;
        export default function Route() { return null; }
      `,
      '/app/routes/runtime-exports.tsx'
    );

    const exportInfo = {
      exportNames: analysis.exportNames,
      exportAllModules: analysis.exportAllModules,
    };
    expect(exportInfo).toEqual({
      exportNames: ['helpers', 'loader', 'default'],
      exportAllModules: ['./shared'],
    });
    await expect(getExportNamesAndExportAll(analysis.code)).resolves.toEqual(
      exportInfo
    );
  });

  it('collects exported TypeScript enum names as runtime exports', async () => {
    await expect(
      getExportNamesAndExportAll(
        `export enum Status { Active = 'active' }`
      )
    ).resolves.toEqual({
      exportNames: ['Status'],
      exportAllModules: [],
    });
  });

  it('does not report an erased default interface as a runtime export', async () => {
    const analysis = await getBundlerRouteAnalysis(
      `export default interface RouteType { value: string }`,
      '/app/routes/type-only-default.tsx'
    );
    const exportInfo = {
      exportNames: analysis.exportNames,
      exportAllModules: analysis.exportAllModules,
    };

    expect(exportInfo).toEqual({ exportNames: [], exportAllModules: [] });
    await expect(getExportNamesAndExportAll(analysis.code)).resolves.toEqual(
      exportInfo
    );
  });

  it('does not report erased ambient declarations as runtime exports', async () => {
    const analysis = await getBundlerRouteAnalysis(
      `
        export declare function loader(): void;
        export declare const action: () => void;
        export declare class ServerOnly {}
        export const clientLoader = () => null;
      `,
      '/app/routes/ambient-exports.tsx'
    );
    const exportInfo = {
      exportNames: analysis.exportNames,
      exportAllModules: analysis.exportAllModules,
    };

    expect(exportInfo).toEqual({
      exportNames: ['clientLoader'],
      exportAllModules: [],
    });
    await expect(getExportNamesAndExportAll(analysis.code)).resolves.toEqual(
      exportInfo
    );
  });
});

describe('transformToEsm', () => {
  it('preserves arrow function object return parentheses', async () => {
    const code = `
      const items = [{ pathname: '/', data: 'Home' }];
      export const labels = items.map((item) => ({
        to: item.pathname,
        label: item.data,
      }));
    `;

    const transformed = await transformToEsm(code, 'route.tsx');

    expect(transformed).toContain('=> ({');
    expect(() => parse(transformed, { sourceType: 'module' })).not.toThrow();
  });
});
