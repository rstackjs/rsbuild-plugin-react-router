import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { normalizeEffectError } from './effect-runtime.js';
import {
  headerEntries,
  type ServerBuildDescription,
  type ServerBuildWorkerData,
  type ServerBuildWorkerRequest,
  type ServerBuildWorkerResponse,
} from './server-build-worker-protocol.js';

const defaultWorkerPath = fileURLToPath(
  new URL('./server-build-worker.js', import.meta.url)
);

export type ServerBuildWorker = {
  /** Plain-data view of the classic server build (routes, assets, prerender). */
  description: ServerBuildDescription | undefined;
  /** Runs the request against the server build in the worker. */
  handler(request: Request): Promise<Response>;
  /** Terminates the worker, and with it any handle the server graph opened. */
  close(): Promise<void>;
};

type Reply = Exclude<ServerBuildWorkerResponse, { type: 'ready' | 'closed' }>;

type Pending = {
  resolve: (reply: Reply) => void;
  reject: (error: Error) => void;
};

const replyError = (reply: Extract<Reply, { ok: false }>): Error => {
  const error = new Error(reply.error.message);
  error.name = reply.error.name ?? error.name;
  if (reply.error.stack) {
    error.stack = reply.error.stack;
  }
  return error;
};

/**
 * Evaluate a built server bundle in a worker thread and proxy requests to it.
 * Build-time rendering used to `import()` the bundle into the build process;
 * a module-scope handle in the app's server graph then kept `rsbuild build`
 * alive forever (#135). The worker is terminated by `close()`.
 *
 * The worker's `exit` is its final event, so any exit (including one between
 * requests, e.g. the app calling `process.exit`) is terminal: outstanding and
 * later requests reject instead of waiting for a reply that cannot come.
 */
export const startServerBuildWorker = async (
  data: ServerBuildWorkerData,
  // Tests run from `src/` and point this at the built worker.
  workerPath: string = defaultWorkerPath
): Promise<ServerBuildWorker> => {
  const worker = new Worker(workerPath, { workerData: data });
  const pending = new Map<number, Pending>();
  const active = new Map<number, (error: Error) => void>();
  let nextId = 0;
  let failure: Error | undefined;
  let acknowledgeClose: () => void = () => {};
  const closed = new Promise<void>(resolve => {
    acknowledgeClose = resolve;
  });

  const fail = (error: Error): void => {
    failure ??= error;
    for (const { reject } of pending.values()) {
      reject(failure);
    }
    pending.clear();
    for (const stop of active.values()) stop(failure);
    active.clear();
  };

  const ready = new Promise<ServerBuildDescription | undefined>(
    (resolve, reject) => {
      worker.on('message', (message: ServerBuildWorkerResponse) => {
        if (message.type === 'closed') {
          acknowledgeClose();
          return;
        }
        if (message.type === 'ready') {
          resolve(message.description);
          return;
        }
        const entry = pending.get(message.id);
        pending.delete(message.id);
        entry?.resolve(message);
      });
      worker.on('error', error => {
        acknowledgeClose();
        fail(normalizeEffectError(error));
        reject(failure);
      });
      worker.on('exit', code => {
        acknowledgeClose();
        fail(new Error(`Server build worker exited with code ${code}`));
        reject(failure);
      });
    }
  );

  const send = (
    request: ServerBuildWorkerRequest,
    transfer: ArrayBuffer[] = []
  ): void => {
    worker.postMessage(request, transfer);
  };

  // Import errors surface as worker 'error' events, an early exit as 'exit'.
  const description = await ready;

  return {
    description,
    async handler(request) {
      const id = nextId++;
      const body = request.body
        ? new Uint8Array(await request.arrayBuffer())
        : undefined;
      let responseController:
        | ReadableStreamDefaultController<Uint8Array>
        | undefined;
      const cleanup = (): void => {
        active.delete(id);
        request.signal.removeEventListener('abort', onAbort);
      };
      const stop = (error: Error): void => {
        responseController?.error(error);
        pending.get(id)?.reject(error);
        pending.delete(id);
        cleanup();
      };
      // Keep the relay alive after headers arrive: RSC may release a redirect
      // or rejected status without ever consuming its response body.
      const onAbort = (): void => {
        send({ type: 'abort', id });
        if (responseController)
          stop(new Error('Server build request was aborted'));
      };
      const reply = await new Promise<Reply>((resolve, reject) => {
        if (failure) {
          reject(failure);
          return;
        }
        pending.set(id, { resolve, reject });
        active.set(id, stop);
        request.signal.addEventListener('abort', onAbort, { once: true });
        send(
          {
            type: 'request',
            id,
            url: request.url,
            method: request.method,
            headers: headerEntries(request.headers),
            body,
          },
          body ? [body.buffer] : []
        );
        if (request.signal.aborted) onAbort();
      }).catch(error => {
        cleanup();
        throw error;
      });
      if (!reply.ok) {
        cleanup();
        throw replyError(reply);
      }
      if (reply.type !== 'reply')
        throw new Error('Unexpected server build response');
      const { status, statusText, headers, hasBody } = reply.response;
      const responseBody = hasBody
        ? new ReadableStream<Uint8Array>(
            {
              start(controller) {
                responseController = controller;
              },
              async pull(controller) {
                try {
                  const result = await new Promise<Reply>((resolve, reject) => {
                    if (failure) {
                      reject(failure);
                      return;
                    }
                    pending.set(id, { resolve, reject });
                    send({ type: 'read', id });
                  });
                  if (!result.ok) throw replyError(result);
                  if (result.type !== 'body')
                    throw new Error('Unexpected server build body');
                  controller.enqueue(result.body);
                  controller.close();
                } catch (error) {
                  controller.error(error);
                } finally {
                  cleanup();
                }
              },
              cancel() {
                send({ type: 'abort', id });
                stop(new Error('Server build response was canceled'));
              },
            },
            { highWaterMark: 0 }
          )
        : null;
      if (!hasBody) cleanup();
      return new Response(responseBody, {
        status,
        statusText,
        headers,
      });
    },
    async close() {
      fail(new Error('Server build worker was closed'));
      send({ type: 'close' });
      await closed;
      await worker.terminate();
    },
  };
};
