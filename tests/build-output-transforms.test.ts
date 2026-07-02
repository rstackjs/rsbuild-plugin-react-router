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
  it('registers post-order route-module transforms for explicit and queryless route modules', async () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    const explicitRouteModuleTransform = harness.transforms.find(
      transform =>
        String(transform.descriptor.resourceQuery) ===
        String(/\?react-router-route/)
    );
    const querylessRouteModuleTransform = harness.transforms.find(
      transform =>
        transform.descriptor.order === 'post' &&
        transform.descriptor.environments === undefined &&
        typeof transform.descriptor.test === 'function' &&
        (transform.descriptor.test as (path: string) => boolean)(
          options.routePath
        )
    );

    expect(explicitRouteModuleTransform?.descriptor).toMatchObject({
      resourceQuery: /\?react-router-route/,
      order: 'post',
    });
    expect(querylessRouteModuleTransform?.descriptor).toMatchObject({
      order: 'post',
    });
    expect(
      (
        querylessRouteModuleTransform!.descriptor.test as (
          path: string
        ) => boolean
      )(options.routePath)
    ).toBe(true);

    await explicitRouteModuleTransform!.handler(
      createTransformArgs(options.routePath, '?react-router-route')
    );
    await querylessRouteModuleTransform!.handler(
      createTransformArgs(options.routePath)
    );

    const run = options.routeTransformExecutor.run;
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'routeModule' })
    );
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('captures post-loader route exports for manifest generation', async () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);
    const onRouteModuleAnalysis = rstest.fn();

    registerBuildOutputTransforms({
      ...options,
      onRouteModuleAnalysis,
    });

    const clientRouteTransform = harness.transforms.find(
      transform =>
        String(transform.descriptor.resourceQuery) ===
        String(/__react-router-build-client-route/)
    );
    expect(clientRouteTransform?.descriptor).toMatchObject({
      order: 'post',
    });

    await clientRouteTransform!.handler(
      createTransformArgs(
        options.routePath,
        '?__react-router-build-client-route',
        `
          export const loader = () => null;
          export default function MDXContent() { return null; }
        `
      )
    );

    expect(onRouteModuleAnalysis).toHaveBeenCalledWith(
      options.routePath,
      expect.objectContaining({
        exports: expect.arrayContaining(['loader', 'default']),
      })
    );
  });

  it('does not match queryless route-module transforms for internal route requests', () => {
    const harness = createTransformHarness();
    const options = createBaseOptions(harness);

    registerBuildOutputTransforms(options);

    const querylessRouteModuleTransform = harness.transforms.find(
      transform =>
        transform.descriptor.order === 'post' &&
        transform.descriptor.environments === undefined &&
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
