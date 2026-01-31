export const PLUGIN_NAME = 'rsbuild:react-router';

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

// Client route exports are split into non-component exports and component exports.
// This mirrors upstream React Router Vite plugin intent and is used for export filtering.
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

export const NAMED_COMPONENT_EXPORTS = [
  'HydrateFallback',
  'ErrorBoundary',
] as const;

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
