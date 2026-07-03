import { readFileSync } from 'node:fs';
import type { RsbuildPlugin } from '@rsbuild/core';
import type { PluginOptions } from './types.js';

type RscPluginOptions = Exclude<NonNullable<PluginOptions['rsc']>, boolean>;

const getPackageVersion = (
  packageName: string,
  resolvePackagePath: (specifier: string) => string | undefined
): string | undefined => {
  const packageJsonPath = resolvePackagePath(`${packageName}/package.json`);
  if (!packageJsonPath) {
    return undefined;
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: unknown;
    };
    return typeof packageJson.version === 'string'
      ? packageJson.version
      : undefined;
  } catch {
    return undefined;
  }
};

const supportsReactRouterRsc = (version: string | undefined): boolean => {
  const match = version?.match(/^(\d+)\.(\d+)\./);
  if (!match) {
    return false;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return major >= 8 || (major === 7 && minor >= 18);
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
  rsc: true | RscPluginOptions;
}): Promise<void> => {
  const { PLUGIN_RSC_NAME, pluginRSC } = await import('rsbuild-plugin-rsc');
  if (api.isPluginExists(PLUGIN_RSC_NAME)) {
    api.logger.warn(
      `[${pluginName}] The "${PLUGIN_RSC_NAME}" plugin is already registered. ` +
        'Skipping built-in RSC setup.'
    );
    return;
  }

  const userRscOptions: RscPluginOptions = rsc === true ? {} : rsc;
  await pluginRSC({
    ...userRscOptions,
    environments: {
      server: 'node',
      client: 'web',
    },
    layers: {
      rsc: [entryRscPath],
      ssr: [entrySsrPath],
      ...userRscOptions.layers,
    },
  }).setup(api);
};

export { createReactRouterRscDevServerSetup } from './rsc-dev-server.js';
export { registerReactRouterRscRouteTransforms } from './rsc-route-transform-registration.js';
export {
  createReactRouterRscResolveAliases,
  createReactRouterRscVirtualModules,
} from './rsc-virtual-modules.js';
