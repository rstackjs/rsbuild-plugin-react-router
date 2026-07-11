import type { TransformDescriptor, TransformHandler } from '@rsbuild/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { resolve } from 'pathe';
import { registerBuildOutputTransforms } from '../src/build-output-transforms';

type TransformRegistration = {
  descriptor: TransformDescriptor;
  handler: TransformHandler;
};

const createTransformHarness = () => {
  const transforms: TransformRegistration[] = [];

  return {
    api: {
      processAssets: rstest.fn(),
      transform(descriptor: TransformDescriptor, handler: TransformHandler) {
        transforms.push({ descriptor, handler });
      },
    },
    transforms,
  };
};

const createBaseOptions = (
  transforms: ReturnType<typeof createTransformHarness>
) => {
  const appDirectory = resolve('/project/app');
  const routePath = resolve(appDirectory, 'routes/page.tsx');

  return {
    api: transforms.api as never,
    resolvedServerOutput: 'module' as const,
    performanceProfiler: {
      record: (_environment: string, _label: string, _resource: string, run) =>
        run(),
    },
    getLatestServerManifest: () => null,
    getLatestServerManifestByBundleId: () => undefined,
    routes: {
      page: { id: 'page', file: 'routes/page.tsx', path: 'page' },
    },
    pluginOptions: {},
    getClientStats: () => undefined,
    appDirectory,
    getAssetPrefix: () => '/',
    routeChunkOptions: { isBuild: true },
    routeTransformExecutor: {
      run: rstest.fn(async task => ({ code: `${task.kind}:${task.code}` })),
      close: rstest.fn(async () => undefined),
    },
    routeByFilePath: new Map([[routePath, { id: 'page' }]]),
    routeChunkConfig: {
      splitRouteModules: true,
      appDirectory,
      rootRouteFile: 'root.tsx',
    },
    isBuild: true,
    splitRouteModules: true,
    ssr: true,
    isSpaMode: false,
    rootRoutePath: resolve(appDirectory, 'root.tsx'),
    routePath,
  };
};

const createTransformArgs = (
  routePath: string,
  resourceQuery = '',
  code = 'export async function loader() {}'
) =>
  ({
    code,
    resource: `${routePath}${resourceQuery}`,
    resourcePath: routePath,
    resourceQuery,
    environment: {
      name: 'web',
      config: { output: { sourceMap: false } },
    },
  }) as never;

describe('build output transforms', () => {
  it('registers post-order transforms for explicit, chunked, and queryless route modules', async () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    const routeModuleTransforms = harness.transforms.filter(
      transform => transform.descriptor.order === 'post'
    );
    const explicitRouteTransform = routeModuleTransforms.find(
      transform =>
        transform.descriptor.resourceQuery instanceof RegExp &&
        transform.descriptor.resourceQuery.source.includes('react-router-route')
    );
    const chunkedRouteTransform = routeModuleTransforms.find(
      transform =>
        transform.descriptor.resourceQuery instanceof RegExp &&
        transform.descriptor.resourceQuery.source === 'route-chunk='
    );
    const querylessRouteTransform = routeModuleTransforms.find(
      transform => typeof transform.descriptor.test === 'function'
    );

    expect(routeModuleTransforms).toHaveLength(3);
    expect(explicitRouteTransform?.descriptor).toMatchObject({
      resourceQuery: /\?react-router-route/,
      order: 'post',
    });
    expect(chunkedRouteTransform?.descriptor).toMatchObject({
      resourceQuery: /route-chunk=/,
      order: 'post',
    });
    expect(querylessRouteTransform?.descriptor).toMatchObject({
      order: 'post',
    });
    expect(
      (querylessRouteTransform?.descriptor.test as (path: string) => boolean)(
        options.routePath
      )
    ).toBe(true);

    await explicitRouteTransform?.handler(
      createTransformArgs(options.routePath, '?react-router-route')
    );
    await chunkedRouteTransform?.handler(
      createTransformArgs(options.routePath, '?route-chunk=clientLoader')
    );
    await querylessRouteTransform?.handler(
      createTransformArgs(options.routePath)
    );

    const run = options.routeTransformExecutor.run;
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'routeModule' })
    );
    expect(run).toHaveBeenCalledTimes(3);
  });

  it('reads dev HMR enablement when route transforms run', async () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);
    let devHmrEnabled = false;

    registerBuildOutputTransforms({
      ...options,
      isBuild: false,
      isDevHmrEnabled: () => devHmrEnabled,
    });

    const routeModuleTransform = harness.transforms.find(
      transform => transform.descriptor.order === 'post'
    );

    await routeModuleTransform!.handler(createTransformArgs(options.routePath));
    devHmrEnabled = true;
    await routeModuleTransform!.handler(createTransformArgs(options.routePath));

    expect(options.routeTransformExecutor.run).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ devHmr: false })
    );
    expect(options.routeTransformExecutor.run).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ devHmr: true })
    );
  });

  it('does not match queryless route-module transforms for internal route requests', () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    const querylessRouteModuleTransform = harness.transforms.find(
      transform =>
        transform.descriptor.order === 'post' &&
        typeof transform.descriptor.test === 'function'
    );

    expect(querylessRouteModuleTransform).toBeDefined();
    const predicate = querylessRouteModuleTransform!.descriptor.test as (
      path: string
    ) => boolean;
    expect(predicate(options.routePath)).toBe(true);
    expect(predicate(resolve(options.appDirectory, 'not-a-route.tsx'))).toBe(
      false
    );

    const resourceQuery = querylessRouteModuleTransform!.descriptor
      .resourceQuery as { not: RegExp };
    expect(resourceQuery.not.test('?__react-router-build-client-route')).toBe(
      true
    );
    expect(resourceQuery.not.test('?react-router-route')).toBe(true);
    expect(resourceQuery.not.test('?route-chunk=clientLoader')).toBe(true);
    expect(resourceQuery.not.test('')).toBe(false);
  });
});
