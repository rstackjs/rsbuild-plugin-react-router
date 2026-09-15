import { DEFAULT_JS_DIST_PATH } from './constants.js';

export type ReactRouterManifestStats = {
  assetsByChunkName?: Record<string, string[]>;
  entrypointFilesByName?: Record<string, string[]>;
  assetTypesByName?: Record<string, string>;
};

type ManifestStatsChunk = {
  files?: Iterable<string>;
};
type ManifestStatsEntrypoint = {
  getFiles?: () => Iterable<string>;
};
type ManifestStatsLookup<T> = Iterable<[string, T | null | undefined]> & {
  get?: (name: string) => T | null | undefined;
};
type ManifestStatsCompilation = {
  namedChunks: ManifestStatsLookup<ManifestStatsChunk>;
  entrypoints?: ManifestStatsLookup<ManifestStatsEntrypoint>;
  getAsset?: (name: string) => {
    name?: string;
    info?: { assetType?: string; javascriptModule?: boolean };
  } | void;
};

export const stripAssetQuery = (name: string): string =>
  name.replace(/[?#].*$/, '');

export const getManifestAssetType = (
  name: string,
  assetTypesByName?: Readonly<Record<string, string>>
): string | undefined => {
  if (/\.hot-update\.[cm]?js(?:[?#]|$)/.test(name)) return undefined;
  const assetType = assetTypesByName?.[name];
  if (assetType !== undefined) {
    return assetType === 'extract-css' ? 'css' : assetType;
  }

  // Synthetic stats and older bundlers may not supply asset metadata.
  const path = stripAssetQuery(name);
  if (/\.[cm]?js$/.test(path)) {
    return 'javascript';
  }
  return path.endsWith('.css') ? 'css' : undefined;
};

const orderChunkFiles = (
  chunkName: string,
  files: string[],
  assetTypesByName: Record<string, string>
): string[] => {
  const ownFileIndex = files.findIndex(
    file =>
      getManifestAssetType(file, assetTypesByName) === 'javascript' &&
      stripAssetQuery(file)
        .replace(/\.[^.]+$/, '')
        .endsWith(chunkName)
  );
  if (ownFileIndex <= 0) {
    return files;
  }
  return [
    files[ownFileIndex],
    ...files.slice(0, ownFileIndex),
    ...files.slice(ownFileIndex + 1),
  ];
};

const collectManifestFilesByName = <T>(
  items: ManifestStatsLookup<T>,
  names: ReadonlySet<string> | undefined,
  getFiles: (item: T) => string[]
): Record<string, string[]> => {
  const filesByName: Record<string, string[]> = {};
  if (!names) {
    for (const [name, item] of items) {
      if (item == null) continue;
      filesByName[name] = getFiles(item);
    }
    return filesByName;
  }

  const missingNames = new Set(names);
  if (typeof items.get === 'function') {
    for (const name of names) {
      const item = items.get(name);
      if (!item) {
        continue;
      }
      if (item == null) continue;
      filesByName[name] = getFiles(item);
      missingNames.delete(name);
    }
  }
  if (missingNames.size === 0) {
    return filesByName;
  }

  for (const [name, item] of items) {
    if (!missingNames.has(name)) {
      continue;
    }
    if (item == null) continue;
    filesByName[name] = getFiles(item);
    missingNames.delete(name);
    if (missingNames.size === 0) {
      break;
    }
  }
  return filesByName;
};

export const createReactRouterManifestStats = (
  compilation: ManifestStatsCompilation | undefined,
  chunkNames?: ReadonlySet<string>
): ReactRouterManifestStats | undefined => {
  if (!compilation) {
    return undefined;
  }

  const assetsByChunkName = collectManifestFilesByName(
    compilation.namedChunks,
    chunkNames,
    chunk => Array.from(chunk.files ?? [])
  );
  const entrypointFilesByName = compilation.entrypoints
    ? collectManifestFilesByName(
        compilation.entrypoints,
        chunkNames,
        entrypoint => Array.from(entrypoint.getFiles?.() ?? [])
      )
    : {};
  const assetTypesByName: Record<string, string> = {};
  if (compilation.getAsset) {
    const files = new Set([
      ...Object.values(assetsByChunkName).flat(),
      ...Object.values(entrypointFilesByName).flat(),
    ]);
    for (const file of files) {
      const info = compilation.getAsset(file)?.info;
      const assetType =
        info?.assetType ??
        (typeof info?.javascriptModule === 'boolean'
          ? 'javascript'
          : undefined);
      if (assetType !== undefined) {
        assetTypesByName[file] = assetType;
      }
    }
  }
  for (const [chunkName, files] of Object.entries(assetsByChunkName)) {
    assetsByChunkName[chunkName] = orderChunkFiles(
      chunkName,
      files,
      assetTypesByName
    );
  }

  return {
    assetsByChunkName,
    ...(Object.keys(entrypointFilesByName).length > 0
      ? { entrypointFilesByName }
      : {}),
    ...(Object.keys(assetTypesByName).length > 0 ? { assetTypesByName } : {}),
  };
};

type ChunkAssets = { js: string[]; css: string[] };

export const createChunkAssetResolver = (
  clientStats: ReactRouterManifestStats | undefined,
  includeEntrypointJavaScript: boolean
): ((chunkName: string) => ChunkAssets) => {
  const chunkAssetsByName = new Map<string, ChunkAssets>();
  const getAssetType = (name: string) =>
    getManifestAssetType(name, clientStats?.assetTypesByName);

  return (chunkName: string): ChunkAssets => {
    const cached = chunkAssetsByName.get(chunkName);
    if (cached) {
      return cached;
    }
    const assets = clientStats?.assetsByChunkName?.[chunkName];
    if (!assets) {
      const result = {
        js: [`${DEFAULT_JS_DIST_PATH}/${chunkName}.js`],
        css: [],
      };
      chunkAssetsByName.set(chunkName, result);
      return result;
    }

    const cssAssets = new Set<string>();
    const jsAssets: string[] = [];
    for (const asset of assets) {
      const assetType = getAssetType(asset);
      if (assetType === 'css') {
        cssAssets.add(asset);
      } else if (assetType === 'javascript') {
        jsAssets.push(asset);
      }
    }

    if (jsAssets.length === 0) {
      throw new Error(
        `[react-router] Chunk "${chunkName}" emitted no JavaScript asset the browser manifest can reference (files: ${assets.join(', ') || 'none'}). Check the web \`output.filename.js\` scheme.`
      );
    }
    // Entrypoint files contain the synchronous chunk group, not async children.
    // Keep the route's own module first even when the runtime is listed first.
    for (const asset of clientStats?.entrypointFilesByName?.[chunkName] ?? []) {
      const assetType = getAssetType(asset);
      if (assetType === 'css') {
        cssAssets.add(asset);
      } else if (includeEntrypointJavaScript && assetType === 'javascript') {
        jsAssets.push(asset);
      }
    }

    const result = {
      js: [...new Set(jsAssets)],
      css: [...cssAssets],
    };
    chunkAssetsByName.set(chunkName, result);
    return result;
  };
};
