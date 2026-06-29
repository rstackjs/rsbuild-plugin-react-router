import { Cause, Effect, Exit, Option } from 'effect';

export const normalizeScriptError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

const normalizeScriptCause = <E,>(cause: Cause.Cause<E>): Error => {
  const failure = Cause.failureOption(cause);
  return normalizeScriptError(
    Option.isSome(failure) ? failure.value : Cause.squash(cause)
  );
};

export const runScriptEffect = async <A, E>(
  effect: Effect.Effect<A, E, never>
): Promise<A> => {
  const exit = await Effect.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) {
    return exit.value;
  }
  throw normalizeScriptCause(exit.cause);
};

export const tryScriptSync = <A,>(
  evaluate: () => A
): Effect.Effect<A, Error, never> =>
  Effect.try({
    try: evaluate,
    catch: normalizeScriptError,
  });

export const tryScriptPromise = <A,>(
  evaluate: () => PromiseLike<A> | A
): Effect.Effect<A, Error, never> =>
  Effect.tryPromise({
    try: () => Promise.resolve(evaluate()),
    catch: normalizeScriptError,
  });
