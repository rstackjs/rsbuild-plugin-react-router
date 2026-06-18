import { describe, expect, it } from '@rstest/core';
import { getBundlerRouteAnalysis } from '../src/export-utils';
import { parse } from '../src/babel';
import { transformToEsm } from '../src/export-utils';

const routeChunkConfig = {
  splitRouteModules: true as const,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

describe('getBundlerRouteAnalysis', () => {
  it('reuses transformed code, export names, and chunk info for the same source', async () => {
    const source = `
      export const clientAction = async () => {};
      export default function Route() { return null; }
    `;
    const resourcePath = '/app/routes/demo.tsx';

    const first = await getBundlerRouteAnalysis(source, resourcePath);
    const second = await getBundlerRouteAnalysis(source, resourcePath);

    expect(second).toBe(first);
    expect(second.code).toBe(first.code);
    expect(second.getExportNames()).toBe(first.getExportNames());
    expect(second.getRouteChunkInfo(undefined, routeChunkConfig)).toBe(
      first.getRouteChunkInfo(undefined, routeChunkConfig)
    );

    expect(await first.getExportNames()).toEqual([
      'clientAction',
      'default',
    ]);
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
    await expect(updated.getExportNames()).resolves.toEqual(['clientLoader']);
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
