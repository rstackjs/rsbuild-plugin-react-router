import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Minify, RsbuildPlugin, RspackChain } from '@rsbuild/core';

export const PLUGIN_REACT_ROUTER_TAILWINDCSS_NAME = 'react-router:tailwindcss';

export type ReactRouterTailwindcssPluginOptions = {
  /**
   * The base directory for Tailwind CSS to scan source files.
   *
   * @default api.context.rootPath
   */
  base?: string;

  /**
   * Enable Tailwind CSS's built-in Lightning CSS optimization.
   *
   * By default, this is enabled in production mode and disabled in development
   * mode. Minification follows Rsbuild's CSS minification config.
   */
  optimize?:
    | boolean
    | {
        minify?: boolean;
      };
};

const getTailwindLoaderPath = (): string =>
  join(
    dirname(fileURLToPath(import.meta.url)),
    import.meta.url.endsWith('.cjs')
      ? 'tailwind-loader.cjs'
      : 'tailwind-loader.js'
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const incrementCssImportLoaders = (
  rule: RspackChain.Rule<unknown>,
  cssUseId: string
): void => {
  if (!rule.uses.has(cssUseId)) {
    return;
  }

  const cssLoader = rule.uses.get(cssUseId);
  const options = cssLoader.get('options');

  if (!isRecord(options)) {
    return;
  }

  cssLoader.options({
    ...options,
    importLoaders:
      typeof options.importLoaders === 'number' ? options.importLoaders + 1 : 1,
  });
};

const isCssMinifyEnabled = (
  minify: Minify | undefined,
  isProd: boolean
): boolean => {
  if (typeof minify === 'boolean' || minify === undefined) {
    return (minify ?? true) && isProd;
  }

  return minify.css !== false && (minify.css === 'always' || isProd);
};

export const pluginReactRouterTailwindcss = (
  options: ReactRouterTailwindcssPluginOptions = {}
): RsbuildPlugin => ({
  name: PLUGIN_REACT_ROUTER_TAILWINDCSS_NAME,

  setup(api) {
    api.modifyBundlerChain(
      (chain, { CHAIN_ID, environment, isProd, target }) => {
        if (!chain.module.rules.has(CHAIN_ID.RULE.CSS)) {
          return;
        }

        const { output } = environment.config;

        let { optimize } = options;
        if (optimize === undefined) {
          if (isProd) {
            optimize = { minify: isCssMinifyEnabled(output.minify, isProd) };
          } else {
            optimize = false;
          }
        }

        const tailwindOptions = {
          base: options.base ?? api.context.rootPath,
          optimize,
        };
        const emitCss = output.emitCss ?? target === 'web';
        const tailwindLoaderPath = getTailwindLoaderPath();

        const addTailwindLoader = (rule: RspackChain.Rule<unknown>): void => {
          incrementCssImportLoaders(rule, CHAIN_ID.USE.CSS);

          rule
            .use('tailwindcss')
            .loader(tailwindLoaderPath)
            .options(tailwindOptions);
        };

        const cssRule = chain.module.rule(CHAIN_ID.RULE.CSS);
        addTailwindLoader(cssRule.oneOf(CHAIN_ID.ONE_OF.CSS_URL));
        if (emitCss) {
          addTailwindLoader(cssRule.oneOf(CHAIN_ID.ONE_OF.CSS_MAIN));
        }
        addTailwindLoader(cssRule.oneOf(CHAIN_ID.ONE_OF.CSS_INLINE));
      }
    );
  },
});
