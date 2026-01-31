import { describe, expect, it } from '@rstest/core';
import type { Config } from '@react-router/dev/config';
import { getBuildManifest } from '../src/build-manifest';

describe('build manifest', () => {
  it('returns routes only when serverBundles is not configured', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
    };
    const result = await getBuildManifest({
      reactRouterConfig: {
        appDirectory: 'app',
        buildDirectory: 'build',
        serverBuildFile: 'index.js',
        future: {},
        serverBundles: undefined,
      },
      routes,
      rootDirectory: process.cwd(),
    });

    expect(result).toEqual({ routes });
  });

  it('builds server bundle mapping when serverBundles is configured', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/about': {
        id: 'routes/about',
        parentId: 'root',
        file: 'routes/about.tsx',
        path: 'about',
      },
    };

    const serverBundles: Config['serverBundles'] = async ({ branch }) => {
      return `bundle_${branch.length}`;
    };

    const result = await getBuildManifest({
      reactRouterConfig: {
        appDirectory: 'app',
        buildDirectory: 'build',
        serverBuildFile: 'index.js',
        future: {},
        serverBundles,
      },
      routes,
      rootDirectory: process.cwd(),
    });

    expect(result).toHaveProperty('serverBundles');
    expect(result).toHaveProperty('routeIdToServerBundleId');
    expect(result?.routes.root.file).toBeDefined();
  });

  it('validates server bundle IDs based on vite environment API flag', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/about': {
        id: 'routes/about',
        parentId: 'root',
        file: 'routes/about.tsx',
        path: 'about',
      },
    };

    const serverBundles: Config['serverBundles'] = async () => 'bad-id';

    await expect(
      getBuildManifest({
        reactRouterConfig: {
          appDirectory: 'app',
          buildDirectory: 'build',
          serverBuildFile: 'index.js',
          future: { v8_viteEnvironmentApi: true },
          serverBundles,
        },
        routes,
        rootDirectory: process.cwd(),
      })
    ).rejects.toThrow('underscores');
  });
});
