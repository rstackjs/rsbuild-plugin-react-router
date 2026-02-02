import { describe, expect, it } from '@rstest/core';
import { getPrerenderConcurrency, getStaticPrerenderPaths, resolvePrerenderPaths } from '../src/prerender';
import type { RouteConfigEntry } from '@react-router/dev/routes';

const routes: RouteConfigEntry[] = [
  {
    id: 'routes/users',
    file: 'routes/users.tsx',
    path: 'users',
    children: [
      {
        id: 'routes/users/$id',
        file: 'routes/users/$id.tsx',
        path: ':id',
        children: [
          {
            id: 'routes/users/$id/settings',
            file: 'routes/users/$id/settings.tsx',
            path: 'settings',
          },
        ],
      },
    ],
  },
  {
    id: 'routes/docs',
    file: 'routes/docs.tsx',
    path: 'docs',
    children: [
      {
        id: 'routes/docs/$',
        file: 'routes/docs/$.tsx',
        path: '*',
      },
    ],
  },
  {
    id: 'routes/about',
    file: 'routes/about.tsx',
    path: 'about',
  },
];

describe('prerender helpers', () => {
  it('skips dynamic ancestors when collecting static paths', () => {
    const { paths, paramRoutes } = getStaticPrerenderPaths(routes);

    expect(paths).toContain('/');
    expect(paths).toContain('/users');
    expect(paths).toContain('/docs');
    expect(paths).toContain('/about');
    expect(paths).not.toContain('/users/:id');
    expect(paths).not.toContain('/users/:id/settings');
    expect(paths).not.toContain('/docs/*');
    expect(paramRoutes).toEqual(
      expect.arrayContaining(['/users/:id', '/users/:id/settings', '/docs/*'])
    );
  });

  it('resolves prerender: true to static paths', async () => {
    let warnCalls = 0;
    const warn = () => {
      warnCalls += 1;
    };
    const paths = await resolvePrerenderPaths(true, false, routes, {
      logWarning: true,
      warn,
    });

    expect(paths).toContain('/about');
    expect(paths).not.toContain('/users/:id');
    expect(warnCalls).toBe(1);
  });

  it('resolves prerender function results', async () => {
    const paths = await resolvePrerenderPaths(
      ({ getStaticPaths }) => getStaticPaths().filter(path => path !== '/docs'),
      true,
      routes
    );

    expect(paths).toContain('/about');
    expect(paths).not.toContain('/docs');
  });

  it('supports prerender concurrency config', () => {
    expect(
      getPrerenderConcurrency({ paths: ['/'], unstable_concurrency: 3 })
    ).toBe(3);
    expect(getPrerenderConcurrency({ paths: ['/'] })).toBe(1);
  });
});
