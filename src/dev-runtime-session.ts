import type { RsbuildDevServer } from '@rsbuild/core';
import * as Effect from 'effect/Effect';
import { PLUGIN_NAME } from './constants.js';
import type { ReactRouterDevRuntime } from './dev-generation.js';
import type { DevCompilerPair } from './dev-runtime-compilation.js';
import {
  runPluginEffect,
  tryPluginPromise,
  tryPluginSync,
} from './effect-runtime.js';

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

type CloseBinding = (binding: RuntimeBinding, error?: Error) => void;

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

  const completeClose = (binding: RuntimeBinding): void => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    if (state.status === 'active') {
      closeBinding(binding);
    }
    state = { status: 'idle' };
  };

  const failClose = (binding: RuntimeBinding, cause: unknown): void => {
    if (!isCurrentBinding(binding)) {
      return;
    }
    const error = new Error(
      `[${PLUGIN_NAME}] The previous development server failed to close. Restart the process before retrying because Rsbuild may not have finished tearing down its compiler and watchers.`,
      { cause }
    );
    closeBinding(binding, error);
    state = { status: 'terminal', error };
  };

  const applyCloseOutcome = (
    observation: CloseObservation,
    outcome: CloseOutcome
  ): void => {
    observation.outcome = outcome;
    const { binding } = observation;
    if (!binding) {
      return;
    }
    if (outcome.ok) {
      completeClose(binding);
    } else {
      failClose(binding, outcome.cause);
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
      observation.promise = runPluginEffect(
        tryPluginPromise(close).pipe(
          Effect.tap(() =>
            tryPluginSync(() => applyCloseOutcome(observation, { ok: true }))
          ),
          Effect.catchAll(cause =>
            tryPluginSync(() =>
              applyCloseOutcome(observation, { ok: false, cause })
            ).pipe(Effect.zipRight(Effect.fail(cause)))
          )
        )
      );
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
        applyCloseOutcome(observation, observation.outcome);
      }
    },

    markClosing(binding: RuntimeBinding): void {
      if (isCurrentBinding(binding)) {
        state = { status: 'closing', binding };
      }
    },

    terminate(binding: RuntimeBinding, error: Error): void {
      if (!isCurrentBinding(binding)) {
        return;
      }
      closeBinding(binding, error);
      state = { status: 'terminal', error };
    },
  };
};
