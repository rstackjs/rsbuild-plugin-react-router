import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { registerModifyBrowserManifestAssets } from '../src/modify-browser-manifest';

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

const createAsset = (source: string) => ({
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
  assets: Record<string, Asset> = {}
) => ({
  namedChunks: new Map(namedChunks),
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
    return Object.entries(assets).map(([name, source]) => ({ name, source }));
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

const createSriHash = (source: string) =>
  `sha384-${createHash('sha384').update(source).digest('base64')}`;

describe('modify browser manifest plugin', () => {
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

  it('hashes build SRI after later asset stages mutate JavaScript', async () => {
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
        createAsset(optimizedEntrySource)
      );
      await harness.runStage('report', { assets, compilation });

      expect(reportedSri?.['/static/js/entry.client.js']).toBe(
        createSriHash(optimizedEntrySource)
      );
      expect(reportedSri?.['/static/js/entry.client.js']).not.toBe(
        createSriHash(originalEntrySource)
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
});
