import { describe, expect, it } from '@rstest/core';
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
