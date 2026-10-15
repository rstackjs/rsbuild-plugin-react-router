import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { rspack, type RsbuildPluginAPI, type Rspack } from '@rsbuild/core';
import {
  NODE_LAZY_BRIDGE,
  NODE_LAZY_SIDECAR,
} from './dev-node-lazy-protocol.js';
import { hasUngatedNodeImports } from './dev-node-lazy-transform.js';

const loader = fileURLToPath(
  new URL('./dev-node-lazy-transform-loader.js', import.meta.url)
);

export const registerNodeLazyCompilation = (api: RsbuildPluginAPI): void => {
  const directory = resolve(
    api.context.rootPath,
    'node_modules/.cache/react-router/node-lazy'
  );
  const runtime = resolve(directory, 'runtime.js');
  const client = resolve(directory, 'client.js');
  const ownedModules = new Set([runtime, client]);
  api.modifyEnvironmentConfig((config, { name, mergeEnvironmentConfig }) => {
    if (name !== 'node') return config;
    return mergeEnvironmentConfig(config, {
      dev: {
        lazyCompilation: { node: true, entries: false, imports: true },
        hmr: true,
      },
      tools: {
        rspack: (configuration: Rspack.Configuration) => {
          const lazy = configuration.lazyCompilation;
          if (
            lazy &&
            typeof lazy === 'object' &&
            'backend' in lazy &&
            lazy.backend !== undefined
          ) {
            throw new Error(
              '[rsbuild-plugin-react-router] unstableServerLazyCompilation requires the installed Rspack lazy backend to provide compilation receipts. Custom backends are unsupported.'
            );
          }
          if (
            lazy &&
            typeof lazy === 'object' &&
            lazy.client &&
            lazy.client !== client
          ) {
            throw new Error(
              '[rsbuild-plugin-react-router] unstableServerLazyCompilation cannot use a custom Node lazy client.'
            );
          }
          configuration.lazyCompilation = {
            ...(typeof lazy === 'object' ? lazy : {}),
            entries: false,
            imports: true,
            client,
            test: module => !ownedModules.has(module.nameForCondition() ?? ''),
          };
          configuration.output = {
            ...configuration.output,
            publicPath: 'auto',
            hotUpdateChunkFilename: '[id].[fullhash].hot-update.js',
          };
          configuration.optimization = {
            ...configuration.optimization,
            runtimeChunk: false,
          };
          const existing = configuration.externals;
          configuration.externals = [
            {
              [NODE_LAZY_BRIDGE]: `${configuration.output.module ? 'node-commonjs' : 'commonjs'} ./${NODE_LAZY_SIDECAR}`,
            },
            ...(Array.isArray(existing)
              ? existing
              : existing
                ? [existing]
                : []),
          ];
          const entries = configuration.entry;
          if (
            !entries ||
            typeof entries !== 'object' ||
            Array.isArray(entries)
          ) {
            throw new Error(
              '[rsbuild-plugin-react-router] Server lazy compilation requires named eager Node entries.'
            );
          }
          for (const [name, entry] of Object.entries(entries)) {
            const descriptor =
              typeof entry === 'string' || Array.isArray(entry)
                ? { import: entry }
                : entry;
            const imports = descriptor.import;
            if (!imports)
              throw new Error(
                `[rsbuild-plugin-react-router] Server entry ${name} has no eager import.`
              );
            entries[name] = {
              ...descriptor,
              filename: `entry-${createHash('sha256').update(name).digest('hex')}.js`,
              import: [
                runtime,
                ...(Array.isArray(imports) ? imports : [imports]),
              ],
            };
          }
          configuration.module ??= {};
          configuration.module.rules ??= [];
          configuration.module.rules.unshift({
            test: /\.[cm]?[jt]sx?$/,
            exclude: [...ownedModules],
            enforce: 'post',
            use: [{ loader, options: { runtimeRequest: runtime } }],
          });
          configuration.plugins ??= [];
          configuration.plugins.push(
            new rspack.experiments.VirtualModulesPlugin({
              [runtime]: `import registration from ${JSON.stringify(NODE_LAZY_BRIDGE)};
const hot = import.meta.webpackHot;
if (!hot) throw new Error('Server lazy compilation requires Node HMR');
const bridge = registration.register({hash: () => __webpack_hash__, check: () => hot.check(false), apply: () => hot.apply()});
export const gate = bridge.gate;
export const demand = bridge.demand;`,
              [client]: `import { demand } from ${JSON.stringify(runtime)};
export const activate = options => demand(options, decodeURIComponent(__resourceQuery.slice(1)));`,
            })
          );
          configuration.plugins.push({
            apply(compiler: Rspack.Compiler) {
              if (
                !('watchInvalidation' in compiler.hooks) ||
                !compiler.hooks.watchInvalidation
              ) {
                throw new Error(
                  '[rsbuild-plugin-react-router] unstableServerLazyCompilation requires Rspack Compiler.hooks.watchInvalidation and Compilation.rebuildOrigin. Install the supported watch-origin preview.'
                );
              }
              compiler.hooks.compilation.tap(
                'ReactRouterNodeLazyCoverage',
                compilation => {
                  compilation.hooks.finishModules.tap(
                    'ReactRouterNodeLazyCoverage',
                    modules => {
                      for (const module of modules) {
                        if (
                          !module.type.startsWith('javascript') ||
                          ownedModules.has(module.nameForCondition() ?? '')
                        )
                          continue;
                        const source = module
                          .originalSource()
                          ?.source()
                          .toString();
                        if (source && hasUngatedNodeImports(source, runtime)) {
                          throw new Error(
                            `[rsbuild-plugin-react-router] Server lazy compilation found an unwrapped import() in ${module.identifier()}. Its custom loader must run before the Router post loader.`
                          );
                        }
                      }
                    }
                  );
                }
              );
            },
          });
          return configuration;
        },
      },
    });
  });
};
