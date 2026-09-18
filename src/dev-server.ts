import type { IncomingMessage, ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';
import type { RsbuildConfig } from '@rsbuild/core';
import type { ServerBuild } from 'react-router';
import { installDevServerSourceMapSupport } from './dev-source-maps.js';
import { resolveAppPackagePath } from './plugin-utils.js';

export type ServerSetup = Exclude<
  NonNullable<NonNullable<RsbuildConfig['server']>['setup']>,
  unknown[]
>;

export type DevServerMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => Promise<void>;

type RequestHandler = (request: Request) => Response | Promise<Response>;
type BuildProvider = () => Promise<ServerBuild>;

export type DevServerMiddlewareDependencies = {
  rootPath: string;
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
      let createRequestHandler = dependencies.createRequestHandler;
      if (!createRequestHandler) {
        const reactRouterPath = resolveAppPackagePath(
          'react-router',
          dependencies.rootPath
        );
        if (!reactRouterPath) {
          throw new Error('Cannot resolve react-router from the application.');
        }
        // Match the application's browser/server bundles, including when the
        // plugin is linked from a workspace with a different Router version.
        const routerModule: typeof import('react-router') = await import(
          pathToFileURL(reactRouterPath).href
        );
        createRequestHandler = routerModule.createRequestHandler;
      }
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

export const createReactRouterDevServerSetup = ({
  loadBuild,
  rootPath,
}: {
  loadBuild: BuildProvider;
  rootPath: string;
}): ServerSetup =>
  function reactRouterDevServerSetup(context) {
    if (context.action !== 'dev') {
      return;
    }
    // The returned callback runs after Rsbuild registers its built-in
    // middlewares, so static assets are served before the React Router
    // request handler.
    return () => {
      installDevServerSourceMapSupport();
      context.server.middlewares.use(
        createDevServerMiddleware({ loadBuild, rootPath })
      );
    };
  };
