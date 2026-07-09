import { describe, expect, it } from '@rstest/core';
import { registerRouteModuleTransformRules } from '../src/route-module-transform-rules';

const createRuleConfig = (
  parallelRouteTransform: boolean | number | undefined
) => {
  const routePath = '/project/app/routes/page.tsx';
  const rspackConfig = {};

  registerRouteModuleTransformRules(rspackConfig, {
    environmentName: 'web',
    ssr: true,
    isBuild: false,
    isSpaMode: false,
    rootRoutePath: '/project/app/root.tsx',
    logPerformance: true,
    routeByFilePath: new Map([[routePath, { id: 'page' }]]),
    parallelRouteTransform,
  });

  return rspackConfig as {
    module: {
      rules: Array<{
        test?: (path: string) => boolean;
        use: Array<{
          loader: string;
          options: Record<string, unknown>;
          parallel?: true | { maxWorkers: number };
        }>;
      }>;
    };
  };
};

describe('route module transform rules', () => {
  it('registers route module loader rules with loader options', () => {
    const config = createRuleConfig(true);
    const [queryRule, routeRule] = config.module.rules;

    expect(config.module.rules).toHaveLength(2);
    expect(queryRule.use[0]).toMatchObject({
      options: {
        environmentName: 'web',
        performanceScopeId: 'web:dev:ssr:/project/app/root.tsx',
        logPerformance: true,
        ssr: true,
        isBuild: false,
        isSpaMode: false,
        rootRoutePath: '/project/app/root.tsx',
      },
      parallel: true,
    });
    expect(routeRule.test?.('/project/app/routes/page.tsx')).toBe(true);
    expect(routeRule.test?.('/project/app/routes/other.tsx')).toBe(false);
  });

  it('passes explicit worker counts to Rspack loader parallelism', () => {
    const config = createRuleConfig(3);

    expect(config.module.rules[0].use[0].parallel).toEqual({
      maxWorkers: 3,
    });
  });

  it('rejects invalid worker counts', () => {
    expect(() => createRuleConfig(0)).toThrow(
      '[react-router] parallelRouteTransform must be true, false, or a positive integer.'
    );
  });
});
