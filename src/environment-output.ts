import type { RsbuildPluginAPI } from '@rsbuild/core';
import { ensureFederationAsyncStartup } from './federation.js';

export const registerReactRouterEnvironmentOutput = ({
  api,
  federation,
  resolvedServerOutput,
}: {
  api: RsbuildPluginAPI;
  federation: boolean | undefined;
  resolvedServerOutput: 'commonjs' | 'module';
}): void => {
  api.modifyEnvironmentConfig(
    async (config, { name, mergeEnvironmentConfig }) => {
      if (name !== 'web' && name !== 'node') {
        return config;
      }

      return mergeEnvironmentConfig(config, {
        tools: {
          rspack: rspackConfig => {
            if (federation) {
              ensureFederationAsyncStartup(rspackConfig);
            }

            if (name === 'node') {
              const output = rspackConfig.output;
              if (output) {
                const library = output.library;
                const libraryOptions =
                  library &&
                  typeof library === 'object' &&
                  !Array.isArray(library)
                    ? library
                    : {};
                rspackConfig.output = {
                  ...output,
                  library: {
                    ...libraryOptions,
                    type:
                      resolvedServerOutput === 'module'
                        ? 'module'
                        : 'commonjs2',
                  },
                };
              }
            }

            return rspackConfig;
          },
        },
      });
    }
  );
};
