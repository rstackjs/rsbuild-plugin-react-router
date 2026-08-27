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

const PluginFibers = Context.GenericTag<FiberSet.FiberSet>(
  'rsbuild-plugin-react-router/PluginFibers'
);
type PluginResources = { readonly scope: Scope.CloseableScope };
const PluginResources: Context.Tag<PluginResources, PluginResources> =
  Context.GenericTag<PluginResources>(
    'rsbuild-plugin-react-router/PluginResources'
  );

type PluginRuntimeContext = Scope.Scope | FiberSet.FiberSet | PluginResources;

const PluginRuntimeLive = Layer.scopedContext(
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    const resources = yield* Scope.fork(scope, ExecutionStrategy.sequential);
    const fiberScope = yield* Scope.fork(scope, ExecutionStrategy.sequential);
    const fibers = yield* FiberSet.make().pipe(
      Effect.provideService(Scope.Scope, fiberScope)
    );
    return Context.make(Scope.Scope, resources).pipe(
      Context.add(PluginFibers, fibers),
      Context.add(PluginResources, { scope: resources })
    );
  })
);

export type PluginEffectRuntime = Pick<
  ManagedRuntime.ManagedRuntime<PluginRuntimeContext, never>,
  'runFork' | 'runPromise'
> & {
  readonly dispose: () => Promise<void>;
};

export const createPluginEffectRuntime = (): PluginEffectRuntime => {
  const runtime = ManagedRuntime.make(PluginRuntimeLive);
  let fiberRunFork: typeof runtime.runFork | undefined;

  let disposePromise: Promise<void> | undefined;

  return {
    runPromise: runtime.runPromise,
    runFork: (effect, options) => {
      if (disposePromise) return Effect.runFork(Effect.interrupt);
      return (fiberRunFork ??= runtime.runSync(
        Effect.flatMap(PluginFibers, fibers =>
          FiberSet.runtime(fibers)<PluginRuntimeContext>()
        )
      ))(effect, options);
    },
    // Resource finalizers cancel their owned fibers before runtime disposal
    // closes the fiber scope and interrupts any stragglers. Deferring by one
    // microtask also lets a managed fiber request its own shutdown safely.
    dispose: (): Promise<void> =>
      (disposePromise ??= Promise.resolve()
        .then(() =>
          runtime.runPromise(
            Effect.flatMap(PluginResources, ({ scope }) =>
              Scope.close(scope, Exit.void)
            )
          )
        )
        .finally(() => runtime.dispose())),
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
};

export const createDelayedPluginTask = ({
  runtime,
  delayMs,
  run,
  onError,
}: {
  runtime: PluginEffectRuntime;
  delayMs: number;
  run: () => Effect.Effect<void, Error, Scope.Scope>;
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
      runtime.runFork(
        Fiber.interrupt(fiber).pipe(Effect.ensuring(Effect.sync(start)))
      );
    } else {
      start();
    }
  };

  return {
    schedule: start,
    reschedule,
    cancelEffect,
  };
};
