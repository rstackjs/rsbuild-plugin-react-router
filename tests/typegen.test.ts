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

  it('runs one-shot build typegen through npx', async () => {
    const execa = rstest.fn().mockResolvedValue(undefined);
    const runner = createReactRouterTypegenRunner(async () => execa);

    await runner.runBuild();

    expect(execa).toHaveBeenCalledWith(
      'npx',
      ['--yes', 'react-router', 'typegen'],
      { stdio: 'inherit' }
    );
  });

  it('starts dev watch after the first dev compile without blocking startup', () => {
    let afterDevCompile!: () => void;
    const runner: ReactRouterTypegenRunner = {
      startWatch: rstest.fn().mockResolvedValue(undefined),
      closeWatch: rstest.fn().mockResolvedValue(undefined),
      runBuild: rstest.fn().mockResolvedValue(undefined),
    };
    const api = {
      logger: { warn: rstest.fn() },
      onAfterDevCompile: rstest.fn(callback => {
        afterDevCompile = callback;
      }),
      onBeforeStartDevServer: rstest.fn(),
      onCloseDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
    };

    registerReactRouterTypegen(api as never, runner);

    expect(api.onBeforeStartDevServer).not.toHaveBeenCalled();
    const result = afterDevCompile();
    expect(result).toBeUndefined();
    afterDevCompile();
    expect(runner.startWatch).toHaveBeenCalledTimes(1);
  });
});
