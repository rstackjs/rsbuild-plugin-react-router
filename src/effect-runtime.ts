import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as ExecutionStrategy from 'effect/ExecutionStrategy';
import * as Exit from 'effect/Exit';
import * as Fiber from 'effect/Fiber';
import * as FiberSet from 'effect/FiberSet';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import * as Scope from 'effect/Scope';

type Acquire = <A, E, R, R2>(
  acquire: Effect.Effect<A, E, R>,
  release: (resource: A) => Effect.Effect<void, never, R2>
) => Effect.Effect<A, E, R | R2>;

export interface PluginScope {
  readonly acquire: Acquire;
  readonly fibers: FiberSet.FiberSet;
}

export const PluginScope: Context.Tag<PluginScope, PluginScope> =
  Context.GenericTag<PluginScope>('rsbuild-plugin-react-router/PluginScope');

const PluginScopeLive = Layer.scoped(
  PluginScope,
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const resources = yield* Scope.fork(scope, ExecutionStrategy.sequential);
    const fibers = yield* FiberSet.make();
    return {
      acquire: (acquire, release) =>
        Effect.acquireRelease(acquire, release).pipe(
          Effect.provideService(Scope.Scope, resources)
        ),
      fibers,
    };
  })
);

export type PluginEffectRuntime = Pick<
  ManagedRuntime.ManagedRuntime<PluginScope, never>,
  'runFork' | 'runPromise'
> & {
  readonly dispose: () => Promise<void>;
};

export const createPluginEffectRuntime = (): PluginEffectRuntime => {
  const runtime = ManagedRuntime.make(PluginScopeLive);
  let fiberRunFork: typeof runtime.runFork | undefined;

  let disposePromise: Promise<void> | undefined;

  return {
    runPromise: runtime.runPromise,
    runFork: (effect, options) =>
      (fiberRunFork ??= runtime.runSync(
        Effect.flatMap(PluginScope, pluginScope =>
          FiberSet.runtime(pluginScope.fibers)<PluginScope>()
        )
      ))(effect, options),
    dispose: (): Promise<void> => (disposePromise ??= runtime.dispose()),
  };
};

export const DEV_BACKGROUND_STARTUP_DELAY_MS = 3_000;

export const normalizeEffectError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

const normalizeEffectCause = <E>(cause: Cause.Cause<E>): Error => {
  const failure = Cause.failureOption(cause);
  return normalizeEffectError(
    Option.isSome(failure) ? failure.value : Cause.squash(cause)
  );
};

export const runPluginEffect = async <A, E>(
  effect: Effect.Effect<A, E, never>
): Promise<A> => {
  const exit = await Effect.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) {
    return exit.value;
  }
  throw normalizeEffectCause(exit.cause);
};

export const tryPluginSync = <A>(
  evaluate: () => A
): Effect.Effect<A, Error, never> =>
  Effect.try({
    try: evaluate,
    catch: normalizeEffectError,
  });

export const tryPluginPromise = <A>(
  evaluate: () => PromiseLike<A> | A
): Effect.Effect<A, Error, never> =>
  Effect.tryPromise({
    try: () => Promise.resolve(evaluate()),
    catch: normalizeEffectError,
  });

type DelayedPluginTask = {
  schedule(): void;
  reschedule(): void;
  cancelEffect(): Effect.Effect<void>;
  cancel(): Promise<void>;
};

export const createDelayedPluginTask = ({
  runtime,
  delayMs,
  run,
  onError,
}: {
  runtime: PluginEffectRuntime;
  delayMs: number;
  run: () => Effect.Effect<void, Error, PluginScope>;
  onError: (error: Error) => void;
}): DelayedPluginTask => {
  let fiber: ReturnType<PluginEffectRuntime['runFork']> | null | undefined;

  const cancelEffect = (): Effect.Effect<void> =>
    Effect.suspend(() => {
      const activeFiber = fiber;
      fiber = null;
      return activeFiber
        ? Fiber.interrupt(activeFiber).pipe(Effect.asVoid)
        : Effect.void;
    });

  const cancel = (): Promise<void> => {
    const activeFiber = fiber;
    return activeFiber
      ? runtime.runPromise(
          Fiber.interrupt(activeFiber).pipe(
            Effect.ensuring(
              Effect.sync(() => {
                if (fiber === activeFiber) {
                  fiber = undefined;
                }
              })
            ),
            Effect.asVoid
          )
        )
      : Promise.resolve();
  };

  const start = (): void => {
    if (fiber !== undefined) {
      return;
    }

    let activeFiber: ReturnType<PluginEffectRuntime['runFork']>;
    activeFiber = runtime.runFork(
      Effect.sleep(Duration.millis(delayMs)).pipe(
        Effect.zipRight(Effect.suspend(run)),
        Effect.catchAll(error =>
          Effect.sync(() => {
            onError(error);
          })
        ),
        Effect.ensuring(
          Effect.sync(() => {
            if (fiber === activeFiber) {
              fiber = undefined;
            }
          })
        )
      )
    );
    fiber = activeFiber;
  };

  const reschedule = (): void => {
    if (fiber) {
      void cancel().then(start).catch(onError);
    } else {
      start();
    }
  };

  return {
    schedule: start,
    reschedule: reschedule,
    cancelEffect: cancelEffect,
    cancel: cancel,
  };
};
