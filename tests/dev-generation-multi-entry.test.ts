import type { RsbuildDevServer, Rspack } from '@rsbuild/core';
import { describe, expect, it, rstest } from '@rstest/core';
import type { ServerBuild } from 'react-router';
import {
  createReactRouterDevRuntime,
  type DevGraphChanges,
  type DevGraphIdentity,
} from '../src/dev-generation';

const noKnownChanges: DevGraphChanges = {
  web: { known: false, files: new Set() },
  node: { known: false, files: new Set() },
};

const identityByCompilation = new WeakMap<Rspack.Compilation, symbol>();

const getCompilationIdentity = (compilation: Rspack.Compilation): symbol => {
  const existing = identityByCompilation.get(compilation);
  if (existing) {
    return existing;
  }
  const identity = Symbol();
  identityByCompilation.set(compilation, identity);
  return identity;
};

const graphIdentity = (
  webCompilation: Rspack.Compilation,
  nodeCompilation: Rspack.Compilation
): DevGraphIdentity => ({
  web: getCompilationIdentity(webCompilation),
  node: getCompilationIdentity(nodeCompilation),
  nodeWeb: getCompilationIdentity(webCompilation),
  attempt: undefined,
});

type TestServerBuild = ServerBuild & { marker: string };

const createBuild = (marker: string): TestServerBuild =>
  ({
    entry: { module: { default: () => new Response() } },
    routes: {},
    assets: { routes: {}, version: marker },
    assetsBuildDirectory: '/app/build/client',
    basename: '/',
    future: {},
    isSpaMode: false,
    marker,
    prerender: [],
    publicPath: '/',
    routeDiscovery: { mode: 'initial' },
    ssr: true,
  }) as unknown as TestServerBuild;

const createCompilation = (name: 'web' | 'node') =>
  ({
    name,
    buildDependencies: new Set(),
    fileDependencies: new Set(),
    contextDependencies: new Set(),
    missingDependencies: new Set(),
  }) as unknown as Rspack.Compilation;

const createStats = (compilation: Rspack.Compilation) =>
  ({ compilation, hasErrors: () => false }) as Rspack.Stats;

const createGraphStats = (
  webCompilation: Rspack.Compilation,
  nodeCompilation: Rspack.Compilation
) =>
  ({
    stats: [createStats(webCompilation), createStats(nodeCompilation)],
  }) as Rspack.MultiStats;

