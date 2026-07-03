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

export const getPackageVersion = (
  packageName: string,
  resolvePackagePath: (
    specifier: string
  ) => string | undefined = resolveAppPackagePath
): string | undefined => {
  const packageJsonPath = resolvePackagePath(`${packageName}/package.json`);
  if (!packageJsonPath) {
    return undefined;
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: unknown;
    };
    return typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined;
  } catch {
    return undefined;
  }
};

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

export function stripFileExtension(file: string): string {
  return file.replace(/\.[^/.]+$/, '');
}

export function createRouteId(file: string): string {
  return normalize(stripFileExtension(file));
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
