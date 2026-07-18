import { describe, expect, it, rstest } from '@rstest/core';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import {
  createPluginEffectRuntime,
  createDelayedPluginTask,
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

  return { runtime, run, task };
};

describe('effect runtime helpers', () => {
  it('releases resources after interrupting fibers when the runtime is disposed', async () => {
    const events: string[] = [];
    const runtime = createPluginEffectRuntime();

    await runtime.runPromise(
      Effect.acquireRelease(
        Effect.sync(() => {
          events.push('acquire');
          return 'resource';
        }),
        resource =>
          Effect.sync(() => {
            events.push(`release:${resource}`);
          })
      )
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

    await Promise.all([runtime.dispose(), runtime.dispose()]);
    expect(events).toEqual(['acquire', 'fiber', 'release:resource']);
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
    await runtime.runPromise(task.cancelEffect());
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(run).not.toHaveBeenCalled();
    await runtime.dispose();
  });

  it('cancels delayed plugin tasks when the plugin runtime is disposed', async () => {
    const { runtime, run, task } = createDelayedTaskFixture(25);

    task.schedule();
    task.reschedule();
    await runtime.dispose();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(run).not.toHaveBeenCalled();
  });

});
