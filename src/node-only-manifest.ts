import { rspack, type RsbuildPluginAPI, type Rspack } from '@rsbuild/core';
import { resolve } from 'pathe';
import type { ReactRouterManifestSnapshot } from './manifest-snapshot.js';
import type { Route } from './types.js';

// Inspect the compiled graph rather than parsing source: loaders, re-exports,
// and cached modules must all participate in the compatibility check.
export const registerNodeOnlyManifestValidation = ({
  api,
  routeByFilePath,
  getSnapshot,
}: {
  api: RsbuildPluginAPI;
  routeByFilePath: ReadonlyMap<string, Route>;
  getSnapshot: () => ReactRouterManifestSnapshot | null;
}): void => {
  api.modifyRspackConfig((config, { environment }) => {
    if (environment.name !== 'node') return;
    config.plugins ??= [];
    config.plugins.push({
      apply(compiler: Rspack.Compiler) {
        const name = 'ReactRouterNodeOnlyManifestValidation';
        compiler.hooks.thisCompilation.tap(name, compilation => {
          compilation.hooks.afterOptimizeModules.tap(name, modules => {
            const snapshot = getSnapshot();
            if (!snapshot) return;
            for (const module of modules) {
              if (!(module instanceof rspack.NormalModule)) continue;
              const route = routeByFilePath.get(
                resolve(module.resource.split('?')[0])
              );
              if (!route) continue;
              const exports =
                compilation.moduleGraph.getProvidedExports(module);
              const saved = snapshot.browser.routes[route.id];
              if (
                !Array.isArray(exports) ||
                !saved ||
                exports.includes('loader') !== saved.hasLoader ||
                exports.includes('action') !== saved.hasAction
              ) {
                throw new Error(
                  `Run a full build before building only the node environment: loader/action exports changed for route "${route.id}".`
                );
              }
            }
          });
        });
      },
    });
  });
};
