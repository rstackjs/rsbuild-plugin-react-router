import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix } from 'node:path';
import { runInNewContext } from 'node:vm';
import {
  rspack,
  type EnvironmentContext,
  type ProcessAssetsDescriptor,
  type RsbuildPluginAPI,
  type Rspack,
} from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import { getRouteModuleAnalysis } from '../src/export-utils';
import {
  createReactRouterManifestStats,
  getReactRouterManifestChunkNames,
  type ReactRouterManifestForDev,
  type RouteManifestModuleExports,
} from '../src/manifest';
import { registerModifyBrowserManifestAssets } from '../src/modify-browser-manifest';
import { getRouteChunkEntryName } from '../src/route-chunks';

const assetPrefix = 'https://cdn.example.test/build/';
const manifestAssetPattern = /(?:^|\/)manifest-[a-f0-9]{8}\.js$/;
const assetUrl = (name: string) => `${assetPrefix}${name}`;
const stages = new Map<ProcessAssetsDescriptor['stage'], number>([
  ['additions', rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS],
  ['report', rspack.Compilation.PROCESS_ASSETS_STAGE_REPORT],
]);

type ManifestPublication = {
  stage: ProcessAssetsDescriptor['stage'] | undefined;
  compilation: Rspack.Compilation;
  manifest: ReactRouterManifestForDev;
  sri: ReactRouterManifestForDev['sri'];
  moduleExportsByRouteId: RouteManifestModuleExports;
  manifestStats: ReturnType<typeof createReactRouterManifestStats>;
};

const readEmittedManifest = (compilation: Rspack.Compilation) => {
  const assets = compilation
    .getAssets()
    .filter(asset => manifestAssetPattern.test(asset.name));
  if (assets.length !== 1) {
    throw new Error(`Expected one browser manifest, found ${assets.length}`);
  }
  const context: {
    window: { __reactRouterManifest?: ReactRouterManifestForDev };
  } = { window: {} };
  runInNewContext(assets[0].source.source().toString(), context);
  if (!context.window.__reactRouterManifest) {
    throw new Error(
      'The emitted asset did not initialize the browser manifest'
    );
  }
  return {
    name: assets[0].name,
    manifest: structuredClone(context.window.__reactRouterManifest),
  };
};

type CompilationObservation = {
  before: number;
  afterAdditions?: number;
  afterHash?: number;
  hashedEntrySource?: string;
};

const getJavaScriptAsset = (
  compilation: Rspack.Compilation,
  chunkName: string
) => {
  const file = Array.from(
    compilation.namedChunks.get(chunkName)?.files ?? []
  ).find(name => {
    const info = compilation.getAsset(name)?.info;
    return (
      info?.assetType === 'javascript' ||
      info?.javascriptModule === true ||
      /\.[cm]?js(?:[?#]|$)/.test(name)
    );
  });
  if (!file) {
    throw new Error(`Expected JavaScript for ${chunkName}`);
  }
  return file;
};

const runCompiler = (compiler: Rspack.Compiler) =>
  new Promise<Rspack.Stats>((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      } else if (!stats || stats.hasErrors()) {
        reject(new Error(stats?.toString({ all: false, errors: true })));
      } else {
        resolve(stats);
      }
    });
  });

