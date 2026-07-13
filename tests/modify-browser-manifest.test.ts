import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  collectSubresourceIntegrity,
  registerModifyBrowserManifestAssets,
} from '../src/modify-browser-manifest';

const BROWSER_MANIFEST_PATH =
  'static/js/virtual/react-router/browser-manifest.js';
const PLACEHOLDER_MANIFEST_SOURCE =
  'window.__reactRouterManifest="PLACEHOLDER";';

const createTempApp = () => {
  const root = mkdtempSync(join(tmpdir(), 'rr-modify-manifest-'));
  const appDir = join(root, 'app');
  mkdirSync(join(appDir, 'routes'), { recursive: true });
  writeFileSync(
    join(appDir, 'root.tsx'),
    `export default function Root() { return null; }`
  );
  writeFileSync(
    join(appDir, 'routes/page.tsx'),
    `export default function Page() { return null; }`
  );
  return { root, appDir };
};

const createAsset = (source: string, integrity?: string) => ({
  info: integrity ? { integrity } : {},
  source: () => source,
  size: () => source.length,
});

class RawSource {
  constructor(private readonly value: string) {}
  source() {
    return this.value;
  }
  size() {
    return this.value.length;
  }
}

type Asset = ReturnType<typeof createAsset>;
type ProcessAssetsContext = {
  assets: Record<string, Asset>;
  compilation: unknown;
};
type ProcessAssetsDescriptor = {
  stage: string;
  environments?: string[];
};
type ProcessAssetsHandler = (
  context: ProcessAssetsContext & { sources: { RawSource: typeof RawSource } }
) => Promise<void> | void;
type ProcessAssetsRegistration = {
  descriptor: ProcessAssetsDescriptor;
  handler: ProcessAssetsHandler;
};

const createProcessAssetsHarness = () => {
  const registrations: ProcessAssetsRegistration[] = [];

  return {
    api: {
      processAssets(
        processAssetsDescriptor: ProcessAssetsDescriptor,
        processAssetsHandler: ProcessAssetsHandler
      ) {
        registrations.push({
          descriptor: processAssetsDescriptor,
          handler: processAssetsHandler,
        });
      },
    },
    getDescriptor: () => registrations[0]?.descriptor,
    getDescriptors: () =>
      registrations.map(registration => registration.descriptor),
    run(context: ProcessAssetsContext) {
      const registration = registrations[0];
      expect(registration).toBeDefined();
      return registration!.handler({ ...context, sources: { RawSource } });
    },
    runStage(stage: string, context: ProcessAssetsContext) {
      const registration = registrations.find(
        registration => registration.descriptor.stage === stage
      );
      expect(registration).toBeDefined();
      return registration!.handler({ ...context, sources: { RawSource } });
    },
  };
};

const createCompilation = (
  namedChunks: Array<[string, unknown]>,
  assets: Record<string, Asset> = {},
  entrypoints: Array<[string, unknown]> = []
) => ({
  namedChunks: new Map(namedChunks),
  entrypoints: new Map(entrypoints),
  assets,
  getAsset(name: string) {
    const asset = assets[name];
    return asset ? { name, source: asset } : undefined;
  },
  updateAsset(name: string, source: Asset) {
    assets[name] = source;
  },
  emitAsset(name: string, source: Asset) {
    assets[name] = source;
  },
  getAssets() {
    return Object.entries(assets).map(([name, source]) => ({
      name,
      source,
      info: source.info,
    }));
  },
});

const rootRoute = { id: 'root', file: 'root.tsx', path: '' };

const createRoutesWithPage = () => ({
  root: rootRoute,
  'routes/page': {
    id: 'routes/page',
    parentId: 'root',
    file: 'routes/page.tsx',
    path: 'page',
  },
});

const createBrowserManifestAssets = () => ({
  [BROWSER_MANIFEST_PATH]: createAsset(PLACEHOLDER_MANIFEST_SOURCE),
});

