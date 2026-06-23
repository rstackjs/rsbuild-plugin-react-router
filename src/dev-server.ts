import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadReactRouterServerBuild } from './dev-generation-coordinator.js';
import { normalizeBuildModule, resolveBuildExports } from './server-utils.js';

export type DevServerMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
) => Promise<void>;

export const createDevServerMiddleware = (server: any): DevServerMiddleware => {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: any) => void
  ): Promise<void> => {
    try {
      const bundle = await loadReactRouterServerBuild(server);

      if (!bundle || !bundle.routes) {
        throw new Error('Server bundle not found or invalid');
      }

      // Use the modern request listener implementation directly to reduce
      // our reliance on the deprecated `@mjackson/node-fetch-server` package.
      const rr = await import('react-router');
      const nfs = await import('@remix-run/node-fetch-server');
      if (typeof rr.createRequestHandler !== 'function') {
        throw new Error(
          '[rsbuild-plugin-react-router] Missing `createRequestHandler` export from `react-router`'
        );
      }
      if (typeof nfs.createRequestListener !== 'function') {
        throw new Error(
          '[rsbuild-plugin-react-router] Missing `createRequestListener` export from `@remix-run/node-fetch-server`'
        );
      }
      const normalizedBuild = normalizeBuildModule(bundle);
      const build = await resolveBuildExports(normalizedBuild);
      const requestHandler = rr.createRequestHandler(build, 'development');
      // `createRequestListener` provides `client` info but React Router's
      // request handler expects an app-defined `loadContext` object.
      // For the built-in dev middleware we don't currently provide a load
      // context, so pass `undefined`.
      const listener = nfs.createRequestListener(request =>
        requestHandler(request)
      );
      await listener(req, res);
    } catch (error) {
      console.error('SSR Error:', error);
      next(error);
    }
  };
};
