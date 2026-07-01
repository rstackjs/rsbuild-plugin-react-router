import { describe, expect, it } from '@rstest/core';
import {
  collectLazyCompilationPrewarmAssets,
  createRspackLazyCompilationTriggerClient,
  normalizeLazyCompilationPrewarmOptions,
} from '../src/lazy-compilation-prewarm';

const createManifest = () => ({
  version: 'dev',
  url: '/static/js/manifest.js',
  entry: {
    module: '/static/js/entry.client.js',
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
});
