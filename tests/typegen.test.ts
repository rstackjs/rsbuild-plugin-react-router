import { describe, expect, it, rstest } from '@rstest/core';
import type { ResultPromise } from 'execa';
import {
  createReactRouterTypegenRunner,
  registerReactRouterTypegen,
  type ReactRouterTypegenRunner,
} from '../src/typegen';

const createProcess = () => {
  let rejectProcess!: (error: Error) => void;
  const process = new Promise<void>((_resolve, reject) => {
    rejectProcess = reject;
  }) as ResultPromise;
  process.kill = rstest.fn(() => {
    rejectProcess(new Error('killed'));
    return true;
  });
  return { process, rejectProcess };
};

describe('React Router typegen runner', () => {
  it('starts one watch process and kills it on close', async () => {
    const first = createProcess();
    const second = createProcess();
    const execa = rstest
      .fn()
      .mockReturnValueOnce(first.process)
      .mockReturnValueOnce(second.process);
    const runner = createReactRouterTypegenRunner(async () => execa);

    await runner.startWatch();
    await runner.startWatch();
    expect(execa).toHaveBeenCalledTimes(1);

    await runner.closeWatch();
    expect(first.process.kill).toHaveBeenCalledWith('SIGTERM');

    await runner.startWatch();
    expect(execa).toHaveBeenCalledTimes(2);
  });

  it('clears a watch process after it exits by itself', async () => {
    const first = createProcess();
    const second = createProcess();
    const execa = rstest
      .fn()
      .mockReturnValueOnce(first.process)
      .mockReturnValueOnce(second.process);
    const runner = createReactRouterTypegenRunner(async () => execa);

    await runner.startWatch();
    first.rejectProcess(new Error('watch exited'));
    await new Promise(resolve => setImmediate(resolve));

    await runner.startWatch();
    expect(execa).toHaveBeenCalledTimes(2);
  });

  it('runs one-shot build typegen through npx when no app directory is given', async () => {
    const execa = rstest.fn().mockResolvedValue(undefined);
    const runner = createReactRouterTypegenRunner(async () => execa);

    await runner.runBuild();

    expect(execa).toHaveBeenCalledWith(
      'npx',
      ['--yes', 'react-router', 'typegen'],
      { stdio: 'inherit' }
    );
  });

  it('spawns the react-router bin directly when resolvable from the app directory', async () => {
    const execa = rstest.fn().mockResolvedValue(undefined);
    const runner = createReactRouterTypegenRunner(
      async () => execa,
      process.cwd()
    );

    await runner.runBuild();

    expect(execa).toHaveBeenCalledTimes(1);
    const [command, args] = execa.mock.calls[0];
    expect(command).toBe(process.execPath);
    expect(args[0]).toMatch(/[\\/]@react-router[\\/]dev[\\/]bin\.cjs$/);
    expect(args.slice(1)).toEqual(['typegen']);
  });

  it('falls back to npx when the react-router bin cannot be resolved', async () => {
    const { process: watchProcess } = createProcess();
    const execa = rstest.fn().mockReturnValue(watchProcess);
    const runner = createReactRouterTypegenRunner(
      async () => execa,
      '/nonexistent/app-directory'
    );

    await runner.startWatch();

    expect(execa).toHaveBeenCalledWith(
      'npx',
      ['--yes', 'react-router', 'typegen', '--watch'],
      { stdio: 'inherit', detached: false, cleanup: true }
    );
    await runner.closeWatch();
  });

  it('starts dev watch after the first dev compile without blocking startup', async () => {
    let afterDevCompile!: () => void;
    const startWatch = rstest.fn().mockResolvedValue(undefined);
    const runner: ReactRouterTypegenRunner = {
      startWatch,
      closeWatch: rstest.fn().mockResolvedValue(undefined),
      runBuild: rstest.fn().mockResolvedValue(undefined),
    };
    const api = {
      context: { action: 'dev' },
      logger: { warn: rstest.fn() },
      onAfterDevCompile: rstest.fn(callback => {
        afterDevCompile = callback;
      }),
      onBeforeStartDevServer: rstest.fn(),
      onCloseDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
    };

    registerReactRouterTypegen(api as never, { runner, devWatchDelayMs: 0 });

    expect(api.onBeforeStartDevServer).not.toHaveBeenCalled();
    const result = afterDevCompile();
    expect(result).toBeUndefined();
    afterDevCompile();
    expect(startWatch).not.toHaveBeenCalled();
    await expect.poll(() => startWatch.mock.calls.length).toBe(1);
  });

  it('defers the dev watch while compiles keep happening', async () => {
    let afterDevCompile!: () => void;
    const startWatch = rstest.fn().mockResolvedValue(undefined);
    const runner: ReactRouterTypegenRunner = {
      startWatch,
      closeWatch: rstest.fn().mockResolvedValue(undefined),
      runBuild: rstest.fn().mockResolvedValue(undefined),
    };
    const api = {
      context: { action: 'dev' },
      logger: { warn: rstest.fn() },
      onAfterDevCompile: rstest.fn(callback => {
        afterDevCompile = callback;
      }),
      onBeforeStartDevServer: rstest.fn(),
      onCloseDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
    };

    registerReactRouterTypegen(api as never, { runner, devWatchDelayMs: 200 });

    // Compiles arriving faster than the idle delay keep pushing the start out.
    for (let i = 0; i < 4; i += 1) {
      afterDevCompile();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(startWatch).not.toHaveBeenCalled();
    }

    await expect
      .poll(() => startWatch.mock.calls.length, { timeout: 1000 })
      .toBe(1);

    // Once started, later compiles do not restart or duplicate the watch.
    afterDevCompile();
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(startWatch).toHaveBeenCalledTimes(1);
  });

  it('cancels delayed dev watch startup on close', async () => {
    let afterDevCompile!: () => void;
    let closeDevServer!: () => Promise<void>;
    const startWatch = rstest.fn().mockResolvedValue(undefined);
    const closeWatch = rstest.fn().mockResolvedValue(undefined);
    const runner: ReactRouterTypegenRunner = {
      startWatch,
      closeWatch,
      runBuild: rstest.fn().mockResolvedValue(undefined),
    };
    const api = {
      context: { action: 'dev' },
      logger: { warn: rstest.fn() },
      onAfterDevCompile: rstest.fn(callback => {
        afterDevCompile = callback;
      }),
      onBeforeStartDevServer: rstest.fn(),
      onCloseDevServer: rstest.fn(callback => {
        closeDevServer = callback;
      }),
      onBeforeBuild: rstest.fn(),
    };

    registerReactRouterTypegen(api as never, {
      runner,
      devWatchDelayMs: 1000,
    });

    afterDevCompile();
    await closeDevServer();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(startWatch).not.toHaveBeenCalled();
    expect(closeWatch).toHaveBeenCalledTimes(1);
  });

  it('does not register the dev watch hook during production builds', () => {
    const runner: ReactRouterTypegenRunner = {
      startWatch: rstest.fn().mockResolvedValue(undefined),
      closeWatch: rstest.fn().mockResolvedValue(undefined),
      runBuild: rstest.fn().mockResolvedValue(undefined),
    };
    const api = {
      context: { action: 'build' },
      logger: { warn: rstest.fn() },
      onAfterDevCompile: rstest.fn(),
      onBeforeStartDevServer: rstest.fn(),
      onCloseDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
    };

    registerReactRouterTypegen(api as never, { runner });

    expect(api.onAfterDevCompile).not.toHaveBeenCalled();
    expect(api.onBeforeBuild).toHaveBeenCalled();
  });
});
