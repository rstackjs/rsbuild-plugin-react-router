import { describe, expect, it } from '@rstest/core';
import { mapWithConcurrency } from '../src/concurrency';
import { getExportNames } from '../src/export-utils';
import {
  executeRouteTransformTask,
  type RouteModuleTransformTask,
} from '../src/route-transform-tasks';
import {
  createRouteTransformExecutor,
  getDefaultWorkerCount,
  shouldParallelizeRouteTransforms,
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
  sourceMaps: true,
  ssr: true,
  isBuild: false,
  isSpaMode: false,
  rootRoutePath: '/app/root.tsx',
  ...overrides,
});

describe('parallel route transforms', () => {
  it.each([
    [48, false],
    [255, false],
    [256, true],
    [1024, true],
  ])('selects the adaptive default for %i routes', (routeCount, expected) => {
    expect(shouldParallelizeRouteTransforms(routeCount)).toBe(expected);
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 1],
    [4, 2],
    [6, 4],
    [8, 6],
    [10, 8],
    [12, 10],
    [24, 22],
  ])('defaults worker count to CPU cores minus two', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus)).toBe(workers);
  });

  it('maps work with a concurrency cap while preserving result order', async () => {
    let active = 0;
    let maxActive = 0;
    const result = await mapWithConcurrency([3, 1, 2], 2, async value => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise(resolve => setTimeout(resolve, value));
      active -= 1;
      return value * 2;
    });

    expect(result).toEqual([6, 2, 4]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it.each([0, Number.NaN, 1.5])(
    'rejects invalid explicit worker count %s',
    workerCount => {
      expect(() =>
        createRouteTransformExecutor({
          parallelRouteTransform: workerCount,
        })
      ).toThrow('must be true, false, or a positive integer');
    }
  );

  it('allows one explicit worker', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 1,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('honors an explicit worker count', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 2,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('forces the default worker count with true', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: true,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('runs route builds inline when parallel transforms are disabled', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: false,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
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

  it('can execute route module tasks through worker-backed parallelism', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 2,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('produces identical build route modules when environments need the same output', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 2,
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

  it('keeps environment-specific build route module output isolated', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 2,
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

      await expect(getExportNames(nodeResult.code)).resolves.toContain(
        'loader'
      );
      await expect(getExportNames(webResult.code)).resolves.not.toContain(
        'loader'
      );
    } finally {
      await executor.close();
    }
  });

  it('isolates escaped server exports across build environments', async () => {
    const executor = createRouteTransformExecutor({
      parallelRouteTransform: 2,
      splitRouteModules: true,
    });
    const task = createRouteModuleTask({
      code: String.raw`
        const implementation = async () => null;
        export { implementation as lo\u0061der };
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

      await expect(getExportNames(nodeResult.code)).resolves.toContain(
        'loader'
      );
      await expect(getExportNames(webResult.code)).resolves.not.toContain(
        'loader'
      );
    } finally {
      await executor.close();
    }
  });

  it('preserves runtime TypeScript for the downstream Rsbuild SWC stage', async () => {
    const result = await executeRouteTransformTask(
      createRouteModuleTask({
        code: `
          export enum Status { Active }
          export default function Route() { return Status.Active; }
        `,
        environmentName: 'node',
        isBuild: true,
      })
    );

    expect(result.code).toContain('enum Status');
    expect(result.code).toContain('Status.Active');
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

  it('generates route module source maps when the environment requests them', async () => {
    const task = createRouteModuleTask({
      code: `
        export async function loader() { return null; }
        export default function Route() { return null; }
      `,
    });

    const buildResult = await executeRouteTransformTask({
      ...task,
      isBuild: true,
    });
    expect(buildResult.map).not.toBeNull();

    const devResult = await executeRouteTransformTask({
      ...task,
      isBuild: false,
    });

    expect(devResult.map).not.toBeNull();

    const withoutSourceMaps = await executeRouteTransformTask({
      ...task,
      sourceMaps: false,
    });
    expect(withoutSourceMaps.map).toBeNull();
  });
});
