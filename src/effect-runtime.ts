import { Effect } from 'effect';

export const normalizeEffectError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

export const runPluginEffect = <A, E>(
  effect: Effect.Effect<A, E, never>
): Promise<A> => Effect.runPromise(effect);

export const tryPluginPromise = <A>(
  evaluate: () => PromiseLike<A> | A
): Effect.Effect<A, Error, never> =>
  Effect.tryPromise({
    try: () => Promise.resolve(evaluate()),
    catch: normalizeEffectError,
  });
