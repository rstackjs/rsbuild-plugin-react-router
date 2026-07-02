import type {
  OnAfterCreateCompilerFn,
  OnAfterDevCompileFn,
  OnBeforeDevCompileFn,
  OnBeforeStartDevServerFn,
  OnCloseDevServerFn,
  RsbuildDevServer,
  Rspack,
} from '@rsbuild/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { createReactRouterDevRuntimeController } from '../src/dev-runtime-controller';
import {
  createBuild,
  createGraphStats,
  createManifestSet,
  createManifestSetWithRoute,
  createStats,
} from './dev-runtime-fixtures';

type FailedCallback = (error: Error) => void;

const afterDoneByCompiler = new WeakMap<
  Rspack.Compiler,
  (stats: Rspack.Stats) => void
>();

const createCompiler = (name: 'web' | 'node') => {
  let failed: FailedCallback | undefined;
  let invalid: (() => void) | undefined;
  let thisCompilation: ((compilation: Rspack.Compilation) => void) | undefined;
  const doneTaps: Array<{
    stage: number;
    callback: (stats: Rspack.Stats) => void;
  }> = [];
  const compiler = {
    name,
    hooks: {
      thisCompilation: {
        tap(_name: string, callback: typeof thisCompilation) {
          thisCompilation = callback;
        },
      },
      done: {
        tap(options: unknown, callback: (stats: Rspack.Stats) => void) {
          const stage =
            typeof options === 'object' &&
            options !== null &&
            'stage' in options &&
            typeof options.stage === 'number'
              ? options.stage
              : 0;
          doneTaps.push({ stage, callback });
        },
      },
      afterDone: {
        tap(_name: unknown, callback: (stats: Rspack.Stats) => void) {
          afterDoneByCompiler.set(compiler, callback);
        },
      },
      failed: {
        tap(_name: string, callback: FailedCallback) {
          failed = callback;
        },
      },
      invalid: {
        tap(_name: string, callback: () => void) {
          invalid = callback;
        },
      },
    },
  } as unknown as Rspack.Compiler;
  const compile = (): Rspack.Compilation => {
    const compilation = {
      name,
      compiler,
      buildDependencies: new Set(),
      fileDependencies: new Set(),
      contextDependencies: new Set(),
      missingDependencies: new Set(),
    } as unknown as Rspack.Compilation;
    thisCompilation?.(compilation);
    return compilation;
  };
  const runDoneTaps = (
    compilation: Rspack.Compilation,
    predicate: (stage: number) => boolean
  ): void => {
    const stats = createStats(compilation);
    for (const tap of doneTaps
      .filter(({ stage }) => predicate(stage))
      .sort((left, right) => left.stage - right.stage)) {
      tap.callback(stats);
    }
  };
  return {
    compiler,
    compile,
    complete: (compilation: Rspack.Compilation) =>
      runDoneTaps(compilation, stage => stage < 0),
    completeLate: (compilation: Rspack.Compilation) =>
      runDoneTaps(compilation, stage => stage >= 0),
    fail: (error: Error) => failed?.(error),
    invalidate: () => invalid?.(),
    setChanges: (files: string[]) => {
      compiler.modifiedFiles = new Set(files);
      compiler.removedFiles = undefined;
    },
    settle: (compilation: Rspack.Compilation) =>
      afterDoneByCompiler.get(compiler)?.(createStats(compilation)),
  };
};

type TestServerSetup = (context: {
  action: 'dev';
  server: RsbuildDevServer;
}) => void;

type TestConfig = {
  server?: { setup?: TestServerSetup | TestServerSetup[] };
};

