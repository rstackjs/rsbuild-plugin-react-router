import { describe, expect, it, rstest } from '@rstest/core';
import { captureWeb, createDevRuntimeHarness } from './dev-generation-fixtures';
import {
  createBuild,
  createCompilation,
  createGraphStats,
  graphIdentity,
  noKnownChanges,
} from './dev-runtime-fixtures';

describe('React Router development runtime CSS ownership', () => {
  it('detects retargeted route css ownership', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime } = createDevRuntimeHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'about-css', {
      routes: { 'routes/about': ['/assets/shared.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );

    const nextWeb = createCompilation('web');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, nextWeb, 'home-css', {
      routes: { 'routes/home': ['/assets/shared.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(nextWeb, nextNode),
      noKnownChanges,
      graphIdentity(nextWeb, nextNode)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();
  });

  it('notifies after a committed web manifest removes route or entry css ownership', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime } = createDevRuntimeHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      entry: ['/assets/entry.css'],
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );
    expect(onCssAssetOwnershipChanged).not.toHaveBeenCalled();

    const removedRouteCssWeb = createCompilation('web');
    const secondNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, removedRouteCssWeb, 'without-route-css', {
      entry: ['/assets/entry.css'],
    });
    await runtime.finishAttempt(
      createGraphStats(removedRouteCssWeb, secondNode),
      noKnownChanges,
      graphIdentity(removedRouteCssWeb, secondNode)
    );
    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();

    const removedEntryCssWeb = createCompilation('web');
    const thirdNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, removedEntryCssWeb, 'without-entry-css');
    await runtime.finishAttempt(
      createGraphStats(removedEntryCssWeb, thirdNode),
      noKnownChanges,
      graphIdentity(removedEntryCssWeb, thirdNode)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledTimes(2);
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'without-entry-css' },
    });
  });

  it('suppresses transient lazy-compilation css ownership changes', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime } = createDevRuntimeHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );

    const lazyWeb = createCompilation('web');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, lazyWeb, 'lazy-without-css');
    await runtime.finishAttempt(
      createGraphStats(lazyWeb, nextNode),
      {
        ...noKnownChanges,
        web: { ...noKnownChanges.web, fileBackedInvalidation: false },
      },
      graphIdentity(lazyWeb, nextNode)
    );

    expect(onCssAssetOwnershipChanged).not.toHaveBeenCalled();
  });
});
