import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';

type ModuleFederationPluginLike = {
  name?: string;
  _options?: { experiments?: { asyncStartup?: boolean } };
  options?: { experiments?: { asyncStartup?: boolean } };
};

const ensureFederationAsyncStartup = (
  rspackConfig: Rspack.Configuration | undefined
): void => {
  if (!rspackConfig?.plugins?.length) {
    return;
  }

  for (const plugin of rspackConfig.plugins) {
    if (!plugin || typeof plugin !== 'object') {
      continue;
    }
    const pluginName = (plugin as ModuleFederationPluginLike).name;
    if (pluginName !== 'ModuleFederationPlugin') {
      continue;
    }

    const pluginOptions =
      (plugin as ModuleFederationPluginLike)._options ??
      (plugin as ModuleFederationPluginLike).options;
    if (!pluginOptions) {
      continue;
    }

    pluginOptions.experiments = {
      ...pluginOptions.experiments,
      asyncStartup: true,
    };
  }
};

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
