import type { Rspack } from '@rsbuild/core';
import {
  BUILD_CLIENT_ROUTE_QUERY_STRING,
  CLIENT_ROUTE_EXPORTS_SET,
} from './constants.js';
import type { PluginOptions, Route } from './types.js';

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
const STYLE_RESOURCE_RE =
  /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:[?#!]|$)/i;
const NATIVE_STYLE_RESOURCE_PATTERN = String.raw`\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:[?#!].*)?$`;
const LAZY_ROUTE_ENTRY_EXECUTION =
  /var __webpack_exports__ = __webpack_exec__\([^)]*!lazy-compilation-proxy/;
const LAZY_ROUTE_EXPORTS_IDENTIFIER = '__reactRouterLazyRouteExports';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNativePathPattern = (value: string): string =>
  escapeRegExp(normalizeSlashes(value)).replaceAll('/', String.raw`[/\\]`);

// Rspack evaluates a RegExp test in Rust, while a function test crosses the
// JS Module binding. Keep the route-entry mode on the native path so full lazy
// compilation does not depend on module methods that are unsafe in 2.1.3.
const createNativeReactRouterLazyCompilationTest = (
  entryClientPath: string,
  eagerRouteFiles: readonly string[]
): RegExp => {
  const eagerResourcePattern = [
    String.raw`virtual[/\\]react-router[/\\]browser-manifest(?:\.[cm]?[jt]sx?)?`,
    ...(entryClientPath ? [toNativePathPattern(entryClientPath)] : []),
    ...eagerRouteFiles.map(toNativePathPattern),
  ].join('|');

  return new RegExp(
    `^(?!.*(?:${eagerResourcePattern})(?:[?#!].*)?$)(?!.*${NATIVE_STYLE_RESOURCE_PATTERN}).+`,
    'i'
  );
};

const getLazyCompilationModuleValues = (
  module: LazyCompilationModule
): string[] =>
  [
    module.request,
    module.userRequest,
    module.rawRequest,
    module.resource,
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
  const conditionName =
    module.resource ??
    module.userRequest ??
    module.request ??
    module.rawRequest;
  if (!conditionName) {
    return false;
  }
  test.lastIndex = 0;
  return test.test(conditionName);
};

const createReactRouterHydrationModuleTest = (
  entryClientPath: string,
  {
    eagerRouteFiles = [],
    lazyRouteEntries = false,
  }: {
    eagerRouteFiles?: readonly string[];
    lazyRouteEntries?: boolean;
  } = {}
) => {
  const normalizedEagerRouteFiles = eagerRouteFiles.map(normalizeSlashes);
  const eagerPatterns = [
    'virtual/react-router/browser-manifest',
    ...(entryClientPath
      ? [
          normalizeSlashes(entryClientPath),
          ...(lazyRouteEntries
            ? []
            : [BUILD_CLIENT_ROUTE_QUERY_STRING, '?react-router-route']),
        ]
      : []),
  ];

  return (moduleValues: readonly string[]): boolean =>
    moduleValues.some(value => {
      const normalizedValue = normalizeSlashes(value);
      if (STYLE_RESOURCE_RE.test(normalizedValue)) {
        return true;
      }
      if (eagerPatterns.some(pattern => normalizedValue.includes(pattern))) {
        return true;
      }
      return normalizedEagerRouteFiles.some(routeFile =>
        normalizedValue.includes(routeFile)
      );
    });
};

export const guardReactRouterLazyCompilation = ({
  lazyCompilation,
  entryClientPath,
  eagerRouteFiles,
  lazyRouteEntries = false,
  prewarmReactRouterModules = false,
}: {
  lazyCompilation: PluginOptions['lazyCompilation'] | undefined;
  entryClientPath: string;
  eagerRouteFiles?: readonly string[];
  lazyRouteEntries?: boolean;
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
  if (
    !prewarmReactRouterModules &&
    lazyRouteEntries &&
    userTest === undefined
  ) {
    return {
      ...options,
      test: createNativeReactRouterLazyCompilationTest(
        entryClientPath,
        eagerRouteFiles ?? []
      ),
    };
  }
  const isReactRouterHydrationModule = prewarmReactRouterModules
    ? createReactRouterHydrationModuleTest('', { eagerRouteFiles })
    : createReactRouterHydrationModuleTest(entryClientPath, {
        eagerRouteFiles,
        lazyRouteEntries,
      });

  return {
    ...options,
    test(module) {
      const lazyModule = module as LazyCompilationModule;
      const moduleValues = getLazyCompilationModuleValues(lazyModule);
      if (
        moduleValues.length === 0 ||
        isReactRouterHydrationModule(moduleValues)
      ) {
        return false;
      }
      return matchesLazyCompilationTest(userTest, lazyModule);
    },
  };
};

export const isLazyRouteEntrySource = (source: string): boolean =>
  LAZY_ROUTE_ENTRY_EXECUTION.test(source);

export const createLazyRouteEntryExportBridge = (
  exportNames: readonly string[]
): string => {
  const clientExportNames = Array.from(
    new Set(
      exportNames.filter(exportName => CLIENT_ROUTE_EXPORTS_SET.has(exportName))
    )
  );
  if (clientExportNames.length === 0) {
    return '';
  }

  const bindings = clientExportNames.map(
    (exportName, index) =>
      `const __reactRouterLazyRouteExport_${index} = ${LAZY_ROUTE_EXPORTS_IDENTIFIER}[${JSON.stringify(
        exportName
      )}];`
  );
  const exports = clientExportNames.map(
    (exportName, index) =>
      `__reactRouterLazyRouteExport_${index} as ${exportName}`
  );

  return [
    `const ${LAZY_ROUTE_EXPORTS_IDENTIFIER} = await __webpack_exports__;`,
    ...bindings,
    `export { ${exports.join(', ')} };`,
  ].join('\n');
};

export const appendLazyRouteEntryExportBridges = ({
  assets,
  compilation,
  moduleExportsByRouteId,
  routes,
  sources,
  stats,
}: {
  assets: Record<string, Rspack.sources.Source>;
  compilation: Rspack.Compilation;
  moduleExportsByRouteId: Readonly<Record<string, readonly string[]>>;
  routes: Record<string, Route>;
  sources: Pick<typeof Rspack.sources, 'ConcatSource'>;
  stats: { assetsByChunkName?: Record<string, string[]> } | undefined;
}): void => {
  for (const [routeId, route] of Object.entries(routes)) {
    const extensionIndex = route.file.lastIndexOf('.');
    if (extensionIndex === -1) {
      continue;
    }
    const entryName = route.file.slice(0, extensionIndex);
    const routeEntryAssets = stats?.assetsByChunkName?.[entryName];
    const routeEntryAssetName = routeEntryAssets?.find(assetName =>
      assetName.endsWith(`${entryName}.js`)
    );
    if (!routeEntryAssetName) {
      if (routeEntryAssets && routeEntryAssets.length > 0) {
        throw new Error(
          `[rsbuild-plugin-react-router] Expected a JavaScript route-entry asset for lazy route \`${routeId}\`.`
        );
      }
      continue;
    }

    const source = assets[routeEntryAssetName];
    if (!source) {
      throw new Error(
        `[rsbuild-plugin-react-router] Could not read lazy route-entry asset \`${routeEntryAssetName}\`.`
      );
    }
    const sourceText = source.source().toString();
    if (!sourceText) {
      throw new Error(
        `[rsbuild-plugin-react-router] Lazy route-entry asset \`${routeEntryAssetName}\` was empty.`
      );
    }
    if (
      !isLazyRouteEntrySource(sourceText) ||
      sourceText.includes(LAZY_ROUTE_EXPORTS_IDENTIFIER)
    ) {
      continue;
    }

    const exportBridge = createLazyRouteEntryExportBridge(
      moduleExportsByRouteId[routeId] ?? []
    );
    if (!exportBridge) {
      continue;
    }
    compilation.updateAsset(
      routeEntryAssetName,
      new sources.ConcatSource(source, '\n', exportBridge, '\n')
    );
  }
};