describe('React Router multi-entry development generations', () => {
  it('publishes and selects a complete multi-entry generation deterministically', async () => {
    const defaultEntry = 'static/js/react-router-server-build';
    const bundleEntry = 'bundle/nested/index';
    const rawDefault = createBuild('default-raw');
    const rawBundle = createBuild('bundle-raw');
    const loadBundle = rstest.fn((entryName: string) =>
      entryName === defaultEntry ? rawDefault : rawBundle
    );
    const server = {
      environments: { node: { loadBundle } },
    } as unknown as RsbuildDevServer;
    const runtime = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: defaultEntry,
        // Deliberately list the bundle first: default selection must be
        // explicit rather than depend on object insertion order.
        entryNames: [bundleEntry, defaultEntry],
      },
      onEvaluationError() {},
    });
    const web = createCompilation('web');
    const node = createCompilation('node');

    runtime.beginAttempt();
    runtime.captureWeb(web, {
      [defaultEntry]: { routes: {}, version: 'default-web' },
      [bundleEntry]: { routes: {}, version: 'bundle-web' },
    });
    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    await expect(runtime.load()).resolves.toMatchObject({
      marker: 'default-raw',
      assets: { version: 'default-web' },
    });
    await expect(runtime.load(bundleEntry)).resolves.toMatchObject({
      marker: 'bundle-raw',
      assets: { version: 'bundle-web' },
    });
    await expect(runtime.load('missing/entry')).rejects.toThrow(
      'not part of this development server build plan'
    );
    expect(rawDefault.assets).toMatchObject({ version: 'default-raw' });
    expect(rawBundle.assets).toMatchObject({ version: 'bundle-raw' });
  });

  it('keeps every last-good entry while a new multi-entry candidate is incomplete', async () => {
    const defaultEntry = 'static/js/app';
    const bundleEntry = 'bundle/index';
    let generation = 'a';
    let resolveBundle!: (build: ServerBuild) => void;
    const loadBundle = rstest.fn((entryName: string) => {
      if (generation === 'b' && entryName === bundleEntry) {
        return new Promise<ServerBuild>(resolve => {
          resolveBundle = resolve;
        });
      }
      return createBuild(`${entryName}-${generation}`);
    });
    const server = {
      environments: { node: { loadBundle } },
    } as unknown as RsbuildDevServer;
    const runtime = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: defaultEntry,
        entryNames: [defaultEntry, bundleEntry],
      },
      onEvaluationError() {},
    });
    const webA = createCompilation('web');
    const nodeA = createCompilation('node');
    runtime.beginAttempt();
    runtime.captureWeb(webA, {
      [defaultEntry]: { routes: {}, version: 'default-a' },
      [bundleEntry]: { routes: {}, version: 'bundle-a' },
    });
    await runtime.finishAttempt(
      createGraphStats(webA, nodeA),
      noKnownChanges,
      graphIdentity(webA, nodeA)
    );
    const committedDefault = await runtime.load();
    const committedBundle = await runtime.load(bundleEntry);

    generation = 'b';
    const webB = createCompilation('web');
    const nodeB = createCompilation('node');
    runtime.beginAttempt();
    runtime.captureWeb(webB, {
      [defaultEntry]: { routes: {}, version: 'default-b' },
      [bundleEntry]: { routes: {}, version: 'bundle-b' },
    });
    const finishing = runtime.finishAttempt(
      createGraphStats(webB, nodeB),
      noKnownChanges,
      graphIdentity(webB, nodeB)
    );
    await Promise.resolve();

    expect(await runtime.load()).toBe(committedDefault);
    expect(await runtime.load(bundleEntry)).toBe(committedBundle);

    resolveBundle(createBuild(`${bundleEntry}-b`));
    await finishing;
    await expect(runtime.load()).resolves.toMatchObject({
      marker: `${defaultEntry}-b`,
      assets: { version: 'default-b' },
    });
    await expect(runtime.load(bundleEntry)).resolves.toMatchObject({
      marker: `${bundleEntry}-b`,
      assets: { version: 'bundle-b' },
    });
  });

  it('rejects a multi-entry candidate atomically when any entry fails', async () => {
    const defaultEntry = 'static/js/app';
    const bundleEntry = 'bundle/index';
    let generation = 'a';
    const loadBundle = rstest.fn((entryName: string) => {
      if (generation === 'b' && entryName === bundleEntry) {
        throw new Error('bundle evaluation failed');
      }
      return createBuild(`${entryName}-${generation}`);
    });
    const errors: Error[] = [];
    const server = {
      environments: { node: { loadBundle } },
    } as unknown as RsbuildDevServer;
    const runtime = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: defaultEntry,
        entryNames: [defaultEntry, bundleEntry],
      },
      onEvaluationError: error => errors.push(error),
    });
    const webA = createCompilation('web');
    const nodeA = createCompilation('node');
    runtime.beginAttempt();
    runtime.captureWeb(webA, {
      [defaultEntry]: { routes: {}, version: 'default-a' },
      [bundleEntry]: { routes: {}, version: 'bundle-a' },
    });
    await runtime.finishAttempt(
      createGraphStats(webA, nodeA),
      noKnownChanges,
      graphIdentity(webA, nodeA)
    );
    const committedDefault = await runtime.load();
    const committedBundle = await runtime.load(bundleEntry);

    generation = 'b';
    const webB = createCompilation('web');
    const nodeB = createCompilation('node');
    runtime.beginAttempt();
    runtime.captureWeb(webB, {
      [defaultEntry]: { routes: {}, version: 'default-b' },
      [bundleEntry]: { routes: {}, version: 'bundle-b' },
    });
    await runtime.finishAttempt(
      createGraphStats(webB, nodeB),
      noKnownChanges,
      graphIdentity(webB, nodeB)
    );

    expect(await runtime.load()).toBe(committedDefault);
    expect(await runtime.load(bundleEntry)).toBe(committedBundle);
    expect(errors.at(-1)?.message).toContain('bundle evaluation failed');
    expect(committedDefault.assets).toMatchObject({ version: 'default-a' });
    expect(committedBundle.assets).toMatchObject({ version: 'bundle-a' });
  });

  it('rejects an initial generation missing a required entry manifest', async () => {
    const defaultEntry = 'static/js/app';
    const bundleEntry = 'bundle/index';
    const server = {
      environments: {
        node: { loadBundle: () => createBuild('raw') },
      },
    } as unknown as RsbuildDevServer;
    const runtime = createReactRouterDevRuntime({
      server,
      buildPlan: {
        defaultEntryName: defaultEntry,
        entryNames: [defaultEntry, bundleEntry],
      },
      onEvaluationError() {},
    });
    const web = createCompilation('web');
    const node = createCompilation('node');
    runtime.beginAttempt();
    runtime.captureWeb(web, {
      [defaultEntry]: { routes: {}, version: 'default-only' },
    });
    const waiting = runtime.load();

    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    await expect(waiting).rejects.toThrow('has no matching web manifest');
  });
});
