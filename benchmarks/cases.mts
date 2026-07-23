import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  appendNodeOption,
  runDevServerBenchmark,
} from '../scripts/benchmark/dev-server.mjs';
import { generateSyntheticFixture } from '../scripts/benchmark/fixture.mts';

export const benchmarkCases = [
  { id: 'build-256-ssr', mode: 'build', routeCount: 256 },
  { id: 'dev-48-ssr', mode: 'dev', routeCount: 48 },
] as const;

type BenchmarkCase = (typeof benchmarkCases)[number];

const harnessRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const rsbuildBin = path.join(
  harnessRoot,
  'node_modules',
  '@rsbuild',
  'core',
  'bin',
  'rsbuild.js'
);

const cleanBuildOutputs = async (fixtureRoot: string) => {
  await Promise.all([
    rm(path.join(fixtureRoot, 'build'), { recursive: true, force: true }),
    rm(path.join(fixtureRoot, '.react-router'), {
      recursive: true,
      force: true,
    }),
  ]);
};

const runCommand = async ({
  command,
  args,
  cwd,
  env,
}: {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}) =>
  new Promise<{ status: number; wallMs: number }>((resolve, reject) => {
    const startedAt = performance.now();
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' });

    child.once('error', reject);
    child.once('exit', code => {
      resolve({ status: code ?? 1, wallMs: performance.now() - startedAt });
    });
  });

const assertRegisteredCase = (definition: BenchmarkCase) => {
  if (!benchmarkCases.some(({ id }) => id === definition.id)) {
    throw new Error(`Unknown benchmark case "${definition.id}".`);
  }
};

const failedCaseError = (id: string) =>
  new Error(`Benchmark case "${id}" failed.`);

export const runBenchmarkCase = async (
  definition: BenchmarkCase,
  options: { pluginRoot: string; workRoot: string; port?: number }
): Promise<{ wallMs: number }> => {
  assertRegisteredCase(definition);

  const fixtureRoot = path.join(options.workRoot, definition.id);
  const pluginImportPath = pathToFileURL(
    path.resolve(options.pluginRoot, 'dist', 'index.js')
  ).href;

  try {
    const fixture = await generateSyntheticFixture({
      root: fixtureRoot,
      routeCount: definition.routeCount,
      pluginImportPath,
    });
    await cleanBuildOutputs(fixtureRoot);

    if (definition.mode === 'build') {
      const result = await runCommand({
        command: process.execPath,
        args: [rsbuildBin, 'build', '--config', 'rsbuild.config.mjs'],
        cwd: fixtureRoot,
        env: { ...process.env, NODE_ENV: 'production' },
      });

      if (result.status !== 0) {
        throw failedCaseError(definition.id);
      }
      return { wallMs: result.wallMs };
    }

    const port = options.port ?? 43000;
    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [
        rsbuildBin,
        'dev',
        '--config',
        'rsbuild.config.mjs',
        '--port',
        String(port),
      ],
      cwd: fixtureRoot,
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: appendNodeOption(
          process.env.NODE_OPTIONS,
          '--experimental-vm-modules'
        ),
      },
      readyEnvironments: ['web', 'node'],
      origin: `http://localhost:${port}`,
      routePaths: ['/'],
      routeTimeoutMs: 30_000,
      updateFile: fixture.updateFile,
      updateRoutePaths: fixture.updateRoutePaths,
      timeoutMs: 120_000,
    });

    if (result.status !== 0) {
      throw failedCaseError(definition.id);
    }
    return { wallMs: result.wallMs };
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
};
