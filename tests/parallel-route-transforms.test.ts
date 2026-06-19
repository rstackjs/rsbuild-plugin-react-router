import { describe, expect, it, rstest } from '@rstest/core';
import * as exportUtils from '../src/export-utils';
import {
  executeRouteTransformTask,
  type RouteModuleTransformTask,
} from '../src/route-transform-tasks';
import {
  createRouteTransformExecutor,
  getDefaultWorkerCount,
} from '../src/parallel-route-transforms';
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
const createRouteModuleTask = (
  overrides: Partial<Omit<RouteModuleTransformTask, 'kind'>> = {}
): RouteModuleTransformTask => ({
  kind: 'routeModule' as const,
  code: `
    import { serverValue } from '../server-data.server';
    export async function loader() { return serverValue; }
    export default function Route() { return null; }
  `,
  resource: `${resourcePath}?react-router-route`,
  resourcePath,
  environmentName: 'web',
  ssr: true,
  isBuild: false,
  isSpaMode: false,
  rootRoutePath: '/app/root.tsx',
  ...overrides,
});

describe('parallel route transforms', () => {
  it.each([
    [1, {}, 0],
    [2, {}, 0],
    [3, {}, 0],
    [4, {}, 2],
    [6, {}, 4],
    [8, {}, 6],
    [24, {}, 8],
    [24, { routeCount: 48 }, 0],
    [24, { routeCount: 256 }, 6],
    [24, { routeCount: 256, splitRouteModules: true }, 2],
    [24, { routeCount: 1024 }, 2],
    [24, { routeCount: 1024, splitRouteModules: true }, 2],
  ])('chooses the default worker count', (cpus, options, workers) => {
    expect(getDefaultWorkerCount(cpus, options)).toBe(workers);
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 2],
    [8, 2],
    [10, 2],
    [24, 2],
  ])('caps medium split route module builds at two workers', (cpus, workers) => {
    expect(
      getDefaultWorkerCount(cpus, {
        routeCount: 256,
        splitRouteModules: true,
      })
    ).toBe(workers);
  });

  it.each([
    [4, 2],
    [6, 2],
    [10, 2],
    [24, 2],
  ])('caps very large route module builds at two workers', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus, { routeCount: 1024 })).toBe(workers);
    expect(
      getDefaultWorkerCount(cpus, {
        routeCount: 1024,
        splitRouteModules: true,
      })
    ).toBe(workers);
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 2],
    [6, 4],
    [10, 6],
    [24, 6],
  ])('caps regular route builds at six workers', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus, { routeCount: 256 })).toBe(workers);
  });

  it.each([
    [1, 0],
    [24, 0],
  ])('runs small route builds inline by default', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus, { routeCount: 48 })).toBe(workers);
  });

  it('honors explicit maxWorkers for small route builds', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: { maxWorkers: 2 },
      routeCount: 48,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('runs small route builds inline when no worker pool is needed', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: true,
      routeCount: 48,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 2],
    [6, 4],
    [8, 6],
    [10, 8],
    [12, 8],
    [24, 8],
  ])('defaults to cpu count minus two cores capped at eight workers', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus)).toBe(workers);
  });

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

  it('does not run bundler route analysis for client entries without split route chunks', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );

    try {
      await executeRouteTransformTask({
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
      });

      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('does not run bundler route analysis for split client entries without split export names', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );

    try {
      const result = await executeRouteTransformTask({
        kind: 'routeClientEntry',
        code: `
          export async function loader() { return null; }
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result.code).toBe(
        `export { default } from "${resourcePath}?react-router-route";`
      );
      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('does not run bundler route analysis for split route export modules without split export names', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );
    const code = `
      export async function loader() { return null; }
      export default function Route() { return null; }
    `;

    try {
      const result = await executeRouteTransformTask({
        kind: 'splitRouteExports',
        code,
        resourcePath,
        routeChunkConfig,
      });

      expect(result).toEqual({ code, map: null });
      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('does not run bundler route analysis for client-only stubs', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );

    try {
      await executeRouteTransformTask({
        kind: 'clientOnlyStub',
        code: `
          export const clientValue = 'client';
          export default function ClientOnly() { return null; }
        `,
        resourcePath: '/app/client-data.client.ts',
      });

      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('can execute route module tasks through worker-backed parallelism', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: { maxWorkers: 2 },
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('shares build route module results across environments when output is identical', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: { maxWorkers: 2 },
      routeCount: 1024,
      splitRouteModules: true,
    });
    const task = createRouteModuleTask({
      code: `
        export async function clientLoader() { return null; }
        export default function Route() { return null; }
      `,
      environmentName: 'node',
      isBuild: true,
    });

    try {
      const nodeResult = await executor.run(task);
      const webResult = await executor.run({
        ...task,
        environmentName: 'web',
      });

      expect(webResult).toEqual(nodeResult);
    } finally {
      await executor.close();
    }
  });

  it('does not share build route module results when web removes server-only exports', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: { maxWorkers: 2 },
      routeCount: 1024,
      splitRouteModules: true,
    });
    const task = createRouteModuleTask({
      environmentName: 'node',
      isBuild: true,
    });

    try {
      const nodeResult = await executor.run(task);
      const webResult = await executor.run({
        ...task,
        environmentName: 'web',
      });

      expect(nodeResult.code).toContain('loader');
      expect(webResult.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('preserves value imports when web route modules have no server-only exports', async () => {
    const result = await executeRouteTransformTask(
      createRouteModuleTask({
        code: `
          import { setup } from './side-effect';
          export default function Route() { return null; }
        `,
        environmentName: 'web',
        ssr: false,
        isBuild: true,
      })
    );

    expect(result.code).toContain(`import { setup } from './side-effect';`);
  });

  it('does not run bundler route analysis for non-SPA route module transforms', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );

    try {
      await executeRouteTransformTask(createRouteModuleTask());

      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('validates SPA route modules without bundler route analysis', async () => {
    const getBundlerRouteAnalysis = rstest.spyOn(
      exportUtils,
      'getBundlerRouteAnalysis'
    );

    try {
      const result = await executeRouteTransformTask(
        createRouteModuleTask({
          code: `
            export async function clientLoader() { return null; }
            export default function Route() { return null; }
          `,
          ssr: false,
          isSpaMode: true,
        })
      );

      expect(result.code).toContain('clientLoader');
      expect(getBundlerRouteAnalysis).not.toHaveBeenCalled();
    } finally {
      getBundlerRouteAnalysis.mockRestore();
    }
  });

  it('rejects invalid SPA route module exports from the route transform AST', async () => {
    await expect(
      executeRouteTransformTask(
        createRouteModuleTask({
          code: `
            export async function action() { return null; }
            export default function Route() { return null; }
          `,
          ssr: false,
          isSpaMode: true,
        })
      )
    ).rejects.toThrow('SPA Mode: 1 invalid route export');
  });

  it('generates route module source maps only outside build mode', async () => {
    const task = createRouteModuleTask({
      code: `
        export async function loader() { return null; }
        export default function Route() { return null; }
      `,
    });

    await expect(
      executeRouteTransformTask({
        ...task,
        isBuild: true,
      })
    ).resolves.toMatchObject({ map: null });

    const devResult = await executeRouteTransformTask({
      ...task,
      isBuild: false,
    });

    expect(devResult.map).not.toBeNull();
  });
});
