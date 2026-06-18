import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'pathe';
import type { Route } from './types.js';

type RouteManifestSnapshotEntry = Pick<
  Route,
  'caseSensitive' | 'file' | 'id' | 'index' | 'parentId' | 'path'
>;

export const createRouteManifestSnapshot = (
  routes: Record<string, RouteManifestSnapshotEntry>
): Set<string> =>
  new Set(
    Object.entries(routes)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([routeId, route]) =>
        JSON.stringify([
          routeId,
          route.id,
          route.parentId ?? null,
          route.path ?? null,
          route.index ?? null,
          route.caseSensitive ?? null,
          route.file,
        ])
      )
  );

export const ensureRestartMarker = async (
  restartMarkerPath: string
): Promise<void> => {
  await mkdir(dirname(restartMarkerPath), { recursive: true });
  try {
    await access(restartMarkerPath);
  } catch {
    await writeFile(restartMarkerPath, String(Date.now()));
  }
};
