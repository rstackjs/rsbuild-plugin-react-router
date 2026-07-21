import type { RsbuildPlugin } from '@rsbuild/core';
import { getPackageVersion, parseVersionMajorMinor } from './plugin-utils.js';
import type { Config } from './react-router-config.js';
import type { PluginOptions } from './types.js';

type RscPluginOptions = Exclude<NonNullable<PluginOptions['rsc']>, boolean>;
type RscUnsupportedConfig = Pick<
  Config,
  'buildEnd' | 'future' | 'presets' | 'serverBundles' | 'subResourceIntegrity'
>;

// Mirrors upstream @react-router/dev's RSC-mode validateConfig: these
// options have no effect in RSC framework mode, so reject them loudly
// instead of silently dropping them.
export const assertReactRouterRscConfigSupport = ({
  pluginName,
  userConfig,
}: {
  pluginName: string;
  userConfig: RscUnsupportedConfig;
}): void => {
  const unsupported: string[] = [];
  if (userConfig.buildEnd) unsupported.push('buildEnd');
  if (userConfig.presets?.length) unsupported.push('presets');
  if (userConfig.serverBundles) unsupported.push('serverBundles');
  if (userConfig.subResourceIntegrity) unsupported.push('subResourceIntegrity');
  if (unsupported.length) {
    throw new Error(
      `[${pluginName}] RSC Framework Mode does not currently support the ` +
        `following React Router config:\n${unsupported
          .map(option => ` - ${option}`)
          .join('\n')}\n`
    );
  }
};

const supportsReactRouterRsc = (version: string | undefined): boolean => {
  const parsed = parseVersionMajorMinor(version);
  if (!parsed) {
    return false;
  }
  return parsed.major >= 8 || (parsed.major === 7 && parsed.minor >= 18);
};

export const assertReactRouterRscSupport = ({
  pluginName,
  resolvePackagePath,
}: {
  pluginName: string;
  resolvePackagePath: (specifier: string) => string | undefined;
}): void => {
  const reactRouterVersion = getPackageVersion(
    'react-router',
    resolvePackagePath
  );
  if (!supportsReactRouterRsc(reactRouterVersion)) {
    throw new Error(
      `[${pluginName}] React Router RSC mode requires react-router >=7.18.0 or >=8.0.0.`
    );
  }

  for (const specifier of [
    'react-server-dom-rspack/client.browser',
    'rsbuild-plugin-rsc',
  ]) {
    if (!resolvePackagePath(specifier)) {
      throw new Error(
        `[${pluginName}] React Router RSC mode requires \`${specifier}\` to be installed.`
      );
    }
  }
};

export const setupReactRouterRscPlugin = async ({
  api,
  entryRscPath,
  entrySsrPath,
  pluginName,
  rsc,
}: {
  api: Parameters<RsbuildPlugin['setup']>[0];
  entryRscPath: string;
  entrySsrPath: string;
  pluginName: string;
  rsc: RscPluginOptions;
}): Promise<void> => {
  const { PLUGIN_RSC_NAME } = await import('rsbuild-plugin-rsc');
  if (api.isPluginExists(PLUGIN_RSC_NAME)) {
    throw new Error(
      `[${pluginName}] The "${PLUGIN_RSC_NAME}" plugin is already registered. ` +
        `Remove the separately configured plugin and pass RSC options through ` +
        `"${pluginName}" so the managed node/web environments stay aligned.`
    );
  }

  const { pluginRSC } = await import('rsbuild-plugin-rsc');
  await pluginRSC({
    ...rsc,
    environments: {
      server: 'node',
      client: 'web',
    },
    layers: {
      rsc: [entryRscPath],
      ssr: [entrySsrPath],
      ...rsc.layers,
    },
  }).setup(api);
};

export { createReactRouterRscDevServerSetup } from './rsc-dev-server.js';
export { registerReactRouterRscRouteTransforms } from './rsc-route-transform-registration.js';
export {
  createReactRouterRscResolveAliases,
  createReactRouterRscVirtualModules,
} from './rsc-virtual-modules.js';
