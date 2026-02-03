import * as fs from 'node:fs';
import { rstest } from '@rstest/core';

// Mock the file system
rstest.mock('node:fs', { spy: true });
rstest.spyOn(fs, 'existsSync').mockReturnValue(true);

// Mock jiti
rstest.mock('jiti', () => ({
  createJiti: () => ({
    import: rstest.fn().mockImplementation((path) => {
      if (path.includes('routes.ts')) {
        return Promise.resolve([
          {
            id: 'routes/index',
            file: 'routes/index.tsx',
            index: true,
          },
        ]);
      }
      return Promise.resolve({});
    }),
  }),
}));

// Mock webpack sources
const mockRawSource = rstest.fn().mockImplementation((content) => ({
  source: () => content,
  size: () => content.length,
}));

const deepMerge = (base: any, overrides: any): any => {
  if (!overrides || typeof overrides !== 'object') {
    return base;
  }
  if (!base || typeof base !== 'object') {
    return overrides;
  }
  const result: Record<string, any> = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (Array.isArray(value)) {
      result[key] = value.slice();
    } else if (value && typeof value === 'object') {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// Mock the @scripts/test-helper module
rstest.mock('@scripts/test-helper', () => ({
  createStubRsbuild: rstest.fn().mockImplementation(async ({ rsbuildConfig = {} } = {}) => {
    const baseConfig = {
      dev: {
        // Match Rsbuild defaults so plugin changes are observable in tests.
        // (Historically the plugin forced `hmr: false` / `liveReload: true`.)
        hmr: true,
        liveReload: true,
        writeToDisk: false,
        setupMiddlewares: [],
      },
      environments: {
        web: {
          tools: {
            rspack: {
              experiments: { outputModule: true },
              externalsType: 'module',
              output: {
                chunkFormat: 'module',
                module: true,
              },
            },
          },
        },
        node: {
          tools: {
            rspack: {
              externals: ['express'],
              experiments: { outputModule: true },
              output: {
                chunkFormat: 'commonjs',
                chunkLoading: 'require',
                module: false,
              },
            },
          },
        },
      },
      tools: {
        rspack: {
          plugins: [
            { constructor: { name: 'RspackVirtualModulePlugin' } },
          ],
        },
      },
      transforms: [
        { resourceQuery: /react-router-route/ },
      ],
    };

    let mergedConfig = deepMerge(baseConfig, rsbuildConfig);

    const mergeRsbuildConfig = (a: any, b: any) => deepMerge(a, b);
    const pending: Promise<unknown>[] = [];

    const stub: any = {
      addPlugins: rstest.fn(),
      unwrapConfig: rstest.fn(),
      processAssets: rstest.fn(),
      onBeforeStartDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
      onAfterBuild: rstest.fn(),
      getNormalizedConfig: rstest.fn().mockImplementation(() => mergedConfig),
      modifyRsbuildConfig: rstest.fn(),
      onAfterEnvironmentCompile: rstest.fn(),
      // Keep as a spy-only hook; tests in this repo assert against the merged
      // Rsbuild config (modifyRsbuildConfig), not post-normalization environment
      // mutations.
      modifyEnvironmentConfig: rstest.fn(),
      transform: rstest.fn(),
      logger: {
        warn: rstest.fn(),
        info: rstest.fn(),
        error: rstest.fn(),
      },
      context: {
        rootPath: '/Users/bytedance/dev/rsbuild-plugin-react-router',
        action: 'dev',
      },
      compiler: {
        webpack: {
          sources: {
            RawSource: mockRawSource,
          },
        },
      },
    };

    stub.modifyRsbuildConfig.mockImplementation((arg: any) => {
      const handler = typeof arg === 'function' ? arg : arg?.handler;
      if (typeof handler !== 'function') return;

      const res = handler(mergedConfig, { mergeRsbuildConfig });
      if (res && typeof res.then === 'function') {
        const p = res.then((next: any) => {
          if (next) mergedConfig = next;
          return next;
        });
        pending.push(p);
        return p;
      }
      if (res) mergedConfig = res;
      return res;
    });

    // In Rsbuild, `addPlugins()` triggers plugin setup before config is read.
    stub.addPlugins.mockImplementation((next: any[]) => {
      for (const plugin of next) {
        if (typeof plugin?.setup === 'function') {
          // Tests do not await `addPlugins`, so ensure `unwrapConfig` waits for setup.
          pending.push(Promise.resolve(plugin.setup(stub)));
        }
      }
    });

    stub.unwrapConfig.mockImplementation(async () => {
      await Promise.all(pending);
      return mergedConfig;
    });

    return stub;
  }),
})); 
