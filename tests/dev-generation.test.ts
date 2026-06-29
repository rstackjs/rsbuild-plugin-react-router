import type { RsbuildDevServer } from '@rsbuild/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { loadReactRouterServerBuild } from '../src';
import {
  createReactRouterDevRuntime,
  type DevGraphChanges,
  registerReactRouterDevRuntime,
  unregisterReactRouterDevRuntime,
} from '../src/dev-generation';
import {
  captureWeb,
  createDevRuntimeHarness as createHarness,
} from './dev-generation-fixtures';
import {
  createBuild,
  createCompilation,
  createGraphStats,
  graphIdentity,
  noKnownChanges,
} from './dev-runtime-fixtures';

describe('React Router development runtime', () => {
  it('publishes css-only removals when the route file overlaps node dependencies', async () => {
    const routePath = '/app/routes/about.tsx';
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime, warnings } = createHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const firstWeb = createCompilation('web');
    const node = createCompilation('node', { files: [routePath] });

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, node),
      noKnownChanges,
      graphIdentity(firstWeb, node)
    );

    const removedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, removedCssWeb, 'without-css', {
      routes: { 'routes/about': [] },
    });
    await runtime.finishAttempt(
      createGraphStats(removedCssWeb, node),
      {
        web: { known: true, files: new Set([routePath]) },
        node: { known: false, files: new Set() },
      },
      graphIdentity(removedCssWeb, node)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();
    expect(warnings).toEqual([]);
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'without-css' },
    });
  });

  it('keeps normal hmr for css-only additions, stable css assets, and node-only compiles', async () => {
    const routePath = '/app/routes/about.tsx';
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime } = createHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node', { files: [routePath] });

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'base');
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );

    const cssOnlyChange: DevGraphChanges = {
      web: { known: true, files: new Set([routePath]) },
      node: { known: false, files: new Set() },
    };

    const addedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, addedCssWeb, 'added-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(addedCssWeb, firstNode),
      cssOnlyChange,
      graphIdentity(addedCssWeb, firstNode)
    );

    const stableCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, stableCssWeb, 'same-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(stableCssWeb, firstNode),
      cssOnlyChange,
      graphIdentity(stableCssWeb, firstNode)
    );

    const nodeOnly = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(stableCssWeb, nodeOnly),
      noKnownChanges,
      graphIdentity(stableCssWeb, nodeOnly)
    );

    expect(onCssAssetOwnershipChanged).not.toHaveBeenCalled();
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'same-css' },
    });
  });

  it('notifies when css ownership is re-added after a removal', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { runtime } = createHarness(() => createBuild('build'), {
      onCssAssetOwnershipChanged,
    });
    const node = createCompilation('node');
    const cssOnlyChange: DevGraphChanges = {
      web: { known: true, files: new Set(['/app/routes/about.tsx']) },
      node: { known: false, files: new Set() },
    };

    const firstWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, node),
      noKnownChanges,
      graphIdentity(firstWeb, node)
    );

    const removedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, removedCssWeb, 'without-css', {
      routes: { 'routes/about': [] },
    });
    await runtime.finishAttempt(
      createGraphStats(removedCssWeb, node),
      cssOnlyChange,
      graphIdentity(removedCssWeb, node)
    );
    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();

    const contentOnlyWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, contentOnlyWeb, 'without-css-content-edit', {
      routes: { 'routes/about': [] },
    });
    await runtime.finishAttempt(
      createGraphStats(contentOnlyWeb, node),
      cssOnlyChange,
      graphIdentity(contentOnlyWeb, node)
    );
    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();

    const readdedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, readdedCssWeb, 'readded-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(readdedCssWeb, node),
      cssOnlyChange,
      graphIdentity(readdedCssWeb, node)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledTimes(2);
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'readded-css' },
    });
  });

  it('publishes css-only web manifest changes when a node result comes from an older web cycle', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { loadBundle, runtime, warnings } = createHarness(
      () => createBuild('build'),
      { onCssAssetOwnershipChanged }
    );
    const node = createCompilation('node');
    const webOnlyCssChange: DevGraphChanges = {
      web: { known: true, files: new Set(['/app/routes/about.tsx']) },
      node: { known: false, files: new Set() },
    };
    const cssOnlyChange: DevGraphChanges = {
      web: { known: true, files: new Set(['/app/routes/about.tsx']) },
      node: { known: true, files: new Set(['/app/routes/about.tsx']) },
    };

    const firstWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, node),
      noKnownChanges,
      graphIdentity(firstWeb, node)
    );

    const removedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, removedCssWeb, 'without-css', {
      routes: { 'routes/about': [] },
    });
    await runtime.finishAttempt(
      createGraphStats(removedCssWeb, node),
      webOnlyCssChange,
      graphIdentity(removedCssWeb, node)
    );
    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'without-css' },
    });

    const readdedCssWeb = createCompilation('web');
    const staleNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, readdedCssWeb, 'readded-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(readdedCssWeb, staleNode),
      cssOnlyChange,
      graphIdentity(readdedCssWeb, staleNode, removedCssWeb)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledTimes(2);
    expect(loadBundle).toHaveBeenCalledOnce();
    expect(warnings).toEqual([]);
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'readded-css' },
    });
  });

  it('publishes re-added css when route imports change with css ownership', async () => {
    const onCssAssetOwnershipChanged = rstest.fn();
    const { loadBundle, runtime, warnings } = createHarness(
      () => createBuild('build'),
      { onCssAssetOwnershipChanged }
    );
    const node = createCompilation('node');
    const cssOnlyChange: DevGraphChanges = {
      web: { known: true, files: new Set(['/app/routes/about.tsx']) },
      node: { known: true, files: new Set(['/app/routes/about.tsx']) },
    };

    const firstWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'with-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
      routeImports: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(firstWeb, node),
      noKnownChanges,
      graphIdentity(firstWeb, node)
    );

    const removedCssWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, removedCssWeb, 'without-css', {
      routes: { 'routes/about': [] },
    });
    await runtime.finishAttempt(
      createGraphStats(removedCssWeb, node),
      cssOnlyChange,
      graphIdentity(removedCssWeb, node, firstWeb)
    );
    expect(onCssAssetOwnershipChanged).toHaveBeenCalledOnce();

    const readdedCssWeb = createCompilation('web');
    const staleNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, readdedCssWeb, 'readded-css', {
      routes: { 'routes/about': ['/assets/about.css'] },
      routeImports: { 'routes/about': ['/assets/about.css'] },
    });
    await runtime.finishAttempt(
      createGraphStats(readdedCssWeb, staleNode),
      cssOnlyChange,
      graphIdentity(readdedCssWeb, staleNode, removedCssWeb)
    );

    expect(onCssAssetOwnershipChanged).toHaveBeenCalledTimes(2);
    expect(loadBundle).toHaveBeenCalledOnce();
    expect(warnings).toEqual([]);
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'readded-css' },
    });
  });

  it('rejects initial waiters on evaluation failure and recovers on a new attempt', async () => {
    let shouldFail = true;
    const { runtime } = createHarness(() => {
      if (shouldFail) {
        throw new Error('top-level evaluation failed');
      }
      return createBuild('recovered');
    });
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');

    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'first');
    const waiting = runtime.load();
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );

    await expect(waiting).rejects.toThrow('top-level evaluation failed');
    await expect(runtime.load()).rejects.toThrow('top-level evaluation failed');

    shouldFail = false;
    const nextWeb = createCompilation('web');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, nextWeb, 'recovered');
    const recovery = runtime.load();
    await runtime.finishAttempt(
      createGraphStats(nextWeb, nextNode),
      noKnownChanges,
      graphIdentity(nextWeb, nextNode)
    );

    await expect(recovery).resolves.toMatchObject({
      assets: { version: 'recovered' },
    });
  });

  it('rejects initial waiters on a fatal compiler failure and recovers', async () => {
    const { loadBundle, runtime } = createHarness(() =>
      createBuild('recovered')
    );
    runtime.beginAttempt();
    const waiting = runtime.load();

    runtime.failAttempt(new Error('fatal compiler failure'));

    await expect(waiting).rejects.toThrow('fatal compiler failure');
    const staleWeb = createCompilation('web');
    const staleNode = createCompilation('node');
    captureWeb(runtime, staleWeb, 'stale');
    await runtime.finishAttempt(
      createGraphStats(staleWeb, staleNode),
      noKnownChanges,
      graphIdentity(staleWeb, staleNode)
    );
    expect(loadBundle).not.toHaveBeenCalled();

    const web = createCompilation('web');
    const node = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'recovered');
    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'recovered' },
    });
  });

  it('rejects objects that are not React Router ServerBuild values', async () => {
    const { runtime } = createHarness(() => ({}));
    const web = createCompilation('web');
    const node = createCompilation('node');

    runtime.beginAttempt();
    captureWeb(runtime, web, 'invalid');
    const waiting = runtime.load();
    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    await expect(waiting).rejects.toThrow('valid React Router ServerBuild');
  });

  it('rejects a near-shaped build without a document request handler', async () => {
    const invalid = {
      ...createBuild('invalid-entry'),
      entry: { module: {} },
    };
    const { runtime } = createHarness(() => invalid);
    const web = createCompilation('web');
    const node = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'invalid-entry');
    const waiting = runtime.load();

    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    await expect(waiting).rejects.toThrow('valid React Router ServerBuild');
  });

  it('keeps serving last-good output when a later compilation or evaluation fails', async () => {
    let build: unknown = createBuild('first');
    const { runtime } = createHarness(() => build);
    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'first');
    await runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );
    const committed = await runtime.load();

    runtime.beginAttempt();
    const failedWeb = createCompilation('web');
    const failedNode = createCompilation('node');
    captureWeb(runtime, failedWeb, 'compile-error');
    await runtime.finishAttempt(
      createGraphStats(failedWeb, failedNode, { node: true }),
      noKnownChanges,
      graphIdentity(failedWeb, failedNode)
    );
    expect(await runtime.load()).toBe(committed);

    build = {};
    runtime.beginAttempt();
    const invalidWeb = createCompilation('web');
    const invalidNode = createCompilation('node');
    captureWeb(runtime, invalidWeb, 'invalid-build');
    await runtime.finishAttempt(
      createGraphStats(invalidWeb, invalidNode),
      noKnownChanges,
      graphIdentity(invalidWeb, invalidNode)
    );
    expect(await runtime.load()).toBe(committed);
  });

  it('ignores stale async failure after supersession', async () => {
    let resolveEvaluation: ((value: unknown) => void) | undefined;
    let rejectEvaluation: ((error: Error) => void) | undefined;
    let nextBuild: unknown = createBuild('first');
    const { errors, runtime } = createHarness(
      () =>
        new Promise((resolve, reject) => {
          resolveEvaluation = resolve;
          rejectEvaluation = reject;
        })
    );

    const firstWeb = createCompilation('web');
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'first');
    const firstFinish = runtime.finishAttempt(
      createGraphStats(firstWeb, firstNode),
      noKnownChanges,
      graphIdentity(firstWeb, firstNode)
    );
    resolveEvaluation?.(nextBuild);
    await firstFinish;
    const committed = await runtime.load();

    const staleWeb = createCompilation('web');
    const staleNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, staleWeb, 'stale');
    const staleFinish = runtime.finishAttempt(
      createGraphStats(staleWeb, staleNode),
      noKnownChanges,
      graphIdentity(staleWeb, staleNode)
    );

    runtime.beginAttempt();
    rejectEvaluation?.(new Error('stale rejection'));
    await staleFinish;

    expect(await runtime.load()).toBe(committed);
    expect(errors).toEqual([]);
  });

  it('ignores stale async success after a newer attempt commits', async () => {
    let staleResolve: ((value: unknown) => void) | undefined;
    let load: () => Promise<unknown> | unknown = () => createBuild('base');
    const { runtime } = createHarness(() => load());
    const baseWeb = createCompilation('web');
    const baseNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, baseWeb, 'base');
    await runtime.finishAttempt(
      createGraphStats(baseWeb, baseNode),
      noKnownChanges,
      graphIdentity(baseWeb, baseNode)
    );

    load = () =>
      new Promise(resolve => {
        staleResolve = resolve;
      });
    const staleWeb = createCompilation('web');
    const staleNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, staleWeb, 'stale');
    const staleFinish = runtime.finishAttempt(
      createGraphStats(staleWeb, staleNode),
      noKnownChanges,
      graphIdentity(staleWeb, staleNode)
    );

    load = () => createBuild('newest');
    const newestWeb = createCompilation('web');
    const newestNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, newestWeb, 'newest');
    await runtime.finishAttempt(
      createGraphStats(newestWeb, newestNode),
      noKnownChanges,
      graphIdentity(newestWeb, newestNode)
    );
    staleResolve?.(createBuild('stale'));
    await staleFinish;

    await expect(runtime.load()).resolves.toMatchObject({
      marker: 'newest',
      assets: { version: 'newest' },
    });
  });

  it('rejects mixed web and node results from overlapping compiler cycles', async () => {
    let build = createBuild('base');
    const { runtime, warnings } = createHarness(() => build);
    const baseWeb = createCompilation('web');
    const baseNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, baseWeb, 'base');
    await runtime.finishAttempt(
      createGraphStats(baseWeb, baseNode),
      noKnownChanges,
      graphIdentity(baseWeb, baseNode)
    );
    const committed = await runtime.load();

    build = createBuild('node-a');
    const webB = createCompilation('web');
    const nodeA = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, webB, 'web-b');
    await runtime.finishAttempt(
      createGraphStats(webB, nodeA),
      noKnownChanges,
      graphIdentity(webB, nodeA, baseWeb)
    );

    expect(await runtime.load()).toBe(committed);
    expect(warnings.at(-1)).toContain('different compiler cycles');

    build = createBuild('coherent-b');
    const nodeB = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(webB, nodeB),
      noKnownChanges,
      graphIdentity(webB, nodeB)
    );
    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'web-b' },
    });
  });

  it('keeps initial readiness pending for a transient mixed result', async () => {
    const { loadBundle, runtime } = createHarness(() => createBuild('web-b'));
    const webA = createCompilation('web');
    const webB = createCompilation('web');
    const nodeA = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, webB, 'web-b');
    const waiting = runtime.load();

    await runtime.finishAttempt(
      createGraphStats(webB, nodeA),
      noKnownChanges,
      graphIdentity(webB, nodeA, webA)
    );
    let published = false;
    void waiting.then(() => {
      published = true;
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(published).toBe(false);
    expect(loadBundle).not.toHaveBeenCalled();

    const nodeB = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(webB, nodeB),
      noKnownChanges,
      graphIdentity(webB, nodeB)
    );

    await expect(waiting).resolves.toMatchObject({
      marker: 'web-b',
      assets: { version: 'web-b' },
    });
  });

  it('rejects a node result compiled against an unseen web compilation', async () => {
    let build = createBuild('base');
    const { loadBundle, runtime, warnings } = createHarness(() => build);
    const web = createCompilation('web');
    const baseNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web-a');
    await runtime.finishAttempt(
      createGraphStats(web, baseNode),
      noKnownChanges,
      graphIdentity(web, baseNode)
    );
    const committed = await runtime.load();

    build = createBuild('node-b');
    const nextNode = createCompilation('node');
    const unseenWeb = createCompilation('web');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, nextNode),
      {
        web: { known: false, files: new Set() },
        node: { known: true, files: new Set(['/app/server-only.ts']) },
      },
      graphIdentity(web, nextNode, unseenWeb)
    );

    expect(await runtime.load()).toBe(committed);
    expect(warnings.at(-1)).toContain('different compiler cycles');
    expect(loadBundle).toHaveBeenCalledOnce();
  });

  it('does not let a stale unchanged callback consume the active attempt', async () => {
    let build = createBuild('base');
    const { runtime } = createHarness(() => build);
    const baseWeb = createCompilation('web');
    const baseNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, baseWeb, 'base');
    await runtime.finishAttempt(
      createGraphStats(baseWeb, baseNode),
      noKnownChanges,
      graphIdentity(baseWeb, baseNode)
    );

    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(baseWeb, baseNode),
      noKnownChanges,
      graphIdentity(baseWeb, baseNode)
    );

    build = createBuild('next');
    const nextWeb = createCompilation('web');
    const nextNode = createCompilation('node');
    captureWeb(runtime, nextWeb, 'next');
    await runtime.finishAttempt(
      createGraphStats(nextWeb, nextNode),
      noKnownChanges,
      graphIdentity(nextWeb, nextNode)
    );

    await expect(runtime.load()).resolves.toMatchObject({
      marker: 'next',
      assets: { version: 'next' },
    });
  });

  it('does not publish an intermediate additional compiler pass', async () => {
    let build = createBuild('intermediate');
    const { loadBundle, runtime } = createHarness(() => build);
    const web = createCompilation('web');
    const intermediateNode = createCompilation('node');
    intermediateNode.needAdditionalPass = true;
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web');
    const waiting = runtime.load();

    await runtime.finishAttempt(
      createGraphStats(web, intermediateNode, { node: true }),
      noKnownChanges,
      graphIdentity(web, intermediateNode)
    );
    let published = false;
    void waiting.then(() => {
      published = true;
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(published).toBe(false);
    expect(loadBundle).not.toHaveBeenCalled();

    build = createBuild('final');
    const finalNode = createCompilation('node');
    await runtime.finishAttempt(
      createGraphStats(web, finalNode),
      noKnownChanges,
      graphIdentity(web, finalNode)
    );
    await expect(waiting).resolves.toMatchObject({ marker: 'final' });
  });

  it('commits known server-only changes that do not touch web dependencies', async () => {
    let build = createBuild('first');
    const { runtime } = createHarness(() => build);
    const web = createCompilation('web', {
      files: ['/app/shared.ts'],
      contexts: ['/app/routes'],
      missing: ['/app/generated.ts'],
    });
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web');
    await runtime.finishAttempt(
      createGraphStats(web, firstNode),
      noKnownChanges,
      graphIdentity(web, firstNode)
    );

    build = createBuild('node-2');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, nextNode),
      {
        web: { known: false, files: new Set() },
        node: { known: true, files: new Set(['/app/server-only.ts']) },
      },
      graphIdentity(web, nextNode)
    );

    await expect(runtime.load()).resolves.toMatchObject({
      assets: { version: 'web' },
      marker: 'node-2',
    });
  });

  it('captures web dependencies after manifest generation finishes', async () => {
    let build = createBuild('first');
    const { loadBundle, runtime, warnings } = createHarness(() => build);
    const web = createCompilation('web');
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web');
    web.fileDependencies.add('/app/late.ts');
    await runtime.finishAttempt(
      createGraphStats(web, firstNode),
      noKnownChanges,
      graphIdentity(web, firstNode)
    );
    const committed = await runtime.load();

    build = createBuild('unsafe-node');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, nextNode),
      {
        web: { known: false, files: new Set() },
        node: { known: true, files: new Set(['/app/late.ts']) },
      },
      graphIdentity(web, nextNode)
    );

    expect(await runtime.load()).toBe(committed);
    expect(loadBundle).toHaveBeenCalledOnce();
    expect(warnings).toHaveLength(1);
  });

  it('treats web build dependencies as unsafe node-only changes', async () => {
    let build = createBuild('first');
    const { loadBundle, runtime } = createHarness(() => build);
    const web = createCompilation('web', {
      builds: ['/app/web-loader.config.ts'],
    });
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web');
    await runtime.finishAttempt(
      createGraphStats(web, firstNode),
      noKnownChanges,
      graphIdentity(web, firstNode)
    );
    const committed = await runtime.load();

    build = createBuild('unsafe-node');
    const nextNode = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, nextNode),
      {
        web: { known: false, files: new Set() },
        node: {
          known: true,
          files: new Set(['/app/web-loader.config.ts']),
        },
      },
      graphIdentity(web, nextNode)
    );

    expect(await runtime.load()).toBe(committed);
    expect(loadBundle).toHaveBeenCalledOnce();
  });

  it('treats node build dependencies as unsafe web-only changes', async () => {
    const build = createBuild('first');
    const { runtime } = createHarness(() => build);
    const firstWeb = createCompilation('web');
    const node = createCompilation('node', {
      builds: ['/app/node-loader.config.ts'],
    });
    runtime.beginAttempt();
    captureWeb(runtime, firstWeb, 'web-1');
    await runtime.finishAttempt(
      createGraphStats(firstWeb, node),
      noKnownChanges,
      graphIdentity(firstWeb, node)
    );
    const committed = await runtime.load();

    const nextWeb = createCompilation('web');
    runtime.beginAttempt();
    captureWeb(runtime, nextWeb, 'web-2');
    await runtime.finishAttempt(
      createGraphStats(nextWeb, node),
      {
        web: {
          known: true,
          files: new Set(['/app/node-loader.config.ts']),
        },
        node: { known: false, files: new Set() },
      },
      graphIdentity(nextWeb, node)
    );

    expect(await runtime.load()).toBe(committed);
  });

  it('discards ambiguous or overlapping one-sided rebuilds', async () => {
    let build = createBuild('first');
    const { errors, runtime, warnings } = createHarness(() => build);
    const web = createCompilation('web', { files: ['/app/shared.ts'] });
    const firstNode = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'web');
    await runtime.finishAttempt(
      createGraphStats(web, firstNode),
      noKnownChanges,
      graphIdentity(web, firstNode)
    );
    const committed = await runtime.load();

    build = createBuild('unsafe');
    const unsafeNode = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, unsafeNode),
      {
        web: { known: false, files: new Set() },
        node: { known: true, files: new Set(['/app/shared.ts']) },
      },
      graphIdentity(web, unsafeNode)
    );

    expect(await runtime.load()).toBe(committed);
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('last-good');

    const ambiguousNode = createCompilation('node');
    runtime.beginAttempt();
    await runtime.finishAttempt(
      createGraphStats(web, ambiguousNode),
      {
        web: { known: false, files: new Set() },
        node: { known: true, files: new Set() },
      },
      graphIdentity(web, ambiguousNode)
    );
    expect(await runtime.load()).toBe(committed);
  });

  it('does not let cleanup from an old session unregister a replacement', async () => {
    const server = {
      environments: { node: { loadBundle: () => createBuild('replacement') } },
    } as unknown as RsbuildDevServer;
    const first = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: 'static/js/app',
        entryNames: ['static/js/app'],
      },
      onEvaluationError() {},
    });
    const replacement = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: 'static/js/app',
        entryNames: ['static/js/app'],
      },
      onEvaluationError() {},
    });
    registerReactRouterDevRuntime(server, first);
    registerReactRouterDevRuntime(server, replacement);
    unregisterReactRouterDevRuntime(server, first);
    expect(
      Reflect.get(
        server,
        Symbol.for('rsbuild-plugin-react-router.dev-runtime.v1')
      )
    ).toBe(replacement);

    const web = createCompilation('web');
    const node = createCompilation('node');
    replacement.beginAttempt();
    captureWeb(replacement, web, 'replacement');
    await replacement.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    await expect(loadReactRouterServerBuild(server)).resolves.toMatchObject({
      assets: { version: 'replacement' },
    });
    unregisterReactRouterDevRuntime(server, replacement);
    expect(
      Reflect.get(
        server,
        Symbol.for('rsbuild-plugin-react-router.dev-runtime.v1')
      )
    ).toBeUndefined();
  });

  it('closes pending waiters and ignores late completions', async () => {
    let resolveEvaluation: ((value: unknown) => void) | undefined;
    const { errors, runtime } = createHarness(
      () =>
        new Promise(resolve => {
          resolveEvaluation = resolve;
        })
    );
    const web = createCompilation('web');
    const node = createCompilation('node');
    runtime.beginAttempt();
    captureWeb(runtime, web, 'late');
    const waiting = runtime.load();
    const finishing = runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    runtime.close();
    resolveEvaluation?.(createBuild('late'));
    await finishing;

    await expect(waiting).rejects.toThrow(
      'development server closed before a React Router build was ready'
    );
    expect(errors).toEqual([]);
  });

});
