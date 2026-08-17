import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import {
  rspack,
  type EnvironmentContext,
  type ProcessAssetsDescriptor,
  type RsbuildPluginAPI,
  type Rspack,
} from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import { BROWSER_MANIFEST_ENTRY_NAME } from '../src/constants';
import { getRouteModuleAnalysis } from '../src/export-utils';
import {
  createReactRouterManifestStats,
  getReactRouterManifestChunkNames,
  type ReactRouterManifestForDev,
  type RouteManifestModuleExports,
} from '../src/manifest';
import { registerModifyBrowserManifestAssets } from '../src/modify-browser-manifest';

const assetPrefix = 'https://cdn.example.test/development/';
const assetUrl = (name: string) => `${assetPrefix}${name}`;
const stages = new Map<ProcessAssetsDescriptor['stage'], number>([
  ['additions', rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS],
  ['report', rspack.Compilation.PROCESS_ASSETS_STAGE_REPORT],
]);

type ManifestPublication = {
  stage: ProcessAssetsDescriptor['stage'] | undefined;
  compilation: Rspack.Compilation;
  manifest: ReactRouterManifestForDev;
  moduleExportsByRouteId: RouteManifestModuleExports;
  manifestStats: ReturnType<typeof createReactRouterManifestStats>;
};

const getJavaScriptAsset = (
  compilation: Rspack.Compilation,
  chunkName: string
): string => {
  const file = Array.from(
    compilation.namedChunks.get(chunkName)?.files ?? []
  ).find(name => name.endsWith('.js'));
  if (!file) {
    throw new Error(`Expected JavaScript for ${chunkName}`);
  }
  return file;
};

const readBrowserManifest = (compilation: Rspack.Compilation) => {
  const name = getJavaScriptAsset(compilation, BROWSER_MANIFEST_ENTRY_NAME);
  const context: {
    window: { __reactRouterManifest?: ReactRouterManifestForDev };
  } = { window: {} };
  runInNewContext(
    compilation.getAsset(name)!.source.source().toString(),
    context
  );
  if (!context.window.__reactRouterManifest) {
    throw new Error('The browser entry did not initialize the manifest');
  }
  return {
    name,
    manifest: structuredClone(context.window.__reactRouterManifest),
  };
};

