import type { Rspack } from '@rsbuild/core';

type JavascriptParserOptions = {
  dynamicImportMode?: unknown;
};

type ModuleParserOptions = {
  javascript?: JavascriptParserOptions;
};

const reactRouterRouteModuleResourceQuery =
  /(?:^|[?&])(?:__react-router-build-client-route|react-router-route|route-chunk=)/;
const reactRouterRuntimePackage =
  /[/\\]node_modules[/\\](?:\.pnpm[/\\][^/\\]+[/\\]node_modules[/\\])?(?:react-router|react-router-dom)[/\\]/;

const getDynamicImportMode = (config: unknown): unknown => {
  if (!config || typeof config !== 'object') {
    return undefined;
  }

  const parser = (config as Rspack.Configuration).module?.parser as
    | ModuleParserOptions
    | undefined;
  return parser?.javascript?.dynamicImportMode;
};

const usesEagerDynamicImportMode = (configs: unknown[]): boolean =>
  configs.some(config => getDynamicImportMode(config) === 'eager');

export const getReactRouterDynamicImportRules = (
  ...configs: unknown[]
): Rspack.RuleSetRule[] =>
  usesEagerDynamicImportMode(configs) ? reactRouterDynamicImportRules : [];

const reactRouterDynamicImportRules: Rspack.RuleSetRule[] = [
  {
    resourceQuery: reactRouterRouteModuleResourceQuery,
    parser: {
      dynamicImportMode: 'lazy',
    },
  },
  {
    test: reactRouterRuntimePackage,
    parser: {
      dynamicImportMode: 'lazy',
    },
  },
];
