import { describe, expect, it } from '@rstest/core';
import { executeRouteTransformTask } from '../src/route-transform-tasks';
import { createRouteTransformExecutor } from '../src/parallel-route-transforms';
import type { RouteChunkConfig } from '../src/route-chunks';

const routeChunkConfig: RouteChunkConfig = {
  splitRouteModules: true,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

const disabledRouteChunkConfig: RouteChunkConfig = {
  ...routeChunkConfig,
  splitRouteModules: false,
};

const resourcePath = '/app/routes/demo.tsx';

describe('parallel route transforms', () => {
  it('executes route client entry tasks through the shared task executor', async () => {
    await expect(
      executeRouteTransformTask({
        kind: 'routeClientEntry',
        code: `
          export async function loader() { return null; }
          export async function clientLoader() { return null; }
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: false,
        routeChunkConfig: disabledRouteChunkConfig,
      })
    ).resolves.toEqual({
      code: `export { clientLoader, default } from "${resourcePath}?react-router-route";`,
    });
  });

  it('can execute route module tasks through worker-backed parallelism', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: { maxWorkers: 2 },
    });

    try {
      const result = await executor.run({
        kind: 'routeModule',
        code: `
          import { serverValue } from '../server-data.server';
          export async function loader() { return serverValue; }
          export default function Route() { return null; }
        `,
        resource: `${resourcePath}?react-router-route`,
        resourcePath,
        environmentName: 'web',
        ssr: true,
        isSpaMode: false,
        rootRoutePath: '/app/root.tsx',
      });

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });
});