const compileManifests = async (
  filename: string,
  enableSri: boolean,
  routeSourceAfterAdditions?: string
) => {
  const root = mkdtempSync(join(tmpdir(), 'rr-finalized-manifest-'));
  const entryFile = join(root, 'entry.client.js');
  const pageFile = join(root, 'page.js');
  const pageSource = `
    export const clientLoader = () => 'compiled-client';
    export const loader = () => 'compiled-server';
    export default function Page() { return 'compiled-page'; }
  `;
  const clientLoaderEntryName = getRouteChunkEntryName('page', 'clientLoader');
  const routes = {
    root: { id: 'root', file: 'root.js', path: '' },
    page: { id: 'page', parentId: 'root', file: 'page.js', path: 'page' },
  };
  const manifestChunkNames = getReactRouterManifestChunkNames(routes, root, true);
  const publications: ManifestPublication[] = [];
  const observations = new WeakMap<
    Rspack.Compilation,
    CompilationObservation
  >();
  let compiledAnalysis = new Map<string, Awaited<ReturnType<typeof getRouteModuleAnalysis>>>();
  let activeStage: ProcessAssetsDescriptor['stage'] | undefined;

  writeFileSync(
    join(root, 'root.js'),
    `export default function Root() { return 'root'; }`
  );
  writeFileSync(
    join(root, 'page-client-loader.js'),
    `export { clientLoader } from './page.js';`
  );

  const compiler = rspack({
    mode: 'production',
    context: root,
    cache: false,
    entry: {
      'entry.client': './entry.client.js',
      root: './root.js',
      page: './page.js',
      [clientLoaderEntryName]: './page-client-loader.js',
    },
    output: {
      path: join(root, 'dist'),
      publicPath: assetPrefix,
      filename,
      chunkFilename: filename,
      module: true,
      library: { type: 'module' },
      chunkFormat: 'module',
      chunkLoading: 'import',
      crossOriginLoading: 'anonymous',
    },
    optimization: {
      minimize: true,
      realContentHash: true,
      runtimeChunk: 'single',
    },
    plugins: [
      ...(enableSri
        ? [
            new rspack.SubresourceIntegrityPlugin({
              hashFuncNames: ['sha384'],
              enabled: true,
            }),
          ]
        : []),
      {
        apply(compiler: Rspack.Compiler) {
          const api: Pick<RsbuildPluginAPI, 'processAssets'> = {
            processAssets(descriptor, handler) {
              const stage = stages.get(descriptor.stage);
              if (stage === undefined) {
                throw new Error(`Unexpected asset stage: ${descriptor.stage}`);
              }
              expect(descriptor.environments).toEqual(['web']);
              const name = `FinalizedManifest:${descriptor.stage}`;
              compiler.hooks.thisCompilation.tap(name, compilation => {
                compilation.hooks.processAssets.tapPromise(
                  { name, stage },
                  async assets => {
                    activeStage = descriptor.stage;
                    try {
                      await handler({
                        assets,
                        sources: rspack.sources,
                        compilation,
                        compiler,
                        environment: { name: 'web' } as EnvironmentContext,
                      });
                    } finally {
                      activeStage = undefined;
                    }
                  }
                );
              });
            },
          };
          registerModifyBrowserManifestAssets(
            api,
            routes,
            {},
            root,
            assetPrefix,
            {
              isBuild: true,
              splitRouteModules: true,
              rootRouteFile: 'root.js',
            },
            {
              routeModuleAnalysis: async path => compiledAnalysis.get(path),
              subResourceIntegrity: enableSri,
              onManifest(manifest, sri, moduleExportsByRouteId, context) {
                publications.push({
                  stage: activeStage,
                  compilation: context.compilation,
                  manifest: structuredClone(manifest),
                  sri: structuredClone(sri),
                  moduleExportsByRouteId: structuredClone(
                    moduleExportsByRouteId
                  ),
                  manifestStats: structuredClone(context.manifestStats),
                });
              },
            }
          );

          compiler.hooks.thisCompilation.tap(
            'ObserveFinalizedManifest',
            compilation => {
              const observation: CompilationObservation = {
                before: publications.length,
              };
              observations.set(compilation, observation);
              compilation.hooks.processAssets.tap(
                {
                  name: 'ObserveManifestAdditions',
                  stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS + 1,
                },
                () => {

                  observation.afterAdditions = publications.length;
                  if (routeSourceAfterAdditions !== undefined) {
                    writeFileSync(pageFile, routeSourceAfterAdditions);
                  }
                }
              );
              compilation.hooks.processAssets.tap(
                {
                  name: 'ChangeEntryBeforeFinalHash',
                  stage:
                    rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
                },
                () => {
                  const name = getJavaScriptAsset(compilation, 'entry.client');
                  const source = compilation.getAsset(name)!.source;
                  compilation.updateAsset(
                    name,
                    new rspack.sources.RawSource(
                      `${source.source().toString()}\nglobalThis.__lateManifestTest = ${observation.before};`
                    )
                  );
                }
              );
              compilation.hooks.processAssets.tap(
                {
                  name: 'ObserveManifestFinalHash',
                  stage:
                    rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH + 1,
                },
                () => {
                  observation.afterHash = publications.length;
                  const name = getJavaScriptAsset(compilation, 'entry.client');
                  observation.hashedEntrySource = compilation
                    .getAsset(name)!.source.source().toString();
                }
              );
            }
          );
        },
      },
    ],
  });
  compiler.hooks.shouldEmit.tap('FinalizedManifestTest', () => false);

  try {
    const results = [];
    for (const value of ['first', 'second']) {
      writeFileSync(entryFile, `globalThis.__entryValue = '${value}'; export const value = '${value}';`);
      writeFileSync(pageFile, pageSource);
      compiledAnalysis = new Map(await Promise.all(Object.values(routes).map(async route => { const file = join(root, route.file); return [file, await getRouteModuleAnalysis(file)] as const; })));
      compiler.purgeInputFileSystem();
      compiler.modifiedFiles = new Set([entryFile, pageFile]);
      const stats = await runCompiler(compiler);
      const compilation = stats.compilation;
      const observation = observations.get(compilation);
      if (!observation || observation.afterAdditions === undefined) {
        throw new Error('The compilation did not reach manifest additions');
      }
      const officialSri: Record<string, string> = {};
      for (const asset of stats.toJson({
        all: false,
        assets: true,
        cachedAssets: true,
      }).assets ?? []) {
        if (
          typeof asset.name === 'string' &&
          typeof asset.integrity === 'string'
        ) {
          officialSri[assetUrl(asset.name)] = asset.integrity;
        }
      }
      const assets = compilation.getAssets();
      results.push({
        compilation,
        observation,
        finalEntrySource: compilation
          .getAsset(getJavaScriptAsset(compilation, 'entry.client'))!
          .source.source().toString(),

        emitted: readEmittedManifest(compilation),
        publications: publications.filter(
          publication => publication.compilation === compilation
        ),
        totalPublications: publications.length,
        manifestStats: createReactRouterManifestStats(
          compilation,
          manifestChunkNames
        ),
        entryFile: getJavaScriptAsset(compilation, 'entry.client'),
        routeFile: getJavaScriptAsset(compilation, 'root'),
        pageFile: getJavaScriptAsset(compilation, 'page'),
        clientLoaderFile: getJavaScriptAsset(
          compilation,
          clientLoaderEntryName
        ),
        compiledPageSource: compilation
          .getAsset(getJavaScriptAsset(compilation, 'page'))!
          .source.source()
          .toString(),
        sourceExportsAfterCompilation: (await getRouteModuleAnalysis(pageFile))
          .exports,
        assetNames: new Set(assets.map(asset => asset.name)),
        officialSri,
        digests: Object.fromEntries(
          assets.map(asset => [
            assetUrl(asset.name),
            `sha384-${createHash('sha384')
              .update(asset.source.source())
              .digest('base64')}`,
          ])
        ),
      });
    }
    return results;
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close(error => (error ? reject(error) : resolve()));
    });
    rmSync(root, { recursive: true, force: true });
  }
};

