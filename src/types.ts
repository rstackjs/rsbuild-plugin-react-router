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
   * When omitted, React Router's `serverModuleFormat` selects the emitted
   * Rsbuild format (`"esm"` -> `"module"`, `"cjs"` -> `"commonjs"`).
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
   * This depends on Rspack's generated lazy-compilation client shape and should
   * be treated as experimental.
   *
   * @default false
   */
  unstableLazyCompilationPrewarm?: boolean;

  /**
   * Emit structured React Router plugin timing logs.
   * @default false
   */
  logPerformance?: boolean;

  /**
   * Run route transforms in a worker-thread pool.
   * Pass `true` to force the default worker count, a positive integer to set
   * the worker count, or `false` to disable.
   * @default Automatically enabled for 256+ resolved routes. The automatic
   * pool uses available CPU cores minus 2.
   */
  parallelRouteTransform?: boolean | number;

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
