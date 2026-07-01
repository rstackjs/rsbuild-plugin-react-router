import { relative, resolve } from 'pathe';
import * as Effect from 'effect/Effect';
import { getCappedPluginConcurrency } from './concurrency.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';
import type { Config } from './react-router-config.js';
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
  return Object.values(routes).filter(
    route => !nonAddressableIds.has(route.id)
  );
};

const getRouteBranch = (
  routes: Record<string, Route>,
  routeId: string
): Route[] => {
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

const validateServerBundleId = (
  serverBundleId: string,
  future: Required<Config>['future']
): Error | undefined => {
  if (future?.v8_viteEnvironmentApi) {
    return /^[a-zA-Z0-9_]+$/.test(serverBundleId)
      ? undefined
      : new Error(
          'The "serverBundles" function must only return strings containing alphanumeric characters and underscores.'
        );
  }

  return /^[a-zA-Z0-9-_]+$/.test(serverBundleId)
    ? undefined
    : new Error(
        'The "serverBundles" function must only return strings containing alphanumeric characters, hyphens and underscores.'
      );
};

type GetBuildManifestOptions = {
  reactRouterConfig: Required<
    Pick<
      Config,
      'appDirectory' | 'buildDirectory' | 'serverBuildFile' | 'future'
    >
  > &
    Pick<Config, 'serverBundles'>;
  routes: Record<string, Route>;
  rootDirectory: string;
};

export const getBuildManifestEffect = ({
  reactRouterConfig,
  routes,
  rootDirectory,
}: GetBuildManifestOptions): Effect.Effect<
  BuildManifest | undefined,
  Error,
  never
> =>
  Effect.gen(function* () {
    const {
      serverBundles,
      appDirectory,
      buildDirectory,
      serverBuildFile,
      future,
    } = reactRouterConfig;

    if (!serverBundles) {
      return { routes };
    }

    const rootRelativeRoutes = Object.fromEntries(
      Object.entries(routes).map(([id, route]) => {
        const filePath = resolve(appDirectory, route.file);
        return [
          id,
          { ...route, file: normalizePath(relative(rootDirectory, filePath)) },
        ];
      })
    );

    const serverBuildDirectory = resolve(buildDirectory, 'server');

    const buildManifest: BuildManifest = {
      routes: rootRelativeRoutes,
      serverBundles: {},
      routeIdToServerBundleId: {},
    };

    yield* Effect.forEach(
      getAddressableRoutes(routes),
      route =>
        Effect.gen(function* () {
          const branch = getRouteBranch(routes, route.id);
          const serverBundleId = yield* tryPluginPromise(() =>
            serverBundles({
              branch: branch.map(branchRoute =>
                configRouteToBranchRoute({
                  ...branchRoute,
                  file: resolve(appDirectory, branchRoute.file),
                })
              ),
            })
          );

          if (typeof serverBundleId !== 'string') {
            return yield* Effect.fail(
              new Error('The "serverBundles" function must return a string')
            );
          }

          const validationError = validateServerBundleId(
            serverBundleId,
            future
          );
          if (validationError) {
            return yield* Effect.fail(validationError);
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
        }),
      { concurrency: getCappedPluginConcurrency(), discard: true }
    );

    return buildManifest;
  });

export const getBuildManifest = (
  options: GetBuildManifestOptions
): Promise<BuildManifest | undefined> =>
  runPluginEffect(getBuildManifestEffect(options));

export const getRoutesByServerBundleId = (
  buildManifest: BuildManifest | undefined,
  sourceRoutes: Record<string, Route>
): Record<string, Record<string, Route>> => {
  if (!buildManifest || !('routeIdToServerBundleId' in buildManifest)) {
    return {};
  }

  const routesByServerBundleId: Record<string, Record<string, Route>> = {};
  for (const [routeId, serverBundleId] of Object.entries(
    buildManifest.routeIdToServerBundleId
  )) {
    routesByServerBundleId[serverBundleId] ??= {};
    const branch = getRouteBranch(sourceRoutes, routeId);
    for (const route of branch) {
      routesByServerBundleId[serverBundleId][route.id] = route;
    }
  }
  return routesByServerBundleId;
};
