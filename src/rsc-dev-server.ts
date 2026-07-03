import { createRequestListener } from '@remix-run/node-fetch-server';
import type { RsbuildConfig } from '@rsbuild/core';

type RscDevServer = {
  environments: {
    node: {
      loadBundle<T>(entryName: string): Promise<T>;
    };
  };
};

type RscServerBuild = {
  default?: {
    fetch?: (request: Request) => Promise<Response>;
  };
};

type RscDevServerSetup = NonNullable<
  NonNullable<RsbuildConfig['server']>['setup']
>;

type RscDevServerSetupOptions = {
  entryName: string;
  pluginName: string;
};

const shouldBypassRscDevRequest = (request: {
  method?: string;
  url?: string;
}): boolean => {
  if (!request.url) {
    return true;
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return true;
  }

  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  if (pathname.startsWith('/__rsbuild_')) {
    return true;
  }
  if (pathname.endsWith('.rsc') || pathname.endsWith('.manifest')) {
    return false;
  }
  return pathname !== '/' && /\.[a-z0-9]+$/i.test(pathname);
};

export function createReactRouterRscDevServerSetup({
  entryName,
  pluginName,
}: RscDevServerSetupOptions): RscDevServerSetup {
  return ({ server }) => {
    const devServer = server as unknown as RscDevServer;
    const listener = createRequestListener(async request => {
      const build =
        await devServer.environments.node.loadBundle<RscServerBuild>(entryName);
      const handler = build.default?.fetch;
      if (typeof handler !== 'function') {
        throw new Error(
          `[${pluginName}] RSC server build must default-export an object with a fetch function.`
        );
      }
      return handler(request);
    });

    server.middlewares.use((req, res, next) => {
      if (shouldBypassRscDevRequest(req)) {
        next();
        return;
      }
      Promise.resolve(listener(req, res)).catch(next);
    });
  };
}
