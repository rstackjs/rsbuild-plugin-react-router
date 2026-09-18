import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';
import type { ReactRouterManifestSnapshot } from './manifest-snapshot.js';

type ReactRouterManifestState = {
  stage(
    compilation: Rspack.Compilation,
    snapshot: ReactRouterManifestSnapshot
  ): void;
  read(): ReactRouterManifestSnapshot | null;
};

export const createReactRouterManifestState = ({
  api,
  isBuild,
  onPublish,
}: {
  api: Pick<
    RsbuildPluginAPI,
    'onBeforeEnvironmentCompile' | 'onAfterEnvironmentCompile'
  >;
  isBuild: boolean;
  onPublish: (
    compilation: Rspack.Compilation,
    snapshot: ReactRouterManifestSnapshot
  ) => void;
}): ReactRouterManifestState => {
  let latest: ReactRouterManifestSnapshot | null = null;
  const pending = new WeakMap<
    Rspack.Compilation,
    ReactRouterManifestSnapshot
  >();
  const publish = (
    compilation: Rspack.Compilation,
    snapshot: ReactRouterManifestSnapshot
  ) => {
    latest = snapshot;
    onPublish(compilation, snapshot);
  };

  if (isBuild) {
    api.onBeforeEnvironmentCompile(({ environment }) => {
      if (environment.name === 'web') {
        // A failed web rebuild must not expose the previous build's manifest.
        // A node-only rebuild may continue using the last successful snapshot.
        latest = null;
      }
    });
  }
  api.onAfterEnvironmentCompile(({ environment, stats }) => {
    if (environment.name !== 'web') {
      return;
    }
    const snapshot =
      stats && !stats.hasErrors() ? pending.get(stats.compilation) : undefined;
    if (stats) {
      pending.delete(stats.compilation);
    }
    if (snapshot && stats) {
      publish(stats.compilation, snapshot);
    } else if (isBuild) {
      latest = null;
    }
  });

  return {
    stage(compilation, snapshot) {
      pending.set(compilation, snapshot);
    },
    read: () => latest,
  };
};
