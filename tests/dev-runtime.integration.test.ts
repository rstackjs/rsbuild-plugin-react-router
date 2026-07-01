import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { createServer, type Server as HttpServer } from 'node:http';
import * as vm from 'node:vm';
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { delimiter, join } from 'node:path';
import {
  createLogger,
  createRsbuild,
  type RsbuildConfig,
  type RsbuildDevServer,
  type RsbuildPlugin,
  type Rspack,
} from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { expect, it, rstest } from '@rstest/core';
import { createRequestHandler, type ServerBuild } from 'react-router';

const ESM_SUBPROCESS_ENV = 'RR_DEV_RUNTIME_ESM_SUBPROCESS';
const isEsmSubprocess = process.env[ESM_SUBPROCESS_ENV] === '1';

const INITIAL_COMPILATION_ERROR = `
export const handle = { marker: ;

export default function IndexRoute() {
  return <h1>broken</h1>;
}
`;

const EVALUATION_ERROR_MARKER = 'RR_TEST_EVALUATION_FAILURE';
const EVALUATION_ERROR = `
throw new Error('${EVALUATION_ERROR_MARKER}');

export const handle = { marker: 'uncommitted' };

export default function IndexRoute() {
  return <h1>uncommitted</h1>;
}
`;

const routeSource = (marker: string): string => `
export const handle = { marker: '${marker}' };

export default function IndexRoute() {
  return <h1>${marker}</h1>;
}
`;

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Timed out waiting for ${label}`)),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};

const getBuildMarker = (build: ServerBuild): string | undefined => {
  for (const route of Object.values(build.routes)) {
    const handle = (route.module as { handle?: unknown }).handle as
      | { marker?: unknown }
      | undefined;
    if (typeof handle?.marker === 'string') {
      return handle.marker;
    }
  }
  return undefined;
};

const createNoopWatcher = (): fs.FSWatcher => {
  const watcher = new EventEmitter() as EventEmitter & {
    close: () => void;
    ref: () => fs.FSWatcher;
    unref: () => fs.FSWatcher;
  };
  watcher.close = () => undefined;
  watcher.ref = () => watcher as fs.FSWatcher;
  watcher.unref = () => watcher as fs.FSWatcher;
  return watcher as fs.FSWatcher;
};

const runEsmIntegrationSubprocess = (repositoryRoot: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const rstestCli = join(
      repositoryRoot,
      'node_modules/@rstest/core/bin/rstest.js'
    );
    const output: Buffer[] = [];
    const child = spawn(
      process.execPath,
      [
        '--experimental-vm-modules',
        rstestCli,
        'run',
        'tests/dev-runtime.integration.test.ts',
      ],
      {
        cwd: repositoryRoot,
        env: { ...process.env, [ESM_SUBPROCESS_ENV]: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    child.stdout.on('data', chunk => output.push(Buffer.from(chunk)));
    child.stderr.on('data', chunk => output.push(Buffer.from(chunk)));

    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let forceKillTimeout: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    const finish = (error?: Error): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (forceKillTimeout) {
        clearTimeout(forceKillTimeout);
      }
      error ? reject(error) : resolve();
    };
    timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      forceKillTimeout = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill('SIGKILL');
        }
      }, 5_000);
    }, 80_000);
    child.once('error', error => finish(error));
    child.once('close', exitCode => {
      if (timedOut) {
        finish(
          new Error(
            `ESM development integration subprocess timed out.\n${Buffer.concat(output).toString('utf8')}`
          )
        );
        return;
      }
      if (exitCode === 0) {
        finish();
        return;
      }
      finish(
        new Error(
          `ESM development integration subprocess exited with ${exitCode}.\n${Buffer.concat(output).toString('utf8')}`
        )
      );
    });
  });

const createDevRuntimeHarness = async (esm: boolean) => {
  const repositoryRoot = process.cwd();
  const temporaryFixtures = join(repositoryRoot, 'tests/.tmp-dev-runtime');
  mkdirSync(temporaryFixtures, { recursive: true });
  const fixtureRoot = mkdtempSync(join(temporaryFixtures, 'case-'));
  cpSync(join(repositoryRoot, 'tests/fixtures/dev-runtime'), fixtureRoot, {
    recursive: true,
  });
  const executableDirectory = join(fixtureRoot, '.bin');
  mkdirSync(executableDirectory, { recursive: true });
  const npxPath = join(executableDirectory, 'npx');
  writeFileSync(npxPath, '#!/bin/sh\nexit 0\n');
  chmodSync(npxPath, 0o755);
  const routePath = join(fixtureRoot, 'app/routes/index.tsx');
  writeFileSync(routePath, INITIAL_COMPILATION_ERROR);

  const existsSyncMock = fs.existsSync as typeof fs.existsSync & {
    mockRestore?: () => void;
  };
  existsSyncMock.mockRestore?.();
  const watchMock = rstest
    .spyOn(fs, 'watch')
    .mockImplementation((() => createNoopWatcher()) as typeof fs.watch);
  const logger = createLogger({ level: 'silent' });
  const loggerError = rstest.spyOn(logger, 'error');
  const consoleError = rstest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const originalPath = process.env.PATH;
  let server: RsbuildDevServer | null = null;
  let httpServer: HttpServer | null = null;
  let builtInServerUrl: string | undefined;
  let compiler: Rspack.MultiCompiler | undefined;
  let compileAttempts = 0;
  let completedCompiles = 0;
  let cleaned = false;

  const closeBuiltInServer = async (): Promise<void> => {
    const current = httpServer;
    httpServer = null;
    builtInServerUrl = undefined;
    if (current) {
      await new Promise<void>((resolve, reject) =>
        current.close(error => (error ? reject(error) : resolve()))
      );
    }
  };
  const closeDevServer = async (): Promise<void> => {
    const current = server;
    server = null;
    await current?.close();
  };
  const cleanup = async (): Promise<void> => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    try {
      await Promise.all([closeBuiltInServer(), closeDevServer()]);
    } finally {
      process.chdir(repositoryRoot);
      if (originalPath === undefined) {
        delete process.env.PATH;
      } else {
        process.env.PATH = originalPath;
      }
      loggerError.mockRestore();
      consoleError.mockRestore();
      watchMock.mockRestore();
      rmSync(fixtureRoot, { force: true, recursive: true });
    }
  };

  process.env.PATH = `${executableDirectory}${delimiter}${originalPath ?? ''}`;
  process.chdir(fixtureRoot);
  try {
    rstest.doUnmock('jiti');
    const { loadReactRouterServerBuild, pluginReactRouter } =
      await import('../src/index');
    const captureCompilerPlugin: RsbuildPlugin = {
      name: 'test:capture-real-multi-compiler',
      setup(api) {
        api.onBeforeDevCompile(() => {
          compileAttempts += 1;
        });
        api.onAfterDevCompile(() => {
          completedCompiles += 1;
        });
        api.onAfterCreateCompiler(({ compiler: createdCompiler }) => {
          if (!('compilers' in createdCompiler)) {
            throw new Error('Expected Rsbuild to create a MultiCompiler.');
          }
          compiler = createdCompiler;
        });
      },
    };
    const rsbuildConfig: RsbuildConfig = {
      customLogger: logger,
      dev: { cliShortcuts: false, hmr: false, liveReload: false },
      plugins: [
        pluginReactRouter({
          lazyCompilation: false,
          onRouteTopologyChange() {},
          ...(esm ? {} : { serverOutput: 'commonjs' as const }),
        }),
        pluginReact(),
        captureCompilerPlugin,
      ],
      root: fixtureRoot,
      server: { middlewareMode: true },
      tools: {
        rspack(config) {
          config.watchOptions = {
            ...config.watchOptions,
            aggregateTimeout: 10,
            poll: 50,
          };
        },
      },
    };
    const rsbuild = await createRsbuild({ cwd: fixtureRoot, rsbuildConfig });

    const assertNodeCompiler = (): void => {
      const nodeCompiler = compiler?.compilers.find(
        child => child.name === 'node'
      );
      expect(nodeCompiler?.options.output.module).toBe(esm);
      expect(Object.keys(nodeCompiler?.options.entry ?? {})).toEqual(
        expect.arrayContaining([
          'static/js/app',
          'static/js/react-router-server-build',
          'index/index',
          'other/index',
        ])
      );
      if (esm) {
        expect(vm.SourceTextModule).toBeTypeOf('function');
      }
    };
    const startDevServer = async (): Promise<void> => {
      server = await rsbuild.createDevServer({ getPortSilently: true });
      assertNodeCompiler();
    };
    const loadBuild = (entryName?: string): Promise<ServerBuild> =>
      server
        ? loadReactRouterServerBuild(server, entryName)
        : Promise.reject(new Error('The test dev server is closed.'));
    const loadRawEntry = (entryName: string): Promise<unknown> =>
      server
        ? server.environments.node.loadBundle(entryName)
        : Promise.reject(new Error('The test dev server is closed.'));
    const requestHandler = createRequestHandler(loadBuild);
    const requestDocument = async (): Promise<string> => {
      const response = await requestHandler(new Request('http://test.local/'));
      expect(response.status).toBe(200);
      return response.text();
    };
    const invalidate = async (
      source: string,
      webOnly: boolean
    ): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 75));
      writeFileSync(routePath, source);
      const watching = webOnly
        ? compiler?.compilers.find(child => child.name === 'web')?.watching
        : compiler?.watching;
      if (!watching) {
        throw new Error(
          `Expected the real ${webOnly ? 'web compiler' : 'MultiCompiler'} to be watching.`
        );
      }
      await new Promise<void>((resolve, reject) => {
        watching.invalidateWithChangesAndRemovals(
          new Set([routePath]),
          new Set(),
          error => (error ? reject(error) : resolve())
        );
      });
    };
    const startBuiltInServer = async (): Promise<void> => {
      if (!server) {
        throw new Error('The test dev server is closed.');
      }
      httpServer = createServer(server.middlewares);
      await new Promise<void>((resolve, reject) => {
        httpServer!.once('error', reject);
        httpServer!.listen(0, '127.0.0.1', resolve);
      });
      const address = httpServer.address();
      if (!address || typeof address === 'string') {
        throw new Error('Expected the built-in middleware server to listen.');
      }
      builtInServerUrl = `http://127.0.0.1:${address.port}/`;
    };
    const requestBuiltInDocument = async (): Promise<string> => {
      if (!builtInServerUrl) {
        throw new Error('The built-in middleware server is not listening.');
      }
      const response = await fetch(builtInServerUrl);
      expect(response.status).toBe(200);
      return response.text();
    };
    const restartDevServer = async (): Promise<void> => {
      await Promise.all([closeBuiltInServer(), closeDevServer()]);
      await startDevServer();
    };

    await startDevServer();
    return {
      cleanup,
      get compileAttempts() {
        return compileAttempts;
      },
      get completedCompiles() {
        return completedCompiles;
      },
      hasConsoleError: (marker: string) =>
        consoleError.mock.calls.some(args =>
          args.some(arg => String(arg).includes(marker))
        ),
      hasLoggedError: (marker: string) =>
        loggerError.mock.calls.some(args =>
          args.some(arg => String(arg).includes(marker))
        ),
      loadBuild,
      loadRawEntry,
      rebuildRoute: (source: string) => invalidate(source, false),
      rebuildWebFirst: (source: string) => invalidate(source, true),
      requestBuiltInDocument,
      requestDocument,
      restartDevServer,
      startBuiltInServer,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
};

