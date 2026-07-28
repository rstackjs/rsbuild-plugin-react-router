import type { Rspack } from '@rsbuild/core';

type ModuleFederationPluginLike = {
  name?: string;
  _options?: { experiments?: { asyncStartup?: boolean } };
  options?: { experiments?: { asyncStartup?: boolean } };
};

export const ensureFederationAsyncStartup = (
  rspackConfig: Rspack.Configuration | undefined
): void => {
  if (!rspackConfig?.plugins?.length) {
    return;
  }

  for (const plugin of rspackConfig.plugins) {
    if (!plugin || typeof plugin !== 'object') {
      continue;
    }
    const federationPlugin = plugin as ModuleFederationPluginLike;
    if (federationPlugin.name !== 'ModuleFederationPlugin') {
      continue;
    }

    const pluginOptions = federationPlugin._options ?? federationPlugin.options;
    if (!pluginOptions) {
      continue;
    }

    pluginOptions.experiments = {
      ...pluginOptions.experiments,
      asyncStartup: true,
    };
  }
};
