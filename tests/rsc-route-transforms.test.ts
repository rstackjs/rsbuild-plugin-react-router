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

  it('notifies the RSC HMR runtime when route client modules update', async () => {
    const result = await transform({
      code: 'export default function Route() { return null; }',
      resourcePath: '/app/routes/client.tsx',
      resourceQuery: '?client-route-module=route',
      routeId: 'routes/client',
      isDev: true,
    });

    expect(result.code).toContain('import.meta.webpackHot.emit("rsc:update")');
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
