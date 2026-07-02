import { describe, expect, it } from '@rstest/core';
import { getExportNames } from '../src/export-utils';
import {
  executeRouteTransformTask,
  type RouteTransformResult,
  type RouteClientEntryTransformTask,
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

const createRouteClientEntryTask = (
  overrides: Partial<Omit<RouteClientEntryTransformTask, 'kind'>> = {}
): RouteClientEntryTransformTask => ({
  kind: 'routeClientEntry' as const,
  code: `
    export async function clientLoader() { return null; }
    export default function Route() { return null; }
  `,
  resourcePath,
  environmentName: 'web',
  isBuild: true,
  routeChunkConfig,
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

const resolveWorkerMessage = (
  worker: FakeRouteTransformWorker,
  result: RouteTransformResult,
  messageIndex = worker.messages.length - 1
): void => {
  worker.emit('message', {
    id: worker.messages[messageIndex]!.id,
    ok: true,
    result,
  } satisfies WorkerResponse);
};

describe('parallel route transforms', () => {
  it.each([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 2],
    [6, 2],
    [8, 2],
    [10, 2],
    [12, 2],
    [24, 2],
  ])('caps default worker count by available CPUs', (cpus, workers) => {
    expect(getDefaultWorkerCount(cpus)).toBe(workers);
  });

  it.each([
    [1, 0],
    [2, 0],
    [3, 1],
    [4, 2],
    [5, 2],
    [8, 2],
  ])(
    'keeps build workers on small machines (%s CPUs -> %s workers)',
    (cpus, workers) => {
      expect(getDefaultWorkerCount(cpus, { isBuild: true })).toBe(workers);
    }
  );

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

  it('does not create route transform workers until work is scheduled', async () => {
    let createdWorkers = 0;
    const worker = new FakeRouteTransformWorker();
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelRouteTransform: 1,
      },
      () => {
        createdWorkers += 1;
        return worker;
      }
    );

    expect(createdWorkers).toBe(0);

    const pending = executor.run(createRouteModuleTask());
    expect(createdWorkers).toBe(1);
    resolveWorkerMessage(worker, { code: 'created lazily' });
    await expect(pending).resolves.toEqual({ code: 'created lazily' });

    await executor.close();
    expect(worker.terminateCalls).toBe(1);
  });

  it('rejects in-flight worker tasks on idempotent close and runs inline afterward', async () => {
    const worker = new FakeRouteTransformWorker();
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelRouteTransform: 1,
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
        parallelRouteTransform: 1,
      },
      () => worker
    );
    const task = createRouteModuleTask();

    const firstRun = executor.run(task);
    expect(worker.messages[0]?.task.code).toBe(task.code);
    resolveWorkerMessage(worker, { code: 'first' }, 0);
    await expect(firstRun).resolves.toEqual({ code: 'first' });

    worker.failNextPostMessage = true;
    await expect(executor.run(task)).rejects.toThrow('postMessage failed');

    const thirdRun = executor.run(task);
    expect(worker.messages[1]?.task.code).toBe(task.code);
    resolveWorkerMessage(worker, { code: 'third' }, 1);
    await expect(thirdRun).resolves.toEqual({ code: 'third' });

    await executor.close();
  });

  it('creates only worker slots that receive scheduled work', async () => {
    const workers: FakeRouteTransformWorker[] = [];
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelRouteTransform: 4,
        splitRouteModules: true,
      },
      () => {
        const worker = new FakeRouteTransformWorker();
        workers.push(worker);
        return worker;
      }
    );

    const first = executor.run(createRouteModuleTask());
    const second = executor.run(
      createRouteModuleTask({ resourcePath: '/app/routes/other.tsx' })
    );

    expect(workers).toHaveLength(2);

    for (const worker of workers) {
      resolveWorkerMessage(worker, { code: 'done' });
    }

    await expect(Promise.all([first, second])).resolves.toEqual([
      { code: 'done' },
      { code: 'done' },
    ]);

    await executor.close();
    expect(workers.map(worker => worker.terminateCalls)).toEqual([1, 1]);
  });

  it('keeps related route source transforms on the same worker', async () => {
    const workers: FakeRouteTransformWorker[] = [];
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelRouteTransform: 2,
        splitRouteModules: true,
      },
      () => {
        const worker = new FakeRouteTransformWorker();
        workers.push(worker);
        return worker;
      }
    );
    const code = `
      export async function clientLoader() { return null; }
      export default function Route() { return null; }
    `;

    const clientEntry = executor.run(createRouteClientEntryTask({ code }));
    expect(workers).toHaveLength(1);
    expect(workers[0]?.messages[0]?.task.code).toBe(code);
    resolveWorkerMessage(workers[0]!, { code: 'client' });
    await expect(clientEntry).resolves.toEqual({ code: 'client' });

    const routeModule = executor.run(
      createRouteModuleTask({
        code,
        environmentName: 'node',
        isBuild: true,
      })
    );
    expect(workers).toHaveLength(1);
    expect(workers[0]?.messages[1]?.task.code).toBeUndefined();
    resolveWorkerMessage(workers[0]!, { code: 'module' });
    await expect(routeModule).resolves.toEqual({ code: 'module' });

    await executor.close();
  });

  it('can prewarm worker slots before the first route transform', async () => {
    const workers: FakeRouteTransformWorker[] = [];
    const executor = createRouteTransformExecutorForTesting(
      {
        parallelRouteTransform: 4,
      },
      () => {
        const worker = new FakeRouteTransformWorker();
        workers.push(worker);
        return worker;
      }
    );

    executor.prewarm();
    executor.prewarm();
    expect(workers).toHaveLength(4);

    executor.prewarm();
    expect(workers).toHaveLength(4);

    await executor.close();
    expect(workers.map(worker => worker.terminateCalls)).toEqual([
      1, 1, 1, 1,
    ]);
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