const createHarness = (userSetup?: TestServerSetup) => {
  let start!: OnBeforeStartDevServerFn;
  let startOrder: 'pre' | 'post' | 'default' = 'default';
  let before!: OnBeforeDevCompileFn;
  let beforeOrder: 'pre' | 'post' | 'default' = 'default';
  let closeHook: OnCloseDevServerFn | undefined;
  let closeOrder: 'pre' | 'post' | 'default' = 'default';
  let created!: OnAfterCreateCompilerFn;
  let after!: OnAfterDevCompileFn;
  const closeRecords = new WeakMap<RsbuildDevServer, { count: number }>();
  const warn = rstest.fn();
  let serverSetups = userSetup ? [userSetup] : [];
  const api = {
    logger: { error: rstest.fn(), warn },
    modifyRsbuildConfig: (
      callback:
        | ((config: TestConfig) => TestConfig | void)
        | { handler: (config: TestConfig) => TestConfig | void }
    ) => {
      const handler =
        typeof callback === 'function' ? callback : callback.handler;
      const nextConfig: TestConfig = { server: { setup: serverSetups } };
      const config = handler(nextConfig) ?? nextConfig;
      const setup = config.server?.setup;
      serverSetups = setup
        ? Array.isArray(setup)
          ? setup
          : [setup]
        : [];
    },
    onBeforeStartDevServer: (
      callback:
        | OnBeforeStartDevServerFn
        | {
            handler: OnBeforeStartDevServerFn;
            order: 'pre' | 'post' | 'default';
          }
    ) => {
      if (typeof callback === 'function') {
        start = callback;
        return;
      }
      start = callback.handler;
      startOrder = callback.order;
    },
    onBeforeDevCompile: (
      callback:
        | OnBeforeDevCompileFn
        | {
            handler: OnBeforeDevCompileFn;
            order: 'pre' | 'post' | 'default';
          }
    ) => {
      if (typeof callback === 'function') {
        before = callback;
        return;
      }
      before = callback.handler;
      beforeOrder = callback.order;
    },
    onCloseDevServer: (
      callback:
        | OnCloseDevServerFn
        | {
            handler: OnCloseDevServerFn;
            order: 'pre' | 'post' | 'default';
          }
    ) => {
      if (typeof callback === 'function') {
        closeHook = callback;
        return;
      }
      closeHook = callback.handler;
      closeOrder = callback.order;
    },
    onAfterCreateCompiler: (callback: OnAfterCreateCompilerFn) => {
      created = callback;
    },
    onAfterDevCompile: (callback: OnAfterDevCompileFn) => {
      after = callback;
    },
  };
  const controller = createReactRouterDevRuntimeController({
    api: api as never,
    isBuild: false,
    buildPlan: {
      defaultEntryName: 'static/js/app',
      entryNames: ['static/js/app'],
    },
  });
  const createServer = (
    loadBundle: (entryName: string) => Promise<unknown> | unknown,
    afterCloseHook?: () => Promise<void> | void
  ): RsbuildDevServer => {
    let closing: Promise<void> | undefined;
      const record = { count: 0 };
      const server = {
        close() {
          if (!closing) {
            record.count++;
            closing = (async () => {
              await closeHook?.();
              await afterCloseHook?.();
            })();
          }
          return closing;
        },
      environments: { node: { loadBundle } },
      sockWrite: rstest.fn(),
    } as unknown as RsbuildDevServer;
    closeRecords.set(server, record);
    for (const setup of serverSetups) {
      setup({ action: 'dev', server });
    }
    return server;
  };
  const loadBundle = rstest.fn();
  const server = createServer(loadBundle);
  let currentServer = server;
  const environments = {};
  const settleStats = (stats: Rspack.Stats | Rspack.MultiStats): void => {
    const children = Array.isArray((stats as Rspack.MultiStats).stats)
      ? (stats as Rspack.MultiStats).stats
      : [stats as Rspack.Stats];
    for (const child of children) {
      afterDoneByCompiler.get(child.compilation.compiler)?.(child);
    }
  };
  const callbacks = {
    after: async ({ stats }: { stats: Rspack.Stats | Rspack.MultiStats }) => {
      await after({ environments, isFirstCompile: false, stats });
      settleStats(stats);
      await new Promise(resolve => setTimeout(resolve, 0));
    },
    aggregate: ({ stats }: { stats: Rspack.Stats | Rspack.MultiStats }) =>
      after({ environments, isFirstCompile: false, stats }),
    before: () =>
      before({
        environments,
        isFirstCompile: false,
        isWatch: true,
      }),
    close: () => currentServer.close(),
    created: ({
      compiler,
    }: {
      compiler: Rspack.Compiler | { compilers: Rspack.Compiler[] };
    }) =>
      created({
        compiler: compiler as Rspack.Compiler | Rspack.MultiCompiler,
        environments,
      }),
    start: ({ server }: { server: RsbuildDevServer }) => {
      const previous = currentServer;
      currentServer = server;
      return Promise.resolve(start({ environments, server })).catch(error => {
        if (currentServer === server) {
          currentServer = previous;
        }
        throw error;
      });
    },
    settle: settleStats,
  };
  return {
    callbacks,
    beforeOrder,
    closeOrder,
    controller,
    createServer,
    getCloseCount: (server: RsbuildDevServer) =>
      closeRecords.get(server)?.count ?? 0,
    loadBundle,
    server,
    startOrder,
    warn,
  };
};

