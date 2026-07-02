import { describe, expect, it } from '@rstest/core';
import {
  resolveReactRouterConfig,
  resolveReactRouterConfigEffect,
} from '../src/react-router-config';
import { runPluginEffect } from '../src/effect-runtime';
import type { Config } from '../src/react-router-config';

describe('resolveReactRouterConfig', () => {
  it('merges presets and combines buildEnd hooks', async () => {
    let buildEndCalls = 0;
    const result = await resolveReactRouterConfig({
      presets: [
        {
          name: 'preset-a',
          reactRouterConfig: async () => ({
            basename: '/preset',
            future: { v8_middleware: true },
            buildEnd: async () => {
              buildEndCalls += 1;
            },
          }),
        },
      ],
      buildEnd: async () => {
        buildEndCalls += 1;
      },
    });

    expect(result.resolved.basename).toBe('/preset');
    await result.resolved.buildEnd?.({
      buildManifest: { routes: {} },
      reactRouterConfig: result.resolved,
      viteConfig: {} as any,
    });
    expect(buildEndCalls).toBe(2);
  });

  it('resolves presets through the Effect config path', async () => {
    let buildEndCalls = 0;
    const result = await runPluginEffect(
      resolveReactRouterConfigEffect({
        presets: [
          {
            name: 'preset-a',
            reactRouterConfig: async () => ({
              basename: '/effect-preset',
              buildEnd: async () => {
                buildEndCalls += 1;
              },
            }),
          },
        ],
        buildEnd: async () => {
          buildEndCalls += 1;
        },
      })
    );

    expect(result.resolved.basename).toBe('/effect-preset');
    await result.resolved.buildEnd?.({
      buildManifest: { routes: {} },
      reactRouterConfig: result.resolved,
      viteConfig: {} as any,
    });
    expect(buildEndCalls).toBe(2);
  });

  it('preserves server bundle selection in SSR mode', async () => {
    const serverBundles = async () => 'bundle';

    const result = await resolveReactRouterConfig({
      ssr: true,
      serverBundles,
    });

    expect(result.resolved.serverBundles).toBe(serverBundles);
  });

  it('distinguishes an explicit server module format from its default', async () => {
    const defaultResult = await resolveReactRouterConfig({});
    const configuredResult = await resolveReactRouterConfig({
      serverModuleFormat: 'cjs',
    });

    expect(defaultResult.hasConfiguredServerModuleFormat).toBe(false);
    expect(configuredResult.hasConfiguredServerModuleFormat).toBe(true);
  });

  it('defaults route module splitting on and respects the stable top-level option', async () => {
    const defaultResult = await resolveReactRouterConfig({});
    const disabledResult = await resolveReactRouterConfig({
      splitRouteModules: false,
    } as any);
    const enforcedResult = await resolveReactRouterConfig({
      splitRouteModules: 'enforce',
    } as any);

    expect(defaultResult.resolved.splitRouteModules).toBe(true);
    expect(disabledResult.resolved.splitRouteModules).toBe(false);
    expect(enforcedResult.resolved.splitRouteModules).toBe('enforce');
  });

  it('resolves stable config fields required by React Router 8', async () => {
    const defaultResult = await resolveReactRouterConfig({});
    const stableResult = await resolveReactRouterConfig({
      splitRouteModules: 'enforce',
      subResourceIntegrity: true,
    });
    const futureResult = await resolveReactRouterConfig({
      future: {
        v8_splitRouteModules: 'enforce',
        unstable_subResourceIntegrity: true,
      },
    });
    const precedenceResult = await resolveReactRouterConfig({
      splitRouteModules: true,
      subResourceIntegrity: false,
      future: {
        v8_splitRouteModules: false,
        unstable_subResourceIntegrity: true,
      },
    });

    expect(defaultResult.resolved.splitRouteModules).toBe(true);
    expect(defaultResult.resolved.subResourceIntegrity).toBe(false);
    expect(stableResult.resolved.splitRouteModules).toBe('enforce');
    expect(stableResult.resolved.subResourceIntegrity).toBe(true);
    expect(futureResult.resolved.splitRouteModules).toBe('enforce');
    expect(futureResult.resolved.subResourceIntegrity).toBe(true);
    expect(futureResult.resolved.future.unstable_subResourceIntegrity).toBe(
      true
    );
    expect(precedenceResult.resolved.splitRouteModules).toBe(true);
    expect(precedenceResult.resolved.subResourceIntegrity).toBe(false);
    expect(
      precedenceResult.resolved.future.unstable_subResourceIntegrity
    ).toBe(false);
  });

  it('lets user SRI config override preset aliases', async () => {
    const disablesPresetSriWithFuture = {
      presets: [
        {
          name: 'sri-preset',
          reactRouterConfig: async () => ({
            subResourceIntegrity: true,
          }),
        },
      ],
      future: { unstable_subResourceIntegrity: false },
    } satisfies Config;
    const disablesPresetSriWithTopLevel = {
      presets: [
        {
          name: 'sri-preset',
          reactRouterConfig: async () => ({
            future: { unstable_subResourceIntegrity: true },
          }),
        },
      ],
      subResourceIntegrity: false,
    } satisfies Config;

    const disabledByFuture = await resolveReactRouterConfig(
      disablesPresetSriWithFuture
    );
    const disabledByTopLevel = await resolveReactRouterConfig(
      disablesPresetSriWithTopLevel
    );
    expect(disabledByFuture.resolved.subResourceIntegrity).toBe(false);
    expect(
      disabledByFuture.resolved.future.unstable_subResourceIntegrity
    ).toBe(false);
    expect(disabledByTopLevel.resolved.subResourceIntegrity).toBe(false);
    expect(
      disabledByTopLevel.resolved.future.unstable_subResourceIntegrity
    ).toBe(false);
  });
});
