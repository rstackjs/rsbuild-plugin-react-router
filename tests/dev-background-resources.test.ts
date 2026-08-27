import { describe, expect, it, rstest } from '@rstest/core';
import {
  registerReactRouterDevBackgroundResources,
} from '../src/dev-background-resources';
import { createPluginEffectRuntime } from '../src/effect-runtime';

describe('dev background resources', () => {
  it('does not restart route watching from a compile callback after scope close', async () => {
    const runtime = createPluginEffectRuntime();
    const warn = rstest.fn();
    const runFork = rstest.spyOn(runtime, 'runFork');
    let onAfterDevCompile: (() => void) | undefined;
    const api = {
      logger: { warn },
      onBeforeStartDevServer: rstest.fn(),
      onAfterStartDevServer: rstest.fn(),
      onAfterDevCompile: rstest.fn((callback: () => void) => {
        onAfterDevCompile = callback;
      }),
    };

    try {
      await registerReactRouterDevBackgroundResources({
        api: api as never,
        runtime,
        isBuild: false,
        lazyCompilationPrewarm: false,
        routeRestartMarkerPath: '/project/.react-router/route-watch',
        watchDirectory: '/project/app',
        getRouteTopology: async () => new Set(['initial']),
        initialRouteTopology: new Set(['initial']),
        onRouteTopologyChange: undefined,
      });
      await runtime.dispose();
      runFork.mockClear();

      onAfterDevCompile?.();

      expect(onAfterDevCompile).toBeDefined();
      expect(runFork).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      await runtime.dispose();
    }
  });
});
