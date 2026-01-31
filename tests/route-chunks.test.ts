import { describe, expect, it } from '@rstest/core';
import {
  detectRouteChunksIfEnabled,
  validateRouteChunks,
} from '../src/route-chunks';

const config = {
  splitRouteModules: true as const,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

const enforceConfig = {
  splitRouteModules: 'enforce' as const,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

describe('route chunks', () => {
  it('detects chunkable client exports', async () => {
    const code = `
      export const clientAction = async () => {};
      export const clientLoader = async () => {};
      export const clientMiddleware = async () => {};
      export function HydrateFallback() { return null; }
      export default function Route() { return null; }
    `;

    const result = await detectRouteChunksIfEnabled(
      undefined,
      config,
      '/app/routes/demo.tsx',
      code
    );

    expect(result.hasRouteChunks).toBe(true);
    expect(result.hasRouteChunkByExportName.clientAction).toBe(true);
    expect(result.hasRouteChunkByExportName.clientLoader).toBe(true);
    expect(result.hasRouteChunkByExportName.clientMiddleware).toBe(true);
    expect(result.hasRouteChunkByExportName.HydrateFallback).toBe(true);
  });

  it('skips splitting for the root route', async () => {
    const code = `export const clientAction = async () => {};`;

    const result = await detectRouteChunksIfEnabled(
      undefined,
      config,
      '/app/root.tsx',
      code
    );

    expect(result.hasRouteChunks).toBe(false);
    expect(result.hasRouteChunkByExportName.clientAction).toBe(false);
  });

  it('throws when enforce is enabled and chunks cannot be split', async () => {
    const code = `
      const shared = () => {};
      export const clientAction = async () => shared();
      export const clientLoader = async () => shared();
    `;

    const result = await detectRouteChunksIfEnabled(
      undefined,
      enforceConfig,
      '/app/routes/shared.tsx',
      code
    );

    expect(result.hasRouteChunkByExportName.clientAction).toBe(false);
    expect(result.hasRouteChunkByExportName.clientLoader).toBe(false);

    expect(() =>
      validateRouteChunks({
        config: enforceConfig,
        id: '/app/routes/shared.tsx',
        valid: {
          clientAction: false,
          clientLoader: false,
          clientMiddleware: true,
          HydrateFallback: true,
        },
      })
    ).toThrowError(/Error splitting route module/);
  });
});
