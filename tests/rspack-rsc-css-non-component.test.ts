import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from '@rstest/core';
import {
  experiments,
  rspack,
  type MultiStats,
  type RspackOptions,
} from '@rspack/core';

type ClientReference = {
  $$typeof?: symbol;
};

type ClientManifestExport = {
  cssFiles?: string[];
};

type RscManifest = Record<
  string,
  {
    clientManifest: Record<string, ClientManifestExport>;
  }
>;

const compileVariant = async (withCss: boolean) => {
  const root = await mkdtemp(join(tmpdir(), 'rspack-rsc-css-reference-'));
  const serverOutput = join(root, 'dist/server');
  const clientOutput = join(root, 'dist/client');
  const rscEntry = join(root, 'entry.rsc.tsx');
  const clientEntry = join(root, 'entry.client.ts');
  const consumer = join(root, 'consumer.client.tsx');
  const dataModule = join(root, 'data.client.ts');
  let manifest: RscManifest | undefined;

  await mkdir(serverOutput, { recursive: true });
  await mkdir(clientOutput, { recursive: true });
  await writeFile(
    rscEntry,
    `import { dataFn } from './consumer.client';
export { dataFn };
`
  );
  await writeFile(clientEntry, 'export {};\n');
  await writeFile(
    consumer,
    `'use client';
export { dataFn } from './data.client';
`
  );
  await writeFile(
    dataModule,
    `${withCss ? "import './data.css';\n" : ''}export function dataFn() {
  return 'data';
}
`
  );
  if (withCss) {
    await writeFile(join(root, 'data.css'), '.data { color: red; }\n');
  }

  const { ClientPlugin, ServerPlugin } = experiments.rsc.createPlugins();
  const swcRule = {
    test: /\.[jt]sx?$/,
    use: [
      {
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
          rspackExperiments: { reactServerComponents: true },
        },
      },
    ],
  } satisfies NonNullable<
    NonNullable<RspackOptions['module']>['rules']
  >[number];
  const cssRule = {
    test: /\.css$/,
    type: 'css/auto',
  } satisfies NonNullable<
    NonNullable<RspackOptions['module']>['rules']
  >[number];
  const shared = {
    context: root,
    mode: 'production',
    resolve: {
      extensions: ['...', '.ts', '.tsx'],
      modules: [join(process.cwd(), 'node_modules')],
    },
    module: { rules: [cssRule, swcRule] },
    optimization: { chunkIds: 'named', moduleIds: 'named' },
  } satisfies RspackOptions;
  const compiler = rspack([
    {
      ...shared,
      name: 'server',
      target: 'node',
      entry: { main: { import: rscEntry } },
      output: {
        path: serverOutput,
        filename: '[name].cjs',
        library: { type: 'commonjs2' },
      },
      module: {
        rules: [
          cssRule,
          swcRule,
          {
            resource: rscEntry,
            layer: experiments.rsc.Layers.rsc,
            resolve: { conditionNames: ['react-server', '...'] },
          },
          {
            issuerLayer: experiments.rsc.Layers.rsc,
            resolve: { conditionNames: ['react-server', '...'] },
          },
        ],
      },
      plugins: [
        new ServerPlugin({
          onManifest(value) {
            manifest = value;
          },
        }),
      ],
    },
    {
      ...shared,
      name: 'client',
      target: 'web',
      entry: { main: { import: clientEntry } },
      output: {
        path: clientOutput,
        filename: '[name].js',
        cssChunkFilename: 'data.css',
      },
      plugins: [new ClientPlugin()],
    },
  ]);

  try {
    const stats = await new Promise<MultiStats>((resolve, reject) => {
      compiler.run((error, value) => {
        if (error) {
          reject(error);
        } else if (!value) {
          reject(new Error('Rspack completed without stats'));
        } else {
          resolve(value);
        }
      });
    });
    if (stats.hasErrors()) {
      const { errors } = stats.toJson({ all: false, errors: true });
      throw new Error(`Rspack compilation failed:\n${JSON.stringify(errors, null, 2)}`);
    }

    const serverBundle = pathToFileURL(join(serverOutput, 'main.cjs')).href;
    const serverExports = (await import(
      `${serverBundle}?variant=${withCss ? 'css' : 'control'}-${Date.now()}`
    )) as { dataFn: ClientReference };
    const manifestEntry = manifest?.main;
    if (!manifestEntry) {
      throw new Error('Rspack did not produce an RSC manifest for main');
    }
    const cssFiles = Object.values(manifestEntry.clientManifest).flatMap(
      value => value.cssFiles ?? []
    );

    return {
      cssFiles,
      dataFn: serverExports.dataFn,
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close(error => (error ? reject(error) : resolve()));
    });
    await rm(root, { recursive: true, force: true });
  }
};

it(
  'preserves a client reference without CSS in a non-component module',
  async () => {
    const { cssFiles, dataFn } = await compileVariant(false);

    expect(cssFiles).toEqual([]);
    expect(dataFn.$$typeof).toBe(Symbol.for('react.client.reference'));
  },
  60_000
);

it(
  'preserves a client reference with CSS in a non-component module',
  async () => {
    const { cssFiles, dataFn } = await compileVariant(true);

    expect(cssFiles).toContain('/data.css');
    expect(dataFn.$$typeof).toBe(Symbol.for('react.client.reference'));
  },
  60_000
);
