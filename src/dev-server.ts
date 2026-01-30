import type { IncomingMessage, ServerResponse } from 'node:http';

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
      const bundle = await server.environments.node.loadBundle('app');

      if (!bundle || !bundle.routes) {
        throw new Error('Server bundle not found or invalid');
      }

      const { createRequestListener } = await import('@react-router/node');
      const listener = createRequestListener({ build: bundle });
      await listener(req, res);
    } catch (error) {
      console.error('SSR Error:', error);
      next(error);
    }
  };
};