describe('React Router development runtime controller', () => {
  it('validates lifecycle state before default startup hooks', () => {
    const { beforeOrder, closeOrder, startOrder } = createHarness();
    expect(beforeOrder).toBe('pre');
    expect(startOrder).toBe('pre');
    expect(closeOrder).toBe('pre');
  });

  it('rejects readiness when Rsbuild does not create both compilers', async () => {
    const { callbacks, controller, server } = createHarness();
    const compiler = createCompiler('web');
    await callbacks.start({ server });

    callbacks.created({ compiler: compiler.compiler });

    await expect(controller.createBuildLoader()()).rejects.toThrow(
      'did not create a multi-compiler'
    );
  });

  it('rejects initial readiness when aggregate stats omit an environment', async () => {
    const { callbacks, controller, server } = createHarness();
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const waiting = controller.createBuildLoader()();
    const webCompilation = web.compile();
    controller.captureWeb(webCompilation, createManifestSet('web'));

    await callbacks.after({ stats: createStats(webCompilation) });

    await expect(waiting).rejects.toThrow(
      'did not provide both web and node results'
    );
  });

  it('rejects a fatal child failure and recovers on the next compile', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const waiting = controller.createBuildLoader()();

    web.fail(new Error('fatal compiler failure'));

    await expect(waiting).rejects.toThrow('fatal compiler failure');

    loadBundle.mockImplementation(() => createBuild('recovered'));
    callbacks.before();
    const webCompilation = web.compile();
    controller.captureWeb(webCompilation, createManifestSet('recovered'));
    web.complete(webCompilation);
    const nodeCompilation = node.compile();
    const recovered = controller.createBuildLoader()();
    await callbacks.after({
      stats: createGraphStats(webCompilation, nodeCompilation),
    });

    await expect(recovered).resolves.toMatchObject({
      marker: 'recovered',
      assets: { version: 'recovered' },
    });
  });

  it('publishes a safe web-only compile after the aggregate pre-hook', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('base'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('web-base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    web.setChanges(['/app/web-only.ts']);
    callbacks.before();
    const nextWeb = web.compile();
    controller.captureWeb(nextWeb, createManifestSet('web-next'));
    web.complete(nextWeb);
    await callbacks.after({ stats: createGraphStats(nextWeb, baseNode) });

    await expect(controller.createBuildLoader()()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-next' },
    });
    expect(loadBundle).toHaveBeenCalledOnce();
  });

  it('hard reloads when a safe web-only compile removes CSS assets', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('base'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(
      baseWeb,
      createManifestSet('web-base', {
        entry: ['/assets/entry.css'],
        routes: { 'routes/about': ['/assets/about.css'] },
      })
    );
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });
    expect(server.sockWrite).not.toHaveBeenCalled();

    web.setChanges(['/app/routes/about.tsx']);
    callbacks.before();
    const nextWeb = web.compile();
    controller.captureWeb(
      nextWeb,
      createManifestSet('web-next', {
        entry: ['/assets/entry.css'],
      })
    );
    web.complete(nextWeb);
    await callbacks.after({ stats: createGraphStats(nextWeb, baseNode) });

    await expect(controller.createBuildLoader()()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-next' },
    });
    expect(server.sockWrite).toHaveBeenCalledWith('full-reload', {
      path: '*',
    });

    web.invalidate();
    await expect
      .poll(() => (server.sockWrite as any).mock.calls.length, {
        timeout: 2000,
      })
      .toBe(2);
  });

  it('hard reloads when CSS ownership is restored after a removal', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('base'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(
      baseWeb,
      createManifestSet('web-base', {
        routes: { 'routes/about': ['/assets/about.css'] },
      })
    );
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    web.setChanges(['/app/routes/about.tsx']);
    callbacks.before();
    const removedCssWeb = web.compile();
    controller.captureWeb(
      removedCssWeb,
      createManifestSet('without-css', {
        routes: { 'routes/about': [] },
      })
    );
    web.complete(removedCssWeb);
    await callbacks.after({ stats: createGraphStats(removedCssWeb, baseNode) });

    web.setChanges(['/app/routes/about.tsx']);
    callbacks.before();
    const readdedCssWeb = web.compile();
    controller.captureWeb(
      readdedCssWeb,
      createManifestSet('readded-css', {
        routes: { 'routes/about': ['/assets/about.css'] },
      })
    );
    web.complete(readdedCssWeb);
    await callbacks.after({ stats: createGraphStats(readdedCssWeb, baseNode) });

    await expect(controller.createBuildLoader()()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'readded-css' },
    });
    expect(server.sockWrite).toHaveBeenCalledTimes(2);
    expect(server.sockWrite).toHaveBeenNthCalledWith(1, 'full-reload', {
      path: '*',
    });
    expect(server.sockWrite).toHaveBeenNthCalledWith(2, 'full-reload', {
      path: '*',
    });
  });

  it('hard reloads when route export metadata changes', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('base'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const finishCompile = async (
      version: string,
      route: Parameters<typeof createManifestSetWithRoute>[2]
    ) => {
      callbacks.before();
      const webCompilation = web.compile();
      controller.captureWeb(
        webCompilation,
        createManifestSetWithRoute(version, 'routes/about', route)
      );
      web.complete(webCompilation);
      const nodeCompilation = node.compile();
      await callbacks.after({
        stats: createGraphStats(webCompilation, nodeCompilation),
      });
    };

    await finishCompile('web-base', { hasClientLoader: false });
    await finishCompile('web-next', {
      hasClientLoader: true,
      clientLoaderModule: '/routes/about.clientLoader.js',
    });

    expect(server.sockWrite).toHaveBeenCalledWith('full-reload', { path: '*' });
  });

  it('publishes a safe node-only compile after the aggregate pre-hook', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    let build = createBuild('base');
    loadBundle.mockImplementation(() => build);
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('web-base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    build = createBuild('node-next');
    node.setChanges(['/app/node-only.ts']);
    callbacks.before();
    const nextNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, nextNode) });

    await expect(controller.createBuildLoader()()).resolves.toMatchObject({
      marker: 'node-next',
      assets: { version: 'web-base' },
    });
    expect(loadBundle).toHaveBeenCalledTimes(2);
  });

  it('keeps last-good output when a one-sided node compile cannot evaluate', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    let build: unknown = createBuild('base');
    loadBundle.mockImplementation(() => build);
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('web-base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });
    const committed = await controller.createBuildLoader()();

    build = {};
    node.setChanges(['/app/node-only.ts']);
    callbacks.before();
    const nextNode = node.compile();
    await expect(callbacks.after({ stats: createStats(nextNode) })).resolves.toBe(
      undefined
    );

    expect(loadBundle).toHaveBeenCalledTimes(2);
    await expect(controller.createBuildLoader()()).resolves.toBe(committed);
  });

  it('publishes an initial same-attempt compile when node starts before web completes', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('parallel'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const waiting = controller.createBuildLoader()();

    const nodeCompilation = node.compile();
    const webCompilation = web.compile();
    controller.captureWeb(webCompilation, createManifestSet('parallel'));
    web.complete(webCompilation);
    await callbacks.after({
      stats: createGraphStats(webCompilation, nodeCompilation),
    });

    const published = await Promise.race([
      waiting,
      new Promise(resolve => setTimeout(() => resolve('pending'), 0)),
    ]);
    expect(published).toMatchObject({
      marker: 'parallel',
      assets: { version: 'parallel' },
    });
    expect(loadBundle).toHaveBeenCalledOnce();
  });

  it('publishes a same-attempt rebuild when node starts before web completes', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    let build = createBuild('base');
    loadBundle.mockImplementation(() => build);
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const loadBuild = controller.createBuildLoader();

    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    build = createBuild('node-b');
    callbacks.before();
    const nodeB = node.compile();
    const webB = web.compile();
    controller.captureWeb(webB, createManifestSet('web-b'));
    web.complete(webB);
    await callbacks.after({ stats: createGraphStats(webB, nodeB) });

    expect(loadBundle).toHaveBeenCalledTimes(2);
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'node-b',
      assets: { version: 'web-b' },
    });
  });

  it('waits for late done hooks before snapshotting dependencies', async () => {
    const routePath = '/app/routes.ts';
    const { callbacks, controller, loadBundle, server, warn } = createHarness();
    loadBundle.mockImplementation(() => createBuild('base'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    node.compiler.hooks.done.tap(
      { name: 'late-node-dependency', stage: 1000 },
      stats => stats.compilation.buildDependencies.add(routePath)
    );
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    callbacks.before();
    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('web-base'));
    web.complete(baseWeb);
    web.settle(baseWeb);
    const baseNode = node.compile();
    await callbacks.aggregate({ stats: createGraphStats(baseWeb, baseNode) });
    node.completeLate(baseNode);
    node.settle(baseNode);
    const committed = await controller.createBuildLoader()();

    web.setChanges([routePath]);
    callbacks.before();
    const nextWeb = web.compile();
    controller.captureWeb(nextWeb, createManifestSet('web-next'));
    web.complete(nextWeb);
    await callbacks.aggregate({ stats: createGraphStats(nextWeb, baseNode) });
    web.settle(nextWeb);

    expect(await controller.createBuildLoader()()).toBe(committed);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('incomplete web-only')
    );
  });

  it('requires the active server to close before replacement', async () => {
    const {
      callbacks,
      controller,
      createServer,
      getCloseCount,
      server,
    } = createHarness();
    await callbacks.start({ server });
    const activeLoader = controller.createBuildLoader();
    const replacementServer = createServer(rstest.fn());

    await expect(
      callbacks.start({ server: replacementServer })
    ).rejects.toThrow('development server is already active');

    expect(getCloseCount(server)).toBe(0);
    await server.close();
    expect(getCloseCount(server)).toBe(1);
    await expect(activeLoader()).rejects.toThrow('not registered');
    await callbacks.start({ server: replacementServer });
    const replacementLoader = controller.createBuildLoader();
    await callbacks.close();
    await expect(replacementLoader()).rejects.toThrow('not registered');
  });

  it('observes one close promise and rejects replacement until it settles', async () => {
    const { callbacks, createServer, getCloseCount } = createHarness();
    let releaseClose!: () => void;
    const closeGate = new Promise<void>(resolve => {
      releaseClose = resolve;
    });
    const closingServer = createServer(rstest.fn(), () => closeGate);
    await callbacks.start({ server: closingServer });
    const closing = closingServer.close();
    expect(closingServer.close()).toBe(closing);
    expect(getCloseCount(closingServer)).toBe(1);

    const replacement = createServer(rstest.fn());
    await expect(callbacks.start({ server: replacement })).rejects.toThrow(
      'still closing'
    );

    releaseClose();
    await closing;
    await callbacks.start({ server: replacement });
    expect(getCloseCount(closingServer)).toBe(1);
    await callbacks.close();
  });

  it('observes close captured by an earlier server setup callback', async () => {
    let capturedClose!: () => Promise<void>;
    const { callbacks, createServer, getCloseCount, server } = createHarness(
      ({ server }) => {
        capturedClose = server.close;
      }
    );
    const closeFirstServer = capturedClose;
    await callbacks.start({ server });

    await closeFirstServer();
    expect(getCloseCount(server)).toBe(1);

    const replacement = createServer(rstest.fn());
    await callbacks.start({ server: replacement });
    await callbacks.close();
  });

  it('fails replacement closed after the active server cannot close', async () => {
    const { callbacks, controller, createServer } = createHarness();
    const closeError = new Error('could not close abandoned server');
    const abandonedServer = createServer(rstest.fn(), () => {
      throw closeError;
    });
    await callbacks.start({ server: abandonedServer });
    const abandonedLoader = controller.createBuildLoader();

    await expect(abandonedServer.close()).rejects.toThrow(closeError);

    await expect(abandonedLoader()).rejects.toThrow('not registered');
    await expect(controller.createBuildLoader()()).rejects.toThrow(
      'previous development server failed to close'
    );

    await expect(
      callbacks.start({ server: createServer(rstest.fn()) })
    ).rejects.toThrow('previous development server failed to close');
    await expect(controller.createBuildLoader()()).rejects.toThrow(
      'previous development server failed to close'
    );
  });

  it('ignores a late fatal callback from a replaced server session', async () => {
    const { callbacks, controller, createServer, server } = createHarness();
    const oldWeb = createCompiler('web');
    const oldNode = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [oldWeb.compiler, oldNode.compiler] },
    });
    const oldLoader = controller.createBuildLoader();

    const replacementServer = createServer(rstest.fn());
    const newWeb = createCompiler('web');
    const newNode = createCompiler('node');
    await callbacks.close();
    await callbacks.start({ server: replacementServer });
    callbacks.created({
      compiler: { compilers: [newWeb.compiler, newNode.compiler] },
    });
    callbacks.before();
    const waiting = controller.createBuildLoader()();

    oldWeb.fail(new Error('stale compiler failure'));
    await expect(oldLoader()).rejects.toThrow('not registered');
    newWeb.fail(new Error('current compiler failure'));

    await expect(waiting).rejects.toThrow('current compiler failure');
  });

  it('disposes the current session through the supported close hook', async () => {
    const { callbacks, controller, server } = createHarness();
    await callbacks.start({ server });
    const loadBuild = controller.createBuildLoader();

    await callbacks.close();

    await expect(loadBuild()).rejects.toThrow('not registered');
    await expect(controller.createBuildLoader()()).rejects.toThrow(
      'runtime is not ready'
    );
  });

  it('ignores manifest and completion callbacks from a replaced compiler', async () => {
    const { callbacks, controller, createServer, server } = createHarness();
    const oldWeb = createCompiler('web');
    const oldNode = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [oldWeb.compiler, oldNode.compiler] },
    });
    const oldWebCompilation = oldWeb.compile();
    oldWeb.complete(oldWebCompilation);
    const oldNodeCompilation = oldNode.compile();

    const replacementLoadBundle = rstest.fn();
    const replacementServer = createServer(replacementLoadBundle);
    const newWeb = createCompiler('web');
    const newNode = createCompiler('node');
    await callbacks.close();
    await callbacks.start({ server: replacementServer });
    callbacks.created({
      compiler: { compilers: [newWeb.compiler, newNode.compiler] },
    });
    callbacks.before();
    controller.captureWeb(oldWebCompilation, createManifestSet('old'));

    await callbacks.after({
      stats: createGraphStats(oldWebCompilation, oldNodeCompilation),
    });

    expect(replacementLoadBundle).not.toHaveBeenCalled();
    const waiting = controller.createBuildLoader()();
    newWeb.fail(new Error('current failure'));
    await expect(waiting).rejects.toThrow('current failure');
  });

  it('isolates web lineage callbacks from a replaced compiler pair', async () => {
    const { callbacks, controller, createServer, server } = createHarness();
    const oldWeb = createCompiler('web');
    const oldNode = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [oldWeb.compiler, oldNode.compiler] },
    });
    const staleWebCompilation = oldWeb.compile();

    const replacementLoadBundle = rstest.fn(() => createBuild('replacement'));
    const replacementServer = createServer(replacementLoadBundle);
    const newWeb = createCompiler('web');
    const newNode = createCompiler('node');
    await callbacks.close();
    await callbacks.start({ server: replacementServer });
    callbacks.created({
      compiler: { compilers: [newWeb.compiler, newNode.compiler] },
    });

    const newWebCompilation = newWeb.compile();
    controller.captureWeb(newWebCompilation, createManifestSet('replacement'));
    newWeb.complete(newWebCompilation);
    oldWeb.complete(staleWebCompilation);
    const newNodeCompilation = newNode.compile();

    await callbacks.after({
      stats: createGraphStats(newWebCompilation, newNodeCompilation),
    });

    expect(replacementLoadBundle).toHaveBeenCalledOnce();
    await expect(controller.createBuildLoader()()).resolves.toMatchObject({
      marker: 'replacement',
      assets: { version: 'replacement' },
    });
  });

  it('keeps the initial loader pending until a mixed result becomes coherent', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    loadBundle.mockImplementation(() => createBuild('web-b'));
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const waiting = controller.createBuildLoader()();

    const webA = web.compile();
    web.complete(webA);
    const nodeA = node.compile();
    const webB = web.compile();
    controller.captureWeb(webB, createManifestSet('web-b'));
    web.complete(webB);
    await callbacks.after({ stats: createGraphStats(webB, nodeA) });

    let published = false;
    void waiting.then(() => {
      published = true;
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(published).toBe(false);
    expect(loadBundle).not.toHaveBeenCalled();

    const nodeB = node.compile();
    await callbacks.after({ stats: createGraphStats(webB, nodeB) });

    await expect(waiting).resolves.toMatchObject({
      marker: 'web-b',
      assets: { version: 'web-b' },
    });
  });

  it('ignores a coherent aggregate older than an invalidated compilation', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    let build = createBuild('base');
    loadBundle.mockImplementation(() => build);
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const loadBuild = controller.createBuildLoader();

    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    callbacks.before();
    const webA = web.compile();
    controller.captureWeb(webA, createManifestSet('a'));
    web.complete(webA);
    const nodeA = node.compile();
    web.invalidate();
    build = createBuild('a');
    await callbacks.after({ stats: createGraphStats(webA, nodeA) });

    expect(loadBundle).toHaveBeenCalledOnce();
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'base' },
    });

    const webB = web.compile();
    controller.captureWeb(webB, createManifestSet('b'));
    web.complete(webB);
    const nodeB = node.compile();
    build = createBuild('b');
    await callbacks.after({ stats: createGraphStats(webB, nodeB) });

    expect(loadBundle).toHaveBeenCalledTimes(2);
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'b',
      assets: { version: 'b' },
    });
  });

  it('does not publish an evaluation superseded during invalidation', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    let resolveCandidate!: (build: TestServerBuild) => void;
    const candidate = new Promise<TestServerBuild>(resolve => {
      resolveCandidate = resolve;
    });
    loadBundle
      .mockImplementationOnce(() => createBuild('base'))
      .mockImplementationOnce(() => candidate);
    const web = createCompiler('web');
    const node = createCompiler('node');
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const loadBuild = controller.createBuildLoader();

    const baseWeb = web.compile();
    controller.captureWeb(baseWeb, createManifestSet('base'));
    web.complete(baseWeb);
    const baseNode = node.compile();
    await callbacks.after({ stats: createGraphStats(baseWeb, baseNode) });

    callbacks.before();
    const webA = web.compile();
    controller.captureWeb(webA, createManifestSet('a'));
    web.complete(webA);
    const nodeA = node.compile();
    const evaluating = callbacks.after({
      stats: createGraphStats(webA, nodeA),
    });
    await expect
      .poll(() => loadBundle.mock.calls.length, { timeout: 1000 })
      .toBe(2);

    web.invalidate();
    resolveCandidate(createBuild('a'));
    await evaluating;

    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'base' },
    });
  });

  it('rejects web B with node A and publishes web B with node B', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    const web = createCompiler('web');
    const node = createCompiler('node');
    let build = createBuild('base');
    loadBundle.mockImplementation(() => build);
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const loadBuild = controller.createBuildLoader();

    const webBase = web.compile();
    controller.captureWeb(webBase, createManifestSet('web-base'));
    web.complete(webBase);
    const nodeBase = node.compile();
    await callbacks.after({ stats: createGraphStats(webBase, nodeBase) });
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-base' },
    });

    callbacks.before();
    const webA = web.compile();
    controller.captureWeb(webA, createManifestSet('web-a'));
    web.complete(webA);
    const nodeA = node.compile();

    web.invalidate();
    node.invalidate();
    const webB = web.compile();
    controller.captureWeb(webB, createManifestSet('web-b'));
    web.complete(webB);
    build = createBuild('node-a');
    await callbacks.after({ stats: createGraphStats(webB, nodeA) });

    expect(loadBundle).toHaveBeenCalledTimes(1);
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-base' },
    });

    const nodeB = node.compile();
    build = createBuild('node-b');
    await callbacks.after({ stats: createGraphStats(webB, nodeB) });

    expect(loadBundle).toHaveBeenCalledTimes(2);
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'node-b',
      assets: { version: 'web-b' },
    });
  });

  it('publishes node retry stats with the latest completed web compilation', async () => {
    const { callbacks, controller, loadBundle, server } = createHarness();
    const web = createCompiler('web');
    const node = createCompiler('node');
    let build = createBuild('base');
    loadBundle.mockImplementation(() => build);
    await callbacks.start({ server });
    callbacks.created({
      compiler: { compilers: [web.compiler, node.compiler] },
    });
    const loadBuild = controller.createBuildLoader();

    const webBase = web.compile();
    controller.captureWeb(webBase, createManifestSet('web-base'));
    web.complete(webBase);
    const nodeBase = node.compile();
    await callbacks.after({ stats: createGraphStats(webBase, nodeBase) });
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-base' },
    });

    callbacks.before();
    const nodeA = node.compile();
    web.invalidate();
    node.invalidate();
    const webB = web.compile();
    controller.captureWeb(webB, createManifestSet('web-b'));
    web.complete(webB);
    build = createBuild('node-a');
    await callbacks.after({ stats: createGraphStats(webB, nodeA) });

    expect(loadBundle).toHaveBeenCalledOnce();
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'base',
      assets: { version: 'web-base' },
    });

    const nodeB = node.compile();
    build = createBuild('node-b');
    await callbacks.after({ stats: createStats(nodeB) });

    expect(loadBundle).toHaveBeenCalledTimes(2);
    await expect(loadBuild()).resolves.toMatchObject({
      marker: 'node-b',
      assets: { version: 'web-b' },
    });
  });
});
