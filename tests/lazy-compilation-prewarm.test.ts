import { describe, expect, it, rstest } from '@rstest/core';
import { runPluginEffect } from '../src/effect-runtime';
import {
  collectLazyCompilationPrewarmAssets,
  createLazyCompilationPrewarmController,
  createRspackLazyCompilationTriggerClient,
  normalizeLazyCompilationPrewarmOptions,
} from '../src/lazy-compilation-prewarm';

const createManifest = (entryModule = '/static/js/entry.client.js') => ({
  version: 'dev',
  url: '/static/js/manifest.js',
  entry: {
    module: entryModule,
    imports: ['/static/js/entry-vendor.js'],
    css: [],
  },
  routes: {
    root: {
      id: 'root',
      module: '/static/js/root.js',
      hasAction: false,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: false,
      hasClientMiddleware: false,
      hasDefaultExport: true,
      hasErrorBoundary: false,
      imports: [],
      css: [],
    },
    'routes/about': {
      id: 'routes/about',
      path: 'about',
      module: '/static/js/routes/about.js',
      clientLoaderModule: '/static/js/routes/about-client-loader.js',
      hasAction: false,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: true,
      hasClientMiddleware: false,
      hasDefaultExport: true,
      hasErrorBoundary: false,
      imports: [],
      css: [],
    },
  },
});

describe('lazy compilation prewarm helpers', () => {
  it('normalizes enabled options with bounded defaults', () => {
    expect(normalizeLazyCompilationPrewarmOptions(false)).toBeNull();
    expect(normalizeLazyCompilationPrewarmOptions(true)).toMatchObject({
      entry: true,
      routeLimit: 8,
      delayMs: 0,
    });
  });

  it('collects entry and route assets without duplicates', () => {
    const config = normalizeLazyCompilationPrewarmOptions(true);

    if (!config) {
      throw new Error('Expected prewarm config.');
    }
    expect(
      collectLazyCompilationPrewarmAssets(createManifest(), config)
    ).toEqual([
      '/static/js/entry.client.js',
      '/static/js/entry-vendor.js',
      '/static/js/root.js',
      '/static/js/routes/about.js',
      '/static/js/routes/about-client-loader.js',
    ]);
  });

  it('extracts Rspack lazy proxy activation keys through the trigger client', () => {
    const source = `
      import { activate } from "@rspack/core/hot/lazy-compilation-web.js";
      activate({ data: "./app/entry.client.tsx", active: true, module });
      activate({ data: "./app/routes/about.tsx?react-router-route", active: true, module });
      activate({ data: "./app/entry.client.tsx", active: true, module });
    `;

    const client = createRspackLazyCompilationTriggerClient();

    expect(client.extractModuleKeys(source)).toEqual([
      './app/entry.client.tsx',
      './app/routes/about.tsx?react-router-route',
    ]);
  });

  it('reschedules in-flight prewarm work with the latest manifest', async () => {
    const config = normalizeLazyCompilationPrewarmOptions(true);
    if (!config) {
      throw new Error('Expected prewarm config.');
    }

    const originalFetch = globalThis.fetch;
    const assetFetches: string[] = [];
    const posts: string[] = [];
    let releaseFirstFetch: (() => void) | undefined;
    let firstFetchStarted: (() => void) | undefined;
    const firstFetch = new Promise<void>(resolve => {
      firstFetchStarted = resolve;
    });

    globalThis.fetch = rstest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (init?.method === 'POST') {
          posts.push(String(init.body));
          return { ok: true, text: async () => '' } as Response;
        }

        assetFetches.push(url);
        if (url.endsWith('/static/js/entry.client.js')) {
          firstFetchStarted?.();
          await new Promise<void>(resolve => {
            releaseFirstFetch = resolve;
          });
        }

        return {
          ok: true,
          text: async () => `activate({ data: ${JSON.stringify(url)} });`,
        } as Response;
      }
    ) as unknown as typeof fetch;

    const controller = createLazyCompilationPrewarmController({
      config,
      onError: error => {
        throw error;
      },
    });

    try {
      controller.setServerOrigin('http://localhost:3000');
      controller.setManifest(createManifest());
      controller.schedule();

      await firstFetch;
      controller.setManifest(createManifest('/static/js/latest-entry.js'));
      releaseFirstFetch?.();

      await expect
        .poll(() =>
          assetFetches.some(url => url.endsWith('/static/js/latest-entry.js'))
        )
        .toBe(true);
      await expect.poll(() => posts.length).toBeGreaterThan(0);
    } finally {
      await runPluginEffect(controller.cancelEffect());
      globalThis.fetch = originalFetch;
    }
  });
});
