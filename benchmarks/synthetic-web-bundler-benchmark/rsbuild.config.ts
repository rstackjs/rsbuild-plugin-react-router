import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { createBabelPlugins } from './build/babel-options';

const reactRouterPluginImport =
  process.env.SYNTHETIC_REACT_ROUTER_PLUGIN_IMPORT ??
  'rsbuild-plugin-react-router';
const { pluginReactRouter } = await import(reactRouterPluginImport);

const isDevelopment = process.env.NODE_ENV === 'development';
const reactRouterLogPerformance =
  process.env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE === '1' ||
  process.env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE === 'true';

export default defineConfig({
  plugins: [
    pluginReactRouter({
      customServer: false,
      logPerformance: reactRouterLogPerformance,
    }),
    pluginReact({
      reactCompiler: {
        compilationMode: 'annotation',
        target: '19',
      },
      splitChunks: false,
    }),
    pluginBabel({
      include: /[/\\]app[/\\].*\.[cm]?[jt]sx?$/,
      babelLoaderOptions(babelOptions) {
        babelOptions.plugins = [
          ...createBabelPlugins(!isDevelopment),
          ...(babelOptions.plugins ?? []),
        ];
      },
    }),
    pluginSvgr({
      svgrOptions: {
        exportType: 'default',
        svgo: true,
      },
    }),
    pluginTailwindcss({
      optimize: {
        minify: !isDevelopment,
      },
    }),
  ],
  source: {
    define: {
      __RESTRICTED__: JSON.stringify(isDevelopment),
    },
  },
  environments: {
    web: {
      output: {
        sourceMap: isDevelopment,
      },
    },
    node: {
      splitChunks: isDevelopment ? false : { chunks: 'all' },
      output: {
        autoExternal: true,
        emitAssets: false,
        emitCss: false,
        minify: !isDevelopment,
        sourceMap: false,
      },
    },
  },
  output: {
    legalComments: 'none',
    minify: !isDevelopment,
  },
  performance: {
    buildCache: false,
  },
});
