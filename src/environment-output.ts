import type { RsbuildPluginAPI, Rspack } from '@rsbuild/core';

// Module Federation reads asyncStartup when applying the plugin, after the
// plugin instance has already been constructed.
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
    if (!('name' in plugin) || plugin.name !== 'ModuleFederationPlugin') {
      continue;
    }

    const pluginOptions =
      ('_options' in plugin ? plugin._options : undefined) ??
      ('options' in plugin ? plugin.options : undefined);
    if (!pluginOptions || typeof pluginOptions !== 'object') {
      continue;
    }

    const experiments =
      'experiments' in pluginOptions &&
      pluginOptions.experiments &&
      typeof pluginOptions.experiments === 'object'
        ? pluginOptions.experiments
        : undefined;
    Object.assign(pluginOptions, {
      experiments: { ...experiments, asyncStartup: true },
    });
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
