import { describe, expect, it } from '@rstest/core';
import { transformRscRouteModule } from '../src/rsc-route-transforms';
import type { RouteChunkConfig } from '../src/route-chunks';
import type { Route } from '../src/types';

const routeChunkConfig: RouteChunkConfig = {
  splitRouteModules: false,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};
const enforceRouteChunkConfig: RouteChunkConfig = {
  ...routeChunkConfig,
  splitRouteModules: 'enforce',
};
const routeByFilePath = new Map<string, Route>([
  ['/app/routes/client.tsx', { id: 'routes/client', file: 'routes/client.tsx' }],
  ['/app/routes/target.tsx', { id: 'routes/target', file: 'routes/target.tsx' }],
]);

type TransformOverrides = Partial<Parameters<typeof transformRscRouteModule>[0]> &
  Pick<Parameters<typeof transformRscRouteModule>[0], 'code' | 'resourcePath' | 'routeId'>;

const transform = (overrides: TransformOverrides) =>
  transformRscRouteModule({
    isRootRoute: false,
    routeChunkCache: new Map(),
    routeChunkConfig,
    isServerEnvironment: false,
    isDev: false,
    ...overrides,
  });

describe('RSC route transforms', () => {
  it('reexports the default root ErrorBoundary from root server route entries', async () => {
    const result = await transform({
      code: `
        export default function Root() {
          return null;
        }
      `,
      resourcePath: '/app/root.tsx',
      isRootRoute: true,
      routeId: 'root',
      isServerEnvironment: true,
    });

    expect(result.code).toContain(
      'export { ErrorBoundary } from "/app/root.tsx?client-route-module=shared";'
    );
    expect(result.code).not.toContain('UNSAFE_RSCDefaultRootErrorBoundary');
  });

  it('adds the default root ErrorBoundary to root shared client route chunks', async () => {
    const result = await transform({
      code: `
        export default function Root() {
          return null;
        }
      `,
      resourcePath: '/app/root.tsx',
      resourceQuery: '?client-route-module=shared',
      isRootRoute: true,
      routeId: 'root',
      isServerEnvironment: true,
    });

    expect(result.code).toContain(
      'import { createElement as __rr_createElement } from "react";'
    );
    expect(result.code).not.toContain('UNSAFE_RSCDefaultRootErrorBoundary');
    expect(result.code).toContain('export function ErrorBoundary()');
    expect(result.code).toContain('"Unexpected Server Error"');
  });

  it('renders non-Error route rejections in the dev root ErrorBoundary', async () => {
    // A react-router ErrorResponse (a plain object, no `.stack`) previously
    // collapsed to "[object Object]" via String(error). The dev boundary must
    // pretty-print such objects so the real payload is visible.
    const result = await transform({
      code: `
        export default function Root() {
          return null;
        }
      `,
      resourcePath: '/app/root.tsx',
      resourceQuery: '?client-route-module=shared',
      isRootRoute: true,
      routeId: 'root',
      isServerEnvironment: true,
      isDev: true,
    });

    expect(result.code).toContain('export function ErrorBoundary()');
    expect(result.code).toContain('function __rr_formatRouteError(error)');
    // Errors keep their (source-mapped) stack.
    expect(result.code).toContain('if (error && error.stack) return String(error.stack)');
    // Non-Error objects fall back to a JSON dump instead of "[object Object]".
    expect(result.code).toContain('JSON.stringify(error, null, 2)');

    // Behavioral check: exercise the emitted formatter against an
    // ErrorResponse-shaped object and a real Error.
    const fnMatch = result.code.match(
      /function __rr_formatRouteError[\s\S]*?\n\}\n/
    );
    expect(fnMatch).not.toBeNull();
    const format = new Function(
      'error',
      `${fnMatch![0]}\nreturn __rr_formatRouteError(error);`
    ) as (error: unknown) => string;

    const errorResponse = {
      status: 404,
      statusText: 'Not Found',
      data: 'Error: No route matches URL',
      internal: true,
    };
    const formatted = format(errorResponse);
    expect(formatted).not.toBe('[object Object]');
    expect(formatted).toContain('"status": 404');

    const realError = new Error('boom');
    expect(format(realError)).toContain('Error: boom');
  });

  it('targets client route chunks from the client route module query', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return null;
        }
        export default function Route() {
          return null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=clientLoader',
      routeId: 'routes/client',
    });

    expect(result.code).toContain('export async function clientLoader()');
    expect(result.code).not.toContain('export async function loader()');
    expect(result.code).not.toContain('export default function Route()');
  });

  it('targets RSC client route exports separately from shared exports', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return null;
        }
        export const customExport = true;
        export default function Route() {
          return null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      routeId: 'routes/client',
    });

    expect(result.code).toContain(
      'export const clientLoader = async (...args) => import("/app/routes/client.tsx?client-route-module=clientLoader")'
    );
    expect(result.code).toContain(
      'export { customExport } from "/app/routes/client.tsx?client-route-module=shared";'
    );
    expect(result.code).toContain(
      'export { default } from "/app/routes/client.tsx?client-route-module=route";'
    );
    expect(result.code).not.toContain(
      'clientLoader")}).then(mod => mod.clientLoader'
    );
  });

  it('keeps unsplittable RSC client route exports in the shared client module', async () => {
    const result = await transform({
      code: `
        const shared = true;
        export async function clientLoader() {
          return shared;
        }
        export default function Route() {
          return shared ? null : null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      routeId: 'routes/client',
    });

    expect(result.code).toContain(
      'export const clientLoader = async (...args) => import("/app/routes/client.tsx?client-route-module=route")'
    );
    expect(result.code).toContain(
      'export { default } from "/app/routes/client.tsx?client-route-module=route";'
    );
  });

  it('rejects unsplittable clientMiddleware exports in enforce mode', async () => {
    await expect(
      transform({
        code: `
          const shared = true;
          export const clientMiddleware = [
            async ({ request }, next) => {
              return shared ? next() : undefined;
            },
          ];
          export default function Route() {
            return shared ? null : null;
          }
        `,
        resourcePath: '/app/routes/client.tsx',
        routeId: 'routes/client',
        routeChunkConfig: enforceRouteChunkConfig,
      })
    ).rejects.toThrowError(
      /Error splitting route module: routes\/client[\s\S]*- clientMiddleware[\s\S]*This export[\s\S]*its own chunk[\s\S]*it shares/
    );
  });

  it('refreshes default RSC client route modules when they update', async () => {
    const result = await transform({
      code: 'export default function Route() { return null; }',
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=route',
      routeId: 'routes/client',
      isDev: true,
    });

    expect(result.code).toContain('import.meta.webpackHot.accept(() =>');
    expect(result.code).toContain('const basename = router.basename || "/"');
    expect(result.code).toContain(
      'router.navigate(pathname + location.search + location.hash'
    );
    // A trailing-slash basename (e.g. "/mybase/") consumes the leading slash
    // when stripped, producing a relative `to` that react-router resolves
    // against the current location and doubles into the URL (which route
    // discovery then 404s). Re-assert absolute after stripping.
    expect(result.code).toContain('if (pathname[0] !== "/") pathname = "/" + pathname');
  });

  it('strips side-effect style imports from the data route chunk', async () => {
    // The `?client-route-module=data` chunk carries only route data exports and
    // must keep its client-manifest `cssFiles` empty so the native rspack
    // `RscServerPlugin` never wraps these non-component exports in a
    // CSS-injecting component wrapper. Assert the bare style side-effect import
    // is dropped from the emitted data chunk.
    const result = await transform({
      code: `
        import "./styles.css";
        export const meta = () => [];
        export const links = () => [];
        export default function Route() { return null; }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=data',
      routeId: 'routes/client',
    });

    expect(result.code).not.toContain('.css');
    expect(result.code).toContain('export const meta');
    expect(result.code).toContain('export const links');
  });

  it('groups RSC client route exports in one route client module', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return null;
        }
        export const customExport = true;
        export default function Route() {
          return null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=route',
      routeId: 'routes/client',
    });

    expect(result.code).toContain('export async function clientLoader()');
    expect(result.code).toContain('export default function Route()');
    expect(result.code).not.toContain('export async function loader()');
    expect(result.code).not.toContain('export const customExport = true');
  });

  it('keeps exported shared dependencies in unsplittable route client chunks', async () => {
    const result = await transform({
      code: `
        export const shared = true;
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return shared;
        }
        export default function Route() {
          return shared ? null : null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=route',
      routeId: 'routes/client',
    });

    expect(result.code).toContain('const shared = true;');
    expect(result.code).toContain('export async function clientLoader()');
    expect(result.code).toContain('export default function Route()');
    expect(result.code).not.toContain('export async function loader()');
  });

  it('keeps shared RSC route exports in shared client route chunks', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return null;
        }
        export const customExport = true;
        export default function Route() {
          return null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=shared',
      routeId: 'routes/client',
    });

    expect(result.code).toContain('export const customExport = true;');
    expect(result.code).not.toContain('export async function clientLoader()');
    expect(result.code).not.toContain('export default function Route()');
  });

  it('re-adds a bare vanilla style import to the shared client chunk of a server-first route', async () => {
    const result = await transform({
      code: `
        import * as localStyles from "./styles-vanilla-local.css";
        export function ServerComponent() {
          return localStyles.index;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?client-route-module=shared',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    // The server component (and its value import) is stripped from the client
    // module, so a bare side-effect import is re-added to make the client build
    // extract the scoped stylesheet the server entry's `entryCssFiles` links.
    expect(result.code).toContain('"use client";');
    expect(result.code).toContain('import "./styles-vanilla-local.css";');
    expect(result.code).not.toContain('export function ServerComponent()');
  });

  it('does not re-add the vanilla style import to the data client chunk of a server-first route', async () => {
    const result = await transform({
      code: `
        import * as localStyles from "./styles-vanilla-local.css";
        export function loader() {
          return null;
        }
        export function ServerComponent() {
          return localStyles.index;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?client-route-module=data',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    // The data chunk keeps `cssFiles` empty so RSC never wraps data exports in a
    // CSS-injecting component; the vanilla import must not leak into it.
    expect(result.code).not.toContain('import "./styles-vanilla-local.css";');
  });

  it('does not re-add vanilla style imports to client (non-server-component) route chunks', async () => {
    const result = await transform({
      code: `
        import * as localStyles from "./styles-vanilla-local.css";
        export default function Route() {
          return localStyles.index;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=route',
      routeId: 'routes/client',
      isServerEnvironment: true,
    });

    // A client route's component stays in the client graph, so its vanilla value
    // import extracts normally — no synthetic bare import is added.
    expect(result.code).not.toContain('import "./styles-vanilla-local.css";');
    expect(result.code).toContain('export default function Route()');
  });

  it('rewrites RSC client route module imports to shared client modules', async () => {
    const result = await transform({
      code: `
        import { customExport } from "./target";

        export const handle = customExport;
        export default function Route() {
          return customExport ? null : null;
        }
      `,
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=default',
      routeId: 'routes/client',
      routeByFilePath,
      isServerEnvironment: true,
    });

    expect(result.code).toContain(
      'from \"/app/routes/target.tsx?client-route-module=shared\"'
    );
    expect(result.code).not.toContain('from \"./target\"');
  });

  it('targets server route modules from the server route module query', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
        export async function clientLoader() {
          return null;
        }
        export default function Route() {
          return null;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    expect(result.code).toContain('export async function loader()');
    expect(result.code).not.toContain('export async function clientLoader()');
    expect(result.code).not.toContain('export default function Route()');
  });

  it('marks server-first route modules as server entries so RSC collects their CSS', async () => {
    const result = await transform({
      code: `
        import "./styles.css";
        export function ServerComponent() {
          return null;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    expect(result.code).toContain("'use server-entry';");
    expect(result.code).toContain('import "./styles.css"');
    expect(result.code).toContain('export function ServerComponent()');
  });

  it('re-adds a bare side-effect import for value-imported vanilla styles in server-first route modules', async () => {
    const result = await transform({
      code: `
        import * as localStyles from "./styles-vanilla-local.css";
        export function ServerComponent() {
          return localStyles.index;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    // The value import (used for the scoped class name) survives, and a bare
    // side-effect import of the same file is added so the vanilla CSS side
    // effect is retained in the server graph and recorded in `entryCssFiles`.
    expect(result.code).toContain("'use server-entry';");
    expect(result.code).toContain(
      'import * as localStyles from "./styles-vanilla-local.css"'
    );
    expect(result.code).toContain('import "./styles-vanilla-local.css";');
  });

  it('does not re-add bare imports for CSS Modules or `?url` value imports in server-first route modules', async () => {
    const result = await transform({
      code: `
        import moduleStyles from "./styles.module.css";
        import cssUrl from "./styles.css?url";
        export function ServerComponent() {
          return moduleStyles.index + cssUrl;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    // CSS Modules are handled by the native CSS pipeline and `?url` imports ride
    // the asset-relocation path; neither should gain a synthetic bare import.
    expect(result.code).not.toContain('import "./styles.module.css";');
    expect(result.code).not.toContain('import "./styles.css?url";');
    expect(result.code).not.toContain('import "./styles.css";');
  });

  it('does not mark data-only server route modules as server entries', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return null;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    expect(result.code).not.toContain('use server-entry');
    expect(result.code).toContain('export async function loader()');
  });

  it('streams server-entry CSS links from server-first route entries', async () => {
    const result = await transform({
      code: `
        export function ServerComponent() {
          return null;
        }
      `,
      resourcePath: '/app/routes/server.tsx',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    expect(result.code).toContain(
      'import { ServerComponent as ServerComponentWithoutClientChunk } from "/app/routes/server.tsx?server-route-module="'
    );
    expect(result.code).toContain(
      '...(ServerComponentWithoutClientChunk.entryCssFiles ?? []).map(href =>'
    );
    expect(result.code).toContain(
      'React.createElement("link", { key: href, rel: "stylesheet", href: href, precedence: "default" })'
    );
    expect(result.code).toContain(
      'React.createElement(ServerComponentWithoutClientChunk, props)'
    );
  });

  it('preserves client component initializer side effects in server route modules', async () => {
    const result = await transform({
      code: `
        export async function loader() {
          return globalThis.componentCount;
        }
        export const clientLoader = (() => {
          globalThis.clientLoaderCount = true;
          return async () => null;
        })();
        const Route = (() => {
          globalThis.componentCount = true;
          return () => null;
        })();
        export default Route;
      `,
      resourcePath: '/app/routes/server.tsx',
      resourceQuery: '?server-route-module=',
      routeId: 'routes/server',
      isServerEnvironment: true,
    });

    expect(result.code).toContain('globalThis.componentCount = true');
    expect(result.code).not.toContain('globalThis.clientLoaderCount = true');
    expect(result.code).not.toContain('export default');
  });
});
