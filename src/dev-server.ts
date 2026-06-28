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

  return async (req, res, next): Promise<void> => {
    try {
      const listener = await getListener();
      await listener(req, res);
    } catch (error) {
      next(error);
    }
  };
};
