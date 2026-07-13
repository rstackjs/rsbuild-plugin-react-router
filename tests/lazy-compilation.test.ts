import { describe, expect, it } from '@rstest/core';
import { guardReactRouterLazyCompilation } from '../src/lazy-compilation';

type LazyCompilationTestModule = {
  request?: string;
  rawRequest?: string;
  resource?: string;
  identifier?: () => string;
  nameForCondition?: () => string | null;
};

const getGuardedTest = (
  guarded: ReturnType<typeof guardReactRouterLazyCompilation>
): ((module: LazyCompilationTestModule) => boolean) => {
  if (
    !guarded ||
    typeof guarded === 'boolean' ||
    typeof guarded.test !== 'function'
  ) {
    throw new Error('Expected a guarded lazy compilation test function.');
  }
  return guarded.test;
};

describe('guardReactRouterLazyCompilation', () => {
  const entryClientPath = '/project/app/entry.client.tsx';

  it('leaves disabled and unspecified lazy compilation unchanged', () => {
    expect(
      guardReactRouterLazyCompilation({
        lazyCompilation: undefined,
        entryClientPath,
      })
    ).toBeUndefined();
    expect(
      guardReactRouterLazyCompilation({
        lazyCompilation: false,
        entryClientPath,
      })
    ).toBe(false);
  });

  it('keeps boolean lazy compilation enabled while guarding hydration modules', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: true,
      entryClientPath,
    });

    expect(guarded).toMatchObject({
      entries: true,
      imports: true,
    });
    const test = getGuardedTest(guarded);
    expect(
      test({
        resource: `${entryClientPath}!lazy-compilation-proxy`,
      })
    ).toBe(false);
    expect(test({ resource: '/project/app/components/card.tsx' })).toBe(true);
  });

  it('preserves user tests for non-React Router hydration modules', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: {
        entries: true,
        imports: false,
        test: /app/g,
      },
      entryClientPath,
    });

    expect(guarded).toMatchObject({
      entries: true,
      imports: false,
    });
    const test = getGuardedTest(guarded);
    expect(
      test({
        resource: '/project/app/root.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      test({
        resource: '/project/app/components/card.tsx',
        nameForCondition: () => '/project/app/components/card.tsx',
      })
    ).toBe(true);
    expect(
      test({
        resource: '/project/vendor/react.tsx',
        nameForCondition: () => '/project/vendor/react.tsx',
      })
    ).toBe(false);
  });

  it('applies RegExp user tests to the module condition name', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: {
        entries: true,
        imports: true,
        test: /node_modules/g,
      },
      entryClientPath,
    });
    const test = getGuardedTest(guarded);

    expect(
      test({
        rawRequest: 'node_modules-loader!/project/app/page.tsx',
        resource: '/project/app/page.tsx',
        nameForCondition: () => '/project/app/page.tsx',
      })
    ).toBe(false);
    expect(
      test({
        rawRequest: './react',
        resource: '/project/node_modules/react/index.js',
        nameForCondition: () => '/project/node_modules/react/index.js',
      })
    ).toBe(true);
  });

  it('guards all React Router hydration-critical module shapes', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: {
        entries: true,
        imports: true,
      },
      entryClientPath,
    });
    const test = getGuardedTest(guarded);

    expect(
      test({
        request: 'virtual/react-router/browser-manifest',
      })
    ).toBe(false);
    expect(
      test({
        resource:
          '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      test({
        resource:
          '/project/app/routes/home.tsx?react-router-route',
      })
    ).toBe(false);
  });

  it('allows React Router entry and route modules when prewarming them', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: true,
      entryClientPath,
      prewarmReactRouterModules: true,
    });
    const test = getGuardedTest(guarded);

    expect(
      test({
        request: 'virtual/react-router/browser-manifest',
      })
    ).toBe(false);
    expect(
      test({
        resource: `${entryClientPath}!lazy-compilation-proxy`,
      })
    ).toBe(true);
    expect(
      test({
        resource:
          '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(true);
    expect(
      test({
        resource:
          '/project/app/routes/home.tsx?react-router-route',
      })
    ).toBe(true);
  });

  it('uses a native regexp for full lazy route entries', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: true,
      entryClientPath,
      lazyRouteEntries: true,
      eagerRouteFiles: ['/project/app/root.tsx'],
    });

    expect(guarded).toMatchObject({ entries: true, imports: true });
    expect(guarded && typeof guarded !== 'boolean' && guarded.test).toBeInstanceOf(
      RegExp
    );
    const test = (guarded as { test: RegExp }).test;
    expect(test.test('/project/app/routes/settings.tsx?react-router-route')).toBe(
      true
    );
    expect(test.test('/project/app/root.tsx?react-router-route')).toBe(false);
    expect(test.test(entryClientPath)).toBe(false);
    expect(test.test('/project/app/styles.css')).toBe(false);
  });

  it('keeps all but the hydration route lazy in a 1000-route application', () => {
    const hydrationRoute = '/project/app/routes/route-0.tsx';
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: true,
      entryClientPath,
      lazyRouteEntries: true,
      eagerRouteFiles: [hydrationRoute],
    });
    const test = (guarded as { test: RegExp }).test;
    const routeResources = Array.from(
      { length: 1000 },
      (_, index) =>
        `/project/app/routes/route-${index}.tsx?__react-router-build-client-route`
    );

    expect(routeResources.filter(resource => test.test(resource))).toHaveLength(
      999
    );
    expect(test.test(`${hydrationRoute}?react-router-route`)).toBe(false);
  });

  it('runs user tests for lazy route entries before generated query guards', () => {
    let calls = 0;
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: {
        entries: true,
        imports: true,
        test: module => {
          calls++;
          return module.resource?.includes('/routes/') ?? false;
        },
      },
      entryClientPath,
      lazyRouteEntries: true,
    });
    const test = getGuardedTest(guarded);

    expect(
      test({
        resource:
          '/project/app/routes/settings.tsx?__react-router-build-client-route',
      })
    ).toBe(true);
    expect(calls).toBe(1);
  });

  it('fails closed for unknown module shapes and style resources', () => {
    const test = getGuardedTest(
      guardReactRouterLazyCompilation({
        lazyCompilation: true,
        entryClientPath,
      })
    );

    expect(test({})).toBe(false);
    expect(test({ resource: '/project/app/styles.scss?modules' })).toBe(false);
  });
});
