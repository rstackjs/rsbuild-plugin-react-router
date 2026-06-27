import { createHash } from 'node:crypto';
import type { Route, PluginOptions } from './types.js';
import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import {
  createReactRouterManifestStats,
  generateReactRouterManifestForDev,
  getReactRouterManifestChunkNames,
  getReactRouterManifestForDev,
  getReactRouterManifestPath,
} from './manifest.js';
import { combineURLs } from './plugin-utils.js';
import jsesc from 'jsesc';

type ModifyBrowserManifestOptions = {
  future?: { unstable_subResourceIntegrity?: boolean };
  subResourceIntegrity?: boolean;
  manifestChunkNames?: ReadonlySet<string>;
  onManifest?: (
    manifest: Awaited<ReturnType<typeof getReactRouterManifestForDev>>,
    sri: Record<string, string> | undefined,
    moduleExportsByRouteId: Awaited<
      ReturnType<typeof generateReactRouterManifestForDev>
    >['moduleExportsByRouteId'],
    context: {
      compilation: Rspack.Compilation;
      manifestStats: ReturnType<typeof createReactRouterManifestStats>;
    }
  ) => void;
};

type ProcessAssetsApi = Pick<RsbuildPluginAPI, 'processAssets'>;
type AssetPrefixInput = string | (() => string);
type ReactRouterManifest = Awaited<
  ReturnType<typeof getReactRouterManifestForDev>
>;
type RouteManifestModuleExports = Awaited<
  ReturnType<typeof generateReactRouterManifestForDev>
>['moduleExportsByRouteId'];
type GeneratedManifest = {
  manifest: ReactRouterManifest;
  moduleExportsByRouteId: RouteManifestModuleExports;
  manifestStats: ReturnType<typeof createReactRouterManifestStats>;
  assetPrefix: string;
};

const BROWSER_MANIFEST_ASSET =
  'static/js/virtual/react-router/browser-manifest.js';

const createSubresourceIntegrity = (
  compilation: Rspack.Compilation,
  assetPrefix: string
) => {
  const sri: Record<string, string> = {};
  for (const asset of compilation.getAssets()) {
    if (!asset.name.endsWith('.js')) {
      continue;
    }
    const source = asset.source.source().toString();
    const hash = createHash('sha384').update(source).digest('base64');
    sri[combineURLs(assetPrefix, asset.name)] = `sha384-${hash}`;
  }
  return sri;
};

export function registerModifyBrowserManifestAssets(
  api: ProcessAssetsApi,
  routes: Record<string, Route>,
  pluginOptions: PluginOptions,
  appDirectory: string,
  assetPrefix: AssetPrefixInput = '/',
  routeChunkOptions?: Parameters<typeof getReactRouterManifestForDev>[5],
  options?: ModifyBrowserManifestOptions
): void {
  const getAssetPrefix =
    typeof assetPrefix === 'function' ? assetPrefix : () => assetPrefix;
  const manifestChunkNames =
    options?.manifestChunkNames ??
    getReactRouterManifestChunkNames(
      routes,
      routeChunkOptions?.splitRouteModules
    );
  const finalizeSri =
    routeChunkOptions?.isBuild &&
    (options?.subResourceIntegrity ??
      options?.future?.unstable_subResourceIntegrity);
  const generatedManifests = finalizeSri
    ? new WeakMap<Rspack.Compilation, GeneratedManifest>()
    : undefined;

  api.processAssets(
    { stage: 'additions', environments: ['web'] },
    async ({ assets, sources, compilation }) => {
      const currentAssetPrefix = getAssetPrefix();
      const stats = createReactRouterManifestStats(
        compilation,
        manifestChunkNames
      );
      const { manifest, moduleExportsByRouteId } =
        await generateReactRouterManifestForDev(
          routes,
          pluginOptions,
          stats,
          appDirectory,
          currentAssetPrefix,
          routeChunkOptions
        );

      const browserManifestAsset = assets[BROWSER_MANIFEST_ASSET];
      if (browserManifestAsset) {
        const originalSource = browserManifestAsset.source().toString();
        const newSource = originalSource.replace(
          /["'`]PLACEHOLDER["'`]/,
          jsesc(manifest, { es6: true })
        );
        compilation.updateAsset(
          BROWSER_MANIFEST_ASSET,
          new sources.RawSource(newSource)
        );
      }

      if (routeChunkOptions?.isBuild) {
        const entryAssets = stats?.assetsByChunkName?.['entry.client'];
        const entryJsAssets =
          entryAssets?.filter(asset => asset.endsWith('.js')) || [];
        const manifestPath = getReactRouterManifestPath({
          version: manifest.version,
          isBuild: true,
          entryModulePath: entryJsAssets[0],
        });
        const manifestSource = `window.__reactRouterManifest=${jsesc(manifest, {
          es6: true,
        })};`;
        const source = new sources.RawSource(manifestSource);
        if (compilation.getAsset(manifestPath)) {
          compilation.updateAsset(manifestPath, source);
        } else {
          compilation.emitAsset(manifestPath, source);
        }
      }

      if (generatedManifests) {
        generatedManifests.set(compilation, {
          manifest,
          moduleExportsByRouteId,
          manifestStats: stats,
          assetPrefix: currentAssetPrefix,
        });
        return;
      }

      options?.onManifest?.(manifest, undefined, moduleExportsByRouteId, {
        compilation,
        manifestStats: stats,
      });
    }
  );

  if (generatedManifests) {
    api.processAssets(
      { stage: 'report', environments: ['web'] },
      ({ compilation }) => {
        const generatedManifest = generatedManifests.get(compilation);
        if (!generatedManifest) {
          return;
        }

        generatedManifests.delete(compilation);
        options?.onManifest?.(
          generatedManifest.manifest,
          createSubresourceIntegrity(
            compilation,
            generatedManifest.assetPrefix
          ),
          generatedManifest.moduleExportsByRouteId,
          {
            compilation,
            manifestStats: generatedManifest.manifestStats,
          }
        );
      }
    );
  }
}
