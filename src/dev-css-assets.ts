import { createHash } from 'node:crypto';
import type { Rspack } from '@rsbuild/core';
import {
  getManifestAssetType,
  type ReactRouterManifestStats,
} from './manifest-assets.js';

export const stripDevCssVersion = (url: string): string =>
  url.replace(/\.__react_router_css_[a-f0-9]{64}\.css(?=[?#]|$)/, '');

export const versionDevCssAssets = (
  compilation: Pick<Rspack.Compilation, 'getAsset' | 'emitAsset'>,
  stats: ReactRouterManifestStats
): void => {
  const names = new Set([
    ...Object.values(stats.assetsByChunkName ?? {}).flat(),
    ...Object.values(stats.entrypointFilesByName ?? {}).flat(),
  ]);
  const urls: Record<string, string> = {};
  for (const name of names) {
    if (getManifestAssetType(name, stats.assetTypesByName) !== 'css') continue;
    const asset = compilation.getAsset(name);
    if (!asset) throw new Error(`[react-router] Missing CSS asset ${name}`);
    // Asset metadata can predate processAssets transforms; version final bytes.
    const version = createHash('sha256')
      .update(asset.source.buffer())
      .digest('hex');
    const bareName = name.replace(/[?#].*$/, '');
    const alias = `${bareName}.__react_router_css_${version}.css`;
    // A distinct path keeps Rspack HMR from removing React-owned links.
    // The same directory preserves relative CSS URLs. Development output
    // retention keeps old manifest URLs serving their original bytes.
    if (!compilation.getAsset(alias)) {
      compilation.emitAsset(alias, asset.source, asset.info);
    }
    urls[name] = alias + name.slice(bareName.length);
  }
  stats.cssUrlsByName = urls;
};