type DevRuntimeHarness = Awaited<ReturnType<typeof createDevRuntimeHarness>>;

const expectInitialCompilationFailure = async (
  harness: DevRuntimeHarness
): Promise<void> => {
  await expect(
    withTimeout(harness.loadBuild(), 20_000, 'the initial compilation failure')
  ).rejects.toThrow('development compilation failed');
  expect(harness.hasConsoleError('Unexpected token')).toBe(true);
  expect(harness.compileAttempts).toBeGreaterThan(0);
  expect(harness.completedCompiles).toBeGreaterThan(0);
};

const expectFirstCommittedGeneration = async (
  harness: DevRuntimeHarness
): Promise<void> => {
  const attemptsBeforeRecovery = harness.compileAttempts;
  const completedBeforeRecovery = harness.completedCompiles;
  await harness.rebuildRoute(routeSource('v1'));
  expect(harness.compileAttempts).toBeGreaterThan(attemptsBeforeRecovery);
  await expect
    .poll(() => harness.completedCompiles, {
      intervals: [50, 100, 250],
      timeout: 20_000,
    })
    .toBeGreaterThan(completedBeforeRecovery);

  const build = await withTimeout(
    harness.loadBuild(),
    5_000,
    `the first valid generation after ${harness.compileAttempts} attempts and ${harness.completedCompiles} completions`
  );
  expect(getBuildMarker(build)).toBe('v1');
  expect(build.assets).toBeTypeOf('object');
  expect(build.entry).toBeTypeOf('object');
  expect(build.routes).toBeTypeOf('object');
  await expect(harness.loadBuild('index/index')).resolves.toMatchObject({
    assets: {
      routes: {
        root: expect.any(Object),
        'routes/index': expect.any(Object),
      },
    },
  });
  await expect(harness.loadBuild('other/index')).resolves.toMatchObject({
    assets: {
      routes: {
        root: expect.any(Object),
        'routes/other': expect.any(Object),
      },
    },
  });
  await expect(harness.loadBuild('missing/index')).rejects.toThrow(
    'not part of this development server build plan'
  );
  await expect(harness.loadRawEntry('static/js/app')).resolves.toMatchObject({
    customServerMarker: 'custom-server-entry',
  });
  await expect(harness.requestDocument()).resolves.toContain('v1');
  await harness.startBuiltInServer();
  await expect(harness.requestBuiltInDocument()).resolves.toContain('v1');
};

