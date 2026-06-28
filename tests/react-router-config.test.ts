import { describe, expect, it } from '@rstest/core';
import { resolveReactRouterConfig } from '../src/react-router-config';

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

  it('resolves stable subresource integrity from top-level config', async () => {
    const defaultResult = await resolveReactRouterConfig({});
    const enabledResult = await resolveReactRouterConfig({
      subResourceIntegrity: true,
    } as any);
    const futureResult = await resolveReactRouterConfig({
      future: { unstable_subResourceIntegrity: true },
    });

    expect(defaultResult.resolved.subResourceIntegrity).toBe(false);
    expect(enabledResult.resolved.subResourceIntegrity).toBe(true);
    expect(futureResult.resolved.subResourceIntegrity).toBe(true);
  });
});
