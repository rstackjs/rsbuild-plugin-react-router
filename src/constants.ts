export const PLUGIN_NAME = 'rsbuild:react-router';

/** Default web `output.distPath.js` segment when the user has not customized it. */
export const DEFAULT_JS_DIST_PATH = 'static/js';

export const JS_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mjs',
  '.mts',
] as const;

export const JS_LOADERS = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.jsx': 'jsx',
  '.mjs': 'js',
  '.mts': 'ts',
} as const;

export const BUILD_CLIENT_ROUTE_QUERY_STRING =
  '?__react-router-build-client-route';

export const SERVER_ONLY_ROUTE_EXPORTS = [
  'loader',
  'action',
  'middleware',
  'headers',
] as const;

export const SERVER_ONLY_ROUTE_EXPORTS_SET: ReadonlySet<string> = new Set(
  SERVER_ONLY_ROUTE_EXPORTS
);

export const CLIENT_NON_COMPONENT_EXPORTS = [
  'clientAction',
  'clientLoader',
  'clientMiddleware',
  'handle',
  'meta',
  'links',
  'shouldRevalidate',
] as const;

export const CLIENT_COMPONENT_EXPORTS = [
  'default',
  'ErrorBoundary',
  'HydrateFallback',
  'Layout',
] as const;

export const CLIENT_ROUTE_EXPORTS: readonly (
  | (typeof CLIENT_NON_COMPONENT_EXPORTS)[number]
  | (typeof CLIENT_COMPONENT_EXPORTS)[number]
)[] = [...CLIENT_NON_COMPONENT_EXPORTS, ...CLIENT_COMPONENT_EXPORTS];

export const CLIENT_ROUTE_EXPORTS_SET: ReadonlySet<string> = new Set(
  CLIENT_ROUTE_EXPORTS
);

export const NAMED_COMPONENT_EXPORTS = [
  'HydrateFallback',
  'ErrorBoundary',
] as const;

export const NAMED_COMPONENT_EXPORTS_SET: ReadonlySet<string> = new Set(
  NAMED_COMPONENT_EXPORTS
);

export const SERVER_EXPORTS = {
  loader: 'loader',
  action: 'action',
  middleware: 'middleware',
  headers: 'headers',
} as const;

export const CLIENT_EXPORTS = {
  clientAction: 'clientAction',
  clientLoader: 'clientLoader',
  clientMiddleware: 'clientMiddleware',
  default: 'default',
  ErrorBoundary: 'ErrorBoundary',
  handle: 'handle',
  HydrateFallback: 'HydrateFallback',
  Layout: 'Layout',
  links: 'links',
  meta: 'meta',
  shouldRevalidate: 'shouldRevalidate',
} as const;

// SPA-mode prerender fallback document, served when no prerendered page matches.
export const SPA_FALLBACK_HTML_FILE = '__spa-fallback.html';
