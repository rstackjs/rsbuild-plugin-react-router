import type { Rspack } from '@rsbuild/core';

type Warn = (message: string) => void;

type JavascriptParserOptions = {
  dynamicImportMode?: unknown;
};

const getJavascriptParserOptions = (
  rspackConfig: Rspack.Configuration | undefined
): JavascriptParserOptions | undefined => {
  const parser = rspackConfig?.module?.parser as
    | { javascript?: JavascriptParserOptions }
    | undefined;
  return parser?.javascript;
};

export const isEagerDynamicImportMode = (
  rspackConfig: Rspack.Configuration | undefined
): boolean =>
  getJavascriptParserOptions(rspackConfig)?.dynamicImportMode === 'eager';

export const warnOnEagerDynamicImportMode = (
  rspackConfig: Rspack.Configuration | undefined,
  warn: Warn
): boolean => {
  if (!isEagerDynamicImportMode(rspackConfig)) {
    return false;
  }

  warn(
    '[rsbuild-plugin-react-router] Rspack `module.parser.javascript.dynamicImportMode: "eager"` is not supported for the web environment. It turns React Router runtime `import()` calls into eager dependencies, which breaks lazy route discovery, route-module manifests, and split route module chunks. Remove this parser option or scope it away from React Router/client routes.'
  );
  return true;
};
