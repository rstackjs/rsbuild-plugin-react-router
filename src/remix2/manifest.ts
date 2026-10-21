import { createHash } from 'node:crypto';
import type { Rspack } from '@rsbuild/core';
import {
  createReactRouterManifestStats,
  createChunkAssetResolver,
} from '../manifest-assets.js';
import type { Remix2RouteAnalysis } from './route-transform.js';
import type {
  Remix2Assets,
  Remix2AssetsManifest,
  Remix2ManifestDraft,
  Remix2PluginOptions,
  ResolvedRemix2Config,
} from './types.js';

export function remix2RouteEntry(id: string): string {
  return `route-${Buffer.from(id).toString('hex')}`;
}

export async function createRemix2Manifest(
  compilation: Rspack.Compilation,
  config: ResolvedRemix2Config,
  analyses: ReadonlyMap<string, Remix2RouteAnalysis>,
  transform?: Remix2PluginOptions['transformManifest']
): Promise<Remix2AssetsManifest> {
  const resolveAssets = createChunkAssetResolver(
    createReactRouterManifestStats(compilation),
    true
  );
  const url = (file: string) => config.publicPath + file;
  const assets = (name: string): Remix2Assets => {
    const { js, css } = resolveAssets(name);
    return {
      module: url(js[0]),
      imports: js.slice(1).map(url),
      ...(css.length ? { css: css.map(url) } : {}),
    };
  };
  let draft: Remix2ManifestDraft = {
    entry: assets('entry.client'),
    routes: Object.fromEntries(
      Object.values(config.routes).map(route => {
        const analysis = analyses.get(route.id);
        if (!analysis)
          throw new Error(`[remix2] Missing route analysis for ${route.id}`);
        const { file: _file, ...metadata } = route;
        return [
          route.id,
          {
            ...metadata,
            ...assets(remix2RouteEntry(route.id)),
            hasLoader: analysis.serverExports.includes('loader'),
            hasAction: analysis.serverExports.includes('action'),
            hasClientLoader: analysis.clientExports.includes('clientLoader'),
            hasClientAction: analysis.clientExports.includes('clientAction'),
            hasErrorBoundary: analysis.clientExports.includes('ErrorBoundary'),
          },
        ];
      })
    ),
  };
  if (transform) draft = await transform(draft);
  for (const route of Object.values(config.routes)) {
    const analysis = analyses.get(route.id)!;
    const metadata = draft.routes[route.id];
    if (
      !metadata ||
      metadata.hasLoader !== analysis.serverExports.includes('loader') ||
      metadata.hasAction !== analysis.serverExports.includes('action') ||
      metadata.hasClientLoader !==
        analysis.clientExports.includes('clientLoader') ||
      metadata.hasClientAction !==
        analysis.clientExports.includes('clientAction')
    ) {
      throw new Error(
        `[remix2] Manifest transforms must retain analyzed export flags for ${route.id}.`
      );
    }
  }
  const version = createHash('sha256')
    .update(JSON.stringify(draft))
    .digest('hex')
    .slice(0, 16);
  return { ...draft, version, url: url(`manifest-${version}.js`) };
}
