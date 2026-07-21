import { normalize, resolve } from 'pathe';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { JS_EXTENSIONS } from './constants.js';

const requireFromApp = createRequire(resolve(process.cwd(), 'package.json'));

export const resolveAppPackagePath = (
  specifier: string
): string | undefined => {
  try {
    return requireFromApp.resolve(specifier);
  } catch {
    return undefined;
  }
};

export const parseVersionMajorMinor = (
  version: string | undefined
): { major: number; minor: number } | undefined => {
  const match = version?.match(/^(\d+)\.(\d+)\./);
  if (!match) {
    return undefined;
  }
  return { major: Number(match[1]), minor: Number(match[2]) };
};

const packageVersionCache = new Map<string, string | undefined>();

export const getPackageVersion = (
  packageName: string,
  resolvePackagePath: (
    specifier: string
  ) => string | undefined = resolveAppPackagePath
): string | undefined => {
  // Only default resolution is cached; injected resolvers (tests) stay live.
  const cacheable = resolvePackagePath === resolveAppPackagePath;
  if (cacheable && packageVersionCache.has(packageName)) {
    return packageVersionCache.get(packageName);
  }
  const packageJsonPath = resolvePackagePath(`${packageName}/package.json`);
  if (!packageJsonPath) {
    return undefined;
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: unknown;
    };
    const version =
      typeof packageJson.version === 'string' ? packageJson.version : undefined;
    if (cacheable) {
      packageVersionCache.set(packageName, version);
    }
    return version;
  } catch {
    if (cacheable) {
      packageVersionCache.set(packageName, undefined);
    }
    return undefined;
  }
};

export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

export function combineURLs(baseURL: string, relativeURL: string): string {
  return relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL;
}

export function normalizeAssetPrefix(assetPrefix?: string): string {
  if (!assetPrefix || assetPrefix === 'auto') {
    return '/';
  }
  return assetPrefix.endsWith('/') ? assetPrefix : `${assetPrefix}/`;
}

/**
 * Resolve the asset prefix Rsbuild applies to emitted asset URLs for the given
 * mode. In development the effective prefix is `dev.assetPrefix` (which Rsbuild
 * defaults from `server.base`, falling back to `output.assetPrefix`); in a
 * production build it is `output.assetPrefix`. Both fields are already resolved
 * on the normalized config, so this mirrors Rsbuild's own precedence rather than
 * re-deriving it from `server.base`.
 *
 * `dev.assetPrefix` may be a boolean on the raw config (`false` disables it);
 * boolean/`'auto'`/empty values normalize to the root prefix `'/'`.
 */
export function resolveEffectiveAssetPrefix(config: {
  dev?: { assetPrefix?: unknown };
  output?: { assetPrefix?: unknown };
  isBuild: boolean;
}): string {
  const outputPrefix =
    typeof config.output?.assetPrefix === 'string'
      ? config.output.assetPrefix
      : undefined;
  if (config.isBuild) {
    return normalizeAssetPrefix(outputPrefix);
  }
  const devPrefix =
    typeof config.dev?.assetPrefix === 'string'
      ? config.dev.assetPrefix
      : undefined;
  return normalizeAssetPrefix(devPrefix ?? outputPrefix);
}

export function createRouteId(file: string): string {
  return normalize(file.replace(/\.[^/.]+$/, ''));
}

export function findEntryFile(basePath: string): string {
  for (const ext of JS_EXTENSIONS) {
    const filePath = `${basePath}${ext}`;
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return `${basePath}.tsx`;
}

export function generateWithProps() {
  return `
    import {
      UNSAFE_withComponentProps,
      UNSAFE_withErrorBoundaryProps,
      UNSAFE_withHydrateFallbackProps,
    } from "react-router";

    export const withComponentProps = UNSAFE_withComponentProps;
    export const withHydrateFallbackProps = UNSAFE_withHydrateFallbackProps;
    export const withErrorBoundaryProps = UNSAFE_withErrorBoundaryProps;
  `;
}

export {
  invalidDestructureError,
  removeExports,
  removeUnusedImports,
  validateDestructuredExports,
} from './route-export-pruning.js';
export { transformRoute } from './route-component-transform.js';
