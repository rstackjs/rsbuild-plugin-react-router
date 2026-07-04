import type { Route, PluginOptions } from './types.js';
import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import {
  createReactRouterManifestOptions,
  createReactRouterManifestStats,
  generateReactRouterManifestForDev,
  getReactRouterManifestChunkNames,
  getReactRouterManifestPath,
  type ReactRouterManifestForDev as ReactRouterManifest,
  type RouteChunkManifestOptions,
  type RouteManifestModuleExports,
  type RouteModuleAnalysisProvider,
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
  subResourceIntegrity?: boolean;
  future?: { unstable_subResourceIntegrity?: boolean };
  manifestChunkNames?: ReadonlySet<string>;
  routeModuleAnalysis?: RouteModuleAnalysisProvider;
  onManifest?: (
    manifest: ReactRouterManifest,
    sri: Record<string, string> | true | undefined,
    moduleExportsByRouteId: RouteManifestModuleExports,
    context: {
      compilation: Rspack.Compilation;
      manifestStats: ReturnType<typeof createReactRouterManifestStats>;
    }
  ) => void;
};

type ProcessAssetsApi = Pick<RsbuildPluginAPI, 'processAssets'>;
type AssetPrefixInput = string | (() => string);
type ManifestProcessAssetsContext = Parameters<
  Parameters<RsbuildPluginAPI['processAssets']>[1]
>[0];

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
  routeChunkOptions?: RouteChunkManifestOptions,
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
  const isBuild = Boolean(routeChunkOptions?.isBuild);
  const finalizeSri = Boolean(
    isBuild &&
    (options?.subResourceIntegrity ??
      options?.future?.unstable_subResourceIntegrity)
  );

  // Build the React Router manifest from the compilation's current asset names,
  // emit the build-mode `manifest-<version>.js` asset (or replace the dev
  // browser-manifest placeholder), and fire the `onManifest` callback.
  const buildAndEmitManifest = async (
    { assets, sources, compilation }: ManifestProcessAssetsContext,
    { withSri }: { withSri: boolean }
  ): Promise<void> => {
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
        createReactRouterManifestOptions({
          routeChunks: routeChunkOptions,
          routeModuleAnalysis: options?.routeModuleAnalysis,
        })
      );

    // With SRI, integrity hashes are only available once the compilation has
    // finalized asset hashes, so collect them at this (report) stage.
    const sri = withSri
      ? (collectSubresourceIntegrity(
          undefined,
          compilation,
          currentAssetPrefix
        ) ?? true)
      : undefined;
    const manifestForBrowser: ReactRouterManifest =
      sri !== undefined ? { ...manifest, sri } : manifest;

    const browserManifestAsset = assets[BROWSER_MANIFEST_ASSET];
    if (browserManifestAsset) {
      const originalSource = browserManifestAsset.source().toString();
      const newSource = originalSource.replace(
        /["'`]PLACEHOLDER["'`]/,
        jsesc(manifestForBrowser, { es6: true })
      );
      compilation.updateAsset(
        BROWSER_MANIFEST_ASSET,
        new sources.RawSource(newSource)
      );
    }

    if (isBuild) {
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

    options?.onManifest?.(manifestForBrowser, sri, moduleExportsByRouteId, {
      compilation,
      manifestStats: stats,
    });
  };

  if (isBuild) {
    // In production, Rspack renames content-hashed assets during
    // `realContentHash` (PROCESS_ASSETS_STAGE_OPTIMIZE_HASH = 2500). Reading
    // asset names before that stage yields pre-rename hashes that never appear
    // in the output, so CSS/JS URLs in the manifest 404. Defer manifest
    // generation and emission to the `report` stage
    // (PROCESS_ASSETS_STAGE_REPORT = 5000), which runs after the rename (and
    // after SRI integrity hashes are finalized).
    api.processAssets({ stage: 'report', environments: ['web'] }, context =>
      buildAndEmitManifest(context, { withSri: finalizeSri })
    );
    return;
  }

  // Dev has no `realContentHash` pass; generate the manifest at `additions` so
  // the browser-manifest placeholder is populated as early as possible.
  api.processAssets({ stage: 'additions', environments: ['web'] }, context =>
    buildAndEmitManifest(context, { withSri: false })
  );
}
