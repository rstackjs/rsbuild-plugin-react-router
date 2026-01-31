import { relative, resolve } from 'pathe';
import type { Config } from '@react-router/dev/config';
import type { Route } from './types.js';

type BuildManifest =
  | {
      routes: Record<string, Route>;
    }
  | {
      routes: Record<string, Route>;
      serverBundles: Record<string, { id: string; file: string }>;
      routeIdToServerBundleId: Record<string, string>;
    };

const normalizePath = (value: string): string => value.replace(/\\/g, '/');

const getAddressableRoutes = (routes: Record<string, Route>): Route[] => {
  const nonAddressableIds = new Set<string>();
  for (const id in routes) {
    const route = routes[id];
    if (route.index) {
      if (!route.parentId) {
        continue;
      }
      nonAddressableIds.add(route.parentId);
    }
    if (typeof route.path !== 'string' && !route.index) {
      nonAddressableIds.add(id);
    }
  }
  return Object.values(routes).filter(route => !nonAddressableIds.has(route.id));
};

const getRouteBranch = (routes: Record<string, Route>, routeId: string): Route[] => {
  const branch: Route[] = [];
  let current = routeId;
  while (current) {
    const route = routes[current];
    if (!route) {
      throw new Error(`Missing route for ${current}`);
    }
    branch.push(route);
    current = route.parentId || '';
  }
  return branch.reverse();
};

const configRouteToBranchRoute = (route: Route) => ({
  id: route.id,
  path: route.path,
  file: route.file,
  index: route.index,
});

export const getBuildManifest = async ({
  reactRouterConfig,
  routes,
  rootDirectory,
}: {
  reactRouterConfig: Required<
    Pick<Config, 'appDirectory' | 'buildDirectory' | 'serverBuildFile' | 'future'>
  > &
    Pick<Config, 'serverBundles'>;
  routes: Record<string, Route>;
  rootDirectory: string;
}): Promise<BuildManifest | undefined> => {
  const { serverBundles, appDirectory, buildDirectory, serverBuildFile, future } =
    reactRouterConfig;

  if (!serverBundles) {
    return { routes };
  }

  const rootRelativeRoutes = Object.fromEntries(
    Object.entries(routes).map(([id, route]) => {
      const filePath = resolve(appDirectory, route.file);
      return [id, { ...route, file: normalizePath(relative(rootDirectory, filePath)) }];
    })
  );

  const serverBuildDirectory = resolve(buildDirectory, 'server');

  const buildManifest: BuildManifest = {
    routes: rootRelativeRoutes,
    serverBundles: {},
    routeIdToServerBundleId: {},
  };

  await Promise.all(
    getAddressableRoutes(routes).map(async route => {
      const branch = getRouteBranch(routes, route.id);
      const serverBundleId = await serverBundles({
        branch: branch.map(branchRoute =>
          configRouteToBranchRoute({
            ...branchRoute,
            file: resolve(appDirectory, branchRoute.file),
          })
        ),
      });

      if (typeof serverBundleId !== 'string') {
        throw new Error('The "serverBundles" function must return a string');
      }

      if (future?.v8_viteEnvironmentApi) {
        if (!/^[a-zA-Z0-9_]+$/.test(serverBundleId)) {
          throw new Error(
            'The "serverBundles" function must only return strings containing alphanumeric characters and underscores.'
          );
        }
      } else if (!/^[a-zA-Z0-9-_]+$/.test(serverBundleId)) {
        throw new Error(
          'The "serverBundles" function must only return strings containing alphanumeric characters, hyphens and underscores.'
        );
      }

      buildManifest.routeIdToServerBundleId![route.id] = serverBundleId;
      buildManifest.serverBundles![serverBundleId] ??= {
        id: serverBundleId,
        file: normalizePath(
          relative(
            rootDirectory,
            resolve(serverBuildDirectory, serverBundleId, serverBuildFile)
          )
        ),
      };
    })
  );

  return buildManifest;
};

export const getRoutesByServerBundleId = (
  buildManifest: BuildManifest | undefined
): Record<string, Record<string, Route>> => {
  if (!buildManifest || !('routeIdToServerBundleId' in buildManifest)) {
    return {};
  }

  const routesByServerBundleId: Record<string, Record<string, Route>> = {};
  for (const [routeId, serverBundleId] of Object.entries(
    buildManifest.routeIdToServerBundleId
  )) {
    routesByServerBundleId[serverBundleId] ??= {};
    const branch = getRouteBranch(buildManifest.routes, routeId);
    for (const route of branch) {
      routesByServerBundleId[serverBundleId][route.id] = route;
    }
  }
  return routesByServerBundleId;
};
