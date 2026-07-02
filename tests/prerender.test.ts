import { describe, expect, it } from '@rstest/core';
import * as Effect from 'effect/Effect';
import {
  createBoundedPrerenderTasksEffect,
  createBuildRequestEffect,
  withBuildRequest,
} from '../src/prerender-build';
import {
  createPrerenderRoutes,
  getPrerenderConcurrency,
  getStaticPrerenderPaths,
  getSsrFalsePrerenderExportErrors,
  normalizePrerenderMatchPath,
  resolvePrerenderPaths,
  validatePrerenderConfig,
} from '../src/prerender';
import { runPluginEffect, tryPluginPromise } from '../src/effect-runtime';
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
    expect(getPrerenderConcurrency({ paths: ['/'], concurrency: 3 })).toBe(3);
    expect(
      getPrerenderConcurrency({
        paths: ['/'],
        concurrency: 4,
        unstable_concurrency: 2,
      })
    ).toBe(4);
    expect(
      getPrerenderConcurrency({ paths: ['/'], unstable_concurrency: 3 })
    ).toBe(3);
    expect(getPrerenderConcurrency({ paths: ['/'] }, 24)).toBe(1);
    expect(getPrerenderConcurrency({ paths: ['/'] }, 3)).toBe(1);
    expect(getPrerenderConcurrency({ paths: ['/'] }, 2)).toBe(1);
  });

  it('creates React Router match routes from a route manifest', () => {
    expect(
      createPrerenderRoutes({
        root: { id: 'root', file: 'root.tsx', path: '' },
        layout: {
          id: 'layout',
          parentId: 'root',
          file: 'routes/layout.tsx',
          path: 'dashboard',
        },
        index: {
          id: 'index',
          parentId: 'layout',
          file: 'routes/index.tsx',
          index: true,
        },
      })
    ).toEqual([
      {
        id: 'root',
        path: '',
        children: [
          {
            id: 'layout',
            path: 'dashboard',
            children: [{ id: 'index', path: undefined, index: true }],
          },
        ],
      },
    ]);
  });

  it('normalizes prerender paths for React Router matching', () => {
    expect(normalizePrerenderMatchPath('/')).toBe('/');
    expect(normalizePrerenderMatchPath('about')).toBe('/about/');
    expect(normalizePrerenderMatchPath('/about')).toBe('/about/');
  });

  it('aborts build request signals after the handler settles', async () => {
    let signal: AbortSignal | undefined;

    const result = await withBuildRequest(
      'http://localhost/about',
      {
        headers: {
          'x-test': 'yes',
        },
      },
      async request => {
        signal = request.signal;
        expect(request.headers.get('x-test')).toBe('yes');
        expect(signal.aborted).toBe(false);
        return 'handled';
      }
    );

    expect(result).toBe('handled');
    expect(signal?.aborted).toBe(true);
  });

  it('aborts effect build request signals after the handler rejects', async () => {
    const failure = new Error('prerender handler failed');
    let signal: AbortSignal | undefined;

    await expect(
      runPluginEffect(
        createBuildRequestEffect('http://localhost/about', undefined, request => {
          signal = request.signal;
          throw failure;
        })
      )
    ).rejects.toBe(failure);

    expect(signal?.aborted).toBe(true);
  });

  it('returns no ssr:false prerender export errors for valid prerendered routes', () => {
    const manifestRoutes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      dashboard: {
        id: 'dashboard',
        parentId: 'root',
        file: 'routes/dashboard.tsx',
        path: 'dashboard',
        hasLoader: true,
        hasClientLoader: true,
      },
    };

    expect(
      getSsrFalsePrerenderExportErrors({
        routes: manifestRoutes,
        manifestRoutes,
        routeExports: {
          dashboard: ['clientLoader'],
        },
        prerenderPaths: ['/dashboard'],
      })
    ).toEqual([]);
  });

  it('rejects ssr:false prerender paths that do not match routes', () => {
    expect(() =>
      getSsrFalsePrerenderExportErrors({
        routes: {
          root: { id: 'root', file: 'root.tsx', path: '' },
        },
        manifestRoutes: {
          root: { id: 'root', file: 'root.tsx', path: '' },
        },
        routeExports: {},
        prerenderPaths: ['/missing'],
      })
    ).toThrow('Unable to prerender path because it does not match any routes');
  });

  it('reports invalid ssr:false prerender action and headers exports', () => {
    const manifestRoutes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      dashboard: {
        id: 'dashboard',
        parentId: 'root',
        file: 'routes/dashboard.tsx',
        path: 'dashboard',
      },
    };

    expect(
      getSsrFalsePrerenderExportErrors({
        routes: manifestRoutes,
        manifestRoutes,
        routeExports: {
          dashboard: ['action', 'headers'],
        },
        prerenderPaths: ['/dashboard'],
      })
    ).toEqual([
      expect.stringContaining(
        '`dashboard` when pre-rendering with `ssr:false`: `headers`, `action`'
      ),
    ]);
  });

  it('reports loader exports on routes outside the ssr:false prerender set', () => {
    const manifestRoutes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      dashboard: {
        id: 'dashboard',
        parentId: 'root',
        file: 'routes/dashboard.tsx',
        path: 'dashboard',
        hasLoader: true,
      },
      reports: {
        id: 'reports',
        parentId: 'dashboard',
        file: 'routes/reports.tsx',
        path: 'reports',
      },
      about: {
        id: 'about',
        parentId: 'root',
        file: 'routes/about.tsx',
        path: 'about',
      },
    };

    expect(
      getSsrFalsePrerenderExportErrors({
        routes: manifestRoutes,
        manifestRoutes,
        routeExports: {
          reports: ['loader'],
        },
        prerenderPaths: ['/about'],
      })
    ).toEqual([
      expect.stringContaining('`reports` when pre-rendering'),
      expect.stringContaining('`dashboard` when pre-rendering'),
    ]);
  });

  it('reports root loaders for unprerendered ssr:false descendants', () => {
    const manifestRoutes = {
      root: {
        id: 'root',
        file: 'root.tsx',
        path: '',
        hasLoader: true,
      },
      dashboard: {
        id: 'dashboard',
        parentId: 'root',
        file: 'routes/dashboard.tsx',
        path: 'dashboard',
      },
      about: {
        id: 'about',
        parentId: 'root',
        file: 'routes/about.tsx',
        path: 'about',
      },
    };

    expect(
      getSsrFalsePrerenderExportErrors({
        routes: manifestRoutes,
        manifestRoutes,
        routeExports: {},
        prerenderPaths: ['/about'],
      })
    ).toEqual([expect.stringContaining('`root` when pre-rendering')]);
  });

  it('validates stable prerender concurrency config', () => {
    expect(validatePrerenderConfig({ paths: ['/'], concurrency: 2 })).toBeNull();
    expect(
      validatePrerenderConfig({
        paths: ['/'],
        concurrency: 2,
        unstable_concurrency: 0,
      })
    ).toBeNull();
    expect(validatePrerenderConfig({ paths: ['/'], concurrency: 0 })).toBe(
      'The `prerender.concurrency` config must be a positive integer if specified.'
    );
    expect(
      validatePrerenderConfig({
        paths: ['/'],
        unstable_concurrency: 0,
      })
    ).toBe(
      'The `prerender.unstable_concurrency` config must be a positive integer if specified.'
    );
  });
});

