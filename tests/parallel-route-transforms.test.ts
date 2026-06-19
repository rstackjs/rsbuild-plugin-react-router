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
    [24, { routeCount: 256 }, 8],
    [24, { routeCount: 256, splitRouteModules: true }, 6],
  ])('chooses the default worker count', (cpus, options, workers) => {
    expect(getDefaultWorkerCount(cpus, options)).toBe(workers);
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 2],
    [8, 6],
    [24, 6],
  ])('caps split route module builds at six workers', (cpus, workers) => {
    expect(
      getDefaultWorkerCount(cpus, {
        routeCount: 256,
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
    [10, 8],
    [24, 8],
  ])('caps regular route builds at eight workers', (cpus, workers) => {
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
