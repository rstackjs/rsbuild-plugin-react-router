import type {
  BuildManifest as ReactRouterBuildManifest,
  Config as ReactRouterConfig,
} from '@react-router/dev/config';
import type { NormalizedConfig } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';

export type BuildEndHook = {
  bivarianceHack(args: {
    buildManifest: ReactRouterBuildManifest | undefined;
    reactRouterConfig: ResolvedReactRouterConfig;
    viteConfig: NormalizedConfig;
  }): void | Promise<void>;
}['bivarianceHack'];

export type Config = Omit<ReactRouterConfig, 'buildEnd'> & {
  buildEnd?: BuildEndHook;
};

type FutureConfig = {
  unstable_optimizeDeps: boolean;
  unstable_subResourceIntegrity: boolean;
  unstable_trailingSlashAwareDataRequests: boolean;
  v8_middleware: boolean;
  v8_splitRouteModules: boolean | 'enforce';
  v8_viteEnvironmentApi: boolean;
};

type RouteManifestEntry = {
  id: string;
  parentId?: string;
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  file: string;
};

type RouteManifest = Record<string, RouteManifestEntry>;

export type ResolvedReactRouterConfig = Readonly<{
  appDirectory: string;
  basename: string;
  buildDirectory: string;
  buildEnd?: Config['buildEnd'];
  future: FutureConfig;
  prerender: Config['prerender'];
  routeDiscovery: Config['routeDiscovery'];
  routes: RouteManifest;
  serverBuildFile: NonNullable<ReactRouterConfig['serverBuildFile']>;
  serverBundles?: Config['serverBundles'];
  serverModuleFormat: NonNullable<ReactRouterConfig['serverModuleFormat']>;
  ssr: NonNullable<ReactRouterConfig['ssr']>;
  allowedActionOrigins: string[] | false;
  unstable_routeConfig: RouteConfigEntry[];
}>;

const DEFAULT_CONFIG = {
  appDirectory: 'app',
  basename: '/',
  buildDirectory: 'build',
  serverBuildFile: 'index.js',
  serverModuleFormat: 'esm',
  ssr: true,
  future: {
    unstable_optimizeDeps: false,
    unstable_subResourceIntegrity: false,
    unstable_trailingSlashAwareDataRequests: false,
    v8_middleware: false,
    v8_splitRouteModules: false,
    v8_viteEnvironmentApi: false,
  } satisfies FutureConfig,
  routeDiscovery: undefined,
  prerender: undefined,
  serverBundles: undefined,
  buildEnd: undefined,
  allowedActionOrigins: false,
  routes: {},
  unstable_routeConfig: [],
} as const satisfies ResolvedReactRouterConfig;

const mergeReactRouterConfig = (...configs: Config[]): Config => {
  const reducer = (configA: Config, configB: Config): Config => {
    const mergeRequired = (key: keyof Config) =>
      configA[key] !== undefined && configB[key] !== undefined;
    return {
      ...configA,
      ...configB,
      ...(mergeRequired('buildEnd')
        ? {
            buildEnd: async (...args: Parameters<NonNullable<Config['buildEnd']>>) => {
              await Promise.all([
                configA.buildEnd?.(...args),
                configB.buildEnd?.(...args),
              ]);
            },
          }
        : {}),
      ...(mergeRequired('future')
        ? {
            future: {
              ...configA.future,
              ...configB.future,
            },
          }
        : {}),
      ...(mergeRequired('presets')
        ? {
            presets: [...(configA.presets ?? []), ...(configB.presets ?? [])],
          }
        : {}),
    };
  };
  return configs.reduce(reducer, {});
};

export const resolveReactRouterConfig = async (
  reactRouterUserConfig: Config
): Promise<{
  resolved: ResolvedReactRouterConfig;
  presets: NonNullable<Config['presets']>;
}> => {
  const presets = await Promise.all(
    (reactRouterUserConfig.presets ?? []).map(async preset => {
      if (!preset.name) {
        throw new Error('React Router presets must have a `name` property defined.');
      }
      if (!preset.reactRouterConfig) {
        return null;
      }
      const { buildEnd: _buildEnd, ...reactRouterUserConfigForPreset } =
        reactRouterUserConfig;
      const presetConfig = await preset.reactRouterConfig({
        reactRouterUserConfig: reactRouterUserConfigForPreset,
      });
      if (!presetConfig) return null;
      const { presets: _presets, ...rest } = presetConfig as Config;
      return rest;
    })
  );

  const userAndPresetConfigs = mergeReactRouterConfig(
    ...(presets.filter(Boolean) as Config[]),
    reactRouterUserConfig
  );

  const resolvedFuture: FutureConfig = {
    ...DEFAULT_CONFIG.future,
    ...(userAndPresetConfigs.future ?? {}),
  };

  let resolved: ResolvedReactRouterConfig = {
    ...DEFAULT_CONFIG,
    ...userAndPresetConfigs,
    future: resolvedFuture,
    allowedActionOrigins:
      userAndPresetConfigs.allowedActionOrigins ??
      DEFAULT_CONFIG.allowedActionOrigins,
    routes: DEFAULT_CONFIG.routes,
    unstable_routeConfig: DEFAULT_CONFIG.unstable_routeConfig,
    serverBundles: DEFAULT_CONFIG.serverBundles,
  };
  if (!resolved.ssr) {
    resolved = {
      ...resolved,
      serverBundles: undefined,
    };
  }

  return {
    resolved,
    presets: reactRouterUserConfig.presets ?? [],
  };
};
