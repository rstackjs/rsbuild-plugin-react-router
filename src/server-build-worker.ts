// Worker entry: evaluates a built server bundle and serves requests to it for
// build-time rendering; see `startServerBuildWorker` for why this is a worker.
// `IS_RR_BUILD_REQUEST` is set for this module graph only.
import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import { createRequestHandler, type ServerBuild } from 'react-router';
import { PLUGIN_NAME } from './constants.js';
import { resolveServerBuildModule } from './server-build-resolution.js';
import {
  headerEntries,
  type ServerBuildWorkerData,
  type ServerBuildWorkerRequest,
  type ServerBuildWorkerResponse,
  type ServerBuildDescription,
  type SerializedError,
} from './server-build-worker-protocol.js';

const port = parentPort;
if (!port) {
  throw new Error('server-build-worker must run as a worker thread');
}

const { serverBuildPath, mode } = workerData as ServerBuildWorkerData;
process.env.IS_RR_BUILD_REQUEST = 'yes';

const post = (
  message: ServerBuildWorkerResponse,
  transfer: ArrayBuffer[] = []
): void => {
  port.postMessage(message, transfer);
};

const serializeError = (error: unknown): SerializedError => {
  const value = error as { message?: unknown; stack?: unknown; name?: unknown };
  return {
    message: String(value?.message ?? error),
    stack: typeof value?.stack === 'string' ? value.stack : undefined,
    name: typeof value?.name === 'string' ? value.name : undefined,
  };
};

const describeClassicBuild = (build: ServerBuild): ServerBuildDescription => ({
  prerender: build.prerender,
  routes: Object.fromEntries(
    Object.entries(build.routes).flatMap(([id, route]) =>
      route
        ? [
            [
              id,
              {
                id: route.id,
                parentId: route.parentId,
                path: route.path,
                index: route.index,
                caseSensitive: route.caseSensitive,
                module: {
                  default: route.module.default !== undefined,
                  ErrorBoundary: route.module.ErrorBoundary !== undefined,
                  loader: route.module.loader !== undefined,
                },
              },
            ],
          ]
        : []
    )
  ),
  assets: {
    routes: Object.fromEntries(
      Object.entries(build.assets.routes).flatMap(([id, route]) =>
        route ? [[id, { hasLoader: route.hasLoader }]] : []
      )
    ),
  },
});

const resolveRscFetch = (
  buildModule: unknown
): ((request: Request) => Promise<Response>) => {
  const moduleRecord = buildModule as
    | { default?: { fetch?: unknown; default?: { fetch?: unknown } } }
    | undefined;
  const fetch =
    typeof moduleRecord?.default?.fetch === 'function'
      ? moduleRecord.default.fetch
      : typeof moduleRecord?.default?.default?.fetch === 'function'
        ? moduleRecord.default.default.fetch
        : null;
  if (!fetch) {
    throw new Error(
      `[${PLUGIN_NAME}] RSC server build ${JSON.stringify(
        serverBuildPath
      )} must default-export an object with a fetch function.`
    );
  }
  return fetch as (request: Request) => Promise<Response>;
};

const buildModule = await import(pathToFileURL(serverBuildPath).href);
let description: ServerBuildDescription | undefined;
let handler: (request: Request) => Promise<Response>;
if (mode === 'classic') {
  const build = await resolveServerBuildModule(
    buildModule,
    `Server build ${JSON.stringify(serverBuildPath)}`
  );
  description = describeClassicBuild(build);
  handler = createRequestHandler(build, 'production');
} else {
  handler = resolveRscFetch(buildModule);
}

// One AbortController per in-flight request, so the Request the app receives
// is aborted when the parent releases it (`createBuildRequestEffect`) or once
// its response has been consumed here, mirroring the in-process contract.
const controllers = new Map<number, AbortController>();
const responses = new Map<number, Response>();
const release = (id: number): void => {
  controllers.get(id)?.abort();
  controllers.delete(id);
  responses.delete(id);
};

port.on('message', async (message: ServerBuildWorkerRequest) => {
  if (message.type === 'close') {
    for (const id of controllers.keys()) release(id);
    post({ type: 'closed' });
    return;
  }
  if (message.type === 'abort') {
    // Cancellation can itself stay pending in application streams. It must
    // not prevent request cleanup or worker shutdown.
    void responses
      .get(message.id)
      ?.body?.cancel()
      .catch(() => {});
    release(message.id);
    return;
  }
  if (message.type === 'read') {
    try {
      const response = responses.get(message.id);
      if (!response) throw new Error('Server build response was released');
      const body = new Uint8Array(await response.arrayBuffer());
      release(message.id);
      post({ type: 'body', id: message.id, ok: true, body }, [body.buffer]);
    } catch (error) {
      release(message.id);
      post({
        type: 'reply',
        id: message.id,
        ok: false,
        error: serializeError(error),
      });
    }
    return;
  }
  const controller = new AbortController();
  controllers.set(message.id, controller);
  try {
    const response = await handler(
      new Request(message.url, {
        method: message.method,
        headers: message.headers,
        body: message.body,
        signal: controller.signal,
      })
    );
    if (response.body) responses.set(message.id, response);
    else release(message.id);
    post({
      type: 'reply',
      id: message.id,
      ok: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: headerEntries(response.headers),
        hasBody: response.body !== null,
      },
    });
  } catch (error) {
    release(message.id);
    post({
      type: 'reply',
      id: message.id,
      ok: false,
      error: serializeError(error),
    });
  }
});

post({ type: 'ready', description });
