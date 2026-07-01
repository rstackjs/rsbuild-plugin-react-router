import * as Cause from 'effect/Cause';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Fiber from 'effect/Fiber';
import * as Option from 'effect/Option';

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
  cancelEffect(): Effect.Effect<void, Error, never>;
  cancel(): Promise<void>;
};

export const createDelayedPluginTask = ({
  delayMs,
  run,
  onError,
}: {
  delayMs: number;
  run: () => Effect.Effect<void, Error, never>;
  onError: (error: Error) => void;
}): DelayedPluginTask => {
  let activeFiber: ReturnType<typeof Effect.runFork> | undefined;
  let version = 0;

  const cancelActiveEffect = (): Effect.Effect<void, Error, never> =>
    Effect.sync(() => {
      const fiber = activeFiber;
      activeFiber = undefined;
      return fiber;
    }).pipe(
      Effect.flatMap(fiber =>
        fiber ? Fiber.interrupt(fiber).pipe(Effect.asVoid) : Effect.void
      )
    );

  const cancelEffect = (): Effect.Effect<void, Error, never> =>
    Effect.sync(() => {
      version += 1;
    }).pipe(Effect.zipRight(cancelActiveEffect()));

  const start = (taskVersion: number): void => {
    if (activeFiber || version !== taskVersion) {
      return;
    }

    let fiber: ReturnType<typeof Effect.runFork>;
    fiber = Effect.runFork(
      Effect.sleep(Duration.millis(delayMs)).pipe(
        Effect.zipRight(Effect.suspend(run)),
        Effect.catchAll(error =>
          Effect.sync(() => {
            onError(error);
          })
        ),
        Effect.ensuring(
          Effect.sync(() => {
            if (activeFiber === fiber) {
              activeFiber = undefined;
            }
          })
        )
      )
    );
    activeFiber = fiber;
  };

  return {
    schedule(): void {
      if (activeFiber) {
        return;
      }
      version += 1;
      start(version);
    },

    reschedule(): void {
      version += 1;
      const taskVersion = version;
      void runPluginEffect(cancelActiveEffect())
        .then(() => start(taskVersion))
        .catch(onError);
    },

    cancelEffect,

    async cancel(): Promise<void> {
      await runPluginEffect(cancelEffect());
    },
  };
};
