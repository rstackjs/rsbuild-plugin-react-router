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
        hmr: false,
        liveReload: true,
        writeToDisk: true,
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

    const mergedConfig = deepMerge(baseConfig, rsbuildConfig);

    return {
      addPlugins: rstest.fn(),
      unwrapConfig: rstest.fn().mockResolvedValue(mergedConfig),
      processAssets: rstest.fn(),
      onBeforeStartDevServer: rstest.fn(),
      onBeforeBuild: rstest.fn(),
      onAfterBuild: rstest.fn(),
      modifyRsbuildConfig: rstest.fn(),
      onAfterEnvironmentCompile: rstest.fn(),
      modifyEnvironmentConfig: rstest.fn(),
      transform: rstest.fn(),
      context: {
        rootPath: '/Users/bytedance/dev/rsbuild-plugin-react-router',
      },
      compiler: {
        webpack: {
          sources: {
            RawSource: mockRawSource,
          },
        },
      },
    };
  }),
})); 
