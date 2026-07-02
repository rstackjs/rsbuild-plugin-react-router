import { describe, expect, it } from '@rstest/core';
import type { ServerBuild } from 'react-router';
import { resolveReactRouterServerBuild } from '../src';

const createBuild = (version: string): ServerBuild =>
  ({
    entry: { module: { default: () => new Response() } },
    routes: {},
    assets: { routes: {}, version },
    assetsBuildDirectory: '/app/build/client',
    basename: '/',
    future: {},
    isSpaMode: false,
    prerender: [],
    publicPath: '/',
    routeDiscovery: { mode: 'initial' },
    ssr: true,
  }) as unknown as ServerBuild;

describe('resolveReactRouterServerBuild', () => {
  it('accepts a direct ESM server build', async () => {
    const build = createBuild('esm');

    await expect(resolveReactRouterServerBuild(build)).resolves.toMatchObject({
      assets: { version: 'esm' },
    });
  });

  it('accepts lazy route discovery with its optional manifest path omitted', async () => {
    const build = {
      ...createBuild('lazy'),
      routeDiscovery: { mode: 'lazy' as const },
    };

    await expect(resolveReactRouterServerBuild(build)).resolves.toMatchObject({
      assets: { version: 'lazy' },
      routeDiscovery: { mode: 'lazy' },
    });
  });

  it('accepts server builds with omitted route discovery', async () => {
    const { routeDiscovery: _routeDiscovery, ...build } = createBuild(
      'no-route-discovery'
    ) as ServerBuild & { routeDiscovery?: unknown };

    await expect(resolveReactRouterServerBuild(build)).resolves.toMatchObject({
      assets: { version: 'no-route-discovery' },
    });
  });

  it('unwraps CommonJS dynamic-import namespaces', async () => {
    const build = createBuild('commonjs');

    await expect(
      resolveReactRouterServerBuild({
        default: build,
        'module.exports': build,
      })
    ).resolves.toMatchObject({ assets: { version: 'commonjs' } });
  });

  it('prefers module.exports when a CommonJS namespace default is not a server build', async () => {
    const build = createBuild('module-exports');

    await expect(
      resolveReactRouterServerBuild({
        default: { routes: {} },
        'module.exports': build,
      })
    ).resolves.toMatchObject({ assets: { version: 'module-exports' } });
  });

  it('unwraps asynchronous namespace defaults', async () => {
    const build = createBuild('async-default');

    await expect(
      resolveReactRouterServerBuild({
        default: Promise.resolve(build),
      })
    ).resolves.toMatchObject({ assets: { version: 'async-default' } });
  });

  it('unwraps asynchronous module.exports namespace values', async () => {
    const build = createBuild('async-module-exports');

    await expect(
      resolveReactRouterServerBuild({
        default: { routes: {} },
        'module.exports': Promise.resolve(build),
      })
    ).resolves.toMatchObject({
      assets: { version: 'async-module-exports' },
    });
  });

  it('resolves recognized asynchronous build exports', async () => {
    const build = createBuild('async');

    await expect(
      resolveReactRouterServerBuild({
        ...build,
        assets: async () => build.assets,
      })
    ).resolves.toMatchObject({ assets: { version: 'async' } });
  });

  it('resolves server builds through the Effect path', async () => {
    const build = createBuild('effect');

    await expect(
      resolveReactRouterServerBuild({
        ...build,
        assets: async () => build.assets,
      })
    ).resolves.toMatchObject({ assets: { version: 'effect' } });
  });

  it('rejects modules without a React Router server build', async () => {
    await expect(
      resolveReactRouterServerBuild({ default: { routes: {} } })
    ).rejects.toThrow('valid React Router ServerBuild');
  });
});
