import type { RsbuildConfig } from '@rsbuild/core';

export type Route = {
  id: string;
  parentId?: string;
  file: string;
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  children?: Route[];
};

export type PluginOptions = {
  /**
   * Whether to disable automatic middleware setup for custom server implementation.
   * Use this when you want to handle server setup manually.
   * @default false
   */
  customServer?: boolean;

  /**
   * The output format for server builds.
   * When set to "module", no package.json will be emitted.
   * @default "module"
   */
  serverOutput?: 'module' | 'commonjs';

  /**
   * Federation mode configuration
   */
  federation?: boolean;

  /**
   * Opt in to Rsbuild's dev-only lazy compilation behavior.
   *
   * React Router hydration modules remain eager so initial dev requests can
   * load the browser manifest and route modules without lazy proxy delays.
   *
   * @default undefined
   */
  lazyCompilation?: NonNullable<RsbuildConfig['dev']>['lazyCompilation'];

  /**
   * Emit structured React Router plugin timing logs.
   * @default false
   */
  logPerformance?: boolean;

  /**
   * Run route transforms in a worker-thread pool.
   * Pass `false` to disable or an integer to override the default worker count.
   * @default undefined. The default uses a bounded worker count when spare CPU
   * cores are available.
   */
  parallelTransforms?: false | number;

  /**
   * Called when the route graph changes during development.
   * Programmatic/custom servers can use this to recreate their Rsbuild server;
   * the CLI uses its built-in reload-server watcher when this is omitted. This
   * notification is not awaited, so it may safely close the current server.
   */
  onRouteTopologyChange?: () => void | Promise<void>;
};

export type RouteManifestItem = Omit<Route, 'file' | 'children'> & {
  module: string;
  clientActionModule?: string;
  clientLoaderModule?: string;
  clientMiddlewareModule?: string;
  hydrateFallbackModule?: string;
  hasAction: boolean;
  hasLoader: boolean;
  hasClientAction: boolean;
  hasClientLoader: boolean;
  hasClientMiddleware: boolean;
  hasDefaultExport: boolean;
  hasErrorBoundary: boolean;
  imports: string[];
  css: string[];
};
