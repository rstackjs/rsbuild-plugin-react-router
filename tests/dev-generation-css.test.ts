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
  it('commits CSS version changes in web-only builds without reloading or reevaluating loaders', async () => {
    const changed = rstest.fn();
    const ownership = rstest.fn();
    let build = createBuild('loader-v1');
    const { runtime, loadBundle, warnings } = createDevRuntimeHarness(
      () => build,
      { onRouteManifestChanged: changed, onCssAssetOwnershipChanged: ownership }
    );
    let node = createCompilation('node', { files: ['/app/style.css'] });
    for (const [i, token] of ['a', 'b', 'a'].entries()) {
      const web = createCompilation('web');
      runtime.beginAttempt();
      captureWeb(runtime, web, token, {
        entry: [`/entry.css.__react_router_css_${token.repeat(64)}.css`],
        routes: {
          'routes/about': [
            `/route.css.__react_router_css_${token.repeat(64)}.css?theme=x`,
          ],
        },
      });
      expect(
        await runtime.finishAttempt(
          createGraphStats(web, node),
          {
            web: { known: true, files: new Set(['/app/style.css']) },
            node: { known: false, files: new Set() },
          },
          graphIdentity(web, node)
        )
      ).toBe('committed');
      expect((await runtime.load()).marker).toBe('loader-v1');
      expect(changed).toHaveBeenCalledTimes(i);
    }
    expect(loadBundle).toHaveBeenCalledTimes(1);
    expect(ownership).not.toHaveBeenCalled();
    expect(warnings).toEqual([]);
    const web = createCompilation('web');
    node = createCompilation('node');
    build = createBuild('loader-v2');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'c', {
      entry: [`/entry.css.__react_router_css_${'c'.repeat(64)}.css`],
      routes: {
        'routes/about': [
          `/route.css.__react_router_css_${'c'.repeat(64)}.css?theme=x`,
        ],
      },
    });
    expect(
      await runtime.finishAttempt(
        createGraphStats(web, node),
        noKnownChanges,
        graphIdentity(web, node)
      )
    ).toBe('committed');
    expect((await runtime.load()).marker).toBe('loader-v2');
    expect(loadBundle).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledTimes(3);
    expect(ownership).not.toHaveBeenCalled();
  });

  it('does not publish failed CSS/loader generations or replay them to reconnecting clients', async () => {
    const changed = rstest.fn();
    let fail = false;
    const { runtime } = createDevRuntimeHarness(
      () => {
        if (fail) throw new Error('loader evaluation failed');
        return createBuild('good-loader');
      },
      { onRouteManifestChanged: changed }
    );
    for (const token of ['a', 'b']) {
      const web = createCompilation('web');
      const node = createCompilation('node');
      runtime.beginAttempt();
      captureWeb(runtime, web, token, {
        entry: [`/entry.css.__react_router_css_${token.repeat(64)}.css`],
        routes: {
          'routes/about': [
            `/route.css.__react_router_css_${token.repeat(64)}.css`,
          ],
        },
      });
      fail = token === 'b';
      expect(
        await runtime.finishAttempt(
          createGraphStats(web, node),
          noKnownChanges,
          graphIdentity(web, node)
        )
      ).toBe(fail ? 'ignored' : 'committed');
    }
    expect(changed).not.toHaveBeenCalled();
    expect(runtime.getCommittedManifest()?.version).toBe('a');
    expect(runtime.getCommittedManifest()?.entry.css).toEqual([
      `/entry.css.__react_router_css_${'a'.repeat(64)}.css`,
    ]);
    expect((await runtime.load()).marker).toBe('good-loader');
  });
});
