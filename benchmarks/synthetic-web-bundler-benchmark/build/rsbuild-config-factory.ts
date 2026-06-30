import {
  defineConfig,
  type RsbuildConfig,
  type RsbuildPlugin,
} from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { availableParallelism, cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBabelPlugins, resolveReactCompilerMode } from './babel-options';

const reactRouterPluginImport =
  process.env.SYNTHETIC_REACT_ROUTER_PLUGIN_IMPORT ??
  'rsbuild-plugin-react-router';
const { pluginReactRouter } = await import(reactRouterPluginImport);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isDevelopment = process.env.NODE_ENV === 'development';
const isPersistentCacheEnabled =
  process.env.SYNTHETIC_RSBUILD_PERSISTENT_CACHE === '1';
const reactRouterLogPerformanceEnv =
  process.env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE;
const fastLoaderWorkerThreads = resolveFastLoaderWorkerThreads();

type BuildCacheConfig = NonNullable<
  NonNullable<RsbuildConfig['performance']>['buildCache']
>;

type RsbuildBenchmarkConfigOptions = {
  appBabel?: boolean;
  buildCache?: BuildCacheConfig;
  devBuildCache?: BuildCacheConfig;
  devServerOutput?: 'commonjs' | 'module';
  devSourceMap?: boolean;
  devWriteToDisk?: boolean;
  lightningcss?: boolean;
  parallelBabel?: boolean;
  parallelSvgr?: boolean;
  reactRouterLogPerformance?: boolean;
  nodeTailwind?: boolean;
  svgo?: boolean;
  tailwind?: boolean;
  tailwindOptimize?: boolean | { minify?: boolean };
};