describe('finalized production browser manifests', () => {
  it.each([
    { filename: 'bundles/[name].[contenthash:8].js', enableSri: false },
    { filename: 'bundles/[contenthash:8]/[name].js', enableSri: false },
    { filename: 'bundles/[name].[contenthash:8].js', enableSri: true },
    { filename: 'bundles/[contenthash:8]/[name].js', enableSri: true },
    { filename: 'bundles/[name].[contenthash:8].mjs', enableSri: true },
    { filename: 'bundles/[name].[contenthash:8].cjs', enableSri: false },
    { filename: 'bundles/[name].js?[contenthash:8]', enableSri: false },
    { filename: 'bundles/[name]-[contenthash:8]', enableSri: false },
    { filename: 'bundles/[name]-[contenthash:8]', enableSri: true },
  ])(
    'publishes final URLs for $filename (SRI: $enableSri)',
    async ({ filename, enableSri }) => {
      const results = await compileManifests(filename, enableSri);

      for (const [index, result] of results.entries()) {
        expect(result.observation.before).toBe(index);
        expect(result.observation.afterAdditions).toBe(index);
        expect(result.observation.afterHash).toBe(index);
        expect(result.publications).toHaveLength(1);
        expect(result.totalPublications).toBe(index + 1);
        const publication = result.publications[0];
        expect(publication.stage).toBe('report');
        expect(publication.manifestStats).toEqual(result.manifestStats);
        expect(result.finalEntrySource).toBe(
          result.observation.hashedEntrySource
        );

        const browser = result.emitted.manifest;
        expect(browser.entry.module).toBe(assetUrl(result.entryFile));
        expect(browser.routes.root.module).toBe(assetUrl(result.routeFile));
        expect(browser.routes.page.module).toBe(assetUrl(result.pageFile));
        expect(browser.routes.page.clientLoaderModule).toBe(
          assetUrl(result.clientLoaderFile)
        );
        expect(result.emitted.name).toBe(
          posix.join(
            posix.dirname(result.entryFile),
            `manifest-${browser.version}.js`
          )
        );
        expect(browser.url).toBe(assetUrl(result.emitted.name));
        const moduleUrls = [
          browser.entry.module,
          ...browser.entry.imports,
          browser.routes.root.module,
          ...browser.routes.root.imports,
          browser.routes.page.module,
          ...browser.routes.page.imports,
          browser.routes.page.clientLoaderModule!,
        ];
        for (const url of [browser.url, ...moduleUrls]) {
          expect(url.startsWith(assetPrefix)).toBe(true);
          expect(result.assetNames.has(url.slice(assetPrefix.length))).toBe(
            true
          );
        }
        if (enableSri) {
          expect(browser.sri).toBeUndefined();
          expect(Object.keys(result.officialSri).length).toBeGreaterThan(0);

          for (const url of moduleUrls) {
            expect(result.officialSri[url]).toBe(result.digests[url]);
            expect(publication.sri?.[url]).toBe(result.digests[url]);
          }
          expect(publication.manifest).toEqual(browser);
        } else {
          expect(publication.sri).toBeUndefined();
          expect(publication.manifest).toEqual(browser);
        }
      }

      expect(results[0].compilation).not.toBe(results[1].compilation);
      expect(results[0].emitted.manifest.entry.module).not.toBe(
        results[1].emitted.manifest.entry.module
      );
      expect(results[0].emitted.manifest.version).not.toBe(
        results[1].emitted.manifest.version
      );
    }
  );

  it('preserves compiled route facts when source changes after additions', async () => {
    const results = await compileManifests(
      'bundles/[contenthash:8]/[name].js',
      false,
      `export const action = () => 'edited-action';
       export default function Page() { return 'edited-page'; }`
    );

    for (const result of results) {
      const browserRoute = result.emitted.manifest.routes.page;
      expect(browserRoute).toMatchObject({
        hasLoader: true,
        hasClientLoader: true,
        hasAction: false,
        clientLoaderModule: assetUrl(result.clientLoaderFile),
      });
      expect(result.compiledPageSource).toContain('compiled-client');
      expect(result.compiledPageSource).not.toContain('edited-action');
      expect(result.sourceExportsAfterCompilation).toEqual([
        'action',
        'default',
      ]);
      expect(result.publications).toHaveLength(1);
      expect(result.publications[0].manifest.routes.page).toEqual(browserRoute);
      expect(result.publications[0].moduleExportsByRouteId.page).toEqual([
        'clientLoader',
        'loader',
        'default',
      ]);
    }
  });
});
