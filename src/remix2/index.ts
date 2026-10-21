import { readdirSync } from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import {
  rspack,
  type RsbuildDevServer,
  type RsbuildPlugin,
  type Rspack,
} from '@rsbuild/core';
import {
  generateRemix2ServerBuild,
  REMIX2_ASSETS_MODULE_ID,
  REMIX2_SERVER_MODULE_ID,
  remix2ServerExternals,
  remix2VirtualPath,
} from './build.js';
import { remix2PackageAliases, resolveRemix2Config } from './config.js';
import { createRemix2Manifest, remix2RouteEntry } from './manifest.js';
import {
  transformRemix2Route,
  type Remix2RouteAnalysis,
} from './route-transform.js';
import {
  createRemix2ReloadChannel,
  Remix2DevAssets,
  publishRemix2Disk,
  registerRemix2DevServer,
  remix2AssetsMiddleware,
  remix2RequestMiddleware,
  snapshotRemix2Assets,
  type Remix2DevState,
  type Remix2Generation,
} from './dev.js';
import type {
  Remix2AssetsManifest,
  Remix2PluginOptions,
  Remix2Route,
} from './types.js';

export type {
  Remix2Assets,
  Remix2AssetsManifest,
  Remix2Future,
  Remix2ManifestDraft,
  Remix2ManifestRoute,
  Remix2PluginOptions,
  Remix2Route,
  Remix2ServerBuild,
  ResolvedRemix2Config,
} from './types.js';
export { REMIX2_ASSETS_MODULE_ID } from './build.js';
export { loadRemix2ServerBuild } from './dev.js';

const name = 'rsbuild:remix2';
const emptyClientId = 'virtual/remix2/empty-client';

interface Remix2Attempt {
  ready: Promise<void>;
  finish: () => void;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory()
      ? sourceFiles(resolve(directory, entry.name))
      : [resolve(directory, entry.name)]
  );
}

