import { normalize } from 'pathe';
import { existsSync } from 'node:fs';
import { JS_EXTENSIONS } from './constants.js';

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
    import { createElement as h } from "react";
    import { useActionData, useLoaderData, useMatches, useParams, useRouteError } from "react-router";

    export function withComponentProps(Component) {
      return function Wrapped() {
        const props = {
          params: useParams(),
          loaderData: useLoaderData(),
          actionData: useActionData(),
          matches: useMatches(),
        };
        return h(Component, props);
      };
    }

    export function withHydrateFallbackProps(HydrateFallback) {
      return function Wrapped() {
        const props = {
          params: useParams(),
        };
        return h(HydrateFallback, props);
      };
    }

    export function withErrorBoundaryProps(ErrorBoundary) {
      return function Wrapped() {
        const props = {
          params: useParams(),
          loaderData: useLoaderData(),
          actionData: useActionData(),
          error: useRouteError(),
        };
        return h(ErrorBoundary, props);
      };
    }
  `;
}

export {
  invalidDestructureError,
  removeExports,
  removeUnusedImports,
  validateDestructuredExports,
} from './route-export-pruning.js';
export { transformRoute } from './route-component-transform.js';