const expectWebFirstRebuild = async (
  harness: DevRuntimeHarness
): Promise<void> => {
  await harness.rebuildWebFirst(routeSource('v2'));
  await expect
    .poll(async () => getBuildMarker(await harness.loadBuild()), {
      intervals: [50, 100, 250],
      timeout: 20_000,
    })
    .toBe('v2');
  await expect(harness.requestDocument()).resolves.toContain('v2');
  await expect(harness.requestBuiltInDocument()).resolves.toContain('v2');
};

const expectEvaluationFailurePreservesLastGood = async (
  harness: DevRuntimeHarness
): Promise<void> => {
  await harness.rebuildRoute(EVALUATION_ERROR);
  await expect
    .poll(() => harness.hasLoggedError(EVALUATION_ERROR_MARKER), {
      intervals: [50, 100, 250],
      timeout: 20_000,
    })
    .toBe(true);
  expect(getBuildMarker(await harness.loadBuild())).toBe('v2');
};

const expectRecoveryAndRestart = async (
  harness: DevRuntimeHarness
): Promise<void> => {
  await harness.rebuildRoute(routeSource('v3'));
  await expect
    .poll(async () => getBuildMarker(await harness.loadBuild()), {
      intervals: [50, 100, 250],
      timeout: 20_000,
    })
    .toBe('v3');
  await harness.restartDevServer();
  const build = await withTimeout(
    harness.loadBuild(),
    20_000,
    'a generation after restarting the same Rsbuild instance'
  );
  expect(getBuildMarker(build)).toBe('v3');
  await expect(harness.requestDocument()).resolves.toContain('v3');
};

const runDevRuntimeScenario = async (esm: boolean): Promise<void> => {
  const harness = await createDevRuntimeHarness(esm);
  try {
    await expectInitialCompilationFailure(harness);
    await expectFirstCommittedGeneration(harness);
    await expectWebFirstRebuild(harness);
    await expectEvaluationFailurePreservesLastGood(harness);
    await expectRecoveryAndRestart(harness);
  } finally {
    await harness.cleanup();
  }
};

it(
  `publishes recoverable generations through real Rsbuild ${
    isEsmSubprocess ? 'ESM' : 'CommonJS'
  } server paths`,
  () => runDevRuntimeScenario(isEsmSubprocess),
  90_000
);

if (!isEsmSubprocess) {
  it('runs the real default ESM development path with VM modules enabled', async () => {
    await runEsmIntegrationSubprocess(process.cwd());
  }, 90_000);
}
