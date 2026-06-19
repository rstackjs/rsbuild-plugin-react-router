import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import { rspack } from '@rsbuild/core';
import * as fs from 'node:fs';
import path from 'node:path';
import { pluginReactRouter } from '../src';
import { getVirtualModuleFilePath } from '../src/virtual-modules';

describe('pluginReactRouter', () => {
  describe('basic configuration', () => {
    it('should apply default options when no options provided', async () => {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      // The plugin should not override Rsbuild's HMR defaults.
      expect(config.dev.hmr).toBe(true);
      expect(config.dev.liveReload).toBe(true);
      expect(config.dev.writeToDisk).toBe(true);
    });

    it('should respect customServer option', async () => {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter({ customServer: true })]);
      const config = await rsbuild.unwrapConfig();

      expect(config.dev.setupMiddlewares).toEqual([]);
    });

    it('should configure server output format correctly', async () => {
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
  });

  describe('environment configurations', () => {
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
  });

  describe('virtual modules', () => {
    it('should register virtual modules', async () => {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      const plugins = config.tools?.rspack?.plugins || [];
      const virtualModulePlugin = plugins.find(
        (p: any) => p.constructor.name === 'VirtualModulesPlugin'
      );

      expect(virtualModulePlugin).toBeDefined();

      const compiler = {
        context: '/virtual/project',
        hooks: {
          afterEnvironment: {
            tap: (_name: string, handler: () => void) => handler(),
          },
        },
      } as any;
      virtualModulePlugin.apply(compiler);

      const virtualFiles =
        rspack.experiments.VirtualModulesPlugin.__internal__take_virtual_files(
          compiler
        );
      const virtualFilePaths = virtualFiles?.map(file => file.path) || [];
      const virtualModulePath = (id: string) =>
        path.join(compiler.context, getVirtualModuleFilePath(id));

      expect(virtualFilePaths).toContain(
        virtualModulePath('virtual/react-router/browser-manifest')
      );
      expect(virtualFilePaths).toContain(
        virtualModulePath('virtual/react-router/server-build')
      );
      expect(virtualFilePaths).toContain(
        virtualModulePath('virtual/react-router/with-props')
      );
      expect(virtualFilePaths).not.toContain(
        '/virtual/project/virtual/react-router/browser-manifest'
      );
    });

    it('should map bare React Router virtual module ids to resolvable files', () => {
      expect(
        getVirtualModuleFilePath('virtual/react-router/browser-manifest')
      ).toBe('node_modules/virtual/react-router/browser-manifest.js');
      expect(
        getVirtualModuleFilePath('virtual/react-router/server-build-edge')
      ).toBe('node_modules/virtual/react-router/server-build-edge.js');

      expect(() =>
        getVirtualModuleFilePath('virtual/react-router/../server-build')
      ).toThrow('Invalid virtual module id');
      expect(() =>
        getVirtualModuleFilePath('virtual/other/server-build')
      ).toThrow('Virtual module id must start');
    });
  });

  describe('route transformations', () => {
    it('should transform route files correctly', async () => {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      rsbuild.addPlugins([pluginReactRouter()]);
      const config = await rsbuild.unwrapConfig();

      const transforms = config.transforms || [];
      const routeTransform = transforms.find(
        (t) => t.resourceQuery?.toString().includes('react-router-route')
      );

      expect(routeTransform).toBeDefined();
    });

    it('should register build and dot file transforms', async () => {
      process.env.RR_TEST_SPLIT_ROUTE_MODULES = 'true';
      const readFileSync = rstest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue('export default function Route() { return null; }');
      const rsbuild = await createStubRsbuild({
        action: 'build',
        rsbuildConfig: {},
      });

      try {
        const plugin = pluginReactRouter();
        await plugin.setup(rsbuild as any);
      } finally {
        delete process.env.RR_TEST_SPLIT_ROUTE_MODULES;
        readFileSync.mockRestore();
      }

      const calls = (rsbuild.transform as any).mock.calls.map(
        (call: any[]) => call[0]
      );

      expect(
        calls.some(
          (call: any) =>
            call.resourceQuery?.toString().includes('__react-router-build-client-route')
        )
      ).toBe(true);

      expect(
        calls.some(
          (call: any) =>
            call.resourceQuery?.toString().includes('route-chunk=') &&
            call.environments?.includes('web')
        )
      ).toBe(true);

      const splitRouteExportsTransform = calls.find(
        (call: any) =>
          typeof call.test === 'function' &&
          call.resourceQuery?.not?.toString().includes('route-chunk=') &&
          call.environments?.includes('web')
      );
      expect(splitRouteExportsTransform).toBeDefined();
      expect(
        splitRouteExportsTransform.test(path.resolve('app/routes/index.tsx'))
      ).toBe(true);
      expect(splitRouteExportsTransform.test(path.resolve('app/other.tsx'))).toBe(
        false
      );

      expect(
        calls.some(
          (call: any) =>
            call.test?.toString().includes('\\.server') &&
            call.environments?.includes('web')
        )
      ).toBe(true);

      expect(
        calls.some(
          (call: any) =>
            call.test?.toString().includes('\\.client') &&
            call.environments?.includes('node')
        )
      ).toBe(true);
    });
  });

  describe('asset handling', () => {
    it('should emit package.json for node environment', async () => {
      const rsbuild = await createStubRsbuild({
        rsbuildConfig: {},
      });

      const processAssets = rstest.fn();
      rsbuild.processAssets = processAssets;

      const plugin = pluginReactRouter({ serverOutput: 'commonjs' });
      await plugin.setup(rsbuild);

      expect(processAssets).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'additional',
          targets: ['node']
        }),
        expect.any(Function)
      );
    });
  });
});
