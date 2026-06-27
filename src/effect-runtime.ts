import { Cause, Duration, Effect, Exit, Fiber, Option } from 'effect';

export const DEV_BACKGROUND_STARTUP_DELAY_MS = 3_000;

export const normalizeEffectError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

const normalizeEffectCause = <E>(cause: Cause.Cause<E>): Error => {
  const failure = Cause.failureOption(cause);
  if (Option.isSome(failure)) {
    return normalizeEffectError(failure.value);
  }
  return normalizeEffectError(Cause.squash(cause));
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
  let activeToken: symbol | undefined;

  return {
    schedule(): void {
      if (activeFiber) {
        return;
      }

      const token = Symbol();
      activeToken = token;
      activeFiber = Effect.runFork(
        Effect.sleep(Duration.millis(delayMs)).pipe(
          Effect.zipRight(Effect.suspend(run)),
          Effect.catchAll(error =>
            Effect.sync(() => {
              onError(error);
            })
          ),
          Effect.ensuring(
            Effect.sync(() => {
              if (activeToken === token) {
                activeToken = undefined;
                activeFiber = undefined;
              }
            })
          )
        )
      );
    },

    async cancel(): Promise<void> {
      const fiber = activeFiber;
      activeToken = undefined;
      activeFiber = undefined;
      if (!fiber) {
        return;
      }
      await runPluginEffect(Fiber.interrupt(fiber).pipe(Effect.asVoid));
    },
  };
};
