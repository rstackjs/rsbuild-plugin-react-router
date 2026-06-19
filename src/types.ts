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
   * @default false
   */
  lazyCompilation?: NonNullable<RsbuildConfig['dev']>['lazyCompilation'];

  /**
   * Emit structured React Router plugin timing logs.
   * @default false
   */
  logPerformance?: boolean;

  /**
   * Run route transforms in a worker-thread pool.
   * Pass `false` to disable or `{ maxWorkers }` to override the default worker count.
   * @default true, inline for small route graphs or low-core CPUs; otherwise `available CPUs - 2`, capped at 8 workers or 10 for split builds with 1024+ routes.
   */
  parallelTransforms?:
    | boolean
    | {
        maxWorkers?: number;
      };
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
