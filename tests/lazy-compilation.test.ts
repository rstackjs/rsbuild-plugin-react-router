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
        identifier: () =>
          '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      test({
        nameForCondition: () =>
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
        identifier: () =>
          '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(true);
    expect(
      test({
        nameForCondition: () =>
          '/project/app/routes/home.tsx?react-router-route',
      })
    ).toBe(true);
  });
});
