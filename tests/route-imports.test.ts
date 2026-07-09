import { describe, expect, it } from '@rstest/core';

import { BUILD_CLIENT_ROUTE_QUERY_STRING } from '../src/constants';
import { resolveQuerylessRouteImportRequest } from '../src/route-imports';
import type { Route } from '../src/types';

const routeByFilePath = new Map<string, Route>([
  ['/app/routes/source.tsx', { id: 'routes/source', file: 'routes/source.tsx' }],
  ['/app/routes/target.tsx', { id: 'routes/target', file: 'routes/target.tsx' }],
]);

describe('queryless route imports', () => {
  it('rewrites web route imports to client route build requests', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        context: '/app/routes',
        issuer: '/app/routes/source.tsx',
        request: './target',
        routeByFilePath,
      })
    ).toBe(`/app/routes/target.tsx${BUILD_CLIENT_ROUTE_QUERY_STRING}`);
  });

  it('rewrites RSC client route module imports to shared client modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        context: '/app/routes',
        issuer: '/app/routes/source.tsx?client-route-module=default',
        request: './target',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?client-route-module=shared');
  });

  it('leaves classic node route imports alone', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        context: '/app/routes',
        issuer: '/app/routes/source.tsx?server-route-module=',
        request: './target',
        routeByFilePath,
      })
    ).toBeUndefined();
  });

  it('rewrites RSC web route imports to shared client route modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        context: '/app/routes',
        issuer: '/app/routes/source.tsx',
        rsc: true,
        request: './target',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?client-route-module=shared');
  });

  it('rewrites RSC node route imports to server route modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        context: '/app/routes',
        issuer: '/app/routes/source.tsx?server-route-module=',
        rsc: true,
        request: './target',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?server-route-module=');
  });
});
