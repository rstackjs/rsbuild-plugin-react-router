import { describe, expect, it, rstest } from '@rstest/core';
import type { ResultPromise } from 'execa';
import { createPluginEffectRuntime } from '../src/effect-runtime';
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

const createDefaultTypegenRunner = () => ({
  startWatch: rstest.fn().mockResolvedValue(undefined),
  closeWatch: rstest.fn().mockResolvedValue(undefined),
  runBuild: rstest.fn().mockResolvedValue(undefined),
});

type TypegenRunnerSpies = ReturnType<typeof createDefaultTypegenRunner>;

const createTypegenRegistrationHarness = (
  {
    action = 'dev',
    runner: runnerOverrides,
  }: {
    action?: 'dev' | 'build';
    runner?: Partial<TypegenRunnerSpies>;
  } = {}
) => {
  let afterDevCompile: (() => void) | undefined;
  const runnerSpies = { ...createDefaultTypegenRunner(), ...runnerOverrides };
  const runner: ReactRouterTypegenRunner = runnerSpies;
  const runtime = createPluginEffectRuntime();
  const api = {
    context: { action },
    logger: { warn: rstest.fn() },
    onAfterDevCompile: rstest.fn((callback: () => void) => {
      afterDevCompile = callback;
    }),
    onBeforeStartDevServer: rstest.fn(),
    onCloseDevServer: rstest.fn(),
    onBeforeBuild: rstest.fn(),
  };

  return {
    runtime,
    api,
    runner,
    ...runnerSpies,
    get afterDevCompile(): () => void {
      if (!afterDevCompile) {
        throw new Error('expected onAfterDevCompile to be registered');
      }
      return afterDevCompile;
    },
  };
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

  it('does not launch a watch after close finishes during execa loading', async () => {
    let resolveExeca!: (execa: ReturnType<typeof rstest.fn>) => void;
    const execaLoaded = new Promise<ReturnType<typeof rstest.fn>>(resolve => {
      resolveExeca = resolve;
    });
    const process = createProcess();
    const execa = rstest.fn().mockReturnValue(process.process);
    const runner = createReactRouterTypegenRunner(async () => execaLoaded);

    const startWatch = runner.startWatch();
    await runner.closeWatch();
    resolveExeca(execa);
    await startWatch;

    expect(execa).not.toHaveBeenCalled();
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
    const harness = createTypegenRegistrationHarness();

    await registerReactRouterTypegen(harness.api as never, {
      runtime: harness.runtime,
      runner: harness.runner,
      devWatchDelayMs: 0,
    });

    expect(harness.api.onBeforeStartDevServer).not.toHaveBeenCalled();
    const result = harness.afterDevCompile();
    expect(result).toBeUndefined();
    harness.afterDevCompile();
    expect(harness.startWatch).not.toHaveBeenCalled();
    await expect.poll(() => harness.startWatch.mock.calls.length).toBe(1);
    await harness.runtime.dispose();
  });

  it('defers the dev watch while compiles keep happening', async () => {
    const harness = createTypegenRegistrationHarness();

    await registerReactRouterTypegen(harness.api as never, {
      runtime: harness.runtime,
      runner: harness.runner,
      devWatchDelayMs: 200,
    });

    // Compiles arriving faster than the idle delay keep pushing the start out.
    for (let i = 0; i < 4; i += 1) {
      harness.afterDevCompile();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(harness.startWatch).not.toHaveBeenCalled();
    }

    await expect
      .poll(() => harness.startWatch.mock.calls.length, { timeout: 1000 })
      .toBe(1);

    // Once started, later compiles do not restart or duplicate the watch.
    harness.afterDevCompile();
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(harness.startWatch).toHaveBeenCalledTimes(1);
    await harness.runtime.dispose();
  });

  it('cancels delayed startup and surfaces close failures during disposal', async () => {
    const closeWatch = rstest
      .fn()
      .mockRejectedValue(new Error('typegen close failed'));
    const harness = createTypegenRegistrationHarness({
      runner: { closeWatch },
    });

    await registerReactRouterTypegen(harness.api as never, {
      runtime: harness.runtime,
      runner: harness.runner,
      devWatchDelayMs: 25,
    });

    harness.afterDevCompile();
    await expect(harness.runtime.dispose()).rejects.toThrow('typegen close failed');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(harness.startWatch).not.toHaveBeenCalled();
    expect(closeWatch).toHaveBeenCalledTimes(1);
  });

  it('does not register the dev watch hook during production builds', async () => {
    const harness = createTypegenRegistrationHarness({ action: 'build' });

    await registerReactRouterTypegen(harness.api as never, {
      runtime: harness.runtime,
      runner: harness.runner,
    });

    expect(harness.api.onAfterDevCompile).not.toHaveBeenCalled();
    expect(harness.api.onBeforeBuild).toHaveBeenCalled();
    await harness.runtime.dispose();
  });
});
