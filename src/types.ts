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
   * Rsbuild dev-only lazy compilation behavior.
   *
   * React Router's browser manifest remains eager so initial dev requests can
   * discover browser assets without lazy proxy delays.
   *
   * Pass `false` to disable.
   * @default true
   */
  lazyCompilation?: NonNullable<RsbuildConfig['dev']>['lazyCompilation'];

  /**
   * Prewarm Rspack lazy-compilation proxy modules after dev compiles.
   * This only runs when lazy compilation is enabled and is disabled by default.
   *
   * @default false
   */
  lazyCompilationPrewarm?:
    | boolean
    | {
        /**
         * Include the browser entry module in the prewarm request.
         * @default true
         */
        entry?: boolean;
        /**
         * Include route modules in the prewarm request. Pass a number to cap
         * the number of route assets or an array of route IDs to target.
         * @default true
         */
        routes?: boolean | number | string[];
        /**
         * Delay prewarming after a dev compile so higher-priority startup work
         * can settle first.
         * @default 0
         */
        delayMs?: number;
        /**
         * Override the Rspack lazy-compilation trigger prefix.
         * @default "/_rspack/lazy/trigger"
         */
        triggerPrefix?: string;
      };

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
