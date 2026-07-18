import { describe, expect, it, rstest } from '@rstest/core';
import * as Effect from 'effect/Effect';
import { readFile } from 'node:fs/promises';
import {
  createPluginEffectRuntime,
  createDelayedPluginTask,
  PluginScope,
  runPluginEffect,
  tryPluginSync,
} from '../src/effect-runtime';

describe('effect runtime helpers', () => {
  it('centralizes raw Effect runners in effect-runtime.ts', async () => {
    const files = ['index.ts', 'manifest.ts', 'route-watch.ts'];
    const sources = await Promise.all(
      files.map(file =>
        readFile(new URL(`../src/${file}`, import.meta.url), 'utf8')
      )
    );

    for (const source of sources) {
      expect(source).not.toMatch(/Effect\.run(?:Promise|Fork|Sync)/);
      expect(source).not.toContain('ManagedRuntime.make');
    }
    expect(sources[0]).not.toContain('runPluginEffect');
  });

  it('releases dynamically acquired resources when the runtime is disposed', async () => {
    const events: string[] = [];
    const runtime = createPluginEffectRuntime();

    await runtime.runPromise(
      Effect.gen(function* () {
        const scope = yield* PluginScope;
        return yield* scope.acquire(
          Effect.sync(() => {
            events.push('acquire');
            return 'resource';
          }),
          resource =>
            Effect.sync(() => {
              events.push(`release:${resource}`);
            })
        );
      })
    );

    await runtime.dispose();
    expect(events).toEqual(['acquire', 'release:resource']);
  });

  it('interrupts supervised fibers and disposes idempotently', async () => {
    let finalized = 0;
    const runtime = createPluginEffectRuntime();

    runtime.runFork(
      Effect.never.pipe(
        Effect.ensuring(
          Effect.sync(() => {
            finalized += 1;
          })
        )
      )
    );

    await Promise.all([runtime.dispose(), runtime.dispose()]);
    expect(finalized).toBe(1);
  });

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
    const runtime = createPluginEffectRuntime();
    const task = createDelayedPluginTask({
      runtime,
      delayMs: 10,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    expect(run).not.toHaveBeenCalled();
    await expect.poll(() => run.mock.calls.length, { timeout: 1000 }).toBe(1);
    await runtime.dispose();
  });

  it('reschedules delayed plugin tasks by replacing the pending run', async () => {
    const run = rstest.fn();
    const runtime = createPluginEffectRuntime();
    const task = createDelayedPluginTask({
      runtime,
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
    await runtime.dispose();
  });

  it('cancels delayed plugin tasks before they start', async () => {
    const run = rstest.fn();
    const runtime = createPluginEffectRuntime();
    const task = createDelayedPluginTask({
      runtime,
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
    await runtime.dispose();
  });

  it('cancels delayed plugin tasks when the plugin runtime is disposed', async () => {
    const run = rstest.fn();
    const runtime = createPluginEffectRuntime();
    const task = createDelayedPluginTask({
      runtime,
      delayMs: 25,
      run: () => Effect.sync(run),
      onError: error => {
        throw error;
      },
    });

    task.schedule();
    await runtime.dispose();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(run).not.toHaveBeenCalled();
  });

});
