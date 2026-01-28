import { vi } from 'vitest';

// Mock the file system
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
  };
});

// Mock jiti
vi.mock('jiti', () => ({
  createJiti: () => ({
    import: vi.fn().mockImplementation((path) => {
      if (path.includes('routes.ts')) {
        return Promise.resolve([
          {
            id: 'root',
            file: 'root.tsx',
            children: [
              {
                id: 'routes/index',
                file: 'routes/index.tsx',
                index: true,
              },
            ],
          },
        ]);
      }
      return Promise.resolve({});
    }),
  }),
}));

// Mock webpack sources
const mockRawSource = vi.fn().mockImplementation((content) => ({
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
vi.mock('@scripts/test-helper', () => ({
  createStubRsbuild: vi.fn().mockImplementation(async ({ rsbuildConfig = {} } = {}) => {
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
      addPlugins: vi.fn(),
      unwrapConfig: vi.fn().mockResolvedValue(mergedConfig),
      processAssets: vi.fn(),
      onBeforeStartDevServer: vi.fn(),
      onBeforeBuild: vi.fn(),
      onAfterBuild: vi.fn(),
      modifyRsbuildConfig: vi.fn(),
      onAfterEnvironmentCompile: vi.fn(),
      modifyEnvironmentConfig: vi.fn(),
      transform: vi.fn(),
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
