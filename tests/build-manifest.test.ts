import { describe, expect, it } from '@rstest/core';
import { runPluginEffect } from '../src/effect-runtime';
import type { Config } from '../src/react-router-config';
import {
  getBuildManifest,
  getBuildManifestEffect,
  getRoutesByServerBundleId,
} from '../src/build-manifest';

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
    const bundleRoutes = getRoutesByServerBundleId(result, routes).bundle_2;
    expect(bundleRoutes.root.file).toBe('root.tsx');
    expect(bundleRoutes['routes/about'].file).toBe('routes/about.tsx');
  });

  it('builds server bundle mapping through the Effect path', async () => {
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

    const result = await runPluginEffect(
      getBuildManifestEffect({
        reactRouterConfig: {
          appDirectory: 'app',
          buildDirectory: 'build',
          serverBuildFile: 'index.js',
          future: {},
          serverBundles,
        },
        routes,
        rootDirectory: process.cwd(),
      })
    );

    const bundleRoutes = getRoutesByServerBundleId(result, routes).bundle_2;
    expect(bundleRoutes.root.file).toBe('root.tsx');
    expect(bundleRoutes['routes/about'].file).toBe('routes/about.tsx');
  });

  it('allows hyphenated server bundle IDs', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
      'routes/about': {
        id: 'routes/about',
        parentId: 'root',
        file: 'routes/about.tsx',
        path: 'about',
      },
    };

    const serverBundles: Config['serverBundles'] = async () => 'good-id';

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

    expect(result?.routeIdToServerBundleId.root).toBe('good-id');
  });

  it('rejects hyphenated server bundle IDs for the Vite environment API future', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
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
    ).rejects.toThrow('alphanumeric characters and underscores');
  });

  it('rejects invalid server bundle IDs', async () => {
    const routes = {
      root: { id: 'root', file: 'root.tsx', path: '' },
    };

    const serverBundles: Config['serverBundles'] = async () => 'bad/id';

    await expect(
      getBuildManifest({
        reactRouterConfig: {
          appDirectory: 'app',
          buildDirectory: 'build',
          serverBuildFile: 'index.js',
          future: {},
          serverBundles,
        },
        routes,
        rootDirectory: process.cwd(),
      })
    ).rejects.toThrow('hyphens and underscores');
  });
});
