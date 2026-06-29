import { Cause, Duration, Effect, Exit, Fiber, Option } from 'effect';

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

  const cancelEffect = (): Effect.Effect<void, Error, never> =>
    Effect.sync(() => {
      const fiber = activeFiber;
      activeFiber = undefined;
      return fiber;
    }).pipe(
      Effect.flatMap(fiber =>
        fiber ? Fiber.interrupt(fiber).pipe(Effect.asVoid) : Effect.void
      )
    );

  return {
    schedule(): void {
      if (activeFiber) {
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
    },

    cancelEffect,

    async cancel(): Promise<void> {
      await runPluginEffect(cancelEffect());
    },
  };
};
