import { createRequestListener } from '@remix-run/node-fetch-server';
import type { RsbuildConfig } from '@rsbuild/core';
import { installDevServerSourceMapSupport } from './dev-source-maps.js';
import { escapeHtml } from './plugin-utils.js';

/**
 * Turns an error thrown by the RSC server build into a source-mapped 500 HTML
 * document. `@remix-run/node-fetch-server`'s request listener catches handler
 * throws internally and, without an `onError`, emits a bare 500 with no body
 * markup. React Router's classic dev path instead returns an ErrorBoundary
 * document whose `<main>` carries the stack, and the integration test asserts
 * on that `<main>`. Reading `error.stack` here triggers the installed
 * `prepareStackTrace`, remapping generated `.js` frames back to the original
 * `.tsx` source.
 */
const renderDevServerError = (error: unknown): Response => {
  const stack =
    error instanceof Error ? (error.stack ?? String(error)) : String(error);
  return new Response(
    `<!doctype html><html><body><main><pre>${escapeHtml(
      stack
    )}</pre></main></body></html>`,
    { status: 500, headers: { 'content-type': 'text/html' } }
  );
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

/**
 * Decides whether a dev-server request should skip the RSC request handler
 * and fall through to the rest of the middleware chain.
 *
 * Only Rsbuild-internal endpoints (`/__rsbuild_*`, e.g. HMR web socket
 * fallbacks) are bypassed. Everything else — any method, any pathname,
 * with or without a file extension — is handled by the RSC server build,
 * matching production where the RSC server handles every request.
 *
 * Static assets need no bypass here: the RSC middleware is registered via
 * the callback returned from `server.setup`, which Rsbuild invokes only
 * after its built-in middlewares (compiled assets, public dir) are
 * registered. A request that reaches this middleware was already declined
 * by static asset serving.
 */
export const shouldBypassRscDevRequest = (request: {
  url?: string;
}): boolean => {
  if (!request.url) {
    return true;
  }
  const { pathname } = new URL(request.url, 'http://localhost');
  return pathname.startsWith('/__rsbuild_');
};

export function createReactRouterRscDevServerSetup({
  entryName,
  pluginName,
}: RscDevServerSetupOptions): RscDevServerSetup {
  return context => {
    // `ServerSetupContext` is a discriminated union on `action`; only the
    // `'dev'` server exposes the typed `environments` API (`loadBundle`), while
    // the `'preview'` server (`RsbuildPreviewServer`) does not. Excluding the
    // preview branch narrows `context` to the dev variant, so `server` is a
    // fully typed `RsbuildDevServer` — no casts, and `loadBundle` is only ever
    // reached on the server that actually provides it.
    if (context.action === 'preview') {
      return;
    }
    const { server } = context;
    // Remap generated `.js` stack frames back to original `.tsx` sources so a
    // loader/render error surfaced below carries source-mapped locations, the
    // same support the classic dev path installs.
    installDevServerSourceMapSupport();
    const listener = createRequestListener(
      async request => {
        const build =
          await server.environments.node.loadBundle<RscServerBuild>(entryName);
        const handler = build.default?.fetch;
        if (typeof handler !== 'function') {
          throw new Error(
            `[${pluginName}] RSC server build must default-export an object with a fetch function.`
          );
        }
        return handler(request);
      },
      { onError: renderDevServerError }
    );

    // Register the RSC middleware in the callback returned from
    // `server.setup`. Rsbuild runs middlewares registered synchronously in
    // `setup` BEFORE its built-ins, but runs returned callbacks AFTER
    // built-in middlewares (compiled assets, public dir) are registered.
    // Registering here makes the RSC handler the fallback for every request
    // that static asset serving did not handle — the same routing semantics
    // as production, where the RSC server handles everything.
    return () => {
      server.middlewares.use((req, res, next) => {
        if (shouldBypassRscDevRequest(req)) {
          next();
          return;
        }
        Promise.resolve(listener(req, res)).catch(next);
      });
    };
  };
}
