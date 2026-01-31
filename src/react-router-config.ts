import type { Config } from '@react-router/dev/config';

export type ResolvedReactRouterConfig = Required<
  Pick<
    Config,
    'appDirectory' | 'basename' | 'buildDirectory' | 'serverBuildFile' | 'serverModuleFormat' | 'ssr'
  >
> &
  Omit<Config, 'appDirectory' | 'basename' | 'buildDirectory' | 'serverBuildFile' | 'serverModuleFormat' | 'ssr'>;

const DEFAULT_CONFIG: Required<
  Pick<
    Config,
    'appDirectory' | 'basename' | 'buildDirectory' | 'serverBuildFile' | 'serverModuleFormat' | 'ssr'
  >
> = {
  appDirectory: 'app',
  basename: '/',
  buildDirectory: 'build',
  serverBuildFile: 'index.js',
  serverModuleFormat: 'esm',
  ssr: true,
};

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
      const presetConfig = await preset.reactRouterConfig({
        reactRouterUserConfig,
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

  const resolved: ResolvedReactRouterConfig = {
    ...DEFAULT_CONFIG,
    ...userAndPresetConfigs,
  };

  if (!resolved.ssr && resolved.serverBundles) {
    resolved.serverBundles = undefined;
  }

  return {
    resolved,
    presets: reactRouterUserConfig.presets ?? [],
  };
};
