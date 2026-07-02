import type {
  BuildManifest as ReactRouterBuildManifest,
  Config as ReactRouterConfig,
} from '@react-router/dev/config';
import type { NormalizedConfig } from '@rsbuild/core';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import * as Effect from 'effect/Effect';
import { getCappedPluginConcurrency } from './concurrency.js';
import { runPluginEffect, tryPluginPromise } from './effect-runtime.js';

export type BuildEndHook = {
  bivarianceHack(args: {
    buildManifest: ReactRouterBuildManifest | undefined;
    reactRouterConfig: ResolvedReactRouterConfig;
    viteConfig: NormalizedConfig;
  }): void | Promise<void>;
}['bivarianceHack'];

type SplitRouteModulesConfig = boolean | 'enforce';

export type Config = Omit<
  ReactRouterConfig,
  'buildEnd' | 'future' | 'splitRouteModules' | 'subResourceIntegrity'
> & {
  buildEnd?: BuildEndHook;
  future?: Partial<FutureConfig>;
  splitRouteModules?: SplitRouteModulesConfig;
  subResourceIntegrity?: boolean;
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

type ResolveReactRouterConfigResult = {
  resolved: ResolvedReactRouterConfig;
  presets: NonNullable<Config['presets']>;
  hasConfiguredServerModuleFormat: boolean;
};

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
  splitRouteModules: SplitRouteModulesConfig;
  subResourceIntegrity: boolean;
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
  splitRouteModules: true,
  subResourceIntegrity: false,
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
            buildEnd: async (
              ...args: Parameters<NonNullable<Config['buildEnd']>>
            ) => {
              await runPluginEffect(
                Effect.all(
                  [
                    tryPluginPromise(() => configA.buildEnd?.(...args)),
                    tryPluginPromise(() => configB.buildEnd?.(...args)),
                  ],
                  { discard: true }
                )
              );
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

const normalizeSubResourceIntegrity = (config: Config): Config => {
  const subResourceIntegrity =
    config.subResourceIntegrity ?? config.future?.unstable_subResourceIntegrity;

  if (subResourceIntegrity === undefined) {
    return config;
  }

  return {
    ...config,
    subResourceIntegrity,
    future: {
      ...(config.future ?? {}),
      unstable_subResourceIntegrity: subResourceIntegrity,
    },
  };
};

export const resolveReactRouterConfigEffect = (
  reactRouterUserConfig: Config
): Effect.Effect<ResolveReactRouterConfigResult, Error, never> =>
  Effect.gen(function* () {
    const presets = yield* Effect.forEach(
      reactRouterUserConfig.presets ?? [],
      preset =>
        Effect.gen(function* () {
          if (!preset.name) {
            return yield* Effect.fail(
              new Error(
                'React Router presets must have a `name` property defined.'
              )
            );
          }
          if (!preset.reactRouterConfig) {
            return null;
          }
          const { buildEnd: _buildEnd, ...reactRouterUserConfigForPreset } =
            reactRouterUserConfig;
          const presetConfig = yield* tryPluginPromise(() =>
            preset.reactRouterConfig?.({
              reactRouterUserConfig: reactRouterUserConfigForPreset,
            })
          );
          if (!presetConfig) return null;
          const { presets: _presets, ...rest } = presetConfig as Config;
          return rest;
        }),
      { concurrency: getCappedPluginConcurrency() }
    );

    const userAndPresetConfigs = mergeReactRouterConfig(
      ...(presets.filter(Boolean) as Config[]).map(
        normalizeSubResourceIntegrity
      ),
      normalizeSubResourceIntegrity(reactRouterUserConfig)
    );

    const subResourceIntegrity =
      userAndPresetConfigs.subResourceIntegrity ??
      userAndPresetConfigs.future?.unstable_subResourceIntegrity ??
      DEFAULT_CONFIG.subResourceIntegrity;
    const resolvedFuture: FutureConfig = {
      ...DEFAULT_CONFIG.future,
      ...(userAndPresetConfigs.future ?? {}),
      unstable_subResourceIntegrity: subResourceIntegrity,
    };
    const splitRouteModules =
      userAndPresetConfigs.splitRouteModules ??
      userAndPresetConfigs.future?.v8_splitRouteModules ??
      DEFAULT_CONFIG.splitRouteModules;

    let resolved: ResolvedReactRouterConfig = {
      ...DEFAULT_CONFIG,
      ...userAndPresetConfigs,
      future: resolvedFuture,
      splitRouteModules,
      subResourceIntegrity,
      allowedActionOrigins:
        userAndPresetConfigs.allowedActionOrigins ??
        DEFAULT_CONFIG.allowedActionOrigins,
      routes: DEFAULT_CONFIG.routes,
      unstable_routeConfig: DEFAULT_CONFIG.unstable_routeConfig,
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
      hasConfiguredServerModuleFormat:
        userAndPresetConfigs.serverModuleFormat !== undefined,
    };
  });

export const resolveReactRouterConfig = (
  reactRouterUserConfig: Config
): Promise<ResolveReactRouterConfigResult> =>
  runPluginEffect(resolveReactRouterConfigEffect(reactRouterUserConfig));
