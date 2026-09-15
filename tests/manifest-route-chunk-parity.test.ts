import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { rspack } from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';
import { getExportNames } from '../src/export-utils';
import { generateReactRouterManifestForDev } from '../src/manifest';
import {
  emptyRouteChunkSnippet,
  getRouteChunkEntryName,
  getRouteChunkIfEnabled,
  type RouteChunkCache,
} from '../src/route-chunks';

const routeId = 'routes/page';
const chunkEntryName = getRouteChunkEntryName(routeId, 'clientLoader');
const clientLoaderUrl = `/build/assets/${chunkEntryName}.js`;
type AnalysisOrder = 'manifest-first' | 'chunk-first';

const sharedTypeSource = `
  type Data = { value: string };
  export const clientLoader = async (): Promise<Data> => ({ value: 'client' });
  export const loader = async (): Promise<Data> => ({ value: 'server' });
  export default function Page() { return null; }
`;

const sharedRuntimeSource = `
  type Data = { value: string };
  const readData = (): Data => ({ value: 'shared' });
  export const clientLoader = (): Data => readData();
  export function loader(): Data { return readData(); }
  export default function Page() { return null; }
`;

const eraseTypes = (code: string) =>
  rspack.experiments.swc.transformSync(code, {
    filename: 'page.tsx',
    jsc: {
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true },
    },
    module: { type: 'es6' },
  }).code;

const createRouteArtifacts = async (code: string, order: AnalysisOrder) => {
  const root = mkdtempSync(join(tmpdir(), 'rr-manifest-chunk-parity-'));
  const appDirectory = join(root, 'app');
  const routeFile = join(appDirectory, 'routes/page.tsx');
  mkdirSync(join(appDirectory, 'routes'), { recursive: true });
  writeFileSync(
    join(appDirectory, 'root.tsx'),
    `export default function Root() { return null; }`
  );
  writeFileSync(routeFile, code);

  const cache: RouteChunkCache = new Map();
  const config = {
    splitRouteModules: true,
    appDirectory,
    rootRouteFile: 'root.tsx',
  };
  const getChunks = async () => ({
    named: await getRouteChunkIfEnabled(
      cache,
      config,
      routeFile,
      'clientLoader',
      code
    ),
    main: await getRouteChunkIfEnabled(cache, config, routeFile, 'main', code),
  });

  try {
    let chunks = order === 'chunk-first' ? await getChunks() : undefined;
    const { manifest } = await generateReactRouterManifestForDev(
      {
        root: { id: 'root', file: 'root.tsx', path: '' },
        [routeId]: {
          id: routeId,
          parentId: 'root',
          file: 'routes/page.tsx',
          path: 'page',
        },
      },
      {},
      {
        assetsByChunkName: {
          'entry.client': ['assets/entry.client.js'],
          root: ['assets/root.js'],
          [routeId]: [`assets/${routeId}.js`],
          [chunkEntryName]: [`assets/${chunkEntryName}.js`],
        },
      },
      appDirectory,
      '/build/',
      { ...config, isBuild: true, cache }
    );
    chunks ??= await getChunks();
    if (chunks.main === null) {
      throw new Error('Expected a main route chunk');
    }
    return {
      route: manifest.routes[routeId],
      routeFile,
      named: chunks.named ?? emptyRouteChunkSnippet(),
      main: chunks.main,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const expectChunkParity = async (
  artifacts: Awaited<ReturnType<typeof createRouteArtifacts>>,
  shouldSplit: boolean
) => {
  const namedExports = await getExportNames(
    artifacts.named,
    artifacts.routeFile
  );
  expect(artifacts.route.hasClientLoader).toBe(true);
  expect(Boolean(artifacts.route.clientLoaderModule)).toBe(
    namedExports.includes('clientLoader')
  );
  expect(namedExports).toEqual(shouldSplit ? ['clientLoader'] : []);
  expect(artifacts.route.clientLoaderModule).toBe(
    shouldSplit ? clientLoaderUrl : undefined
  );
  const mainExports = await getExportNames(artifacts.main, artifacts.routeFile);
  expect(mainExports.includes('loader')).toBe(!shouldSplit);
  expect(mainExports.includes('clientLoader')).toBe(!shouldSplit);
};

const evaluateModule = (
  code: string,
  globals: Record<string, unknown> = {}
) => {
  const output = rspack.experiments.swc.transformSync(code, {
    filename: 'page.tsx',
    jsc: {
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true, decorators: true },
      transform: { legacyDecorator: true, decoratorMetadata: true },
    },
    module: { type: 'commonjs' },
  });
  const exports: Record<string, unknown> = {};
  runInNewContext(output.code, { exports, ...globals });
  return exports;
};

const callExport = (exports: Record<string, unknown>, name: string) => {
  const exported = exports[name];
  if (typeof exported !== 'function') {
    throw new Error(`Expected callable export ${name}`);
  }
  return exported();
};

describe('manifest and route-chunk parity', () => {
  it.each([
    ['raw TypeScript', sharedTypeSource],
    ['type-erased JavaScript', eraseTypes(sharedTypeSource)],
  ])(
    'advertises the emitted typed client loader for %s',
    async (_name, code) => {
      for (const order of ['manifest-first', 'chunk-first'] as const) {
        const artifacts = await createRouteArtifacts(code, order);
        await expectChunkParity(artifacts, true);
        expect(
          await callExport(evaluateModule(artifacts.named), 'clientLoader')
        ).toEqual({ value: 'client' });
        expect(
          await callExport(evaluateModule(code), 'loader')
        ).toEqual({
          value: 'server',
        });
      }
    }
  );

  it.each([
    ['raw TypeScript', sharedRuntimeSource],
    ['type-erased JavaScript', eraseTypes(sharedRuntimeSource)],
  ])(
    'does not advertise an unsafe runtime split for %s',
    async (_name, code) => {
      for (const order of ['manifest-first', 'chunk-first'] as const) {
        const artifacts = await createRouteArtifacts(code, order);
        await expectChunkParity(artifacts, false);
        const main = evaluateModule(artifacts.main);
        expect(await callExport(main, 'clientLoader')).toEqual({
          value: 'shared',
        });
        expect(await callExport(main, 'loader')).toEqual({ value: 'shared' });
      }
    }
  );

  it('keeps decorator-sensitive type dependencies in the unsplit route', async () => {
    const artifacts = await createRouteArtifacts(
      `type Service = string;
       function decorate(..._args: unknown[]) {}
       function make() {
         const Service = class {};
         class Consumer { @decorate value!: Service; }
         return [Consumer, Service];
       }
       export const clientLoader = (_arg: Service) => make();
       export function loader(): Service { return 'server'; }
       export default function Page() { return null; }`,
      'manifest-first'
    );
    await expectChunkParity(artifacts, false);

    const metadataTypes: unknown[] = [];
    const main = evaluateModule(artifacts.main, {
      Reflect: {
        metadata(key: string, value: unknown) {
          if (key === 'design:type') metadataTypes.push(value);
          return () => {};
        },
      },
    });
    const result = callExport(main, 'clientLoader');
    const metadataType = metadataTypes[0];
    expect(metadataTypes).toHaveLength(1);
    if (typeof metadataType !== 'function' || !Array.isArray(result)) {
      throw new Error('Expected constructor metadata and returned classes');
    }
    expect(metadataType.name).toBe('Object');
    expect(metadataType).not.toBe(result[1]);
    expect(callExport(main, 'loader')).toBe('server');
  });
});