const compileDevelopmentManifest = async (
  realContentHash: boolean,
  changeRouteSource = false
) => {
  const root = mkdtempSync(join(tmpdir(), 'rr-dev-manifest-hashes-'));
  const pageFile = join(root, 'page.js');
  const routes = {
    root: { id: 'root', file: 'root.js', path: '' },
    page: { id: 'page', parentId: 'root', file: 'page.js', path: 'page' },
  };
  const manifestChunkNames = getReactRouterManifestChunkNames(routes, root);
  manifestChunkNames.add(BROWSER_MANIFEST_ENTRY_NAME);
  const publications: ManifestPublication[] = [];
  let activeStage: ProcessAssetsDescriptor['stage'] | undefined;
  let afterAdditions = 0;
  let afterHash = 0;
  let early: ReturnType<typeof readBrowserManifest> | undefined;

  writeFileSync(
    join(root, 'entry.client.js'),
    `console.log('compiled-entry');`
  );
  writeFileSync(
    join(root, 'root.js'),
    `export default function Root() { return 'compiled-root'; }`
  );
  writeFileSync(
    pageFile,
    `export const clientLoader = () => 'compiled-client';
     export const loader = () => 'compiled-server';
     export default function Page() { return 'compiled-page'; }`
  );
  writeFileSync(
    join(root, 'browser-manifest.js'),
    `window.__reactRouterManifest = "PLACEHOLDER";`
  );

  const compiledAnalysis = new Map(await Promise.all(Object.values(routes).map(async route => { const file = join(root, route.file); return [file, await getRouteModuleAnalysis(file)] as const; })));
  const compiler = rspack({
    mode: 'development',
    context: root,
    devtool: false,
    cache: false,
    entry: {
      'entry.client': './entry.client.js',
      root: './root.js',
      page: './page.js',
      [BROWSER_MANIFEST_ENTRY_NAME]: './browser-manifest.js',
    },
    output: {
      path: join(root, 'dist'),
      publicPath: assetPrefix,
      filename: 'bundles/[contenthash:8]/[name].js',
      chunkFilename: 'bundles/[contenthash:8]/[name].js',
    },
    optimization: {
      minimize: false,
      realContentHash,
      runtimeChunk: false,
      splitChunks: false,
    },
    plugins: [
      {
        apply(compiler: Rspack.Compiler) {
          const api: Pick<RsbuildPluginAPI, 'processAssets'> = {
            processAssets(descriptor, handler) {
              const stage = stages.get(descriptor.stage);
              if (stage === undefined) {
                throw new Error(`Unexpected asset stage: ${descriptor.stage}`);
              }
              expect(descriptor.environments).toEqual(['web']);
              const name = `DevelopmentManifest:${descriptor.stage}`;
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
            { isBuild: false },
            {
              routeModuleAnalysis: async path => compiledAnalysis.get(path),
              onManifest(manifest, _sri, moduleExportsByRouteId, context) {
                publications.push({
                  stage: activeStage,
                  compilation: context.compilation,
                  manifest: structuredClone(manifest),
                  moduleExportsByRouteId: structuredClone(
                    moduleExportsByRouteId
                  ),
                  manifestStats: structuredClone(context.manifestStats),
                });
              },
            }
          );

          compiler.hooks.thisCompilation.tap(
            'ObserveDevelopmentManifest',
            compilation => {
              compilation.hooks.processAssets.tap(
                {
                  name: 'ObserveDevelopmentManifestAdditions',
                  stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS + 1,
                },
                () => {
                  afterAdditions = publications.length;
                  early = readBrowserManifest(compilation);
                  if (changeRouteSource) {
                    writeFileSync(
                      pageFile,
                      `export const action = () => 'edited-action';
                       export default function Page() { return 'edited-page'; }`
                    );
                  }
                }
              );
              compilation.hooks.processAssets.tap(
                {
                  name: 'ChangeDevelopmentEntryBeforeFinalHash',
                  stage:
                    rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
                },
                () => {
                  const name = getJavaScriptAsset(compilation, 'entry.client');
                  const source = compilation.getAsset(name)!.source;
                  compilation.updateAsset(
                    name,
                    new rspack.sources.RawSource(
                      `${source.source().toString()}\nglobalThis.__lateDevelopmentManifestTest = true;`
                    )
                  );
                }
              );
              compilation.hooks.processAssets.tap(
                {
                  name: 'ObserveDevelopmentManifestFinalHash',
                  stage:
                    rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH + 1,
                },
                () => {
                  afterHash = publications.length;
                }
              );
            }
          );
        },
      },
    ],
  });
  compiler.hooks.shouldEmit.tap('DevelopmentManifestHashesTest', () => false);

  try {
    const stats = await new Promise<Rspack.Stats>((resolve, reject) => {
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
    if (!early) {
      throw new Error('The compilation did not reach manifest additions');
    }
    const compilation = stats.compilation;
    return {
      compilation,
      publications,
      afterAdditions,
      afterHash,
      early,
      emitted: readBrowserManifest(compilation),
      manifestStats: createReactRouterManifestStats(
        compilation,
        manifestChunkNames
      ),
      entryFile: getJavaScriptAsset(compilation, 'entry.client'),
      rootFile: getJavaScriptAsset(compilation, 'root'),
      pageFile: getJavaScriptAsset(compilation, 'page'),
      assetNames: new Set(compilation.getAssets().map(asset => asset.name)),
      compiledPageSource: compilation
        .getAsset(getJavaScriptAsset(compilation, 'page'))!
        .source.source()
        .toString(),
      sourceExportsAfterCompilation: (await getRouteModuleAnalysis(pageFile))
        .exports,
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close(error => (error ? reject(error) : resolve()));
    });
    rmSync(root, { recursive: true, force: true });
  }
};

describe('development manifests with content hashes', () => {
  it('publishes final asset URLs with compiled route facts', async () => {
    const result = await compileDevelopmentManifest(true, true);

    expect(result.afterAdditions).toBe(0);
    expect(result.afterHash).toBe(0);
    expect(result.publications.map(publication => publication.stage)).toEqual([
      'report',
    ]);
    const [finalized] = result.publications;
    expect(finalized.compilation).toBe(result.compilation);
    expect(finalized.manifest).toEqual(result.emitted.manifest);
    expect(finalized.manifestStats).toEqual(result.manifestStats);
    expect(finalized.moduleExportsByRouteId.page).toEqual([
      'clientLoader',
      'loader',
      'default',
    ]);
    expect(finalized.manifest.routes.page).toMatchObject({
      hasLoader: true,
      hasClientLoader: true,
      hasAction: false,
    });
    expect(result.sourceExportsAfterCompilation).toEqual(['action', 'default']);
    expect(result.compiledPageSource).toContain('compiled-client');
    expect(result.compiledPageSource).not.toContain('edited-action');

    const browser = result.emitted.manifest;
    expect(browser.url).toBe(`${assetUrl(result.emitted.name)}?v=${browser.version}`);
    expect(browser.entry.module).toBe(assetUrl(result.entryFile));
    expect(browser.entry.imports).toEqual([]);
    expect(browser.routes.root.module).toBe(assetUrl(result.rootFile));
    expect(browser.routes.page.module).toBe(assetUrl(result.pageFile));
    expect(browser.routes.page.imports).toEqual([]);
    expect(result.assetNames.has(result.early.name)).toBe(false);
    for (const url of [
      browser.url,
      browser.entry.module,
      ...browser.entry.imports,
      ...Object.values(browser.routes).flatMap(route => [
        route.module,
        ...route.imports,
      ]),
    ]) {
      expect(url.startsWith(assetPrefix)).toBe(true);
      expect(result.assetNames.has(url.slice(assetPrefix.length).replace(/\?v=.*$/, ''))).toBe(true);
    }
  });

  it('publishes once without real content hashing', async () => {
    const result = await compileDevelopmentManifest(false);

    expect(result.afterAdditions).toBe(0);
    expect(result.afterHash).toBe(0);
    expect(result.publications.map(publication => publication.stage)).toEqual([
      'report',
    ]);
    expect(result.publications[0].compilation).toBe(result.compilation);
    expect(result.publications[0].manifest).toEqual(result.emitted.manifest);
    expect(result.emitted.name).toBe(result.early.name);
    expect(result.emitted.manifest.url).toBe(`${assetUrl(result.emitted.name)}?v=${result.emitted.manifest.version}`);
    expect(result.emitted.manifest.entry.module).toBe(
      assetUrl(result.entryFile)
    );
  });
});
