import { describe, expect, it } from '@rstest/core';
import {
  detectRouteChunksIfEnabled,
  getRouteChunkIfEnabled,
  routeChunkNames,
  type RouteChunkCache,
  type RouteChunkConfig,
  type RouteChunkInfo,
  type RouteChunkName,
} from '../src/route-chunks';

const config: RouteChunkConfig = {
  splitRouteModules: true,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

const routeId = '/app/routes/demo.tsx';

const chunkableCode = `
  const actionHelper = () => null;
  const loaderHelper = () => null;
  const middlewareHelper = () => null;
  const fallbackHelper = () => null;
  export const clientAction = async () => actionHelper();
  export const clientLoader = async () => loaderHelper();
  export const clientMiddleware = async () => middlewareHelper();
  export function HydrateFallback() { return fallbackHelper(); }
  export async function action() { return null; }
  export default function Route() { return null; }
`;

const nonChunkableCode = `
  const shared = () => null;
  export default function Route() { return shared(); }
  export const clientAction = async () => shared();
`;

const collectRouteChunkOracle = async (
  cache: RouteChunkCache | undefined,
  code = chunkableCode
) => {
  const info = await detectRouteChunksIfEnabled(cache, config, routeId, code);
  const chunks = Object.fromEntries(
    await Promise.all(
      routeChunkNames.map(async chunkName => [
        chunkName,
        await getRouteChunkIfEnabled(cache, config, routeId, chunkName, code),
      ])
    )
  ) as Record<RouteChunkName, string | null>;

  return { info, chunks };
};

const expectAllRouteChunks = (info: RouteChunkInfo) => {
  expect(info.hasRouteChunks).toBe(true);
  expect(info.chunkedExports).toEqual([
    'clientAction',
    'clientLoader',
    'clientMiddleware',
    'HydrateFallback',
  ]);
  expect(info.hasRouteChunkByExportName).toEqual({
    clientAction: true,
    clientLoader: true,
    clientMiddleware: true,
    HydrateFallback: true,
  });
};

describe('route chunk cache', () => {
  it('invalidates cached detection when the same route id receives changed code', async () => {
    const cache = new Map();

    const first = await detectRouteChunksIfEnabled(
      cache,
      config,
      routeId,
      chunkableCode
    );
    const second = await detectRouteChunksIfEnabled(
      cache,
      config,
      routeId,
      nonChunkableCode
    );

    expectAllRouteChunks(first);
    expect(second.hasRouteChunks).toBe(false);
    expect(second.hasRouteChunkByExportName.clientAction).toBe(false);
  });

  it('returns identical route chunk info and generated chunks across repeated cached calls', async () => {
    const cache = new Map();

    const first = await collectRouteChunkOracle(cache);
    const second = await collectRouteChunkOracle(cache);

    expect(second).toEqual(first);
    expectAllRouteChunks(first.info);
    expect(first.chunks.main).not.toContain('clientAction');
    expect(first.chunks.clientAction).toContain('clientAction');
    expect(first.chunks.clientLoader).toContain('clientLoader');
    expect(first.chunks.clientMiddleware).toContain('clientMiddleware');
    expect(first.chunks.HydrateFallback).toContain('HydrateFallback');
  });

  it('computes the same route chunk oracle with and without an explicit cache', async () => {
    const cached = await collectRouteChunkOracle(new Map());
    const uncached = await collectRouteChunkOracle(undefined);

    expect(uncached).toEqual(cached);
  });

  it('stores the Yuku route chunk analysis entries for repeated chunk generation', async () => {
    const cache = new Map();

    await collectRouteChunkOracle(cache);

    expect(Array.from(cache.keys()).sort()).toEqual([
      'routes/demo.tsx::analyzeCode',
      'routes/demo.tsx::getChunkedExport::HydrateFallback',
      'routes/demo.tsx::getChunkedExport::clientAction',
      'routes/demo.tsx::getChunkedExport::clientLoader',
      'routes/demo.tsx::getChunkedExport::clientMiddleware',
      'routes/demo.tsx::getExportDependencies',
      'routes/demo.tsx::hasChunkableExport::HydrateFallback',
      'routes/demo.tsx::hasChunkableExport::clientAction',
      'routes/demo.tsx::hasChunkableExport::clientLoader',
      'routes/demo.tsx::hasChunkableExport::clientMiddleware',
      'routes/demo.tsx::omitChunkedExports::clientAction,clientLoader,clientMiddleware,HydrateFallback',
    ]);
  });
});
