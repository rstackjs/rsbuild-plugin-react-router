import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'pathe';

/**
 * Relocation of server-only static assets to the client build.
 *
 * In React Router framework mode a route's server-only code (a loader or a
 * `.server` module) can import an asset — for example
 * `import txtUrl from "./file.txt?url"` or a `.css?url` file. The imported URL
 * is returned to the client (e.g. as loader data) and fetched from the client
 * build directory at runtime, so the asset file must exist under
 * `build/client` even though only the node/server compilation referenced it.
 *
 * Rspack emits these assets into the server output (`build/server/static/...`)
 * and never into the client output. This module mirrors upstream React
 * Router's Vite plugin, which internally enables `ssrEmitAssets` and then, in
 * the SSR `writeBundle` hook, moves server-emitted static assets into the
 * client assets directory and strips them from the server build
 * (`react-router-dev/vite/plugin.ts`). Here the equivalent runs inside the
 * node compilation's `processAssets` hook: static assets are written into the
 * client output at the same public path and deleted from the server
 * compilation so the server build never ships duplicate static files.
 */

/**
 * The subset of an Rspack asset info that identifies static assets emitted by
 * asset modules (`asset/resource`) and the CSS pipeline.
 */
export interface RelocatableAssetInfo {
  /**
   * Set by Rspack for assets produced from a source module (asset modules and
   * extracted CSS). JavaScript chunks and generated files such as
   * `package.json` do not carry a `sourceFilename`.
   */
  sourceFilename?: string;
  /**
   * Set for JavaScript chunk assets. Static assets never set this, so it is
   * used to keep code-split JS in the server build.
   */
  javascriptModule?: boolean;
}

/**
 * The minimal compilation surface needed to collect and relocate assets. Kept
 * narrow so the logic can be unit-tested without a real Rspack compilation.
 */
export interface RelocatableAssetCompilation {
  assets: Record<string, unknown>;
  getAsset(name: string):
    | {
        name: string;
        source: { buffer(): Buffer };
        info: RelocatableAssetInfo;
      }
    | undefined
    | void;
  deleteAsset(name: string): void;
}

export interface CollectedServerAsset {
  /** The public path of the asset, relative to the compilation output root. */
  name: string;
  source: { buffer(): Buffer };
}

/**
 * Determine whether an emitted asset is a static asset that must live in the
 * client build. Static assets (asset modules and CSS) carry a `sourceFilename`
 * and are not JavaScript chunks. Code-split JavaScript is intentionally
 * excluded so it remains in the server build.
 */
export const isRelocatableServerAsset = (
  info: RelocatableAssetInfo | undefined
): boolean => Boolean(info?.sourceFilename) && !info?.javascriptModule;

/**
 * Collect the server-only static assets from a node compilation. Returns them
 * in stable (sorted) order so callers and tests see deterministic output.
 */
export const collectRelocatableServerAssets = (
  compilation: RelocatableAssetCompilation
): CollectedServerAsset[] => {
  const collected: CollectedServerAsset[] = [];
  for (const name of Object.keys(compilation.assets)) {
    const asset = compilation.getAsset(name);
    if (!asset) {
      continue;
    }
    if (!isRelocatableServerAsset(asset.info)) {
      continue;
    }
    collected.push({ name, source: asset.source });
  }
  collected.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return collected;
};

export interface RelocateServerAssetsResult {
  /** Assets written into the client output because they were missing or stale. */
  written: string[];
  /**
   * Assets that already existed in the client output. They are still removed
   * from the server build but not rewritten.
   */
  skipped: string[];
}

/**
 * Move server-only static assets into the client output and strip them from
 * the server compilation.
 *
 * For each static asset: if it is missing or stale in the client output at the
 * same public path, write it there; then delete it from the server compilation
 * regardless. This mirrors upstream's move/remove behavior — the server build
 * never ships static assets, and the client build gains fresh server-only
 * assets.
 */
const digestBuffer = (buffer: Buffer): string =>
  createHash('sha256').update(buffer).digest('hex');

export const relocateServerAssetsToClient = async ({
  compilation,
  outputClientPath,
  relocatedDestinations,
  existsSyncFn = existsSync,
  mkdirFn = (dir: string) => mkdir(dir, { recursive: true }),
  readFileFn = readFile,
  renameFn = rename,
  rmFn = rm,
  writeFileFn = writeFile,
}: {
  compilation: RelocatableAssetCompilation;
  outputClientPath: string;
  /**
   * Destination content digests already handled by a previous compilation
   * (dev rebuilds, serverBundles). Stable dev filenames can carry changed
   * bytes, so the cache is keyed by path and digest rather than path alone.
   */
  relocatedDestinations?: Map<string, string>;
  existsSyncFn?: (path: string) => boolean;
  mkdirFn?: (dir: string) => Promise<unknown>;
  readFileFn?: (path: string) => Promise<Buffer>;
  renameFn?: (oldPath: string, newPath: string) => Promise<void>;
  rmFn?: (path: string, options: { force: true }) => Promise<void>;
  writeFileFn?: (path: string, data: Buffer) => Promise<void>;
}): Promise<RelocateServerAssetsResult> => {
  const assets = collectRelocatableServerAssets(compilation);
  const written: string[] = [];
  const skipped: string[] = [];

  for (const asset of assets) {
    const destination = join(outputClientPath, asset.name);
    const sourceBuffer = asset.source.buffer();
    const sourceDigest = digestBuffer(sourceBuffer);
    const cachedDigest = relocatedDestinations?.get(destination);
    if (cachedDigest === sourceDigest) {
      skipped.push(asset.name);
    } else {
      let existingDigest: string | undefined;
      if (existsSyncFn(destination)) {
        existingDigest = digestBuffer(await readFileFn(destination));
      }
      if (existingDigest === sourceDigest) {
        skipped.push(asset.name);
      } else {
        await mkdirFn(dirname(destination));
        const temporaryDestination = `${destination}.tmp-${process.pid}-${Date.now()}`;
        await writeFileFn(temporaryDestination, sourceBuffer);
        try {
          await renameFn(temporaryDestination, destination);
        } catch (error) {
          await rmFn(temporaryDestination, { force: true });
          throw error;
        }
        written.push(asset.name);
      }
    }
    relocatedDestinations?.set(destination, sourceDigest);
    // Remove the static asset from the server build so it is not shipped
    // twice. Code-split JavaScript is not collected, so it stays.
    compilation.deleteAsset(asset.name);
  }

  return { written, skipped };
};
