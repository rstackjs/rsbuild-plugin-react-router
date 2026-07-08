import { describe, expect, it } from '@rstest/core';
import { rspack } from '@rsbuild/core';
import { getExportNamesAndExportAll } from '../src/export-utils';

describe('getExportNamesAndExportAll', () => {
  it('collects runtime exports and export-all modules', async () => {
    await expect(
      getExportNamesAndExportAll(`
        export type LoaderData = { value: string };
        export interface RouteHandle { title: string }
        export type * from './types';
        export type * as typeHelpers from './type-helpers';
        export * from './shared';
        export * as helpers from './helpers';
        export const loader = () => null;
        export default function Route() { return null; }
      `)
    ).resolves.toEqual({
      exportNames: ['helpers', 'loader', 'default'],
      exportAllModules: ['./shared'],
    });
  });

  it('collects exported TypeScript enums as runtime exports', async () => {
    await expect(
      getExportNamesAndExportAll(`export enum Status { Active = 'active' }`)
    ).resolves.toEqual({
      exportNames: ['Status'],
      exportAllModules: [],
    });
  });

  it('collects exports when route TypeScript contains typed arrows in conditionals', async () => {
    await expect(
      getExportNamesAndExportAll(
        `
          const ok = true;
          const values: unknown[] = [];
          ok
            ? values.filter((value): value is string => Boolean(value))
            : [];
          export default function Route() { return null; }
        `,
        'routes/page.tsx'
      )
    ).resolves.toEqual({
      exportNames: ['default'],
      exportAllModules: [],
    });
  });

  it('collects exports when route TSX contains typed arrows in conditional JSX data', async () => {
    await expect(
      getExportNamesAndExportAll(
        `
          const ok = true;
          const values: unknown[] = [];
          export const clientLoader = () =>
            ok
              ? values.filter((value): value is string => Boolean(value))
              : [];
          export default function Route() {
            return <main>{clientLoader().map(value => <span key={value}>{value}</span>)}</main>;
          }
        `,
        'routes/page.tsx'
      )
    ).resolves.toEqual({
      exportNames: ['clientLoader', 'default'],
      exportAllModules: [],
    });
  });

  it('uses Yuku directly when route TypeScript and TSX parse without normalization', async () => {
    const originalTransform = rspack.experiments.swc.transformSync;
    let transformCalls = 0;
    try {
      rspack.experiments.swc.transformSync = ((
        ...args: Parameters<typeof originalTransform>
      ) => {
        transformCalls += 1;
        return originalTransform(...args);
      }) as typeof originalTransform;

      await expect(
        getExportNamesAndExportAll(
          `
            export const loader = () => null;
            export default function Route() { return <main />; }
          `,
          'routes/simple.tsx'
        )
      ).resolves.toEqual({
        exportNames: ['loader', 'default'],
        exportAllModules: [],
      });
      await expect(
        getExportNamesAndExportAll(
          `
            export const loader = () => null;
            export default function Route() { return null; }
          `,
          'routes/simple.ts'
        )
      ).resolves.toEqual({
        exportNames: ['loader', 'default'],
        exportAllModules: [],
      });
      await expect(
        getExportNamesAndExportAll(
          `
            export const action = () => null;
            export default function Route() { return <form />; }
          `,
          'routes/simple.tsx?react-router-route'
        )
      ).resolves.toEqual({
        exportNames: ['action', 'default'],
        exportAllModules: [],
      });
      expect(transformCalls).toBe(0);
    } finally {
      rspack.experiments.swc.transformSync = originalTransform;
    }
  });

  it('ignores erased default interfaces', async () => {
    await expect(
      getExportNamesAndExportAll(
        `export default interface RouteType { value: string }`
      )
    ).resolves.toEqual({ exportNames: [], exportAllModules: [] });
  });

  it('ignores erased ambient declarations', async () => {
    await expect(
      getExportNamesAndExportAll(`
        export declare function loader(): void;
        export declare const action: () => void;
        export declare class ServerOnly {}
        export const clientLoader = () => null;
      `)
    ).resolves.toEqual({
      exportNames: ['clientLoader'],
      exportAllModules: [],
    });
  });
});
