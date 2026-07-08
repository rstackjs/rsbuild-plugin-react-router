import { createRsbuild, type Rspack } from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import { pluginReactRouterTailwindcss } from '../src';

type Rule = NonNullable<Rspack.Configuration['module']>['rules'][number];
type RuleUse = {
  loader?: string;
  options?: Record<string, unknown>;
};

const getTailwindLoaders = (rule: Rule): RuleUse[] => {
  if (!rule || typeof rule !== 'object' || !('oneOf' in rule)) {
    return [];
  }

  return (rule.oneOf ?? []).flatMap(oneOf => {
    if (!oneOf || typeof oneOf !== 'object' || !('use' in oneOf)) {
      return [];
    }

    const uses = Array.isArray(oneOf.use) ? oneOf.use : [oneOf.use];
    return uses.filter(
      (use): use is RuleUse =>
        Boolean(
          use &&
            typeof use === 'object' &&
            'loader' in use &&
            typeof use.loader === 'string' &&
            use.loader.includes('tailwind-loader')
        )
    );
  });
};

describe('pluginReactRouterTailwindcss', () => {
  it('adds the local Tailwind loader to CSS rules', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [
          pluginReactRouterTailwindcss({
            base: '/custom/tailwind-base',
          }),
        ],
      },
    });

    const [config] = await rsbuild.initConfigs();
    const tailwindLoaders = (config.module?.rules ?? []).flatMap(rule =>
      getTailwindLoaders(rule)
    );

    expect(tailwindLoaders).toHaveLength(3);
    expect(tailwindLoaders.map(loader => loader.options?.base)).toEqual([
      '/custom/tailwind-base',
      '/custom/tailwind-base',
      '/custom/tailwind-base',
    ]);
  });
});
