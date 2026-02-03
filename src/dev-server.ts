import type { IncomingMessage, ServerResponse } from 'node:http';
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
      const tryLoadBundle = async (entryName: string) => {
        try {
          return await server.environments.node.loadBundle(entryName);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Can't find entry")
          ) {
            return null;
          }
          throw error;
        }
      };

      const bundle =
        (await tryLoadBundle('static/js/app')) ?? (await tryLoadBundle('app'));

      if (!bundle || !bundle.routes) {
        throw new Error('Server bundle not found or invalid');
      }

      // Use the modern request listener implementation directly to reduce
      // our reliance on the deprecated `@mjackson/node-fetch-server` package.
      const [{ createRequestHandler }, { createRequestListener }] = await Promise.all([
        import('react-router'),
        import('@remix-run/node-fetch-server'),
      ]);
      const normalizedBuild = normalizeBuildModule(bundle);
      const build = await resolveBuildExports(normalizedBuild);
      const requestHandler = createRequestHandler(build);
      // `createRequestListener` provides `client` info but React Router's
      // request handler expects an app-defined `loadContext` object.
      // For the built-in dev middleware we don't currently provide a load
      // context, so pass `undefined`.
      const listener = createRequestListener((request) => requestHandler(request));
      await listener(req, res);
    } catch (error) {
      console.error('SSR Error:', error);
      next(error);
    }
  };
};
