import { readFileSync } from 'node:fs';
import type { RsbuildEntryDescription, RsbuildPluginAPI } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { resolve } from 'pathe';
import {
  getBuildManifest,
  getRoutesByServerBundleId,
} from './build-manifest.js';
import { BUILD_CLIENT_ROUTE_QUERY_STRING } from './constants.js';
import {
  DEV_HMR_RUNTIME_MODULE_ID,
  type DevHmrPlanOptions,
} from './dev-hmr.js';
import {
  createReactRouterDevRuntimeController,
  type ReactRouterDevRuntimeController,
} from './dev-runtime-controller.js';
import { generateWithProps } from './plugin-utils.js';
import { resolvePrerenderPaths } from './prerender.js';
import { generateServerBuild } from './server-utils.js';
import {
  createReactRouterServerBuildPlan,
  type ReactRouterServerBundleEntry,
} from './server-build-plan.js';
import {
  getRouteChunkEntryName,
  getRouteChunkModuleId,
  routeChunkExportNames,
} from './route-chunks.js';
import type { Config } from './react-router-config.js';
import type { Route } from './types.js';

type CreateClassicWebRouteEntriesOptions = {
  appDirectory: string;
  isBuild: boolean;
  routes: Record<string, Route>;
  splitRouteModules: boolean;
};

type CreateClassicVirtualModulesOptions = {
  allowedActionOrigins: string[] | undefined;
  appDirectory: string;
  assetsBuildDirectory: string;
  basename: string;
  devHmrRuntimeModule?: string;
  entryServerPath: string;
  future: Config['future'];
  prerenderPaths: string[];
  publicPath: string;
  routeDiscovery: Config['routeDiscovery'];
  routes: Record<string, Route>;
  routesByServerBundleId: Record<string, Record<string, Route>>;
  ssr: boolean;
};

type CreateClassicBuildArtifactsOptions = {
  api: RsbuildPluginAPI;
  defaultEntryName: string;
  isBuild: boolean;
  prerenderConfig: Config['prerender'];
  reactRouterConfig: Required<
    Pick<
      Config,
      'appDirectory' | 'buildDirectory' | 'serverBuildFile' | 'future'
    >
  > &
    Pick<Config, 'serverBundles'>;
  routeConfig: RouteConfigEntry[];
  routes: Record<string, Route>;
  rootDirectory: string;
  ssr: boolean;
  devHmr?: DevHmrPlanOptions;
};

export type ClassicBuildArtifacts = {
  buildManifest: Awaited<ReturnType<typeof getBuildManifest>>;
  devRuntime: ReactRouterDevRuntimeController;
  prerenderPaths: string[];
  routesByServerBundleId: Record<string, Record<string, Route>>;
  serverBundleEntries: ReactRouterServerBundleEntry[];
};

export const createClassicBuildArtifacts = async ({
  api,
  defaultEntryName,
  isBuild,
  prerenderConfig,
  reactRouterConfig,
  routeConfig,
  routes,
  rootDirectory,
  ssr,
  devHmr,
}: CreateClassicBuildArtifactsOptions): Promise<ClassicBuildArtifacts> => {
  const buildManifest = await getBuildManifest({
    reactRouterConfig,
    routes,
    rootDirectory,
  });
  const routesByServerBundleId = getRoutesByServerBundleId(
    buildManifest,
    routes
  );
  const serverBuildPlan = createReactRouterServerBuildPlan({
    routesByServerBundleId,
    serverBuildFile: reactRouterConfig.serverBuildFile,
    defaultEntryName,
  });
  const prerenderPaths = await resolvePrerenderPaths(
    prerenderConfig,
    ssr,
    routeConfig,
    {
      logWarning: true,
      warn: message => api.logger.warn(message),
    }
  );

  return {
    buildManifest,
    devRuntime: createReactRouterDevRuntimeController({
      api,
      isBuild,
      buildPlan: serverBuildPlan,
      clientPatchesRouteMetadata: devHmr?.enabled,
      onNodeRebuildCommitted: devHmr?.onNodeRebuildCommitted,
    }),
    prerenderPaths,
    routesByServerBundleId,
    serverBundleEntries: serverBuildPlan.serverBundleEntries,
  };
};

export const createClassicWebRouteEntries = ({
  appDirectory,
  isBuild,
  routes,
  splitRouteModules,
}: CreateClassicWebRouteEntriesOptions): {
  manifestChunkNames: Set<string>;
  webRouteEntries: Record<string, RsbuildEntryDescription>;
} => {
  const manifestChunkNames = new Set<string>(['entry.client']);
  const webRouteEntries = Object.values(routes).reduce(
    (acc, route) => {
      const entryName = route.file.slice(0, route.file.lastIndexOf('.'));
      const routeFilePath = resolve(appDirectory, route.file);
      manifestChunkNames.add(entryName);
      acc[entryName] = {
        import: `${routeFilePath}${BUILD_CLIENT_ROUTE_QUERY_STRING}`,
        html: false,
      };

      if (isBuild && splitRouteModules && route.id !== 'root') {
        let source: string;
        try {
          source = readFileSync(routeFilePath, 'utf8');
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return acc;
          }
          throw error;
        }
        for (const exportName of routeChunkExportNames) {
          if (!source.includes(exportName)) {
            continue;
          }
          const chunkEntryName = getRouteChunkEntryName(route.id, exportName);
          manifestChunkNames.add(chunkEntryName);
          acc[chunkEntryName] = {
            import: getRouteChunkModuleId(routeFilePath, exportName),
            html: false,
          };
        }
      }

      return acc;
    },
    {} as Record<string, RsbuildEntryDescription>
  );

  return {
    manifestChunkNames,
    webRouteEntries,
  };
};

export const createClassicVirtualModules = ({
  allowedActionOrigins,
  appDirectory,
  assetsBuildDirectory,
  basename,
  devHmrRuntimeModule,
  entryServerPath,
  future,
  prerenderPaths,
  publicPath,
  routeDiscovery,
  routes,
  routesByServerBundleId,
  ssr,
}: CreateClassicVirtualModulesOptions): Record<string, string> => {
  const serverBuildOptions = {
    entryServerPath,
    assetsBuildDirectory,
    basename,
    appDirectory,
    ssr,
    future,
    allowedActionOrigins,
    prerender: prerenderPaths,
    routeDiscovery,
    publicPath,
  };
  const bundleVirtualModules = Object.fromEntries(
    Object.entries(routesByServerBundleId).map(([bundleId, bundleRoutes]) => [
      `virtual/react-router/server-build-${bundleId}`,
      generateServerBuild(bundleRoutes, {
        ...serverBuildOptions,
        serverManifestId: `virtual/react-router/server-manifest-${bundleId}`,
      }),
    ])
  );
  const bundleManifestModules = Object.fromEntries(
    Object.entries(routesByServerBundleId)
      .filter(
        ([, bundleRoutes]) =>
          bundleRoutes && Object.keys(bundleRoutes).length > 0
      )
      .map(([bundleId]) => [
        `virtual/react-router/server-manifest-${bundleId}`,
        'export default {};',
      ])
  );

  return {
    'virtual/react-router/browser-manifest': 'export default {};',
    'virtual/react-router/server-manifest': 'export default {};',
    'virtual/react-router/server-build': generateServerBuild(
      routes,
      serverBuildOptions
    ),
    ...bundleVirtualModules,
    ...bundleManifestModules,
    'virtual/react-router/with-props': generateWithProps(),
    ...(devHmrRuntimeModule !== undefined
      ? { [DEV_HMR_RUNTIME_MODULE_ID]: devHmrRuntimeModule }
      : {}),
  };
};
