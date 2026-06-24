import { PLUGIN_NAME } from './constants.js';
import type { ReactRouterDevBuildPlan } from './dev-runtime-artifacts.js';
import type { Route } from './types.js';

export type ReactRouterServerBundleEntry = {
  bundleId: string;
  entryName: string;
};

export type ReactRouterServerBuildPlan = ReactRouterDevBuildPlan & {
  serverBundleEntries: ReactRouterServerBundleEntry[];
};

export const createReactRouterServerBuildPlan = ({
  routesByServerBundleId,
  serverBuildFile,
  defaultEntryName,
}: {
  routesByServerBundleId: Record<string, Record<string, Route>>;
  serverBuildFile: string | undefined;
  defaultEntryName: string;
}): ReactRouterServerBuildPlan => {
  const serverBuildFileBase = (serverBuildFile || 'index.js').replace(
    /\.js$/,
    ''
  );
  const serverBundleEntries = Object.entries(routesByServerBundleId)
    .filter(([, bundleRoutes]) =>
      Boolean(bundleRoutes && Object.keys(bundleRoutes).length > 0)
    )
    .map(([bundleId]) => ({
      bundleId,
      entryName: `${bundleId}/${serverBuildFileBase}`,
    }));

  const reservedNodeEntryNames = new Set([
    'static/js/app',
    'static/js/entry.server',
    defaultEntryName,
  ]);
  for (const { entryName } of serverBundleEntries) {
    if (reservedNodeEntryNames.has(entryName)) {
      throw new Error(
        `[${PLUGIN_NAME}] Server bundle entry ${JSON.stringify(entryName)} conflicts with a reserved node entry.`
      );
    }
    reservedNodeEntryNames.add(entryName);
  }

  return {
    defaultEntryName,
    entryNames: [
      defaultEntryName,
      ...serverBundleEntries.map(({ entryName }) => entryName),
    ],
    serverBundleEntries,
  };
};

export const createReactRouterNodeEntries = ({
  hasServerApp,
  isBuild,
  serverAppPath,
  entryServerPath,
  defaultEntryName,
  serverBundleEntries,
}: {
  hasServerApp: boolean;
  isBuild: boolean;
  serverAppPath: string;
  entryServerPath: string;
  defaultEntryName: string;
  serverBundleEntries: readonly ReactRouterServerBundleEntry[];
}): Record<string, string> => {
  const entries: Record<string, string> = {
    'static/js/app': hasServerApp
      ? serverAppPath
      : 'virtual/react-router/server-build',
    'static/js/entry.server': entryServerPath,
  };

  if (hasServerApp && !isBuild) {
    entries[defaultEntryName] = 'virtual/react-router/server-build';
  }

  for (const { bundleId, entryName } of serverBundleEntries) {
    entries[entryName] = `virtual/react-router/server-build-${bundleId}`;
  }

  return entries;
};
