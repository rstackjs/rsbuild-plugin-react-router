import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerBuild } from 'react-router';

export type DevServerMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => Promise<void>;

type RequestHandler = (request: Request) => Response | Promise<Response>;
type BuildProvider = () => Promise<ServerBuild>;

export type DevServerMiddlewareDependencies = {
  loadBuild: BuildProvider;
  createRequestHandler?: (
    build: BuildProvider,
    mode: 'development'
  ) => RequestHandler;
  createRequestListener?: (
    handler: RequestHandler
  ) => (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
};

export const createDevServerMiddleware = (
  dependencies: DevServerMiddlewareDependencies
): DevServerMiddleware => {
  let listenerPromise:
    | Promise<
        (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
      >
    | undefined;

  const getListener = () => {
    listenerPromise ??= (async () => {
      const createRequestHandler =
        dependencies.createRequestHandler ??
        (await import('react-router')).createRequestHandler;
      const createRequestListener =
        dependencies.createRequestListener ??
        (await import('@remix-run/node-fetch-server')).createRequestListener;
      const requestHandler = createRequestHandler(
        dependencies.loadBuild,
        'development'
      );
      return createRequestListener(request => requestHandler(request));
    })();
    return listenerPromise;
  };

  // Warm the handler imports now so the first request does not pay them.
  // On failure, reset so the first real request retries and surfaces the
  // error through the middleware's own error path.
  void getListener().catch(() => {
    listenerPromise = undefined;
  });

  return async (req, res, next): Promise<void> => {
    try {
      const listener = await getListener();
      await listener(req, res);
    } catch (error) {
      next(error);
    }
  };
};
