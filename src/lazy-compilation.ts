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
): string[] => {
  const values = [
    module.request,
    module.userRequest,
    module.rawRequest,
    module.resource,
    module.identifier?.(),
    module.nameForCondition?.(),
  ];
  return values.filter((value): value is string => Boolean(value));
};

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

const isReactRouterHydrationModule = (
  module: LazyCompilationModule,
  entryClientPath: string
): boolean => {
  const eagerPatterns = [
    normalizeSlashes(entryClientPath),
    'virtual/react-router/browser-manifest',
    BUILD_CLIENT_ROUTE_QUERY_STRING,
    '?react-router-route',
  ];

  return getLazyCompilationModuleValues(module)
    .map(normalizeSlashes)
    .some(value => eagerPatterns.some(pattern => value.includes(pattern)));
};

export const guardReactRouterLazyCompilation = ({
  lazyCompilation,
  entryClientPath,
}: {
  lazyCompilation: PluginOptions['lazyCompilation'] | undefined;
  entryClientPath: string;
}): PluginOptions['lazyCompilation'] | undefined => {
  if (lazyCompilation === undefined || lazyCompilation === false) {
    return lazyCompilation;
  }

  const options: LazyCompilationOptions =
    lazyCompilation === true
      ? { entries: true, imports: true }
      : lazyCompilation;
  const userTest = options.test;

  return {
    ...options,
    test(module) {
      const lazyModule = module as LazyCompilationModule;
      if (isReactRouterHydrationModule(lazyModule, entryClientPath)) {
        return false;
      }
      return matchesLazyCompilationTest(userTest, lazyModule);
    },
  };
};
