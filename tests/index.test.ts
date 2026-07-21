import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import * as fs from 'node:fs';
import { pluginReactRouter, shouldParallelizeEnvironmentBuilds } from '../src';

type ReactRouterTestGlobal = typeof globalThis & {
  __reactRouterTestConfig?: unknown;
  __reactRouterTestJitiCache?: Record<string, unknown>;
  __reactRouterTestJitiCacheAfterImport?: Record<string, unknown>;
};

const testGlobal = globalThis as ReactRouterTestGlobal;

type LazyCompilationTestModule = {
  resource?: string;
  nameForCondition?: () => string | null;
};

type LazyCompilationConfig = {
  test?: (module: LazyCompilationTestModule) => boolean;
};

const getLazyCompilationTest = (
  lazyCompilation: boolean | LazyCompilationConfig | undefined
) => {
  if (
    !lazyCompilation ||
    typeof lazyCompilation === 'boolean' ||
    typeof lazyCompilation.test !== 'function'
  ) {
    throw new Error('Expected lazy compilation to install a test function.');
  }
  return lazyCompilation.test;
};

const captureEnv = (keys: string[]) => {
  const previousValues = new Map(
    keys.map(key => [key, process.env[key]] as const)
  );
  return () => {
    for (const [key, value] of previousValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
};

describe('pluginReactRouter', () => {
  it('should configure basic plugin options', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    // The plugin should not override Rsbuild's HMR defaults.
    expect(config.dev.hmr).toBe(true);
    expect(config.dev.liveReload).toBe(true);
    expect(config.dev.writeToDisk).toBe(false);
    expect(config.dev.lazyCompilation).toMatchObject({
      entries: true,
      imports: true,
    });
    expect(
      config.dev.lazyCompilation.test({
        resource: `${process.cwd()}/app/entry.client.tsx`,
      })
    ).toBe(false);
  });

  it('preserves an explicit writeToDisk override', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        dev: { writeToDisk: true },
      },
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.writeToDisk).toBe(true);
  });

  it('adds the committed custom-server build entry only in development', async () => {
    const devRsbuild = await createStubRsbuild({ rsbuildConfig: {} });
    devRsbuild.addPlugins([pluginReactRouter({ customServer: true })]);
    const devConfig = await devRsbuild.unwrapConfig();

    expect(
      devConfig.environments.node.source.entry[
        'static/js/react-router-server-build'
      ]
    ).toBe('virtual/react-router/server-build');

    const buildRsbuild = await createStubRsbuild({
      action: 'build',
      rsbuildConfig: {},
    });
    buildRsbuild.addPlugins([pluginReactRouter({ customServer: true })]);
    const buildConfig = await buildRsbuild.unwrapConfig();

    expect(
      buildConfig.environments.node.source.entry[
        'static/js/react-router-server-build'
      ]
    ).toBeUndefined();
    expect(buildRsbuild.onBeforeDevCompile).not.toHaveBeenCalled();
    expect(buildRsbuild.onAfterDevCompile).not.toHaveBeenCalled();
    expect(buildRsbuild.onAfterCreateCompiler).not.toHaveBeenCalled();
  });

  it('should restart the dev server when route entries are added', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        dev: {
          watchFiles: {
            paths: 'custom.config.ts',
            type: 'reload-server',
          },
        },
      },
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.watchFiles).toEqual(
      expect.arrayContaining([
        {
          paths: 'custom.config.ts',
          type: 'reload-server',
        },
        {
          paths: expect.stringMatching(
            /react-router\.config\.[cm]?[jt]sx?$/
          ),
          type: 'reload-server',
        },
        {
          paths: expect.stringMatching(/app\/routes\.[cm]?[jt]sx?$/),
          type: 'reload-server',
        },
        {
          paths: expect.stringMatching(
            /build\/client\/\.react-router\/route-watch$/
          ),
          type: 'reload-server',
        },
      ])
    );
  });

  it('reloads the dev server when imported route config helpers change', async () => {
    testGlobal.__reactRouterTestJitiCache = {
      '/project/node_modules/jiti/dist/jiti.cjs': {
        filename: '/project/node_modules/jiti/dist/jiti.cjs',
      },
    };
    testGlobal.__reactRouterTestJitiCacheAfterImport = {
      '/project/app/routes.ts': {
        filename: '/project/app/routes.ts',
      },
      '/project/app/dev-routes.ts': {
        filename: '/project/app/dev-routes.ts',
      },
    };

    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.watchFiles).toEqual(
      expect.arrayContaining([
        {
          paths: expect.arrayContaining([
            expect.stringMatching(/app\/routes\.[cm]?[jt]sx?$/),
            expect.stringMatching(/app\/dev-routes\.ts$/),
          ]),
          type: 'reload-server',
        },
      ])
    );
  });

  it('watches all supported config filenames when the config does not exist yet', async () => {
    const existsSyncMock = fs.existsSync as unknown as {
      mockImplementation: (implementation: (path: unknown) => boolean) => void;
      mockReturnValue: (value: boolean) => void;
    };
    existsSyncMock.mockImplementation(
      path => !String(path).includes('react-router.config')
    );

    try {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();
      const configWatch = config.dev.watchFiles.find(
        (watchFile: { paths: unknown }) => Array.isArray(watchFile.paths)
      );

      expect(configWatch).toMatchObject({
        paths: expect.arrayContaining([
          expect.stringMatching(/react-router\.config\.tsx$/),
          expect.stringMatching(/react-router\.config\.ts$/),
          expect.stringMatching(/react-router\.config\.jsx$/),
          expect.stringMatching(/react-router\.config\.js$/),
          expect.stringMatching(/react-router\.config\.mjs$/),
          expect.stringMatching(/react-router\.config\.mts$/),
        ]),
        type: 'reload-server',
      });
    } finally {
      existsSyncMock.mockReturnValue(true);
    }
  });

  it('reloads the dev server when imported config helpers change', async () => {
    const existsSync = rstest.spyOn(fs, 'existsSync').mockImplementation(path => {
      const filePath = String(path);
      if (filePath.includes('react-router.config')) {
        return filePath.endsWith('react-router.config.ts');
      }
      return (
        filePath.endsWith('app/routes.ts') ||
        filePath.endsWith('app/root.tsx')
      );
    });
    testGlobal.__reactRouterTestJitiCache = {
      '/project/node_modules/jiti/dist/jiti.cjs': {
        filename: '/project/node_modules/jiti/dist/jiti.cjs',
      },
    };
    testGlobal.__reactRouterTestJitiCacheAfterImport = {
      '/project/react-router.config.ts': {
        filename: '/project/react-router.config.ts',
      },
      '/project/config/server-bundles.ts': {
        filename: '/project/config/server-bundles.ts',
      },
    };

    try {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.dev.watchFiles).toEqual(
        expect.arrayContaining([
          {
            paths: expect.arrayContaining([
              expect.stringMatching(/react-router\.config\.ts$/),
              expect.stringMatching(/config\/server-bundles\.ts$/),
            ]),
            type: 'reload-server',
          },
        ])
      );
    } finally {
      existsSync.mockReturnValue(true);
    }
  });

  it('lets custom route topology callbacks own route restart handling', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([
      pluginReactRouter({
        onRouteTopologyChange: () => {},
      }),
    ]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.watchFiles).toEqual(
      expect.arrayContaining([
        {
          paths: expect.stringMatching(
            /react-router\.config\.[cm]?[jt]sx?$/
          ),
          type: 'reload-server',
        },
      ])
    );
    expect(config.dev.watchFiles).not.toEqual(
      expect.arrayContaining([
        {
          paths: expect.stringMatching(/app\/routes\.[cm]?[jt]sx?$/),
          type: 'reload-server',
        },
      ])
    );
    expect(config.dev.watchFiles).not.toEqual(
      expect.arrayContaining([
        {
          paths: expect.stringMatching(
            /build\/client\/\.react-router\/route-watch$/
          ),
          type: 'reload-server',
        },
      ])
    );
  });

  it('should respect server output format', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ serverOutput: 'commonjs' })]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.output.chunkFormat).toBe('commonjs');
    expect(nodeConfig.output.chunkLoading).toBe('require');
    expect(nodeConfig.output.module).toBe(false);
  });

  it('configures web entries to avoid unnecessary entry IIFEs', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(
      config.environments?.web?.tools?.rspack?.optimization?.avoidEntryIife
    ).toBe(true);
  });

  it('reduces file size reporting overhead for medium split route builds by default', async () => {
    const restoreEnv = captureEnv([
      'RR_TEST_SPLIT_ROUTE_MODULES',
      'RR_TEST_ROUTE_COUNT',
    ]);
    process.env.RR_TEST_SPLIT_ROUTE_MODULES = 'true';
    process.env.RR_TEST_ROUTE_COUNT = '256';
    const readFileSync = rstest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('export default function Route() { return null; }');
    try {
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.performance?.printFileSize).toEqual({
        total: true,
        detail: false,
        compressed: false,
      });
    } finally {
      readFileSync.mockRestore();
      restoreEnv();
    }
  });

  it('reduces file size reporting overhead for medium route builds by default', async () => {
    const restoreEnv = captureEnv(['RR_TEST_ROUTE_COUNT']);
    process.env.RR_TEST_ROUTE_COUNT = '256';
    const readFileSync = rstest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('export default function Route() { return null; }');
    try {
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.performance?.printFileSize).toEqual({
        total: true,
        detail: false,
        compressed: false,
      });
    } finally {
      readFileSync.mockRestore();
      restoreEnv();
    }
  });

  it('keeps explicit object file size reporting config for large split route builds', async () => {
    const restoreEnv = captureEnv([
      'RR_TEST_SPLIT_ROUTE_MODULES',
      'RR_TEST_ROUTE_COUNT',
    ]);
    process.env.RR_TEST_SPLIT_ROUTE_MODULES = 'true';
    process.env.RR_TEST_ROUTE_COUNT = '1024';
    const readFileSync = rstest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('export default function Route() { return null; }');
    try {
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {
          performance: {
            printFileSize: {
              detail: true,
              compressed: true,
            },
          },
        },
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      expect(config.performance?.printFileSize).toEqual({
        detail: true,
        compressed: true,
      });
    } finally {
      readFileSync.mockRestore();
      restoreEnv();
    }
  });

  it('should forward lazy compilation when explicitly configured', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([
      pluginReactRouter({
        lazyCompilation: {
          entries: true,
          imports: true,
        },
      }),
    ]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toMatchObject({
      entries: true,
      imports: true,
    });
    const test = getLazyCompilationTest(config.dev.lazyCompilation);
    expect(
      test({
        resource: '/project/app/root.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      test({
        resource: '/project/app/components/card.tsx',
        nameForCondition: () => '/project/app/components/card.tsx',
      })
    ).toBe(true);
  });

  it('should allow lazy compilation to be enabled with a boolean', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ lazyCompilation: true })]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toMatchObject({
      entries: true,
      imports: true,
    });
    const test = getLazyCompilationTest(config.dev.lazyCompilation);
    expect(
      test({
        resource: `${process.cwd()}/app/entry.client.tsx`,
      })
    ).toBe(false);
  });

  it('allows lazy React Router entry and route modules when prewarming is enabled', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([
      pluginReactRouter({
        lazyCompilation: true,
        unstableLazyCompilationPrewarm: true,
      }),
    ]);
    const config = await rsbuild.unwrapConfig();

    expect(rsbuild.onAfterStartDevServer).toHaveBeenCalled();
    expect(rsbuild.onAfterDevCompile).toHaveBeenCalled();
    expect(rsbuild.onAfterCreateCompiler).toHaveBeenCalled();
    expect(rsbuild.onCloseDevServer).toHaveBeenCalled();
    expect(config.dev.lazyCompilation).toMatchObject({
      entries: true,
      imports: true,
    });

    const test = getLazyCompilationTest(config.dev.lazyCompilation);
    expect(
      test({
        resource: `${process.cwd()}/app/entry.client.tsx`,
      })
    ).toBe(true);
    expect(
      test({
        nameForCondition: () =>
          '/project/app/routes/home.tsx?react-router-route',
      })
    ).toBe(true);
    expect(
      test({
        resource: 'virtual/react-router/browser-manifest',
      })
    ).toBe(false);
  });

  it('guards direct Rsbuild lazy compilation config for React Router hydration entries', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        dev: {
          lazyCompilation: {
            entries: true,
            imports: false,
            test: /app/,
          },
        },
      },
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toMatchObject({
      entries: true,
      imports: false,
    });
    const test = getLazyCompilationTest(config.dev.lazyCompilation);
    expect(
      test({
        resource: '/project/app/routes/home.tsx?__react-router-build-client-route',
      })
    ).toBe(false);
    expect(
      test({
        resource: '/project/app/components/card.tsx',
        nameForCondition: () => '/project/app/components/card.tsx',
      })
    ).toBe(true);
    expect(
      test({
        resource: '/project/vendor/react.tsx',
        nameForCondition: () => '/project/vendor/react.tsx',
      })
    ).toBe(false);
  });

  it('should allow lazy compilation to be disabled', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ lazyCompilation: false })]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toBe(false);
  });

  it('should configure web environment correctly', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const webConfig = config.environments?.web?.tools?.rspack;
    expect(webConfig.experiments.outputModule).toBe(true);
    expect(webConfig.externalsType).toBe('module');
    expect(webConfig.output.chunkFormat).toBe('module');
    expect(webConfig.output.module).toBe(true);

    const webEntries = config.environments?.web?.source?.entry;
    expect(webEntries['entry.client']).toEqual(
      expect.stringMatching(/entry\.client/)
    );
    expect(webEntries['virtual/react-router/browser-manifest']).toEqual({
      import: 'virtual/react-router/browser-manifest',
      html: false,
    });
    expect(webEntries['routes/index']).toMatchObject({
      html: false,
    });
  });

  it('should enable Rsbuild SRI for the web environment when configured', async () => {
    testGlobal.__reactRouterTestConfig = {
      subResourceIntegrity: true,
    };
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    expect(config.environments?.web?.security?.sri?.enable).toBe(true);
    expect(config.environments?.node?.security?.sri).toBeUndefined();
  });

  it('should configure node environment correctly', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.externals).toContain('express');
    expect(nodeConfig.experiments.outputModule).toBe(true);
  });

  it('should apply the resolved development compiler dependency policy', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.dependencies).toEqual(
      shouldParallelizeEnvironmentBuilds({ isBuild: false })
        ? undefined
        : ['web']
    );
  });

  it.each([
    [{ isBuild: false, spareCoreCount: 4 }, true],
    [{ isBuild: false, spareCoreCount: 3 }, false],
    [{ isBuild: false, spareCoreCount: 1 }, false],
    [{ isBuild: false, spareCoreCount: 0 }, false],
    [{ isBuild: true, spareCoreCount: 8 }, false],
  ])('should resolve parallel environment build mode', (options, expected) => {
    expect(shouldParallelizeEnvironmentBuilds(options)).toBe(expected);
  });

  it('should keep the node compiler dependent on web during production builds', async () => {
    const rsbuild = await createStubRsbuild({
      action: 'build',
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter()]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.dependencies).toEqual(['web']);
  });

  it('should use async-node target for federation builds', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {
        environments: {
          node: {
            tools: {
              rspack: {
                target: 'async-node',
              },
            },
          },
        },
      },
    });

    rsbuild.addPlugins([pluginReactRouter({ federation: true })]);
    const config = await rsbuild.unwrapConfig();

    const nodeConfig = config.environments?.node?.tools?.rspack;
    expect(nodeConfig.target).toBe('async-node');
  });
});
