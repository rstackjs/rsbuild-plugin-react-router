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
    const optimizedEntrySource = 'console.log("after optimize");';
    const assets = {
      ...createBrowserManifestAssets(),
      'static/js/entry.client.js': createAsset(optimizedEntrySource),
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

      // Build mode defers manifest generation to the `report` stage, which
      // runs after Rspack's realContentHash rename and after integrity hashes
      // are attached. Only a single `report` registration is expected.
      expect(harness.getDescriptors()).toEqual([
        { stage: 'report', environments: ['web'] },
      ]);

      // Integrity metadata is attached to the finalized (post-hash) asset
      // before the `report` stage runs.
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

  it('enables SRI from the stable subResourceIntegrity config field', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const optimizedEntrySource = 'console.log("stable sri");';
    const assets = {
      ...createBrowserManifestAssets(),
      'static/js/entry.client.js': createAsset(
        optimizedEntrySource,
        'sha384-stable-entry'
      ),
    };
    const compilation = createCompilation(
      [['entry.client', { files: new Set(['static/js/entry.client.js']) }]],
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
          subResourceIntegrity: true,
          onManifest(_manifest, sri) {
            reportedSri = sri;
          },
        }
      );

      expect(harness.getDescriptors()).toEqual([
        { stage: 'report', environments: ['web'] },
      ]);

      await harness.runStage('report', { assets, compilation });

      expect(reportedSri?.['/static/js/entry.client.js']).toBe(
        'sha384-stable-entry'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('builds the manifest at the report stage from post-realContentHash asset names', async () => {
    const { root, appDir } = createTempApp();
    const harness = createProcessAssetsHarness();
    const assets = createBrowserManifestAssets();
    // Emulate Rspack's realContentHash rename: the entry chunk exposes its final
    // (post-rename) CSS/JS file names by the time PROCESS_ASSETS_STAGE_REPORT
    // runs. Reading them earlier (at `additions`) would capture the pre-rename
    // names that never appear in the output.
    const entrypoint = {
      getFiles: () => [
        'static/js/entry.client.aaaaaaaa.js',
        'static/css/entry.client.aaaaaaaa.css',
      ],
    };
    const compilation = createCompilation(
      [
        [
          'entry.client',
          { files: new Set(['static/js/entry.client.aaaaaaaa.js']) },
        ],
      ],
      assets,
      [['entry.client', entrypoint]]
    );
    let manifest:
      | { entry?: { css?: string[]; module?: string } }
      | undefined;

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
            manifest = nextManifest as typeof manifest;
          },
        }
      );

      // Build mode registers only the post-hash `report` stage.
      expect(harness.getDescriptors()).toEqual([
        { stage: 'report', environments: ['web'] },
      ]);

      await harness.runStage('report', { assets, compilation });

      expect(manifest?.entry?.css).toContain(
        '/static/css/entry.client.aaaaaaaa.css'
      );
      expect(manifest?.entry?.module).toBe(
        '/static/js/entry.client.aaaaaaaa.js'
      );

      // The emitted build manifest asset also reflects the post-rename names.
      const manifestAsset = Object.entries(assets).find(([name]) =>
        /manifest-.*\.js$/.test(name)
      );
      expect(manifestAsset).toBeDefined();
      const emitted = manifestAsset![1].source().toString();
      expect(emitted).toContain('static/css/entry.client.aaaaaaaa.css');
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
          // The entry's own module is excluded from imports (upstream parity),
          // and transitive entrypoint JS (vendor.js) is not added as a preload.
          imports: [],
          css: ['/static/css/reset.css', '/static/css/route.css'],
        },
      });
      const entryImports = (manifest as { entry: { imports: string[] } }).entry
        .imports;
      expect(entryImports).not.toContain('/static/js/vendor.js');
      expect(entryImports).not.toContain('/static/js/entry.client.js');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
