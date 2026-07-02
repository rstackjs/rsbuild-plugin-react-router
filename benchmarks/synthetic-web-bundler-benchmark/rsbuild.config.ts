import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import { createBabelPlugins } from './build/babel-options';

const isDevelopment = process.env.NODE_ENV === 'development';
const reactRouterLogPerformance =
  process.env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE === '1' ||
  process.env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE === 'true';

const readBooleanEnv = (name: string, defaultValue: boolean) => {
  const value = process.env[name];
  if (value == null || value === '') {
    return defaultValue;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  throw new Error(`${name} must be true or false.`);
};

const parseParallelRouteTransform = () => {
  const value = process.env.SYNTHETIC_REACT_ROUTER_PARALLEL_ROUTE_TRANSFORM;
  if (value == null || value === '' || value === 'auto') {
    return undefined;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  const workerCount = Number(value);
  if (Number.isInteger(workerCount) && workerCount > 0) {
    return workerCount;
  }
  throw new Error(
    'SYNTHETIC_REACT_ROUTER_PARALLEL_ROUTE_TRANSFORM must be auto, true, false, or a positive integer.'
  );
};

const parseReactCompiler = () => {
  const value = process.env.SYNTHETIC_REACT_COMPILER;
  if (value == null || value === '' || value === 'annotation') {
    return {
      compilationMode: 'annotation' as const,
      target: '19' as const,
    };
  }
  if (value === '1' || value === 'true' || value === 'default') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  throw new Error(
    'SYNTHETIC_REACT_COMPILER must be annotation, default, true, or false.'
  );
};

const reactCompiler = parseReactCompiler();
const babelParallel = readBooleanEnv('SYNTHETIC_BABEL_PARALLEL', true);
const svgrParallel = readBooleanEnv('SYNTHETIC_SVGR_PARALLEL', true);
const tailwindMinify = readBooleanEnv(
  'SYNTHETIC_TAILWIND_MINIFY',
  !isDevelopment
);

export default defineConfig({
  plugins: [
    pluginReactRouter({
      customServer: false,
      logPerformance: reactRouterLogPerformance,
      parallelRouteTransform: parseParallelRouteTransform(),
    }),
    pluginReact({
      reactCompiler,
      splitChunks: false,
    }),
    pluginBabel({
      include: /[/\\]app[/\\].*\.[cm]?[jt]sx?$/,
      parallel: babelParallel,
      babelLoaderOptions(babelOptions) {
        babelOptions.plugins = [
          ...createBabelPlugins(!isDevelopment),
          ...(babelOptions.plugins ?? []),
        ];
      },
    }),
    pluginSvgr({
      parallel: svgrParallel,
      svgrOptions: {
        exportType: 'default',
        svgo: true,
      },
    }),
    pluginTailwindcss({
      optimize: {
        minify: tailwindMinify,
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
});