describe('prerender build scheduler', () => {
  it('runs prerender task effects with a concurrency cap', async () => {
    let active = 0;
    let maxActive = 0;
    const completed: string[] = [];

    await runPluginEffect(
      createBoundedPrerenderTasksEffect(
        ['/slow', '/fast', '/medium'],
        2,
        path =>
          Effect.promise(async () => {
            active += 1;
            maxActive = Math.max(maxActive, active);
            await new Promise(resolve =>
              setTimeout(resolve, path === '/slow' ? 15 : 1)
            );
            completed.push(path);
            active -= 1;
          })
      )
    );

    expect(maxActive).toBeLessThanOrEqual(2);
    expect(completed.sort()).toEqual(['/fast', '/medium', '/slow']);
  });

  it('runs prerender tasks with a concurrency cap', async () => {
    let active = 0;
    let maxActive = 0;
    const completed: string[] = [];

    await runPluginEffect(
      createBoundedPrerenderTasksEffect(['/slow', '/fast', '/medium'], 2, path =>
        tryPluginPromise(async () => {
          active += 1;
          maxActive = Math.max(maxActive, active);
          await new Promise(resolve =>
            setTimeout(resolve, path === '/slow' ? 15 : 1)
          );
          completed.push(path);
          active -= 1;
        })
      )
    );

    expect(maxActive).toBeLessThanOrEqual(2);
    expect(completed.sort()).toEqual(['/fast', '/medium', '/slow']);
  });

  it('rejects without starting later prerender tasks after an early failure', async () => {
    const started: string[] = [];

    await expect(
      runPluginEffect(
        createBoundedPrerenderTasksEffect(['/fail', '/slow', '/later'], 2, path =>
          tryPluginPromise(async () => {
            started.push(path);
            await new Promise(resolve =>
              setTimeout(resolve, path === '/fail' ? 1 : 15)
            );
            if (path === '/fail') {
              throw new Error('prerender failed');
            }
          })
        )
      )
    ).rejects.toThrow('prerender failed');

    expect(started).toEqual(['/fail', '/slow']);
  });
});
