import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from '@rstest/core';

describe('benchmark fixture generator', () => {
  it('creates the default focused SSR fixture', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 8,
      });

      expect(result).toEqual({
        updateFile: join(root, 'app/routes/route-0001.tsx'),
        updateRoutePaths: ['/'],
      });
      expect(existsSync(join(root, 'app/routes.ts'))).toBe(true);
      expect(existsSync(join(root, 'rsbuild.config.mjs'))).toBe(true);

      const routeConfig = readFileSync(join(root, 'app/routes.ts'), 'utf8');
      expect(routeConfig).toContain("id: 'route-0001'");
      expect(routeConfig).toContain("file: 'routes/route-0001.tsx'");
      expect(routeConfig).toContain("id: 'route-0008'");
      expect(existsSync(join(root, 'app/routes/route-0008.tsx'))).toBe(true);

      const routeModule = readFileSync(
        join(root, 'app/routes/route-0003.tsx'),
        'utf8'
      );
      expect(routeModule).toContain('export async function clientLoader');
      expect(routeModule).toContain('export default function Route0003');

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(rsbuildConfig).toContain(
        "import { pluginReact } from '@rsbuild/plugin-react';"
      );
      expect(rsbuildConfig).toContain('pluginReact(),');
      expect(rsbuildConfig.indexOf('pluginReact(),')).toBeLessThan(
        rsbuildConfig.indexOf('pluginReactRouter({')
      );
      expect(rsbuildConfig).toContain("serverOutput: 'module'");
      expect(rsbuildConfig).toContain('logPerformance');
      expect(rsbuildConfig).toContain('sourceMap: false');
      expect(rsbuildConfig).not.toContain('parallelRouteTransform:');

      const reactRouterConfig = readFileSync(
        join(root, 'react-router.config.ts'),
        'utf8'
      );
      expect(reactRouterConfig).toContain('ssr: true');
      expect(reactRouterConfig).toContain('splitRouteModules: false');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('can point the benchmark config at an explicit built plugin import', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      await generateSyntheticFixture({
        root,
        routeCount: 1,
        pluginImportPath: 'file:///repo/dist/index.js',
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(rsbuildConfig).toContain(
        "import { pluginReactRouter } from 'file:///repo/dist/index.js';"
      );
      expect(rsbuildConfig).toContain("serverOutput: 'module'");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('uses current plugin option names for benchmark environment toggles', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      await generateSyntheticFixture({
        root,
        routeCount: 1,
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(rsbuildConfig).toContain('REACT_ROUTER_BENCHMARK_LAZY_COMPILATION');
      expect(rsbuildConfig).toContain(
        'REACT_ROUTER_BENCHMARK_LAZY_COMPILATION_PREWARM'
      );
      expect(rsbuildConfig).toContain('unstableLazyCompilationPrewarm: true');
      expect(rsbuildConfig).not.toContain('lazyCompilationPrewarm: true');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('focused local benchmark cases', () => {
  it('registers the focused build and dev cases', async () => {
    const { benchmarkCases } = await import('../benchmarks/cases.mts');

    expect(benchmarkCases.map(({ id }) => id)).toEqual([
      'build-256-ssr',
      'dev-48-ssr',
    ]);
  });

  it('rejects an unknown benchmark case id', async () => {
    const { runBenchmarkCase } = await import('../benchmarks/cases.mts');
    const root = mkdtempSync(join(process.cwd(), '.benchmark-case-test-'));

    try {
      await expect(
        runBenchmarkCase(
          { id: 'unknown', mode: 'build', routeCount: 1 } as never,
          { pluginRoot: root, workRoot: join(root, 'work') }
        )
      ).rejects.toThrow('Unknown benchmark case "unknown".');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('cleans only the case-owned fixture directory', async () => {
    const { benchmarkCases, runBenchmarkCase } = await import(
      '../benchmarks/cases.mts'
    );
    const root = mkdtempSync(join(process.cwd(), '.benchmark-case-test-'));
    const pluginRoot = join(root, 'plugin-fixture');
    const workRoot = join(root, 'work');
    const preservedDirectory = join(workRoot, 'preserved');

    try {
      mkdirSync(pluginRoot, { recursive: true });
      mkdirSync(preservedDirectory, { recursive: true });
      writeFileSync(join(pluginRoot, 'fixture-marker'), 'fixture\n');

      await expect(
        runBenchmarkCase(benchmarkCases[0], { pluginRoot, workRoot })
      ).rejects.toThrow('Benchmark case "build-256-ssr" failed.');

      expect(() => statSync(pluginRoot)).not.toThrow();
      expect(() => statSync(preservedDirectory)).not.toThrow();
      expect(() => statSync(join(workRoot, benchmarkCases[0].id))).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('focused local benchmark runner', () => {
  it('writes measured samples after successful warmup runs', async () => {
    const { run } = await import('../benchmarks/run.mts');
    const root = mkdtempSync(join(process.cwd(), '.benchmark-runner-test-'));
    const pluginRoot = join(root, 'plugin');
    const out = join(root, 'local.json');
    const samples = [99, 30, 10];
    const ports: number[] = [];

    try {
      mkdirSync(pluginRoot, { recursive: true });
      writeFileSync(out, 'previous result\n');

      await run(
        [
          '--plugin-root',
          pluginRoot,
          '--out',
          out,
          '--case',
          'build-256-ssr',
          '--iterations',
          '2',
          '--warmup',
          '1',
        ],
        async (_definition, options) => {
          ports.push(options.port ?? 0);
          expect(readFileSync(out, 'utf8')).toBe('previous result\n');
          return { wallMs: samples[ports.length - 1] };
        }
      );

      expect(ports).toEqual([43000, 43001, 43002]);
      expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
        version: 1,
        pluginRoot,
        cases: [
          {
            id: 'build-256-ssr',
            samplesMs: [30, 10],
            medianMs: 20,
          },
        ],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects invalid iteration counts before starting benchmarks', () => {
    const result = spawnSync(
      process.execPath,
      ['benchmarks/run.mts', '--iterations', '0'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '--iterations must be a positive integer.'
    );
  });

  it('rejects duplicate and unknown case selections before starting benchmarks', () => {
    const duplicate = spawnSync(
      process.execPath,
      [
        'benchmarks/run.mts',
        '--case',
        'build-256-ssr',
        '--case',
        'build-256-ssr',
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    const unknown = spawnSync(
      process.execPath,
      ['benchmarks/run.mts', '--case', 'unknown'],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    expect(duplicate.status).toBe(1);
    expect(duplicate.stderr).toContain(
      'Duplicate benchmark case "build-256-ssr".'
    );
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain('Unknown benchmark case "unknown".');
  });
});
