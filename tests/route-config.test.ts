import { describe, expect, it } from '@rstest/core';
import { validateRouteConfig } from '../src/route-config';

describe('route config identity validation', () => {
  it.each(['root.tsx', './root.tsx', 'nested/../root.tsx'])(
    'rejects the reserved root id inferred from %s',
    file => {
      expect(
        validateRouteConfig({
          routeConfigFile: 'routes.ts',
          routeConfig: [{ file }],
        })
      ).toMatchObject({
        valid: false,
        message: expect.stringContaining(
          "A route cannot use the reserved id 'root'."
        ),
      });
    }
  );

  it.each([42, {}, null])('rejects a non-string explicit route id', id => {
    expect(
      validateRouteConfig({
        routeConfigFile: 'routes.ts',
        routeConfig: [{ id, file: 'routes/page.tsx' }],
      })
    ).toMatchObject({
      valid: false,
      message: expect.stringContaining('routes.0.id'),
    });
  });

  it('allows distinct explicit IDs for a shared route file', () => {
    expect(
      validateRouteConfig({
        routeConfigFile: 'routes.ts',
        routeConfig: [
          { id: 'first', file: 'root.tsx' },
          { id: 'second', file: 'root.tsx' },
        ],
      }).valid
    ).toBe(true);
  });
});
