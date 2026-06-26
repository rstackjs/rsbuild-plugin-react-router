import { describe, expect, it } from '@rstest/core';
import { mapWithConcurrency } from '../src/concurrency';
import { getExportNames } from '../src/export-utils';
import {
  executeRouteTransformTask,
  type RouteModuleTransformTask,
} from '../src/route-transform-tasks';
import {
  createRouteTransformExecutorForTesting,
  createRouteTransformExecutor,
  getDefaultWorkerCount,
} from '../src/parallel-route-transforms';
import type {
  WorkerRequest,
  WorkerResponse,
} from '../src/parallel-route-transform-protocol';
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

type FakeWorkerHandler = (value: any) => void;

class FakeRouteTransformWorker {
  readonly messages: WorkerRequest[] = [];
  readonly handlers = new Map<string, FakeWorkerHandler[]>();
  failNextPostMessage = false;
  terminateCalls = 0;

  on(event: string, handler: FakeWorkerHandler): this {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
    return this;
  }

  postMessage(message: WorkerRequest): void {
    if (this.failNextPostMessage) {
      this.failNextPostMessage = false;
      throw new Error('postMessage failed');
    }
    this.messages.push(message);
  }

  async terminate(): Promise<number> {
    this.terminateCalls += 1;
    return 0;
  }

  emit(event: string, value: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(value);
    }
  }
}

describe('parallel route transforms', () => {
  it.each([
    [1, 0],
    [2, 0],
    [3, 1],
    [4, 1],
    [5, 3],
    [6, 4],
    [8, 4],
    [10, 4],
    [12, 4],
    [24, 4],
  ])('caps default worker count by available CPUs', (cpus, workers) => {
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

  it('rejects invalid explicit worker counts', () => {
    expect(() =>
      createRouteTransformExecutor({
        parallelTransforms: 1.5,
      })
    ).toThrow('must be false or a positive integer');
  });

  it('honors an explicit worker count', async () => {
    const executor = createRouteTransformExecutor({
      parallelTransforms: 2,
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
      parallelTransforms: false,
    });

    try {
      const result = await executor.run(createRouteModuleTask());

      expect(result.code).toContain('export default _withComponentProps');
      expect(result.code).not.toContain('loader');
    } finally {
      await executor.close();
    }
  });

  it('does not create route transform workers until work is scheduled', async () => {
    let createdWorkers = 0;
    const worker = new FakeRouteTransformWorker();
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelTransforms: 1,
      },
      () => {
        createdWorkers += 1;
        return worker;
      }
    );

    expect(createdWorkers).toBe(0);

    const pending = executor.run(createRouteModuleTask());
    expect(createdWorkers).toBe(1);
    worker.emit('message', {
      id: worker.messages[0]!.id,
      ok: true,
      result: { code: 'created lazily' },
    } satisfies WorkerResponse);
    await expect(pending).resolves.toEqual({ code: 'created lazily' });

    await executor.close();
    expect(worker.terminateCalls).toBe(1);
  });

  it('rejects in-flight worker tasks on idempotent close and runs inline afterward', async () => {
    const worker = new FakeRouteTransformWorker();
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelTransforms: 1,
      },
      () => worker
    );

    const pending = executor.run(createRouteModuleTask());
    expect(worker.messages).toHaveLength(1);

    const firstClose = executor.close();
    const secondClose = executor.close();

    await expect(pending).rejects.toThrow('Route transform worker closed.');
    await expect(Promise.all([firstClose, secondClose])).resolves.toEqual([
      undefined,
      undefined,
    ]);
    expect(worker.terminateCalls).toBe(1);

    const inlineResult = await executor.run(createRouteModuleTask());
    expect(inlineResult.code).toContain('export default _withComponentProps');
    expect(worker.messages).toHaveLength(1);
  });

  it('sends full source again after a cached worker request fails to post', async () => {
    const worker = new FakeRouteTransformWorker();
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelTransforms: 1,
      },
      () => worker
    );
    const task = createRouteModuleTask();

    const firstRun = executor.run(task);
    expect(worker.messages[0]?.task.code).toBe(task.code);
    worker.emit('message', {
      id: worker.messages[0]!.id,
      ok: true,
      result: { code: 'first' },
    } satisfies WorkerResponse);
    await expect(firstRun).resolves.toEqual({ code: 'first' });

    worker.failNextPostMessage = true;
    await expect(executor.run(task)).rejects.toThrow('postMessage failed');

    const thirdRun = executor.run(task);
    expect(worker.messages[1]?.task.code).toBe(task.code);
    worker.emit('message', {
      id: worker.messages[1]!.id,
      ok: true,
      result: { code: 'third' },
    } satisfies WorkerResponse);
    await expect(thirdRun).resolves.toEqual({ code: 'third' });

    await executor.close();
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
      parallelTransforms: 2,
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
      parallelTransforms: 2,
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
      parallelTransforms: 2,
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
      parallelTransforms: 2,
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

      expect(nodeResult.code).toContain('loader');
      expect(webResult.code).not.toContain('loader');
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
