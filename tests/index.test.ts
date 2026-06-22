import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import * as fs from 'node:fs';
import { pluginReactRouter } from '../src';

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
    expect(config.dev.writeToDisk).toBe(true);
    expect(config.dev.lazyCompilation).toBeUndefined();
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
      delete process.env.RR_TEST_SPLIT_ROUTE_MODULES;
      delete process.env.RR_TEST_ROUTE_COUNT;
    }
  });

  it('reduces file size reporting overhead for medium route builds by default', async () => {
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
      delete process.env.RR_TEST_ROUTE_COUNT;
    }
  });

  it('keeps explicit object file size reporting config for large split route builds', async () => {
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
      delete process.env.RR_TEST_SPLIT_ROUTE_MODULES;
      delete process.env.RR_TEST_ROUTE_COUNT;
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

    expect(config.dev.lazyCompilation).toEqual({
      entries: true,
      imports: true,
    });
  });

  it('should allow lazy compilation to be enabled with a boolean', async () => {
    const rsbuild = await createStubRsbuild({
      rsbuildConfig: {},
    });

    rsbuild.addPlugins([pluginReactRouter({ lazyCompilation: true })]);
    const config = await rsbuild.unwrapConfig();

    expect(config.dev.lazyCompilation).toBe(true);
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
