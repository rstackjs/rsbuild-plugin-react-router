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

type StatsAssetWithIntegrity = {
  name?: string;
  integrity?: unknown;
};

type StatsWithIntegrity = {
  assets?: StatsAssetWithIntegrity[];
};

type CompilationAssetWithIntegrity = {
  name: string;
  info?: {
    integrity?: unknown;
  };
};

type CompilationWithIntegrityAssets =
  | {
      getAssets?: () => readonly CompilationAssetWithIntegrity[];
    }
  | Pick<Rspack.Compilation, 'getAssets'>;

type ModifyBrowserManifestOptions = {
  future?: { unstable_subResourceIntegrity?: boolean };
  subResourceIntegrity?: boolean;
  manifestChunkNames?: ReadonlySet<string>;
  onManifest?: (
    manifest: Awaited<ReturnType<typeof getReactRouterManifestForDev>>,
    sri: Record<string, string> | true | undefined,
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
const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

const toManifestAssetUrl = (assetPrefix: string, assetName: string) => {
  if (
    ABSOLUTE_URL_RE.test(assetName) ||
    assetName.startsWith('//') ||
    assetName.startsWith('/')
  ) {
    return assetName;
  }
  return combineURLs(assetPrefix, assetName);
};

const addIntegrity = (
  sri: Record<string, string>,
  assetPrefix: string,
  assetName: unknown,
  integrity: unknown
) => {
  if (typeof assetName !== 'string' || typeof integrity !== 'string') {
    return;
  }
  sri[toManifestAssetUrl(assetPrefix, assetName)] = integrity;
};

export const collectSubresourceIntegrity = (
  stats: StatsWithIntegrity | undefined,
  compilation: CompilationWithIntegrityAssets | undefined,
  assetPrefix = '/'
): Record<string, string> | undefined => {
  const sri: Record<string, string> = {};

  for (const asset of stats?.assets ?? []) {
    addIntegrity(sri, assetPrefix, asset.name, asset.integrity);
  }

  if (typeof compilation?.getAssets === 'function') {
    const assets =
      compilation.getAssets() as readonly CompilationAssetWithIntegrity[];
    for (const asset of assets) {
      addIntegrity(sri, assetPrefix, asset.name, asset.info?.integrity);
    }
  }

  return Object.keys(sri).length > 0 ? sri : undefined;
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
  const finalizeSri = Boolean(
    routeChunkOptions?.isBuild &&
    (options?.subResourceIntegrity ??
      options?.future?.unstable_subResourceIntegrity)
  );
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
      const manifestForBrowser = finalizeSri
        ? { ...manifest, sri: true as const }
        : manifest;

      const browserManifestAsset = assets[BROWSER_MANIFEST_ASSET];
      if (browserManifestAsset) {
        const originalSource = browserManifestAsset.source().toString();
        const serializedManifest = jsesc(manifestForBrowser, { es6: true });
        const newSource = originalSource.replace(
          /["'`]PLACEHOLDER["'`]/,
          () => serializedManifest
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
        const manifestSource = `window.__reactRouterManifest=${jsesc(
          manifestForBrowser,
          { es6: true }
        )};`;
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
        const sri =
          collectSubresourceIntegrity(
            undefined,
            compilation,
            generatedManifest.assetPrefix
          ) ?? true;
        options?.onManifest?.(
          {
            ...generatedManifest.manifest,
            sri,
          },
          sri,
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
