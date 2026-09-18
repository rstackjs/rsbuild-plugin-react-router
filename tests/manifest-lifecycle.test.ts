import { createStubRsbuild } from '@scripts/test-helper';
import type { Rspack } from '@rsbuild/core';
import { beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { pluginReactRouter } from '../src';
import { registerBuildOutputTransforms } from '../src/build-output-transforms';
import type { ReactRouterManifestForDev } from '../src/manifest';
import { registerModifyBrowserManifestAssets } from '../src/modify-browser-manifest';
import { runReactRouterPrerenderBuild } from '../src/prerender-build';

rstest.mock('../src/build-output-transforms', () => ({
  registerBuildOutputTransforms: rstest.fn(),
}));
rstest.mock('../src/modify-browser-manifest', () => ({
  registerModifyBrowserManifestAssets: rstest.fn(),
}));
rstest.mock('../src/prerender-build', () => ({
  runReactRouterPrerenderBuild: rstest.fn(async () => undefined),
}));

beforeEach(() => {
  rstest.mocked(registerBuildOutputTransforms).mockClear();
  rstest.mocked(registerModifyBrowserManifestAssets).mockClear();
  rstest.mocked(runReactRouterPrerenderBuild).mockClear();
});

const createManifest = (version: string): ReactRouterManifestForDev => ({
  version,
  url: `/assets/manifest-${version}.js`,
  entry: { module: `/assets/entry-${version}.js`, imports: [], css: [] },
  routes: {},
});

const createCompilation = (): Rspack.Compilation =>
  ({
    compiler: {},
    namedChunks: new Map(),
    entrypoints: new Map(),
  }) as Rspack.Compilation;

const createHarness = async (action: 'dev' | 'build' = 'build') => {
  const rsbuild = await createStubRsbuild({ action, rsbuildConfig: {} });
  rsbuild.addPlugins([pluginReactRouter({ typegen: false })]);
  await rsbuild.unwrapConfig();
  const transforms = rstest.mocked(registerBuildOutputTransforms).mock
    .calls[0][0];
  const onManifest = rstest.mocked(registerModifyBrowserManifestAssets).mock
    .calls[0][6]?.onManifest;
  if (!onManifest) {
    throw new Error('Expected a browser manifest callback');
  }

  return {
    read: transforms.getLatestServerManifest,
    stage(compilation: Rspack.Compilation, version: string) {
      onManifest(
        createManifest(version),
        undefined,
        {},
        {
          compilation,
          manifestStats: undefined,
        }
      );
    },
    async start(name: 'web' | 'node') {
      for (const [hook] of rstest.mocked(rsbuild.onBeforeEnvironmentCompile)
        .mock.calls) {
        const handler = typeof hook === 'function' ? hook : hook.handler;
        await handler({ environment: { name } } as never);
      }
    },
    async finish(
      name: 'web' | 'node',
      compilation: Rspack.Compilation,
      hasErrors = false
    ) {
      for (const [hook] of rstest.mocked(rsbuild.onAfterEnvironmentCompile).mock
        .calls) {
        const handler = typeof hook === 'function' ? hook : hook.handler;
        await handler({
          environment: { name },
          stats: { compilation, hasErrors: () => hasErrors },
        } as never);
      }
    },
    async finishBuild(hasErrors: boolean) {
      for (const [hook] of rstest.mocked(rsbuild.onAfterBuild).mock.calls) {
        const handler = typeof hook === 'function' ? hook : hook.handler;
        await handler({
          environments: { web: { name: 'web' }, node: { name: 'node' } },
          stats: { hasErrors: () => hasErrors },
        } as never);
      }
    },
  };
};

describe('manifest publication lifecycle', () => {
  it('publishes only after the matching web compilation succeeds', async () => {
    const harness = await createHarness();
    const compilation = createCompilation();
    await harness.start('web');
    harness.stage(compilation, 'first');

    expect(harness.read()).toBeNull();
    await harness.finish('web', compilation);
    expect(harness.read()?.version).toBe('first');

    await harness.start('node');
    await harness.finish('node', createCompilation());
    expect(harness.read()?.version).toBe('first');
  });

  it('does not reuse a stale manifest after a failed web rebuild', async () => {
    const harness = await createHarness();
    const first = createCompilation();
    harness.stage(first, 'first');
    await harness.finish('web', first);
    expect(harness.read()?.version).toBe('first');

    await harness.start('web');
    expect(harness.read()).toBeNull();
    const failed = createCompilation();
    harness.stage(failed, 'failed');
    await harness.finish('web', failed, true);
    expect(harness.read()).toBeNull();

    await harness.start('web');
    harness.stage(createCompilation(), 'wrong-compilation');
    await harness.finish('web', createCompilation());
    expect(harness.read()).toBeNull();

    await harness.start('web');
    const recovered = createCompilation();
    harness.stage(recovered, 'recovered');
    await harness.finish('web', recovered);
    expect(harness.read()?.version).toBe('recovered');
  });

  it('keeps the last successful development manifest through a failed rebuild', async () => {
    const harness = await createHarness('dev');
    const first = createCompilation();
    harness.stage(first, 'development');
    expect(harness.read()).toBeNull();
    await harness.finish('web', first);
    expect(harness.read()?.version).toBe('development');
    await harness.start('web');
    const failed = createCompilation();
    harness.stage(failed, 'failed');
    await harness.finish('web', failed, true);
    expect(harness.read()?.version).toBe('development');
    const recovered = createCompilation();
    harness.stage(recovered, 'recovered');
    await harness.finish('web', recovered);
    expect(harness.read()?.version).toBe('recovered');
  });

  it('does not prerender or call buildEnd using output from a failed build', async () => {
    const harness = await createHarness();

    await harness.finishBuild(true);
    expect(runReactRouterPrerenderBuild).not.toHaveBeenCalled();

    await harness.finishBuild(false);
    expect(runReactRouterPrerenderBuild).toHaveBeenCalledTimes(1);
  });
});
