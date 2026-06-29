import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it, rstest } from '@rstest/core';
import type { ServerBuild } from 'react-router';
import { createDevServerMiddleware } from '../src/dev-server';

const build = {
  entry: { module: {} },
  routes: {},
  assets: {},
} as unknown as ServerBuild;

describe('React Router development middleware', () => {
  it('constructs one lazy request handler over the committed build provider', async () => {
    const loadBuild = rstest.fn(() => Promise.resolve(build));
    const requestHandler = rstest.fn(async () => {
      await capturedBuildProvider?.();
      return new Response();
    });
    let capturedBuildProvider: (() => Promise<ServerBuild>) | undefined;
    const createRequestHandler = rstest.fn(
      (buildProvider: () => Promise<ServerBuild>) => {
        capturedBuildProvider = buildProvider;
        return requestHandler;
      }
    );
    const listener = rstest.fn(
      async (
        handler: (request: Request) => Response | Promise<Response>,
        _req: IncomingMessage,
        _res: ServerResponse
      ) => {
        await handler(new Request('http://localhost/'));
      }
    );
    const createRequestListener = rstest.fn(handler =>
      listener.bind(undefined, handler)
    );
    const next = rstest.fn();
    const middleware = createDevServerMiddleware({
      loadBuild,
      createRequestHandler,
      createRequestListener,
    });

    await middleware({} as IncomingMessage, {} as ServerResponse, next);
    await middleware({} as IncomingMessage, {} as ServerResponse, next);

    expect(createRequestHandler).toHaveBeenCalledTimes(1);
    expect(createRequestHandler).toHaveBeenCalledWith(
      loadBuild,
      'development'
    );
    expect(createRequestListener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(loadBuild).toHaveBeenCalledTimes(2);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards listener failures to the next middleware', async () => {
    const error = new Error('request failed');
    const next = rstest.fn();
    const middleware = createDevServerMiddleware({
      loadBuild: () => Promise.resolve(build),
      createRequestHandler: () => () => Promise.reject(error),
      createRequestListener: handler => async () => {
        await handler(new Request('http://localhost/'));
      },
    });

    await middleware({} as IncomingMessage, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not pass node-fetch client info as React Router load context', async () => {
    const requestHandler = rstest.fn(async () => new Response());
    const middleware = createDevServerMiddleware({
      loadBuild: () => Promise.resolve(build),
      createRequestHandler: () => requestHandler,
      createRequestListener: handler => async () => {
        await (
          handler as (
            request: Request,
            client: { address: string; family: string; port: number }
          ) => Response | Promise<Response>
        )(new Request('http://localhost/'), {
          address: '127.0.0.1',
          family: 'IPv4',
          port: 1234,
        });
      },
    });

    await middleware({} as IncomingMessage, {} as ServerResponse, rstest.fn());

    expect(requestHandler).toHaveBeenCalledTimes(1);
    expect(requestHandler.mock.calls[0]).toHaveLength(1);
  });
});
