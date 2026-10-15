import type { RsbuildDevServer } from '@rsbuild/core';
import { PLUGIN_NAME } from './constants.js';
import type { ReactRouterDevRuntime } from './dev-generation.js';
import type { DevCompilerPair } from './dev-runtime-compilation.js';
import { normalizeEffectError } from './effect-runtime.js';

export type RuntimeBinding = {
  id: number;
  server: RsbuildDevServer;
  runtime: ReactRouterDevRuntime;
  compilers?: DevCompilerPair;
};

type CloseOutcome = { ok: true } | { ok: false; cause: unknown };

type CloseObservation = {
  binding?: RuntimeBinding;
  promise?: Promise<void>;
  outcome?: CloseOutcome;
};

export type ControllerState =
  | { status: 'idle' }
  | { status: 'active'; binding: RuntimeBinding }
  | { status: 'closing'; binding: RuntimeBinding }
  | { status: 'terminal'; error: Error };

type CloseBinding = (
  binding: RuntimeBinding,
  error?: Error
) => void | Promise<void>;

export type DevRuntimeSessionManager = {
  getState(): ControllerState;
  getActiveBinding(): RuntimeBinding | undefined;
  observeClose(server: RsbuildDevServer): void;
  assertCanStart(): void;
  createBinding(
    server: RsbuildDevServer,
    runtime: ReactRouterDevRuntime
  ): RuntimeBinding;
  bindCloseObservation(binding: RuntimeBinding): void;
  markClosing(binding: RuntimeBinding): void;
  terminate(binding: RuntimeBinding, error: Error): void;
};

export const createDevRuntimeSessionManager = (
  closeBinding: CloseBinding
): DevRuntimeSessionManager => {
  let state: ControllerState = { status: 'idle' };
  let nextSessionId = 1;
  const closeObservationByServer = new WeakMap<
    RsbuildDevServer,
    CloseObservation
  >();

  const getState = (): ControllerState => state;

  const getActiveBinding = (): RuntimeBinding | undefined =>
    state.status === 'active' ? state.binding : undefined;

  const isCurrentBinding = (binding: RuntimeBinding): boolean =>
    (state.status === 'active' || state.status === 'closing') &&
    state.binding === binding;

  const completeClose = async (binding: RuntimeBinding): Promise<void> => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    if (state.status === 'active') {
      state = { status: 'closing', binding };
      await closeBinding(binding);
    }
    if (isCurrentBinding(binding)) state = { status: 'idle' };
  };

  const terminateBinding = async (
    binding: RuntimeBinding,
    error: Error
  ): Promise<void> => {
    if (!isCurrentBinding(binding)) return;
    state = { status: 'terminal', error };
    try {
      await closeBinding(binding, error);
    } catch (cause) {
      error.cause = new AggregateError(
        [error.cause ?? error.message, cause],
        'Development runtime cleanup failed'
      );
    }
  };

  const failClose = async (
    binding: RuntimeBinding,
    cause: unknown
  ): Promise<void> => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    const error = new Error(
      `[${PLUGIN_NAME}] The previous development server failed to close. Restart the process before retrying because Rsbuild may not have finished tearing down its compiler and watchers.`,
      { cause }
    );
    await terminateBinding(binding, error);
  };

  const applyCloseOutcome = async (
    observation: CloseObservation,
    outcome: CloseOutcome
  ): Promise<void> => {
    observation.outcome = outcome;
    const { binding } = observation;
    if (!binding) {
      return;
    }
    if (outcome.ok) {
      await completeClose(binding);
    } else {
      await failClose(binding, outcome.cause);
    }
    observation.binding = undefined;
  };

  const observeClose = (server: RsbuildDevServer): CloseObservation => {
    const existing = closeObservationByServer.get(server);
    if (existing) {
      return existing;
    }
    const observation: CloseObservation = {};
    const close = server.close.bind(server);
    server.close = () => {
      if (observation.promise) {
        return observation.promise;
      }
      let closePromise: Promise<void>;
      try {
        closePromise = Promise.resolve(close());
      } catch (cause) {
        closePromise = Promise.reject(normalizeEffectError(cause));
      }
      observation.promise = closePromise
        .then(() => applyCloseOutcome(observation, { ok: true }))
        .catch(async cause => {
          const error = normalizeEffectError(cause);
          await applyCloseOutcome(observation, { ok: false, cause: error });
          throw error;
        });
      return observation.promise;
    };
    closeObservationByServer.set(server, observation);
    return observation;
  };

  return {
    getState,
    getActiveBinding,

    observeClose(server: RsbuildDevServer): void {
      observeClose(server);
    },

    assertCanStart(): void {
      if (state.status === 'terminal') {
        throw state.error;
      }
      if (state.status === 'active') {
        throw new Error(
          `[${PLUGIN_NAME}] A development server is already active. Await its close() before calling createDevServer() again. If startup failed before returning the server, restart the process before retrying.`
        );
      }
      if (state.status === 'closing') {
        throw new Error(
          `[${PLUGIN_NAME}] The previous development server is still closing. Await its close() before calling createDevServer() again.`
        );
      }
    },

    createBinding(
      server: RsbuildDevServer,
      runtime: ReactRouterDevRuntime
    ): RuntimeBinding {
      const binding = { id: nextSessionId++, server, runtime };
      state = { status: 'active', binding };
      return binding;
    },

    bindCloseObservation(binding: RuntimeBinding): void {
      const observation = observeClose(binding.server);
      observation.binding = binding;
      if (observation.outcome) {
        void applyCloseOutcome(observation, observation.outcome).catch(cause =>
          failClose(binding, cause)
        );
      }
    },

    markClosing(binding: RuntimeBinding): void {
      if (isCurrentBinding(binding)) {
        state = { status: 'closing', binding };
      }
    },

    terminate(binding: RuntimeBinding, error: Error): void {
      void terminateBinding(binding, error);
    },
  };
};
