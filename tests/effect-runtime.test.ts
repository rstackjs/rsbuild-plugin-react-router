import { describe, expect, it, rstest } from '@rstest/core';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import {
  createPluginEffectRuntime,
  createDelayedPluginTask,
  PluginScope,
  runPluginEffect,
  tryPluginSync,
} from '../src/effect-runtime';

const createDelayedTaskFixture = (delayMs: number) => {
  const run = rstest.fn();
  const onError = rstest.fn((error: Error) => {
    throw error;
  });
  const runtime = createPluginEffectRuntime();
  const task = createDelayedPluginTask({
    runtime,
    delayMs,
    run: () => Effect.sync(run),
    onError,
  });

  return { runtime, run, onError, task };
};

describe('effect runtime helpers', () => {
  it('releases resources after interrupting fibers when the runtime is disposed', async () => {
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

    runtime.runFork(
      Effect.never.pipe(
        Effect.ensuring(
          Effect.sync(() => {
            events.push('fiber');
          })
        )
      )
    );

    await runtime.dispose();
    expect(events).toEqual(['acquire', 'fiber', 'release:resource']);
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

  it('settles shutdown when a fiber forks during finalization', async () => {
    const runtime = createPluginEffectRuntime();
    let nestedFiber: ReturnType<typeof runtime.runFork> | undefined;
    let nestedRan = false;
    let resolveNestedStarted!: () => void;
    const nestedStarted = new Promise<void>(resolve => {
      resolveNestedStarted = resolve;
    });

    runtime.runFork(
      Effect.never.pipe(
        Effect.ensuring(
          Effect.sync(() => {
            nestedFiber = runtime.runFork(
              Effect.sync(() => {
                nestedRan = true;
              }).pipe(Effect.zipRight(Effect.never))
            );
            resolveNestedStarted();
          })
        )
      )
    );

    const dispose = runtime.dispose();
    await nestedStarted;
    let settled = false;
    try {
      settled = await Promise.race([
        dispose.then(() => true),
        new Promise(resolve => setTimeout(() => resolve(false), 1_000)),
      ]);
      expect(settled).toBe(true);
      if (nestedFiber) {
        await Effect.runPromise(Fiber.await(nestedFiber));
      }
      expect(nestedRan).toBe(false);
    } finally {
      if (!settled && nestedFiber) {
        await runtime.runPromise(Fiber.interrupt(nestedFiber).pipe(Effect.asVoid));
      }
      await dispose;
    }
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
    const { runtime, run, task } = createDelayedTaskFixture(10);

    task.schedule();
    expect(run).not.toHaveBeenCalled();
    await expect.poll(() => run.mock.calls.length, { timeout: 1000 }).toBe(1);
    await runtime.dispose();
  });

  it('reschedules delayed plugin tasks by replacing the pending run', async () => {
    const { runtime, run, task } = createDelayedTaskFixture(10);

    task.schedule();
    task.reschedule();
    task.reschedule();

    await expect.poll(() => run.mock.calls.length, { timeout: 1000 }).toBe(1);
    await runtime.dispose();
  });

  it('cancels delayed plugin tasks before they start', async () => {
    const { runtime, run, task } = createDelayedTaskFixture(1000);

    task.schedule();
    await task.cancel();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(run).not.toHaveBeenCalled();
    await runtime.dispose();
  });

  it('cancels delayed plugin tasks when the plugin runtime is disposed', async () => {
    const { runtime, run, task } = createDelayedTaskFixture(25);

    task.schedule();
    await runtime.dispose();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(run).not.toHaveBeenCalled();
  });

});