describe('modify browser manifest plugin', () => {
  it('uses official integrity metadata from stats and compilation assets', () => {
    const sri = collectSubresourceIntegrity(
      {
        assets: [
          {
            name: 'static/js/entry.client.js',
            integrity: 'sha384-entry',
          },
          {
            name: 'static/css/entry.client.css',
            integrity: 'sha384-css',
          },
          {
            name: 'static/js/no-integrity.js',
          },
        ],
      },
      {
        getAssets: () => [
          {
            name: 'static/js/route.js',
            info: {
              integrity: 'sha384-route',
            },
          },
          {
            name: '/static/js/already-prefixed.js',
            info: {
              integrity: 'sha384-prefixed',
            },
          },
        ],
      },
      '/assets/'
    );

    expect(sri).toEqual({
      '/assets/static/js/entry.client.js': 'sha384-entry',
      '/assets/static/css/entry.client.css': 'sha384-css',
      '/assets/static/js/route.js': 'sha384-route',
      '/static/js/already-prefixed.js': 'sha384-prefixed',
    });
  });

  it('returns undefined when Rspack does not provide integrity metadata', () => {
    const sri = collectSubresourceIntegrity(
      {
        assets: [
          {
            name: 'static/js/entry.client.js',
          },
        ],
      },
      {
        getAssets: () => [
          {
            name: 'static/js/route.js',
            info: {},
          },
        ],
      }
    );

    expect(sri).toBeUndefined();
  });

  it('registers browser manifest mutation with Rsbuild processAssets', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    const compilation = createCompilation(
      [
        ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
        ['root', { files: new Set(['static/js/root.js']) }],
      ],
      assets
    );

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        { root: rootRoute },
        {},
        appDir
      );

      expect(harness.getDescriptor()).toEqual({
        stage: 'additions',
        environments: ['web'],
      });
      await harness.run({ assets, compilation });

      expect(assets[BROWSER_MANIFEST_PATH].source()).toContain('routes');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('treats serialized browser manifest values as literal replacement text', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-modify-manifest-'));
    const appDir = join(root, 'app');
    const routeFile = join(appDir, 'routes/dollar.tsx');
    const specialRouteIds = [
      'routes/dollar$',
      'routes/match$&',
      'routes/literal$$',
    ] as const;
    mkdirSync(join(appDir, 'routes'), { recursive: true });
    writeFileSync(
      join(appDir, 'root.tsx'),
      `export default function Root() { return null; }`
    );
    writeFileSync(
      routeFile,
      `export default function Dollar() { return null; }`
    );
    const harness = createProcessAssetsHarness();
    const suffix = ';window.afterPlaceholder=true;';
    const assets = {
      [BROWSER_MANIFEST_PATH]: createAsset(
        `window.__reactRouterManifest="PLACEHOLDER"${suffix}`
      ),
    };
    const compilation = createCompilation(
      [
        ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
        ['root', { files: new Set(['static/js/root.js']) }],
        ...specialRouteIds.map((routeId, index) => [
          routeId,
          { files: new Set([`static/js/special-${index}.js`]) },
        ]),
      ],
      assets
    );

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        {
          root: rootRoute,
          ...Object.fromEntries(
            specialRouteIds.map((routeId, index) => [
              routeId,
              {
                id: routeId,
                parentId: 'root',
                file: 'routes/dollar.tsx',
                path: `special-${index}`,
              },
            ])
          ),
        },
        {},
        appDir
      );

      await harness.run({ assets, compilation });

      const source = assets[BROWSER_MANIFEST_PATH].source();
      for (const routeId of specialRouteIds) {
        expect(source).toContain(`'${routeId}'`);
      }
      expect(source).not.toContain('PLACEHOLDER');
      expect(source.match(/window\.afterPlaceholder=true/g)).toHaveLength(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports the exact compilation that produced the manifest', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    const compilation = createCompilation(
      [
        ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
        ['root', { files: new Set(['static/js/root.js']) }],
      ],
      assets
    );
    let reportedCompilation: unknown;

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        { root: rootRoute },
        {},
        appDir,
        '/',
        undefined,
        {
          onManifest(_manifest, _sri, _exports, context) {
            reportedCompilation = context.compilation;
          },
        }
      );

      await harness.run({ assets, compilation });

      expect(reportedCompilation).toBe(compilation);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('collects build SRI after later asset stages attach integrity metadata', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const originalEntrySource = 'console.log("before optimize");';
    const optimizedEntrySource = 'console.log("after optimize");';
    const assets = {
      ...createBrowserManifestAssets(),
      'static/js/entry.client.js': createAsset(originalEntrySource),
      'static/js/root.js': createAsset('console.log("root");'),
    };
    const compilation = createCompilation(
      [
        ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
        ['root', { files: new Set(['static/js/root.js']) }],
      ],
      assets
    );
    let reportedSri: Record<string, string> | undefined;

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        { root: rootRoute },
        {},
        appDir,
        '/',
        { isBuild: true },
        {
          future: { unstable_subResourceIntegrity: true },
          onManifest(_manifest, sri) {
            reportedSri = sri;
          },
        }
      );

      expect(harness.getDescriptors()).toEqual([
        { stage: 'additions', environments: ['web'] },
        { stage: 'report', environments: ['web'] },
      ]);

      await harness.runStage('additions', { assets, compilation });
      expect(reportedSri).toBeUndefined();

      compilation.updateAsset(
        'static/js/entry.client.js',
        createAsset(optimizedEntrySource, 'sha384-optimized-entry')
      );
      await harness.runStage('report', { assets, compilation });

      expect(reportedSri?.['/static/js/entry.client.js']).toBe(
        'sha384-optimized-entry'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects the promise hook when build route analysis fails', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    writeFileSync(join(appDir, 'routes/page.tsx'), 'export const = broken;');

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        createRoutesWithPage(),
        {},
        appDir,
        '/',
        { isBuild: true }
      );

      await expect(
        harness.run({
          assets: {},
          compilation: createCompilation([]),
        })
      ).rejects.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not read ignored chunk files while creating manifest stats', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    const ignoredChunk = {};
    Object.defineProperty(ignoredChunk, 'files', {
      get() {
        throw new Error('ignored chunk files should not be read');
      },
    });

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        createRoutesWithPage(),
        {},
        appDir
      );

      await harness.run({
        assets,
        compilation: createCompilation([
          ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
          ['root', { files: new Set(['static/js/root.js']) }],
          ['routes/page', { files: new Set(['static/js/routes/page.js']) }],
          ['vendor', ignoredChunk],
        ]),
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('uses actual manifest chunk names instead of theoretical split route chunks', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    const theoreticalSplitChunk = {};
    Object.defineProperty(theoreticalSplitChunk, 'files', {
      get() {
        throw new Error('theoretical split chunk files should not be read');
      },
    });

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        createRoutesWithPage(),
        {},
        appDir,
        '/',
        {
          splitRouteModules: true,
          rootRouteFile: 'root.tsx',
          isBuild: true,
        },
        {
          manifestChunkNames: new Set(['entry.client', 'root', 'routes/page']),
        }
      );

      await harness.run({
        assets,
        compilation: createCompilation([
          ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
          ['root', { files: new Set(['static/js/root.js']) }],
          ['routes/page', { files: new Set(['static/js/routes/page.js']) }],
          ['routes/page-client-loader', theoreticalSplitChunk],
        ]),
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('adds transitive entrypoint CSS without adding transitive JavaScript preloads', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    let manifest: unknown;

    try {
      registerModifyBrowserManifestAssets(
        harness.api as never,
        { root: rootRoute },
        {},
        appDir,
        '/',
        { isBuild: true },
        {
          onManifest(nextManifest) {
            manifest = nextManifest;
          },
        }
      );

      await harness.run({
        assets,
        compilation: createCompilation(
          [
            ['entry.client', { files: new Set(['static/js/entry.client.js']) }],
            ['vendor', { files: new Set(['static/js/vendor.js']) }],
          ],
          assets,
          [
            [
              'entry.client',
              {
                getFiles: () => [
                  'static/js/entry.client.js',
                  'static/js/vendor.js',
                  'static/css/reset.css',
                  'static/css/route.css',
                ],
              },
            ],
          ]
        ),
      });

      expect(manifest).toMatchObject({
        entry: {
          imports: ['/static/js/entry.client.js'],
          css: ['/static/css/reset.css', '/static/css/route.css'],
        },
      });
      expect((manifest as { entry: { imports: string[] } }).entry.imports).not
        .toContain('/static/js/vendor.js');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