export function createRsbuildConfig(
  options: RsbuildBenchmarkConfigOptions = {}
) {
  const appBabel =
    booleanEnv('SYNTHETIC_RSBUILD_APP_BABEL') ?? options.appBabel ?? true;
  const reactCompilerMode = resolveReactCompilerMode();
  const buildCache =
    booleanEnv('SYNTHETIC_RSBUILD_BUILD_CACHE') ?? options.buildCache ?? false;
  const lightningcss =
    booleanEnv('SYNTHETIC_RSBUILD_LIGHTNINGCSS') ??
    options.lightningcss ??
    true;
  const parallelBabel =
    booleanEnv('SYNTHETIC_RSBUILD_PARALLEL_BABEL') ??
    options.parallelBabel ??
    false;
  const parallelSvgr =
    booleanEnv('SYNTHETIC_RSBUILD_PARALLEL_SVGR') ??
    options.parallelSvgr ??
    false;
  const nodeTailwind =
    booleanEnv('SYNTHETIC_RSBUILD_NODE_TAILWIND') ??
    options.nodeTailwind ??
    true;
  const svgo =
    booleanEnv('SYNTHETIC_RSBUILD_SVGO') ?? options.svgo ?? !isDevelopment;
  const tailwind =
    booleanEnv('SYNTHETIC_RSBUILD_TAILWIND') ?? options.tailwind ?? true;
  const tailwindOptimize =
    booleanEnv('SYNTHETIC_RSBUILD_TAILWIND_OPTIMIZE') ??
    options.tailwindOptimize;
  if (
    (parallelBabel || parallelSvgr) &&
    !process.env.RSPACK_LOADER_WORKER_THREADS
  ) {
    process.env.RSPACK_LOADER_WORKER_THREADS = fastLoaderWorkerThreads;
  }
  const resolvedBuildCache = isPersistentCacheEnabled
    ? createRspackTailwindHmrBuildCache()
    : isDevelopment
      ? (options.devBuildCache ?? false)
      : buildCache;
  const devConfig =
    isDevelopment && options.devWriteToDisk !== undefined
      ? {
          writeToDisk: options.devWriteToDisk,
        }
      : undefined;
  const tools: RsbuildConfig['tools'] = {};

  if (!lightningcss) {
    tools.lightningcssLoader = false;
  }

  if (parallelBabel || parallelSvgr || !nodeTailwind) {
    tools.bundlerChain = (chain, { CHAIN_ID, environment, target }) => {
      const parallelUses: string[] = [];
      if (parallelBabel) {
        parallelUses.push(CHAIN_ID.USE.BABEL);
      }
      if (parallelSvgr) {
        parallelUses.push(CHAIN_ID.USE.SVGR);
      }
      for (const rule of Object.values(chain.module.rules.entries())) {
        enableParallelLoaders(rule, parallelUses);
      }
      if (!nodeTailwind && isNodeBundlerChain({ environment, target })) {
        disableTailwindForNodeCssUrlAndInline(
          chain.module.rule(CHAIN_ID.RULE.CSS),
          [CHAIN_ID.ONE_OF.CSS_URL, CHAIN_ID.ONE_OF.CSS_INLINE],
          CHAIN_ID.USE.CSS
        );
      }
    };
  }

  return defineConfig({
    plugins: [
      pluginReactRouter({
        customServer: false,
        logPerformance:
          options.reactRouterLogPerformance ??
          (reactRouterLogPerformanceEnv === '1' ||
            reactRouterLogPerformanceEnv === 'true'),
        ...(isDevelopment && options.devServerOutput
          ? { serverOutput: options.devServerOutput }
          : {}),
      }),
      pluginReact({
        reactCompiler:
          reactCompilerMode === 'with-react-compiler'
            ? {
                compilationMode: 'annotation',
                target: '19',
              }
            : false,
        splitChunks: false,
      }),
      ...optionalPlugin(!appBabel, pluginSyntheticFastTransforms()),
      ...optionalPlugin(
        appBabel,
        pluginBabel({
          include: /[/\\]app[/\\].*\.[cm]?[jt]sx?$/,
          babelLoaderOptions(babelOptions) {
            babelOptions.plugins = [
              ...createBabelPlugins({
                reactCompilerMode: 'without-react-compiler',
                stripRestricted: !isDevelopment,
              }),
              ...(babelOptions.plugins ?? []),
            ];
          },
        })
      ),
      pluginSvgr({
        svgrOptions: {
          exportType: 'default',
          svgo,
        },
      }),
      ...optionalPlugin(
        tailwind,
        pluginTailwindcss({
          optimize:
            tailwindOptimize === true
              ? { minify: !isDevelopment }
              : tailwindOptimize,
        })
      ),
    ],
    source: {
      define: {
        __RESTRICTED__: JSON.stringify(isDevelopment),
      },
    },
    resolve: {
      alias: {
        '@': path.join(root, 'app'),
      },
    },
    environments: {
      web: {
        output: {
          sourceMap: isDevelopment ? (options.devSourceMap ?? true) : false,
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
    dev: devConfig,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    output: {
      legalComments: 'none',
      minify: !isDevelopment,
    },
    performance: {
      buildCache: resolvedBuildCache,
    },
  });
}

function createRspackTailwindHmrBuildCache(): BuildCacheConfig {
  return {
    cacheDirectory: path.join(
      root,
      'node_modules/.cache/rspack-tailwind-hmr-repro'
    ),
    cacheDigest: ['rspack-tailwind-hmr-repro-v1'],
    buildDependencies: [
      path.join(root, 'package.json'),
      path.join(root, 'pnpm-lock.yaml'),
      path.join(root, 'rsbuild.config.ts'),
    ],
  };
}

function resolveFastLoaderWorkerThreads(): string {
  const availableCores = availableParallelism?.() ?? cpus().length;
  return String(Math.max(1, availableCores - 2));
}

function booleanEnv(name: string): boolean | undefined {
  const value = process.env[name];
  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  return undefined;
}

function optionalPlugin(
  enabled: boolean,
  plugin: RsbuildPlugin
): RsbuildPlugin[] {
  return enabled ? [plugin] : [];
}

function pluginSyntheticFastTransforms(): RsbuildPlugin {
  return {
    name: 'synthetic-fast-transforms',
    setup(api) {
      api.transform(
        {
          test: /[/\\]app[/\\].*\.[cm]?[jt]sx?$/,
        },
        async ({ code }) => ({
          code: transformSyntheticFastCode(code, isDevelopment),
        })
      );
    },
  };
}

function transformSyntheticFastCode(code: string, isDevelopmentBuild: boolean) {
  let transformed = code.replace(
    /__syntheticSecret\(\s*(["'])([^"']*)\1\s*\)/g,
    (_match, _quote: string, value: string) => String(fnv1a(value))
  );

  if (!isDevelopmentBuild) {
    transformed = transformed
      .replace(
        /^\s*import\s+\{\s*RestrictedCard\s*\}\s+from\s+["'][^"']*restricted\/restricted-\d+["'];\n?/gm,
        ''
      )
      .replace(/\{__RESTRICTED__ \? <RestrictedCard \/> : null\}/g, '{null}');
  }

  return transformed;
}

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function enableParallelLoaders(rule: unknown, useIds: string[]) {
  const currentRule = rule as {
    uses?: {
      has?: (name: string) => boolean;
    };
    use?: (name: string) => { parallel?: (enabled: boolean) => void };
    oneOfs?: {
      entries?: () => Record<string, unknown>;
    };
  };

  for (const useId of useIds) {
    if (currentRule.uses?.has?.(useId)) {
      currentRule.use?.(useId).parallel?.(true);
    }
  }

  for (const oneOf of Object.values(currentRule.oneOfs?.entries?.() ?? {})) {
    enableParallelLoaders(oneOf, useIds);
  }
}

function isNodeBundlerChain({
  environment,
  target,
}: {
  environment?: { name?: string };
  target?: string | string[];
}): boolean {
  return environment?.name === 'node' || target === 'node';
}

function disableTailwindForNodeCssUrlAndInline(
  cssRule: unknown,
  oneOfIds: string[],
  cssUseId: string
) {
  const currentRule = cssRule as {
    oneOf?: (name: string) => unknown;
  };

  for (const oneOfId of oneOfIds) {
    removeTailwindUse(currentRule.oneOf?.(oneOfId), cssUseId);
  }
}

function removeTailwindUse(rule: unknown, cssUseId: string) {
  const currentRule = rule as {
    uses?: {
      delete?: (name: string) => void;
      get?: (name: string) => {
        get?: (key: string) => unknown;
        options?: (options: unknown) => void;
      };
      has?: (name: string) => boolean;
    };
  };

  if (!currentRule.uses?.has?.('tailwindcss')) {
    return;
  }

  currentRule.uses.delete?.('tailwindcss');

  const cssUse = currentRule.uses.get?.(cssUseId);
  const cssOptions = cssUse?.get?.('options');
  if (
    cssOptions &&
    typeof cssOptions === 'object' &&
    !Array.isArray(cssOptions)
  ) {
    const options = cssOptions as { importLoaders?: number };
    cssUse?.options?.({
      ...options,
      importLoaders:
        typeof options.importLoaders === 'number'
          ? Math.max(0, options.importLoaders - 1)
          : options.importLoaders,
    });
  }
}
