import { describe, expect, it, rstest } from '@rstest/core';
import * as Effect from 'effect/Effect';
import {
  createDelayedPluginTask,
  runPluginEffect,
  tryPluginSync,
} from '../src/effect-runtime';

describe('effect runtime helpers', () => {
  it('preserves typed errors at promise boundaries', async () => {
    const error = new Error('typed failure');

    await expect(runPluginEffect(tryPluginSync(() => {
      throw error;
    }))).rejects.toBe(error);
  });

  it('normalizes synchronous thrown causes to errors', async () => {
    await expect(
      runPluginEffect(
        tryPluginSync(() => {
          throw 'dev runtime failed';
        })
      )
    ).rejects.toThrow('dev runtime failed');
  });

  it('runs delayed plugin tasks after their delay', async () => {
    const run = rstest.fn();
    const task = createDelayedPluginTask({
      delayMs: 10,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    expect(run).not.toHaveBeenCalled();
    await expect.poll(() => run.mock.calls.length, { timeout: 1000 }).toBe(1);
  });

  it('reschedules delayed plugin tasks by replacing the pending run', async () => {
    const run = rstest.fn();
    const task = createDelayedPluginTask({
      delayMs: 10,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    task.reschedule();
    task.reschedule();

    await expect.poll(() => run.mock.calls.length, { timeout: 1000 }).toBe(1);
  });

  it('cancels delayed plugin tasks before they start', async () => {
    const run = rstest.fn();
    const task = createDelayedPluginTask({
      delayMs: 1000,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    await task.cancel();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(run).not.toHaveBeenCalled();
  });

  it('supports Effect-based cancellation for delayed plugin tasks', async () => {
    const run = rstest.fn();
    const task = createDelayedPluginTask({
      delayMs: 1000,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    await runPluginEffect(task.cancelEffect());
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(run).not.toHaveBeenCalled();
  });
});
