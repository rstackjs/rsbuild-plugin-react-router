import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createLogger } from '@rsbuild/core';
import { expect, it, rstest } from '@rstest/core';
import { getPackageVersion } from '../src/plugin-utils';
import * as actualPluginUtils from '../src/plugin-utils' with { rstest: 'importActual' };
import { runReactRouterPrerenderBuild } from '../src/prerender-build';
import { startServerBuildWorker } from '../src/server-build-worker-client';

rstest.mock('../src/server-build-worker-client', () => ({
  startServerBuildWorker: rstest.fn(),
}));
rstest.mock('../src/plugin-utils', () => ({
  ...actualPluginUtils,
  getPackageVersion: rstest.fn(),
}));

it('writes escaped classic redirects without consuming their body and releases the request', async () => {
  const buildDirectory = await mkdtemp(
    resolve(tmpdir(), 'rsbuild-prerender-redirect-')
  );
  const routes = {
    about: { id: 'about', path: 'about', file: 'routes/about.tsx' },
  };
  const close = rstest.fn(async () => {});
  let signal: AbortSignal | undefined;
  rstest.mocked(startServerBuildWorker).mockResolvedValueOnce({
    description: {
      routes: {
        about: {
          ...routes.about,
          module: { default: true, ErrorBoundary: false, loader: false },
        },
      },
      assets: { routes: {} },
    },
    handler: async request => {
      signal = request.signal;
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new Error('redirect body must not be read'));
          },
        }),
        {
          status: 302,
          headers: { location: '/target?x="<script>bad</script>&y=1' },
        }
      );
    },
    close,
  });
  try {
    await runReactRouterPrerenderBuild({
      api: {
        logger: createLogger({ level: 'silent' }),
        getNormalizedConfig: () => ({}) as never,
      },
      hasWebEnvironment: true,
      buildDirectory,
      ssr: true,
      isPrerenderEnabled: true,
      prerenderConfig: ['/about'],
      prerenderPaths: ['/about'],
      basename: '/',
      future: {} as never,
      routes,
      latestBrowserManifest: null,
      latestBrowserManifestModuleExports: {},
      clientStats: undefined,
      pluginOptions: {},
      appDirectory: buildDirectory,
      assetPrefix: '/',
      routeChunkOptions: undefined,
      buildManifest: { routes },
      buildEndReactRouterConfig: {} as never,
      buildEnd: undefined,
    });
    const html = await readFile(
      resolve(buildDirectory, 'client/about/index.html'),
      'utf8'
    );
    expect(html).toContain(
      'href="/target?x=&quot;&lt;script&gt;bad&lt;/script&gt;&amp;y=1"'
    );
    expect(html).not.toContain('<script>');
    expect(signal?.aborted).toBe(true);
    expect(close).toHaveBeenCalledOnce();
  } finally {
    await rm(buildDirectory, { recursive: true, force: true });
  }
});

it.each([
  ['8.4.0', '/_.data'],
  ['7.18.0', '/_root.data'],
])(
  'requests root data the way React Router %s handlers expect',
  async (version, expectedRequestPath) => {
    const buildDirectory = await mkdtemp(
      resolve(tmpdir(), 'rsbuild-prerender-root-data-')
    );
    rstest.mocked(getPackageVersion).mockReturnValueOnce(version);
    const routes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };
    const requestPaths: string[] = [];
    rstest.mocked(startServerBuildWorker).mockResolvedValueOnce({
      description: {
        routes: {
          root: {
            ...routes.root,
            module: { default: true, ErrorBoundary: false, loader: true },
          },
        },
        assets: { routes: { root: { hasLoader: true } } },
      },
      handler: async request => {
        const { pathname } = new URL(request.url);
        requestPaths.push(pathname);
        return new Response(pathname.endsWith('.data') ? 'data' : '<html>', {
          status: 200,
        });
      },
      close: async () => {},
    });
    try {
      await runReactRouterPrerenderBuild({
        api: {
          logger: createLogger({ level: 'silent' }),
          getNormalizedConfig: () => ({}) as never,
        },
        hasWebEnvironment: true,
        buildDirectory,
        ssr: true,
        isPrerenderEnabled: true,
        prerenderConfig: ['/'],
        prerenderPaths: ['/'],
        basename: '/',
        future: { unstable_trailingSlashAwareDataRequests: true } as never,
        routes,
        latestBrowserManifest: null,
        latestBrowserManifestModuleExports: {},
        clientStats: undefined,
        pluginOptions: {},
        appDirectory: buildDirectory,
        assetPrefix: '/',
        routeChunkOptions: undefined,
        buildManifest: { routes },
        buildEndReactRouterConfig: {} as never,
        buildEnd: undefined,
      });
      expect(requestPaths).toContain(expectedRequestPath);
      expect(
        await readFile(resolve(buildDirectory, 'client/_.data'), 'utf8')
      ).toBe('data');
    } finally {
      await rm(buildDirectory, { recursive: true, force: true });
    }
  }
);
