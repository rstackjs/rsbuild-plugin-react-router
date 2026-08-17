import type {
  ReactRouterManifestForDev,
  RouteManifestModuleExports,
} from './manifest.js';
import type { ReactRouterServerBuildPlan } from './server-build-plan.js';
import type { Route } from './types.js';

export type ReactRouterManifestSnapshot = {
  browser: ReactRouterManifestForDev;
  moduleExportsByRouteId: RouteManifestModuleExports;
  server: ReactRouterManifestForDev;
  serverByBundleId: Readonly<Record<string, ReactRouterManifestForDev>>;
  serverByEntryName: Readonly<Record<string, ReactRouterManifestForDev>>;
};

export const createReactRouterManifestSnapshot = ({
  manifest,
  sri,
  moduleExportsByRouteId,
  serverBuildPlan,
  routesByServerBundleId,
}: {
  manifest: ReactRouterManifestForDev;
  sri: ReactRouterManifestForDev['sri'];
  moduleExportsByRouteId: RouteManifestModuleExports;
  serverBuildPlan: Pick<
    ReactRouterServerBuildPlan,
    'defaultEntryName' | 'serverBundleEntries'
  >;
  routesByServerBundleId: Readonly<
    Record<string, Readonly<Record<string, Route>>>
  >;
}): ReactRouterManifestSnapshot => {
  // Detach caller-owned data once so every derived view belongs to this snapshot.
  const { server, moduleExportsByRouteId: detachedModuleExports } =
    structuredClone({
      server: { ...manifest, sri },
      moduleExportsByRouteId,
    });
  const browser: ReactRouterManifestForDev = {
    ...server,
    sri: undefined,
  };
  const bundles = serverBuildPlan.serverBundleEntries.flatMap(
    ({ bundleId, entryName }) => {
      const bundleRoutes = routesByServerBundleId[bundleId];
      if (!bundleRoutes) {
        return [];
      }

      return [
        {
          bundleId,
          entryName,
          manifest: {
            ...server,
            routes: Object.fromEntries(
              Object.entries(server.routes).filter(([routeId]) =>
                Object.hasOwn(bundleRoutes, routeId)
              )
            ),
          },
        },
      ];
    }
  );

  return {
    browser,
    moduleExportsByRouteId: detachedModuleExports,
    server,
    serverByBundleId: Object.fromEntries(
      bundles.map(({ bundleId, manifest }) => [bundleId, manifest])
    ),
    serverByEntryName: Object.fromEntries([
      [serverBuildPlan.defaultEntryName, server],
      ...bundles.map(({ entryName, manifest }) => [entryName, manifest]),
    ]),
  };
};
