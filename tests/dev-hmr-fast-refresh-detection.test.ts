import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { describe, expect, it } from '@rstest/core';
import { isRspackSwcReactRefreshEnabled } from '../src/dev-hmr';

type ToolsSwc = NonNullable<NonNullable<RsbuildConfig['tools']>['swc']>;

// Runs real Rsbuild config resolution so every `tools.swc` form goes through
// core's reduceConfigs merge, then reads the resolved Rspack config the same
// way the plugin's `tools.rspack` hook does.
const detectRefresh = async ({
  swc,
  plugins = [],
}: {
  swc?: ToolsSwc;
  plugins?: NonNullable<RsbuildConfig['plugins']>;
}): Promise<boolean> => {
  let detected: boolean | undefined;
  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      mode: 'development',
      tools: {
        ...(swc ? { swc } : {}),
        rspack: config => {
          detected = isRspackSwcReactRefreshEnabled(config);
          return config;
        },
      },
      plugins: [
        ...plugins,
      ],
    },
  });
  await rsbuild.initConfigs();
  if (detected === undefined) {
    throw new Error('refresh probe did not run');
  }
  return detected;
};

const refreshFragment = {
  jsc: { transform: { react: { refresh: true } } },
};

describe('isRspackSwcReactRefreshEnabled', () => {
  it('detects the plain-object tools.swc form', async () => {
    await expect(detectRefresh({ swc: refreshFragment })).resolves.toBe(true);
  });

  it('detects the array tools.swc form', async () => {
    await expect(detectRefresh({ swc: [refreshFragment] })).resolves.toBe(
      true
    );
  });

  it('detects the function tools.swc form', async () => {
    await expect(
      detectRefresh({
        swc: config => {
          config.jsc ??= {};
          config.jsc.transform = {
            ...config.jsc.transform,
            react: { ...config.jsc.transform?.react, refresh: true },
          };
        },
      })
    ).resolves.toBe(true);
  });

  it('detects plugin-react refresh layered under a user tools.swc function', async () => {
    // plugin-react contributes an object fragment; the user function turns
    // tools.swc into a mixed array — the case the raw-config probe missed.
    await expect(
      detectRefresh({
        plugins: [pluginReact()],
        swc: config => {
          config.jsc ??= {};
          config.jsc.parser = { ...config.jsc.parser, decorators: true };
        },
      })
    ).resolves.toBe(true);
  });

  it('returns false when Fast Refresh is not configured', async () => {
    await expect(detectRefresh({})).resolves.toBe(false);
  });

  it('returns false when plugin-react disables fastRefresh', async () => {
    await expect(
      detectRefresh({ plugins: [pluginReact({ fastRefresh: false })] })
    ).resolves.toBe(false);
  });
});
