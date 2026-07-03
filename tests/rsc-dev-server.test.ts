import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from '@rstest/core';
import {
  createReactRouterRscDevServerSetup,
  shouldBypassRscDevRequest,
} from '../src/rsc-dev-server';

type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void
) => void;

describe('shouldBypassRscDevRequest', () => {
  it('routes the root path to the RSC handler', () => {
    expect(shouldBypassRscDevRequest({ url: '/' })).toBe(false);
  });

  it('routes extensionless document paths to the RSC handler', () => {
    expect(shouldBypassRscDevRequest({ url: '/about' })).toBe(false);
  });

  it('routes resource routes with file extensions to the RSC handler', () => {
    // The middleware runs after Rsbuild's static asset middlewares, so an
    // extension no longer implies a static asset: /sitemap.xml, /feed.rss,
    // /og.png reaching this middleware means no asset matched.
    expect(shouldBypassRscDevRequest({ url: '/sitemap.xml' })).toBe(false);
    expect(shouldBypassRscDevRequest({ url: '/feed.rss' })).toBe(false);
    expect(shouldBypassRscDevRequest({ url: '/og.png' })).toBe(false);
  });

  it('routes unmatched compiled-asset-shaped paths to the RSC handler', () => {
    // Real compiled assets are served by Rsbuild's assetsMiddleware before
    // this middleware runs; anything arriving here gets RSC 404 semantics.
    expect(shouldBypassRscDevRequest({ url: '/static/js/index.js' })).toBe(
      false
    );
  });

  it('bypasses Rsbuild internal endpoints', () => {
    expect(shouldBypassRscDevRequest({ url: '/__rsbuild_hmr' })).toBe(true);
    expect(shouldBypassRscDevRequest({ url: '/__rsbuild_ping?token=1' })).toBe(
      true
    );
  });

  it('routes .rsc and .manifest payload requests to the RSC handler', () => {
    expect(shouldBypassRscDevRequest({ url: '/about.rsc' })).toBe(false);
    expect(shouldBypassRscDevRequest({ url: '/__manifest.manifest' })).toBe(
      false
    );
    expect(shouldBypassRscDevRequest({ url: '/route.data' })).toBe(false);
  });

  it('routes any HTTP method to the RSC handler', () => {
    // Method is intentionally ignored: DELETE/PUT/PATCH resource routes must
    // reach the RSC server so it can produce proper 404/405 semantics.
    expect(shouldBypassRscDevRequest({ url: '/resource' })).toBe(false);
  });

  it('bypasses requests without a url', () => {
    expect(shouldBypassRscDevRequest({})).toBe(true);
  });
});

describe('createReactRouterRscDevServerSetup', () => {
  const createFakeServer = () => {
    const middlewares: ConnectMiddleware[] = [];
    const handled: Array<{ method: string; pathname: string }> = [];
    const server = {
      middlewares: {
        use: (middleware: ConnectMiddleware) => {
          middlewares.push(middleware);
        },
      },
      environments: {
        node: {
          loadBundle: async () => ({
            default: {
              fetch: async (request: Request) => {
                const { pathname } = new URL(request.url);
                handled.push({ method: request.method, pathname });
                return new Response(`rsc:${request.method}:${pathname}`, {
                  status: 200,
                });
              },
            },
          }),
        },
      },
    };
    return { server, middlewares, handled };
  };

  it('defers middleware registration until after built-in middlewares', () => {
    const { server, middlewares } = createFakeServer();
    const setup = createReactRouterRscDevServerSetup({
      entryName: 'index',
      pluginName: 'test-plugin',
    });

    const postSetup = (setup as (context: unknown) => unknown)({ server });

    // Nothing may be registered synchronously: setup-time middlewares run
    // BEFORE Rsbuild's static asset middlewares and would shadow them.
    expect(middlewares).toHaveLength(0);
    expect(typeof postSetup).toBe('function');

    (postSetup as () => void)();
    expect(middlewares).toHaveLength(1);
  });

  it('handles fallthrough requests of any method and bypasses internals', async () => {
    const { server, middlewares, handled } = createFakeServer();
    const setup = createReactRouterRscDevServerSetup({
      entryName: 'index',
      pluginName: 'test-plugin',
    });
    const postSetup = (setup as (context: unknown) => unknown)({ server });
    (postSetup as () => void)();
    const middleware = middlewares[0];

    const httpServer = createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 404;
        res.end('static-404');
      });
    });
    await new Promise<void>(resolve =>
      httpServer.listen(0, '127.0.0.1', resolve)
    );
    const { port } = httpServer.address() as AddressInfo;
    const origin = `http://127.0.0.1:${port}`;

    try {
      const getRoot = await fetch(`${origin}/`);
      expect(getRoot.status).toBe(200);
      expect(await getRoot.text()).toBe('rsc:GET:/');

      const resourceRoute = await fetch(`${origin}/sitemap.xml`);
      expect(resourceRoute.status).toBe(200);
      expect(await resourceRoute.text()).toBe('rsc:GET:/sitemap.xml');

      const deleteRoute = await fetch(`${origin}/items/1`, {
        method: 'DELETE',
      });
      expect(deleteRoute.status).toBe(200);
      expect(await deleteRoute.text()).toBe('rsc:DELETE:/items/1');

      const internal = await fetch(`${origin}/__rsbuild_hmr`);
      expect(internal.status).toBe(404);
      expect(await internal.text()).toBe('static-404');

      expect(handled).toEqual([
        { method: 'GET', pathname: '/' },
        { method: 'GET', pathname: '/sitemap.xml' },
        { method: 'DELETE', pathname: '/items/1' },
      ]);
    } finally {
      await new Promise<void>((resolve, reject) =>
        httpServer.close(err => (err ? reject(err) : resolve()))
      );
    }
  });
});
