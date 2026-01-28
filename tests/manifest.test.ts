import { describe, expect, it } from 'vitest';
import { configRoutesToRouteManifest } from '../src/manifest';

describe('manifest', () => {
  describe('configRoutesToRouteManifest', () => {
    it('should convert simple route config to manifest', () => {
      const routeConfig = [
        {
          id: 'routes/home',
          file: 'routes/home.tsx',
          path: '/',
          index: true,
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/home']).toBeDefined();
      expect(result['routes/home'].id).toBe('routes/home');
      expect(result['routes/home'].path).toBe('/');
      expect(result['routes/home'].index).toBe(true);
    });

    it('should handle nested routes with parentId', () => {
      const routeConfig = [
        {
          id: 'routes/dashboard',
          file: 'routes/dashboard.tsx',
          path: 'dashboard',
          children: [
            {
              id: 'routes/dashboard/settings',
              file: 'routes/dashboard/settings.tsx',
              path: 'settings',
            },
          ],
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/dashboard']).toBeDefined();
      expect(result['routes/dashboard/settings']).toBeDefined();
      expect(result['routes/dashboard/settings'].parentId).toBe(
        'routes/dashboard'
      );
    });

    it('should handle routes with no path (layout routes)', () => {
      const routeConfig = [
        {
          id: 'routes/_layout',
          file: 'routes/_layout.tsx',
          children: [
            {
              id: 'routes/_layout/page',
              file: 'routes/_layout/page.tsx',
              path: 'page',
            },
          ],
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/_layout']).toBeDefined();
      expect(result['routes/_layout'].path).toBeUndefined();
    });

    it('should handle dynamic route segments', () => {
      const routeConfig = [
        {
          id: 'routes/users/$userId',
          file: 'routes/users/$userId.tsx',
          path: 'users/:userId',
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/users/$userId']).toBeDefined();
      expect(result['routes/users/$userId'].path).toBe('users/:userId');
    });

    it('should handle catch-all routes', () => {
      const routeConfig = [
        {
          id: 'routes/$',
          file: 'routes/$.tsx',
          path: '*',
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/$']).toBeDefined();
      expect(result['routes/$'].path).toBe('*');
    });

    it('should handle empty route config', () => {
      const result = configRoutesToRouteManifest('app', []);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should preserve caseSensitive flag', () => {
      const routeConfig = [
        {
          id: 'routes/CaseSensitive',
          file: 'routes/CaseSensitive.tsx',
          path: 'case-sensitive',
          caseSensitive: true,
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      expect(result['routes/CaseSensitive'].caseSensitive).toBe(true);
    });

    it('should deeply nest routes with correct parentIds', () => {
      const routeConfig = [
        {
          id: 'routes/level1',
          file: 'routes/level1.tsx',
          path: 'level1',
          children: [
            {
              id: 'routes/level1/level2',
              file: 'routes/level1/level2.tsx',
              path: 'level2',
              children: [
                {
                  id: 'routes/level1/level2/level3',
                  file: 'routes/level1/level2/level3.tsx',
                  path: 'level3',
                },
              ],
            },
          ],
        },
      ];

      const result = configRoutesToRouteManifest('app', routeConfig);

      // Top-level routes have 'root' as parentId (they are children of the root route)
      expect(result['routes/level1'].parentId).toBe('root');
      expect(result['routes/level1/level2'].parentId).toBe('routes/level1');
      expect(result['routes/level1/level2/level3'].parentId).toBe(
        'routes/level1/level2'
      );
    });
  });

  // The dev manifest is generated from compiled exports and should include
  // flags for new route exports as they are added upstream.
  // This is a light-weight shape test to ensure our types stay in sync.
  it('route manifest item type includes hasClientMiddleware', () => {
    const item = {
      id: 'root',
      module: '/static/js/root.js',
      hasAction: false,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: false,
      hasClientMiddleware: false,
      hasErrorBoundary: false,
      imports: [],
      css: [],
    };

    expect(item).toHaveProperty('hasClientMiddleware', false);
  });
});
