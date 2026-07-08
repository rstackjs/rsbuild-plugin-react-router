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
  transforms: ReturnType<typeof createTransformHarness>,
  useApiRouteModuleTransforms = false
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
    useApiRouteModuleTransforms,
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
  it('does not register route-module transforms through api.transform', () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    expect(
      harness.transforms.find(
        transform =>
          transform.descriptor.resourceQuery?.toString() ===
          String(/\?react-router-route/)
      )
    ).toBeUndefined();
    expect(
      harness.transforms.find(transform => transform.descriptor.order === 'post')
    ).toBeUndefined();
    expect(options.routeTransformExecutor.run).not.toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'routeModule' })
    );
  });

  it('registers route-module transforms through api.transform in source mode', async () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness, true);

    registerBuildOutputTransforms(options);

    const routeModuleTransforms = harness.transforms.filter(
      transform => transform.descriptor.order === 'post'
    );

    expect(routeModuleTransforms).toHaveLength(2);
    expect(routeModuleTransforms[0].descriptor).toMatchObject({
      resourceQuery: /\?react-router-route/,
      order: 'post',
    });
    expect(routeModuleTransforms[1].descriptor).toMatchObject({
      order: 'post',
    });

    await routeModuleTransforms[0].handler(
      createTransformArgs(options.routePath, '?react-router-route')
    );
    await routeModuleTransforms[1].handler(
      createTransformArgs(options.routePath)
    );

    expect(options.routeTransformExecutor.run).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'routeModule' })
    );
    expect(options.routeTransformExecutor.run).toHaveBeenCalledTimes(2);
  });

  it('does not match split-export transforms for internal route requests', () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    const splitExportsTransform = harness.transforms.find(
      transform =>
        transform.descriptor.environments?.includes('web') &&
        typeof transform.descriptor.test === 'function'
    );

    expect(splitExportsTransform).toBeDefined();
    const predicate = splitExportsTransform!.descriptor.test as (
      path: string
    ) => boolean;
    expect(predicate(options.routePath)).toBe(true);
    expect(predicate(resolve(options.appDirectory, 'not-a-route.tsx'))).toBe(
      false
    );

    const resourceQuery = splitExportsTransform!.descriptor.resourceQuery as {
      not: RegExp;
    };
    expect(resourceQuery.not.test('?__react-router-build-client-route')).toBe(
      true
    );
    expect(resourceQuery.not.test('?react-router-route')).toBe(true);
    expect(resourceQuery.not.test('?route-chunk=clientLoader')).toBe(true);
    expect(resourceQuery.not.test('')).toBe(false);
  });
});
