import type { Route, PluginOptions } from './types.js';
import { rspack } from '@rsbuild/core';
import type { Rspack } from '@rsbuild/core';
import {
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
  compilation:
    | Pick<Rspack.Compilation, 'getAssets'>
    | { getAssets?: () => CompilationAssetWithIntegrity[] }
    | undefined,
  assetPrefix = '/'
): Record<string, string> | undefined => {
  const sri: Record<string, string> = {};

  for (const asset of stats?.assets ?? []) {
    addIntegrity(sri, assetPrefix, asset.name, asset.integrity);
  }

  if (typeof compilation?.getAssets === 'function') {
    for (const asset of compilation.getAssets()) {
      addIntegrity(sri, assetPrefix, asset.name, asset.info?.integrity);
    }
  }

  return Object.keys(sri).length > 0 ? sri : undefined;
};

/**
 * Creates a Webpack/Rspack plugin that modifies the browser manifest
 * @param routes - The routes configuration
 * @param pluginOptions - The plugin options
 * @param appDirectory - The application directory
 * @returns A webpack/rspack plugin
 */
export function createModifyBrowserManifestPlugin(
  routes: Record<string, Route>,
  pluginOptions: PluginOptions,
  appDirectory: string,
  assetPrefix = '/',
  routeChunkOptions?: Parameters<typeof getReactRouterManifestForDev>[5],
  options?: {
    future?: { unstable_subResourceIntegrity?: boolean };
    subResourceIntegrity?: boolean;
    onManifest?: (
      manifest: Awaited<ReturnType<typeof getReactRouterManifestForDev>>,
      sri: Record<string, string> | true | undefined
    ) => void;
  }
) {
  return {
    apply(compiler: Rspack.Compiler): void {
      compiler.hooks.emit.tapAsync(
        'ModifyBrowserManifest',
        async (compilation: Rspack.Compilation, callback) => {
          const stats = compilation.getStats().toJson();
          const manifest = await getReactRouterManifestForDev(
            routes,
            pluginOptions,
            stats,
            appDirectory,
            assetPrefix,
            routeChunkOptions
          );
          const manifestForBrowser =
            routeChunkOptions?.isBuild &&
            (options?.subResourceIntegrity ??
              options?.future?.unstable_subResourceIntegrity)
              ? { ...manifest, sri: true as const }
              : manifest;
          const sri =
            manifestForBrowser.sri === true
              ? collectSubresourceIntegrity(stats, compilation, assetPrefix) ??
                true
              : undefined;

          const virtualManifestPath =
            'static/js/virtual/react-router/browser-manifest.js';
          if (compilation.assets[virtualManifestPath]) {
            const originalSource = compilation.assets[virtualManifestPath]
              .source()
              .toString();
            const newSource = originalSource.replace(
              /["'`]PLACEHOLDER["'`]/,
              jsesc(manifestForBrowser, { es6: true })
            );
            compilation.assets[virtualManifestPath] = {
              source: () => newSource,
              size: () => newSource.length,
              map: () => ({
                version: 3,
                sources: [virtualManifestPath],
                names: [],
                mappings: '',
                file: virtualManifestPath,
                sourcesContent: [newSource],
              }),
              sourceAndMap: () => ({
                source: newSource,
                map: {
                  version: 3,
                  sources: [virtualManifestPath],
                  names: [],
                  mappings: '',
                  file: virtualManifestPath,
                  sourcesContent: [newSource],
                },
              }),
              updateHash: hash => hash.update(newSource),
              buffer: () => Buffer.from(newSource),
            };
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
            compilation.assets[manifestPath] = new rspack.sources.RawSource(
              manifestSource
            );
          }

          options?.onManifest?.(manifestForBrowser, sri);
          callback();
        }
      );
    },
  };
}
