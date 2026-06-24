import { describe, expect, it } from '@rstest/core';
import { guardReactRouterLazyCompilation } from '../src/lazy-compilation';

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
    expect(
      guarded?.test?.({
        resource: `${entryClientPath}!lazy-compilation-proxy`,
      })
    ).toBe(false);
    expect(
      guarded?.test?.({
        resource: '/project/app/components/card.tsx',
      })
    ).toBe(true);
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
    expect(
      guarded?.test?.({
        resource: '/project/app/root.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      guarded?.test?.({
        resource: '/project/app/components/card.tsx',
      })
    ).toBe(true);
    expect(
      guarded?.test?.({
        resource: '/project/vendor/react.tsx',
      })
    ).toBe(false);
  });

  it('guards all React Router hydration-critical module shapes', () => {
    const guarded = guardReactRouterLazyCompilation({
      lazyCompilation: {
        entries: true,
        imports: true,
      },
      entryClientPath,
    });

    expect(
      guarded?.test?.({
        request: 'virtual/react-router/browser-manifest',
      })
    ).toBe(false);
    expect(
      guarded?.test?.({
        identifier: () =>
          '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      guarded?.test?.({
        nameForCondition: () =>
          '/project/app/routes/home.tsx?react-router-route',
      })
    ).toBe(false);
  });
});
