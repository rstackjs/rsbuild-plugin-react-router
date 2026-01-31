import { createHash } from 'node:crypto';
import type { Route, PluginOptions } from './types.js';
import { rspack } from '@rsbuild/core';
import type { Rspack } from '@rsbuild/core';
import {
  getReactRouterManifestForDev,
  getReactRouterManifestPath,
} from './manifest.js';
import { combineURLs } from './plugin-utils.js';
import jsesc from 'jsesc';

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
    onManifest?: (
      manifest: Awaited<ReturnType<typeof getReactRouterManifestForDev>>,
      sri: Record<string, string> | undefined
    ) => void;
  }
) {
  return {
    apply(compiler: Rspack.Compiler): void {
      compiler.hooks.emit.tapAsync(
        'ModifyBrowserManifest',
        async (compilation: Rspack.Compilation, callback) => {
          const manifest = await getReactRouterManifestForDev(
            routes,
            pluginOptions,
            compilation.getStats().toJson(),
            appDirectory,
            assetPrefix,
            routeChunkOptions
          );

          const virtualManifestPath =
            'static/js/virtual/react-router/browser-manifest.js';
          if (compilation.assets[virtualManifestPath]) {
            const originalSource = compilation.assets[virtualManifestPath]
              .source()
              .toString();
            const newSource = originalSource.replace(
              /["'`]PLACEHOLDER["'`]/,
              jsesc(manifest, { es6: true })
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
            const manifestPath = getReactRouterManifestPath(
              manifest.version,
              true
            );
            const manifestSource = `window.__reactRouterManifest=${jsesc(
              manifest,
              { es6: true }
            )};`;
            compilation.assets[manifestPath] = new rspack.sources.RawSource(
              manifestSource
            );
          }

          let sri: Record<string, string> | undefined;
          if (
            routeChunkOptions?.isBuild &&
            options?.future?.unstable_subResourceIntegrity
          ) {
            const assets =
              typeof compilation.getAssets === 'function'
                ? compilation.getAssets()
                : Object.entries(compilation.assets).map(([name, asset]) => ({
                    name,
                    source: asset,
                  }));
            sri = {};
            for (const asset of assets) {
              if (!asset.name.endsWith('.js')) {
                continue;
              }
              const source = asset.source.source().toString();
              const hash = createHash('sha384')
                .update(source)
                .digest('base64');
              sri[combineURLs(assetPrefix, asset.name)] = `sha384-${hash}`;
            }
          }

          options?.onManifest?.(manifest, sri);
          callback();
        }
      );
    },
  };
}
