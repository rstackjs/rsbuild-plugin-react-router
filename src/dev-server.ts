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

      const { createRequestListener } = await import('@react-router/node');
      const normalizedBuild = normalizeBuildModule(bundle);
      const build = await resolveBuildExports(normalizedBuild);
      const listener = createRequestListener({ build });
      await listener(req, res);
    } catch (error) {
      console.error('SSR Error:', error);
      next(error);
    }
  };
};
