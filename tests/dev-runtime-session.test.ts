import type { RsbuildDevServer } from '@rsbuild/core';
import { expect, it } from '@rstest/core';
import type { ReactRouterDevRuntime } from '../src/dev-generation';
import { createDevRuntimeSessionManager } from '../src/dev-runtime-session';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

const fixture = (cleanup: Promise<void>) => {
  const sessions = createDevRuntimeSessionManager(() => cleanup);
  const server = {
    close: async () => undefined,
  } as unknown as RsbuildDevServer;
  const binding = sessions.createBinding(server, {} as ReactRouterDevRuntime);
  sessions.bindCloseObservation(binding);
  return { sessions, server, binding };
};

it('keeps an early server close pending until runtime cleanup completes', async () => {
  const cleanup = deferred();
  const { sessions, server } = fixture(cleanup.promise);
  let closed = false;
  const closing = server.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  expect(() => sessions.assertCanStart()).toThrow('still closing');
  cleanup.resolve();
  await closing;
  expect(closed).toBe(true);
  expect(sessions.getState()).toEqual({ status: 'idle' });
});

it('rejects server close and prevents restart when fallback runtime cleanup fails', async () => {
  const cleanup = deferred();
  const { sessions, server } = fixture(cleanup.promise);
  const closing = server.close();
  cleanup.reject(new Error('Cannot remove native artifacts'));
  await expect(closing).rejects.toThrow('Cannot remove native artifacts');
  expect(() => sessions.assertCanStart()).toThrow(
    'previous development server failed to close'
  );
});

it('observes asynchronous cleanup failure after terminal startup failure', async () => {
  const cleanup = deferred();
  const { sessions, binding } = fixture(cleanup.promise);
  const error = new Error('Startup failed');
  sessions.terminate(binding, error);
  cleanup.reject(new Error('Cannot remove native artifacts'));
  await Promise.resolve();
  expect(() => sessions.assertCanStart()).toThrow('Startup failed');
  expect(error.cause).toBeInstanceOf(AggregateError);
  expect((error.cause as AggregateError).errors[1].message).toBe(
    'Cannot remove native artifacts'
  );
});
