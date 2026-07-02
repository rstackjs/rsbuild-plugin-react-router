import { describe, expect, it } from '@rstest/core';
import {
  describeRscRouteExportConflict,
  RSC_CLIENT_COMPONENT_EXPORTS,
  RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS,
  RSC_ROUTE_COMPONENT_EXPORTS,
  RSC_SERVER_COMPONENT_EXPORTS,
} from '../src/rsc-route-exports';

describe('RSC route export policy', () => {
  it('keeps client and server component export pairs in one canonical order', () => {
    expect(RSC_ROUTE_COMPONENT_EXPORTS).toEqual([
      {
        routeProperty: 'Component',
        clientExport: 'default',
        serverExport: 'ServerComponent',
      },
      {
        routeProperty: 'Layout',
        clientExport: 'Layout',
        serverExport: 'ServerLayout',
      },
      {
        routeProperty: 'ErrorBoundary',
        clientExport: 'ErrorBoundary',
        serverExport: 'ServerErrorBoundary',
      },
      {
        routeProperty: 'HydrateFallback',
        clientExport: 'HydrateFallback',
        serverExport: 'ServerHydrateFallback',
      },
    ]);
    expect(RSC_CLIENT_COMPONENT_EXPORTS).toEqual([
      'default',
      'Layout',
      'ErrorBoundary',
      'HydrateFallback',
    ]);
    expect(RSC_SERVER_COMPONENT_EXPORTS).toEqual([
      'ServerComponent',
      'ServerLayout',
      'ServerErrorBoundary',
      'ServerHydrateFallback',
    ]);
    expect(RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS).toEqual([
      ['default', 'ServerComponent'],
      ['Layout', 'ServerLayout'],
      ['ErrorBoundary', 'ServerErrorBoundary'],
      ['HydrateFallback', 'ServerHydrateFallback'],
    ]);
  });

  it('uses the same conflict wording for default and named exports', () => {
    expect(
      describeRscRouteExportConflict('default', 'ServerComponent')
    ).toBe(
      'Module cannot have both a default export and a ServerComponent export'
    );
    expect(describeRscRouteExportConflict('Layout', 'ServerLayout')).toBe(
      'Module cannot have both a Layout export and a ServerLayout export'
    );
  });
});
