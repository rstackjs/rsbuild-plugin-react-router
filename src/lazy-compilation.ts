import { BUILD_CLIENT_ROUTE_QUERY_STRING } from './constants.js';
import type { PluginOptions } from './types.js';

type LazyCompilationOptions = Exclude<
  NonNullable<PluginOptions['lazyCompilation']>,
  boolean
>;

type LazyCompilationModule = {
  request?: string;
  userRequest?: string;
  rawRequest?: string;
  resource?: string;
  identifier?: () => string;
  nameForCondition?: () => string | null;
};

const normalizeSlashes = (value: string): string => value.replace(/\\/g, '/');

const getLazyCompilationModuleValues = (
  module: LazyCompilationModule
): string[] =>
  [
    module.request,
    module.userRequest,
    module.rawRequest,
    module.resource,
    module.identifier?.(),
    module.nameForCondition?.(),
  ].filter((value): value is string => Boolean(value));

const matchesLazyCompilationTest = (
  test: LazyCompilationOptions['test'] | undefined,
  module: LazyCompilationModule
): boolean => {
  if (!test) {
    return true;
  }
  if (typeof test === 'function') {
    return test(module as Parameters<typeof test>[0]);
  }
  const conditionName = module.nameForCondition?.();
  if (!conditionName) {
    return false;
  }
  test.lastIndex = 0;
  return test.test(conditionName);
};

const createReactRouterHydrationModuleTest = (entryClientPath: string) => {
  const eagerPatterns = [
    'virtual/react-router/browser-manifest',
    ...(entryClientPath
      ? [
          normalizeSlashes(entryClientPath),
          BUILD_CLIENT_ROUTE_QUERY_STRING,
          '?react-router-route',
        ]
      : []),
  ];

  return (module: LazyCompilationModule): boolean =>
    getLazyCompilationModuleValues(module).some(value => {
      const normalizedValue = normalizeSlashes(value);
      return eagerPatterns.some(pattern => normalizedValue.includes(pattern));
    });
};

export const guardReactRouterLazyCompilation = ({
  lazyCompilation,
  entryClientPath,
  prewarmReactRouterModules = false,
}: {
  lazyCompilation: PluginOptions['lazyCompilation'] | undefined;
  entryClientPath: string;
  prewarmReactRouterModules?: boolean;
}): PluginOptions['lazyCompilation'] | undefined => {
  if (lazyCompilation === undefined || lazyCompilation === false) {
    return lazyCompilation;
  }

  const options: LazyCompilationOptions =
    lazyCompilation === true
      ? { entries: true, imports: true }
      : lazyCompilation;
  const userTest = options.test;
  const isReactRouterHydrationModule = prewarmReactRouterModules
    ? createReactRouterHydrationModuleTest('')
    : createReactRouterHydrationModuleTest(entryClientPath);

  return {
    ...options,
    test(module) {
      const lazyModule = module as LazyCompilationModule;
      if (isReactRouterHydrationModule(lazyModule)) {
        return false;
      }
      return matchesLazyCompilationTest(userTest, lazyModule);
    },
  };
};
