import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Rspack } from '@rsbuild/core';
import type { RouteModuleTransformLoaderOptions } from './route-module-transform-loader.js';
import type { PluginOptions, Route } from './types.js';

const routeModuleTransformLoaderPath = fileURLToPath(
  new URL('./route-module-transform-loader.js', import.meta.url)
);

export const shouldUseApiRouteModuleTransforms = (): boolean =>
  existsSync(
    fileURLToPath(
      new URL('./route-module-transform-loader.ts', import.meta.url)
    )
  ) || process.env.RSTEST === 'true';

const getRouteModuleTransformParallel = (
  parallelRouteTransform: PluginOptions['parallelRouteTransform']
): Rspack.RuleSetLoaderWithOptions['parallel'] => {
  if (parallelRouteTransform === true) {
    return true;
  }
  if (typeof parallelRouteTransform === 'number') {
    if (
      !Number.isInteger(parallelRouteTransform) ||
      parallelRouteTransform < 1
    ) {
      throw new Error(
        '[react-router] parallelRouteTransform must be true, false, or a positive integer.'
      );
    }
    return { maxWorkers: parallelRouteTransform };
  }
  return undefined;
};

const createRouteModuleTransformUse = (
  options: RouteModuleTransformLoaderOptions,
  parallelRouteTransform: PluginOptions['parallelRouteTransform']
): Rspack.RuleSetLoaderWithOptions => {
  const parallel = getRouteModuleTransformParallel(parallelRouteTransform);
  return {
    loader: routeModuleTransformLoaderPath,
    options,
    ...(parallel ? { parallel } : {}),
  };
};

export const registerRouteModuleTransformRules = (
  rspackConfig: Rspack.Configuration,
  {
    environmentName,
    ssr,
    isBuild,
    isSpaMode,
    rootRoutePath,
    logPerformance,
    routeByFilePath,
    parallelRouteTransform,
  }: {
    environmentName: string;
    ssr: boolean;
    isBuild: boolean;
    isSpaMode: boolean;
    rootRoutePath: string | null;
    logPerformance: boolean;
    routeByFilePath: Map<string, Route>;
    parallelRouteTransform: PluginOptions['parallelRouteTransform'];
  }
): void => {
  const routeModuleTransformUse = createRouteModuleTransformUse(
    {
      environmentName,
      logPerformance,
      ssr,
      isBuild,
      isSpaMode,
      rootRoutePath,
    },
    parallelRouteTransform
  );

  rspackConfig.module ??= {};
  rspackConfig.module.rules ??= [];
  rspackConfig.module.rules.push(
    {
      resourceQuery: /\?react-router-route/,
      enforce: 'post',
      use: [routeModuleTransformUse],
    },
    {
      test: path => routeByFilePath.has(path),
      resourceQuery: {
        not: /__react-router-build-client-route|react-router-route|route-chunk=/,
      },
      enforce: 'post',
      use: [routeModuleTransformUse],
    }
  );
};
