import { describe, expect, it } from '@rstest/core';
import {
  createRouteTransformExecutor,
  shouldParallelizeRouteTransforms,
} from '../src/parallel-route-transforms';

describe('route transform executor', () => {
  it('enables Rspack loader parallelism for large route graphs', () => {
    expect(shouldParallelizeRouteTransforms(255)).toBe(false);
    expect(shouldParallelizeRouteTransforms(256)).toBe(true);
  });

  it('runs non-loader route transform tasks inline', async () => {
    const executor = createRouteTransformExecutor();

    await expect(
      executor.run({
        kind: 'routeModule',
        code: `
          export async function loader() { return null; }
          export default function Route() { return null; }
        `,
        resource: '/project/app/routes/page.tsx?react-router-route',
        resourcePath: '/project/app/routes/page.tsx',
        environmentName: 'web',
        sourceMaps: false,
        ssr: true,
        isBuild: false,
        isSpaMode: false,
        rootRoutePath: '/project/app/root.tsx',
      })
    ).resolves.toMatchObject({
      code: expect.stringContaining('export default _withComponentProps'),
    });

    expect(() => executor.prewarm()).not.toThrow();
    await expect(executor.close()).resolves.toBeUndefined();
  });
});
