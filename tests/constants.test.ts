import { describe, expect, it } from 'vitest';
import {
  CLIENT_COMPONENT_EXPORTS,
  CLIENT_EXPORTS,
  CLIENT_NON_COMPONENT_EXPORTS,
  CLIENT_ROUTE_EXPORTS,
  SERVER_EXPORTS,
  SERVER_ONLY_ROUTE_EXPORTS,
} from '../src/constants';

describe('constants', () => {
  it('includes upstream server-only route exports', () => {
    expect(SERVER_ONLY_ROUTE_EXPORTS).toEqual([
      'loader',
      'action',
      'middleware',
      'headers',
    ]);
    expect(Object.keys(SERVER_EXPORTS).sort()).toEqual(
      [...SERVER_ONLY_ROUTE_EXPORTS].sort()
    );
  });

  it('splits client route exports into component vs non-component', () => {
    expect(CLIENT_NON_COMPONENT_EXPORTS).toEqual([
      'clientAction',
      'clientLoader',
      'clientMiddleware',
      'handle',
      'meta',
      'links',
      'shouldRevalidate',
    ]);
    expect(CLIENT_COMPONENT_EXPORTS).toEqual([
      'default',
      'ErrorBoundary',
      'HydrateFallback',
      'Layout',
    ]);
    expect(CLIENT_ROUTE_EXPORTS).toEqual([
      ...CLIENT_NON_COMPONENT_EXPORTS,
      ...CLIENT_COMPONENT_EXPORTS,
    ]);
    expect(Object.keys(CLIENT_EXPORTS).sort()).toEqual(
      [...CLIENT_ROUTE_EXPORTS].sort()
    );
  });
});
