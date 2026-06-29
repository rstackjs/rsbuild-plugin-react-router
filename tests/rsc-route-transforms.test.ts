import { describe, expect, it } from '@rstest/core';
import { transformRscRouteModule } from '../src/rsc-route-transforms';
import type { RouteChunkConfig } from '../src/route-chunks';

const routeChunkConfig: RouteChunkConfig = {
  splitRouteModules: false,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

describe('RSC route transforms', () => {
  it('reexports the default root ErrorBoundary from root server route entries', async () => {
    const result = await transformRscRouteModule({
      code: `
        export default function Root() {
          return null;
        }
      `,
      resourcePath: '/app/root.tsx',
      isRootRoute: true,
      routeId: 'root',
      routeChunkCache: new Map(),
      routeChunkConfig,
      isServerEnvironment: true,
      isDev: false,
    });

    expect(result.code).toContain(
      'export { ErrorBoundary } from "/app/root.tsx?client-route-module=shared";'
    );
    expect(result.code).not.toContain('UNSAFE_RSCDefaultRootErrorBoundary');
  });

  it('adds the default root ErrorBoundary to root shared client route chunks', async () => {
    const result = await transformRscRouteModule({
      code: `
        export default function Root() {
          return null;
        }
      `,
      resourcePath: '/app/root.tsx',
      resourceQuery: '?client-route-module=shared',
      isRootRoute: true,
      routeId: 'root',
      routeChunkCache: new Map(),
      routeChunkConfig,
      isServerEnvironment: true,
      isDev: false,
    });

    expect(result.code).toContain(
      'import { createElement as __rr_createElement } from "react";'
    );
    expect(result.code).not.toContain('UNSAFE_RSCDefaultRootErrorBoundary');
    expect(result.code).toContain('export function ErrorBoundary()');
    expect(result.code).toContain('"Unexpected Server Error"');
  });
});