export function pluginRemix2(options: Remix2PluginOptions = {}): RsbuildPlugin {
  return {
    name,
    async setup(api) {
      const root = api.context.rootPath;
      const isBuild = api.context.action === 'build';
      const config = await resolveRemix2Config(
        root,
        isBuild ? 'production' : 'development',
        options
      );
      const esm = config.serverModuleFormat === 'esm';
      const aliases = remix2PackageAliases(root);
      const analyses = new Map<string, Remix2RouteAnalysis>();
      const routesByPath = new Map<string, Remix2Route[]>();
      for (const route of Object.values(config.routes)) {
        const path = resolve(config.appDirectory, route.file);
        const routes = routesByPath.get(path) ?? [];
        routes.push(route);
        routesByPath.set(path, routes);
      }
      const clientRouteByResource = new Map(
        Object.values(config.routes).map(route => [
          `${resolve(config.appDirectory, route.file)}?__remix2-route=${encodeURIComponent(route.id)}`,
          route,
        ])
      );
      const webModules = new rspack.experiments.VirtualModulesPlugin({});
      const nodeModules = new rspack.experiments.VirtualModulesPlugin({
        [remix2VirtualPath(root, emptyClientId)]: 'module.exports = {};',
        [remix2VirtualPath(root, REMIX2_SERVER_MODULE_ID)]:
          generateRemix2ServerBuild(
            config,
            isBuild ? 'production' : 'development'
          ),
        [remix2VirtualPath(root, REMIX2_ASSETS_MODULE_ID)]:
          'export const assets = {};',
      });
      const manifests = new WeakMap<Rspack.Compilation, Remix2AssetsManifest>();
      let publishGeneration: (stats: Rspack.MultiStats) => Promise<void>;
      let latestWeb: Rspack.Compilation | undefined;
      let completedWeb: Rspack.Compilation | undefined;
      const webForNode = new WeakMap<Rspack.Compilation, Rspack.Compilation>();
      const attempts = new WeakMap<Rspack.Compilation, Remix2Attempt>();
      let pending: Remix2Attempt | undefined;
      let publishedNodeHash: string | null | undefined;
      let state: Remix2DevState = { kind: 'starting' };
      let server: RsbuildDevServer | undefined;
      let compiler: Rspack.MultiCompiler | undefined;
      let unregister: (() => void) | undefined;
      let resolveReady: () => void;
      let rejectReady: (error: Error) => void;
      const ready = new Promise<void>((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
      });
      void ready.catch(() => {});
      const assets = new Remix2DevAssets();
      const reload = createRemix2ReloadChannel();
      const reloadClientId = 'virtual/remix2/reload-client';
      const reloadModules = new rspack.experiments.VirtualModulesPlugin({
        [remix2VirtualPath(root, reloadClientId)]:
          'const events = new EventSource("/__remix2/events"); events.onmessage = () => location.reload();',
      });
      const generation = () =>
        state.kind === 'ready' ? state.generation : undefined;
      const closed = () => state.kind === 'closed';
      const assertOpen = () => {
        if (state.kind === 'closed') throw state.error;
      };
      const load = async () => {
        assertOpen();
        await ready;
        let attempt: Remix2Attempt | undefined;
        do {
          attempt = pending;
          await attempt?.ready;
        } while (attempt !== pending);
        assertOpen();
        return generation()!.build;
      };

      api.transform(
        { environments: ['web'], test: path => routesByPath.has(path) },
        async ({ code, resource, resourcePath }) => {
          const clientRoute = clientRouteByResource.get(resource);
          const route = clientRoute ?? routesByPath.get(resourcePath)![0];
          const result = await transformRemix2Route(
            code,
            route,
            clientRoute ? options.transformClientRoute : undefined
          );
          if (clientRoute) analyses.set(route.id, result.analysis);
          return result.code;
        }
      );
      api.transform(
        { environments: ['web'], test: /\.server(?:\.|\/)/ },
        ({ resourcePath }) => {
          throw new Error(
            `[remix2] Server-only module reached browser compilation: ${resourcePath}`
          );
        }
      );
      api.transform(
        {
          environments: ['node'],
          test: path =>
            path === remix2VirtualPath(root, REMIX2_ASSETS_MODULE_ID),
        },
        ({ addDependency }) => {
          for (const file of sourceFiles(config.appDirectory))
            addDependency(file);
          const manifest = completedWeb && manifests.get(completedWeb);
          if (!manifest)
            throw new Error('[remix2] Browser manifest is not ready.');
          return `export const assets = ${JSON.stringify(manifest)};`;
        }
      );

      api.modifyRsbuildConfig((user, { mergeRsbuildConfig }) => {
        const entries = Object.fromEntries(
          Object.values(config.routes).map(route => [
            remix2RouteEntry(route.id),
            {
              import: `${resolve(config.appDirectory, route.file)}?__remix2-route=${encodeURIComponent(route.id)}`,
              html: false,
            },
          ])
        );
        return mergeRsbuildConfig(user, {
          server: {
            htmlFallback: false,
            historyApiFallback: false,
            host: '0.0.0.0',
            compress: false,
            publicDir: { name: 'public', copyOnBuild: false },
          },
          dev: {
            hmr: false,
            liveReload: false,
            lazyCompilation: false,
            writeToDisk: false,
            watchFiles: [
              {
                paths: [
                  resolve(root, 'remix.config.*'),
                  ...(config.watchPaths ?? []).map(path => resolve(root, path)),
                ],
                type: 'restart',
              },
            ],
          },
          environments: {
            web: {
              source: {
                entry: {
                  'entry.client': {
                    import: isBuild
                      ? config.entryClientFilePath
                      : [config.entryClientFilePath, reloadClientId],
                    html: false,
                  },
                  ...entries,
                },
                define: {
                  'process.env.NODE_ENV': JSON.stringify(
                    isBuild ? 'production' : 'development'
                  ),
                },
              },
              output: {
                target: 'web',
                distPath: { root: config.assetsBuildDirectory },
                assetPrefix: config.publicPath,
                cleanDistPath: false,
              },
              tools: { rspack: { plugins: [webModules, reloadModules] } },
            },
            node: {
              source: {
                entry: {
                  [basename(config.serverBuildPath).replace(/\.[^.]+$/, '')]:
                    REMIX2_SERVER_MODULE_ID,
                },
              },
              output: {
                target: 'node',
                distPath: { root: dirname(config.serverBuildPath) },
                filename: { js: basename(config.serverBuildPath) },
                minify: config.serverMinify ?? false,
                cleanDistPath: false,
              },
              tools: { rspack: { plugins: [nodeModules] } },
            },
          },
        });
      });
      api.modifyRspackConfig((bundler, { environment }) => {
        if (environment.name !== 'web' && environment.name !== 'node') return;
        const web = environment.name === 'web';
        bundler.name = environment.name;
        if (web) {
          bundler.resolve = {
            ...bundler.resolve,
            alias: { ...aliases, ...bundler.resolve?.alias },
          };
        }
        bundler.output = {
          ...bundler.output,
          module: web || esm,
          library: { type: web || esm ? 'module' : 'commonjs2' },
          chunkFormat: web || esm ? 'module' : 'commonjs',
          chunkLoading: web || esm ? 'import' : 'require',
          ...(!isBuild
            ? {
                filename: web
                  ? 'static/js/[name].[contenthash:10].js'
                  : basename(config.serverBuildPath),
                chunkFilename: 'static/js/[name].[contenthash:10].js',
              }
            : {}),
        };
        bundler.optimization = {
          ...bundler.optimization,
          runtimeChunk: web ? 'single' : false,
          ...(web ? {} : { splitChunks: false }),
          mangleExports: false,
          usedExports: false,
        };
        if (!web) {
          bundler.plugins ??= [];
          bundler.plugins.push(
            new rspack.NormalModuleReplacementPlugin(
              /\.client(\.[jt]sx?)?$/,
              resource => {
                const appPath = relative(
                  config.appDirectory,
                  resolve(resource.context, resource.request)
                );
                if (appPath !== '..' && !appPath.startsWith(`..${sep}`))
                  resource.request = remix2VirtualPath(root, emptyClientId);
              }
            )
          );
          bundler.module ??= {};
          bundler.module.rules ??= [];
          bundler.module.rules.push({
            test: path => path === remix2VirtualPath(root, emptyClientId),
            type: 'javascript/dynamic',
          });
          bundler.dependencies = ['web'];
          bundler.externals = [remix2ServerExternals(config, bundler.resolve)];
          bundler.externalsType = esm ? 'module' : 'commonjs';
          bundler.resolve = {
            ...bundler.resolve,
            conditionNames: config.serverConditions ?? [
              'node',
              esm ? 'import' : 'require',
              'default',
            ],
            mainFields:
              config.serverMainFields ??
              (esm ? ['module', 'main'] : ['main', 'module']),
          };
        }
      });
      api.processAssets(
        { environments: ['web'], stage: 'report' },
        async ({ compilation, sources }) => {
          if (compilation.errors.length) return;
          const manifest = await createRemix2Manifest(
            compilation,
            config,
            analyses,
            options.transformManifest
          );
          manifests.set(compilation, manifest);
          latestWeb = compilation;
          compilation.emitAsset(
            `manifest-${manifest.version}.js`,
            new sources.RawSource(
              `window.__remixManifest=${JSON.stringify(manifest)};`
            ),
            { immutable: true }
          );
        }
      );
      api.onAfterCreateCompiler(({ compiler: created }) => {
        if (!('compilers' in created))
          throw new Error(
            '[remix2] Both web and node environments are required.'
          );
        compiler = created;
        if (!isBuild) {
          const node = created.compilers.find(child => child.name === 'node')!;
          node.hooks.thisCompilation.tap(name, compilation => {
            webForNode.set(compilation, completedWeb!);
          });
          node.hooks.done.tapPromise({ name, stage: 10000 }, async stats => {
            const web = webForNode.get(stats.compilation)!;
            try {
              await publishGeneration(
                new rspack.MultiStats([web.getStats(), stats])
              );
            } finally {
              attempts.get(web)?.finish();
            }
          });
        }
        const web = created.compilers.find(child => child.name === 'web')!;
        web.hooks.done.tap(name, stats => {
          completedWeb = stats.compilation;
        });
        web.hooks.thisCompilation.tap(name, compilation => {
          latestWeb = compilation;
          pending?.finish();
          let finish: () => void;
          const ready = new Promise<void>(resolve => {
            finish = resolve;
          });
          pending = { ready, finish: finish! };
          attempts.set(compilation, pending);
          // Server-only edits must start the browser half of the same serialized attempt.
          compilation.hooks.finishModules.tap(name, () => {
            for (const file of sourceFiles(config.appDirectory))
              compilation.fileDependencies.add(file);
            for (const path of config.watchPaths ?? [])
              compilation.contextDependencies.add(resolve(root, path));
          });
        });
      });

      if (isBuild) {
        api.onAfterBuild(async ({ stats }) => {
          if (!stats || stats.hasErrors()) return;
          const children = 'stats' in stats ? stats.stats : [stats];
          const node = children.find(
            child => child.compilation.name === 'node'
          )!;
          await publishRemix2Disk(
            config.assetsBuildDirectory,
            config.serverBuildPath,
            snapshotRemix2Assets(latestWeb!),
            snapshotRemix2Assets(node.compilation),
            esm
          );
        });
        return;
      }

      api.onBeforeStartDevServer(async ({ server: created }) => {
        server = created;
        unregister = registerRemix2DevServer(server, load);
        server.middlewares.use(reload.middleware);
        server.middlewares.use(
          remix2AssetsMiddleware(config.publicPath, assets)
        );
        const requestMiddleware = options.customServer
          ? undefined
          : await remix2RequestMiddleware(root, load);
        return async () => {
          if (requestMiddleware) created.middlewares.use(requestMiddleware);
          // Rsbuild normally returns before compiling. Start its watch before
          // returning so native readiness includes evaluation and publication.
          compiler!.watch(
            compiler!.compilers.map(child => child.options.watchOptions ?? {}),
            error => {
              if (error) {
                pending?.finish();
                if (state.kind === 'starting') rejectReady(error);
                else api.logger.error(error.message);
              }
            }
          );
          try {
            await ready;
          } catch (error) {
            await new Promise<void>(done =>
              compiler!.watching?.close(() => done())
            );
            await new Promise<void>(done => compiler!.close(() => done()));
            unregister?.();
            reload.close();
            assets.clear();
            throw error;
          }
        };
      });
      publishGeneration = async stats => {
        const children = 'stats' in stats ? stats.stats : [stats];
        const web = children.find(child => child.compilation.name === 'web');
        const node = children.find(child => child.compilation.name === 'node');
        try {
          if (web && web.compilation !== latestWeb) return;
          if (!web || !node || stats.hasErrors())
            throw new Error('[remix2] Native compilation failed.');
          const manifest = manifests.get(web.compilation);
          if (!manifest)
            throw new Error('[remix2] Browser manifest is not ready.');
          const build = await server!.environments.node.loadBundle<
            Remix2Generation['build']
          >(basename(config.serverBuildPath).replace(/\.[^.]+$/, ''));
          if (
            !build.entry?.module ||
            !build.routes ||
            build.assets.version !== manifest.version
          ) {
            throw new Error(
              '[remix2] Server build does not match its browser generation.'
            );
          }
          const next: Remix2Generation = {
            build,
            manifest,
          };
          if (closed() || web.compilation !== latestWeb) return;
          const browserAssets = snapshotRemix2Assets(web.compilation);
          if (options.customServer)
            await publishRemix2Disk(
              config.assetsBuildDirectory,
              config.serverBuildPath,
              browserAssets,
              snapshotRemix2Assets(node.compilation),
              esm
            );
          const previous = generation();
          if (closed() || web.compilation !== latestWeb) return;
          assets.publish(web.compilation, browserAssets);
          state = { kind: 'ready', generation: next };
          resolveReady!();
          if (
            previous &&
            (previous.manifest.version !== next.manifest.version ||
              publishedNodeHash !== node.hash)
          )
            reload.publish();
          publishedNodeHash = node.hash;
        } catch (cause) {
          const error =
            cause instanceof Error ? cause : new Error(String(cause));
          if (state.kind === 'starting') rejectReady!(error);
          else api.logger.error(error.message);
        }
      };
      api.onCloseDevServer(() => {
        const error = new Error('[remix2] Development server closed.');
        state = { kind: 'closed', error };
        pending?.finish();
        rejectReady!(error);
        unregister?.();
        reload.close();
        assets.clear();
      });
    },
  };
}
