import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from '@rstest/core';

describe('benchmark fixture generator', () => {
  it('creates a deterministic synthetic React Router app', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 8,
        variant: 'ssr-esm-split',
        sourceMap: true,
      });

      expect(result.routeCount).toBe(8);
      expect(result.variant).toBe('ssr-esm-split');
      expect(result.updateFile).toBe(join(root, 'app/routes/route-0001.tsx'));
      expect(result.updateRoutePaths).toEqual(['/']);
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
      expect(rsbuildConfig).toContain('logPerformance');
      expect(rsbuildConfig).toContain(
        "sourceMap: { js: 'cheap-module-source-map', css: false }"
      );
      expect(rsbuildConfig).not.toContain('parallelRouteTransform:');

      const reactRouterConfig = readFileSync(
        join(root, 'react-router.config.ts'),
        'utf8'
      );
      expect(reactRouterConfig).toContain('splitRouteModules: true');
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
        variant: 'ssr-esm',
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

  it('can enable parallel route transforms in benchmark config', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 1,
        variant: 'ssr-esm',
        parallelRouteTransform: 3,
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(result.parallelRouteTransform).toBe(3);
      expect(rsbuildConfig).toContain('parallelRouteTransform: 3,');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('can explicitly disable parallel route transforms in benchmark config', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 1,
        variant: 'ssr-esm',
        parallelRouteTransform: false,
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(result.parallelRouteTransform).toBe(false);
      expect(rsbuildConfig).toContain('parallelRouteTransform: false,');
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
        variant: 'ssr-esm',
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

  it('omits server-only route exports from SPA benchmark fixtures', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      await generateSyntheticFixture({
        root,
        routeCount: 8,
        variant: 'spa',
      });

      const rootModule = readFileSync(join(root, 'app/root.tsx'), 'utf8');
      expect(rootModule).toContain('Scripts');

      for (let index = 1; index <= 8; index += 1) {
        const routeModule = readFileSync(
          join(root, `app/routes/route-${String(index).padStart(4, '0')}.tsx`),
          'utf8'
        );
        expect(routeModule).not.toContain('function loader');
        expect(routeModule).not.toContain('function action');
        expect(routeModule).not.toContain('function headers');
        expect(routeModule).not.toContain('HydrateFallback');
        expect(routeModule).not.toContain('server-data.server');
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('generates deterministic named stress fixture shapes', async () => {
    const { benchmarkFixtureNames, generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    expect(benchmarkFixtureNames).toEqual([
      'default',
      'export-heavy',
      'reexports',
      'import-fanout',
      'chunk-saturated',
      'large',
    ]);

    const expectations = [
      {
        fixture: 'export-heavy',
        routeFile: 'app/routes/route-0001.tsx',
        snippets: ['unusedExport0001_31', 'export async function clientLoader'],
      },
      {
        fixture: 'reexports',
        routeFile: 'app/routes/route-0001.tsx',
        snippets: [
          "export * from '../route-reexports/reexport-all-0001'",
          'app/route-reexports/reexport-0001.ts',
        ],
      },
      {
        fixture: 'import-fanout',
        routeFile: 'app/routes/route-0001.tsx',
        snippets: ["from '../fanout/fanout-15'", 'fanoutValues'],
      },
      {
        fixture: 'chunk-saturated',
        routeFile: 'app/routes/route-0001.tsx',
        snippets: ['export async function clientAction', 'HydrateFallback'],
      },
    ];

    for (const { fixture, routeFile, snippets } of expectations) {
      const rootA = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-a-'));
      const rootB = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-b-'));

      try {
        const result = await generateSyntheticFixture({
          root: rootA,
          routeCount: 4,
          variant: 'ssr-esm-split',
          fixture,
        });
        await generateSyntheticFixture({
          root: rootB,
          routeCount: 4,
          variant: 'ssr-esm-split',
          fixture,
        });

        expect(result.fixture).toBe(fixture);
        const routeModuleA = readFileSync(join(rootA, routeFile), 'utf8');
        const routeModuleB = readFileSync(join(rootB, routeFile), 'utf8');
        expect(routeModuleA).toBe(routeModuleB);

        for (const snippet of snippets) {
          if (snippet.startsWith('app/')) {
            expect(existsSync(join(rootA, snippet))).toBe(true);
          } else {
            expect(routeModuleA).toContain(snippet);
          }
        }
      } finally {
        rmSync(rootA, { recursive: true, force: true });
        rmSync(rootB, { recursive: true, force: true });
      }
    }
  });

  it('generates the large synthetic app shape and statistics', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mts'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-large-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 2,
        variant: 'ssr-esm',
        fixture: 'large',
        largeConfig: {
          routes: 2,
          componentsPerRoute: 2,
          utilitiesPerRoute: 1,
          lazyModulesPerRoute: 1,
          workers: 2,
          restrictedModules: 2,
          svgAssets: 2,
          cssModules: 2,
          localeFiles: 2,
          localeTotalBytes: 2048,
          payloadEntriesPerComponent: 4,
          reactCompilerEvery: 2,
          secretEvery: 2,
          restrictedImportEvery: 2,
        },
      });

      expect(result.fixture).toBe('large');
      expect(result.routeCount).toBe(2);
      expect(result.updateFile).toBe(
        join(root, 'app/generated/routes/route-0000.tsx')
      );
      expect(result.updateRoutePaths).toEqual(['/']);
      expect(result.stats).toEqual({
        codeModules: 19,
        dynamicImports: 2,
        routes: 2,
        components: 4,
        utilities: 2,
        lazyModules: 2,
        workers: 2,
        restrictedModules: 2,
        svgAssets: 2,
        cssModules: 2,
        localeFiles: 2,
        localeTotalBytes: 2048,
      });
      expect(existsSync(join(root, 'app/generated/route-config.ts'))).toBe(
        true
      );
      expect(
        existsSync(join(root, 'app/generated/routes/route-0000.tsx'))
      ).toBe(true);
      expect(
        existsSync(
          join(root, 'app/generated/features/feature-0000/components/card-00.tsx')
        )
      ).toBe(true);
      expect(
        existsSync(join(root, 'app/generated/features/feature-0001/lazy/lazy-00.tsx'))
      ).toBe(true);
      expect(
        existsSync(join(root, 'app/generated/styles/style-0000.module.css'))
      ).toBe(true);
      expect(
        existsSync(join(root, 'public/generated/locales/synthetic-0001.json'))
      ).toBe(true);

      const routeModule = readFileSync(
        join(root, 'app/generated/routes/route-0000.tsx'),
        'utf8'
      );
      expect(routeModule).toContain(
        "import { FeatureShell0000 } from '../features/feature-0000/shell';"
      );
      expect(routeModule).toContain(
        "import('../features/feature-0000/lazy/lazy-00')"
      );
      expect(routeModule).toContain(
        "new Worker(new URL('../workers/worker-0000.ts', import.meta.url)"
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('accepts equals-form CLI options before benchmark selection', () => {
    const result = spawnSync(
      process.execPath,
      [
        'scripts/bench-builds.mts',
        '--profile=smoke',
        '--iterations=1',
        '--large-iterations=1',
        '--warmup=0',
        '--filter=missing',
        '--rspack-profile=ALL',
        '--rspack-trace-output=rspack.log',
        '--skip-root-build',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      }
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('No benchmarks matched filter "missing".');
    expect(result.stderr).not.toContain('Unknown benchmark argument');
  });

  it('accepts the large benchmark profile in the CLI', () => {
    const result = spawnSync(
      process.execPath,
      [
        'scripts/bench-builds.mts',
        '--profile=large',
        '--iterations=1',
        '--warmup=0',
        '--filter=missing',
        '--skip-root-build',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      }
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('No benchmarks matched filter "missing".');
    expect(result.stderr).not.toContain('Unknown profile "large"');
  });

  it('renders the embedded synthetic app benchmark row in CI reports', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-report-'));

    try {
      const baseBenchmark = {
        commit: 'base-sha',
        profile: 'full',
        mode: 'dev',
        iterations: 1,
        warmup: 0,
        benchmarks: [
          {
            id: 'large-355-ssr-esm',
            fixture: 'large',
            routeCount: 355,
            variant: 'ssr-esm',
            summary: {
              wallMs: { median: 1000, mean: 1020, p95: 1100 },
              readyMs: { median: 700 },
              routeTotalMs: { median: 300 },
              updateMs: { median: 220 },
              updateRouteTotalMs: { median: 180 },
              maxRssKb: { p95: 512000 },
            },
            runs: [{ wallMs: 1000 }],
            devRouteSummary: [
              {
                path: '/',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 240, mean: 240, p95: 240 },
                bytes: { median: 4096 },
              },
            ],
            devUpdateRouteSummary: [
              {
                path: '/',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 180, mean: 180, p95: 180 },
                bytes: { median: 4096 },
              },
            ],
            pluginOperations: [],
          },
          {
            id: 'synthetic-256-spa',
            routeCount: 256,
            variant: 'spa',
            summary: {
              wallMs: { median: 800, mean: 810, p95: 900 },
              readyMs: { median: 500 },
              routeTotalMs: { median: 250 },
              updateMs: { median: 160 },
              updateRouteTotalMs: { median: 90 },
              maxRssKb: { p95: 256000 },
            },
            runs: [{ wallMs: 800 }],
            devRouteSummary: [
              {
                path: '/route-0001',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 120, mean: 125, p95: 150 },
                bytes: { median: 2048 },
              },
            ],
            devUpdateRouteSummary: [
              {
                path: '/route-0001',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 90, mean: 95, p95: 110 },
                bytes: { median: 2048 },
              },
            ],
            pluginOperations: [
              {
                environment: 'web',
                operation: 'route:module',
                count: 256,
                totalMs: 600,
                wallMs: 400,
                maxMs: 20,
                reports: 1,
              },
            ],
          },
        ],
      };
      const headBenchmark = {
        ...baseBenchmark,
        commit: 'head-sha',
        benchmarks: [
          {
            ...baseBenchmark.benchmarks[0],
            summary: {
              wallMs: { median: 900, mean: 920, p95: 1000 },
              readyMs: { median: 650 },
              routeTotalMs: { median: 250 },
              updateMs: { median: 200 },
              updateRouteTotalMs: { median: 150 },
              maxRssKb: { p95: 500000 },
            },
            runs: [{ wallMs: 900 }],
            devRouteSummary: [
              {
                path: '/',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 200, mean: 200, p95: 200 },
                bytes: { median: 4096 },
              },
            ],
            devUpdateRouteSummary: [
              {
                path: '/',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 150, mean: 150, p95: 150 },
                bytes: { median: 4096 },
              },
            ],
          },
          {
            ...baseBenchmark.benchmarks[1],
            summary: {
              wallMs: { median: 760, mean: 780, p95: 840 },
              readyMs: { median: 460 },
              routeTotalMs: { median: 230 },
              updateMs: { median: 140 },
              updateRouteTotalMs: { median: 80 },
              maxRssKb: { p95: 250000 },
            },
            runs: [{ wallMs: 760 }],
            devRouteSummary: [
              {
                path: '/route-0001',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 100, mean: 105, p95: 130 },
                bytes: { median: 2048 },
              },
            ],
            devUpdateRouteSummary: [
              {
                path: '/route-0001',
                count: 1,
                statuses: ['200'],
                failures: 0,
                ms: { median: 80, mean: 85, p95: 100 },
                bytes: { median: 2048 },
              },
            ],
            pluginOperations: [
              {
                environment: 'web',
                operation: 'route:module',
                count: 256,
                totalMs: 500,
                wallMs: 350,
                maxMs: 18,
                reports: 1,
              },
            ],
          },
        ],
      };
      const baseBuildBenchmark = {
        ...baseBenchmark,
        mode: 'build',
        benchmarks: baseBenchmark.benchmarks.map(benchmark => ({
          ...benchmark,
          summary: {
            wallMs: benchmark.summary.wallMs,
            userMs: { median: 700 },
            sysMs: { median: 100 },
            maxRssKb: benchmark.summary.maxRssKb,
          },
          devRouteSummary: [],
          devUpdateRouteSummary: [],
        })),
      };
      const headBuildBenchmark = {
        ...headBenchmark,
        mode: 'build',
        benchmarks: headBenchmark.benchmarks.map(benchmark => ({
          ...benchmark,
          summary: {
            wallMs: benchmark.summary.wallMs,
            userMs: { median: 650 },
            sysMs: { median: 90 },
            maxRssKb: benchmark.summary.maxRssKb,
          },
          devRouteSummary: [],
          devUpdateRouteSummary: [],
        })),
      };
      const baseSynthetic = {
        generatedAt: '2026-06-15T00:00:00.000Z',
        node: 'v22.22.2',
        platform: 'linux-x64',
        runs: 1,
        summaries: [
          {
            mode: 'rsbuild',
            profile: 'cold',
            median: 40,
            mean: 40,
            samples: [40],
          },
          {
            mode: 'rsbuild',
            profile: 'dev',
            median: 12,
            mean: 12,
            samples: [12],
            readyMs: { median: 9000 },
            routeTotalMs: { median: 2200 },
            updateMs: { median: 800 },
          },
        ],
      };
      const headSynthetic = {
        ...baseSynthetic,
        summaries: [
          {
            ...baseSynthetic.summaries[0],
            median: 36,
            mean: 36,
            samples: [36],
          },
          {
            ...baseSynthetic.summaries[1],
            median: 11,
            mean: 11,
            samples: [11],
            readyMs: { median: 8500 },
            routeTotalMs: { median: 2000 },
            updateMs: { median: 700 },
          },
        ],
      };

      mkdirSync(join(root, 'base-synthetic'), { recursive: true });
      mkdirSync(join(root, 'head-synthetic'), { recursive: true });
      writeJson(join(root, 'base.json'), baseBenchmark);
      writeJson(join(root, 'head.json'), headBenchmark);
      writeJson(join(root, 'base-build.json'), baseBuildBenchmark);
      writeJson(join(root, 'head-build.json'), headBuildBenchmark);
      writeJson(join(root, 'base-synthetic/result-rsbuild.json'), baseSynthetic);
      writeJson(join(root, 'head-synthetic/result-rsbuild.json'), headSynthetic);
      writeJson(join(root, 'base-synthetic/latest.json'), {
        outputDirectory: join(root, 'base-synthetic'),
        generatedFiles: ['result-rsbuild.json'],
      });
      writeJson(join(root, 'head-synthetic/latest.json'), {
        outputDirectory: join(root, 'head-synthetic'),
        generatedFiles: ['result-rsbuild.json'],
      });

      const result = spawnSync(
        process.execPath,
        [
          'scripts/report-benchmark-ci.mts',
          '--base',
          join(root, 'base.json'),
          '--head',
          join(root, 'head.json'),
          '--build-base',
          join(root, 'base-build.json'),
          '--build-head',
          join(root, 'head-build.json'),
          '--synthetic-base',
          join(root, 'base-synthetic/latest.json'),
          '--synthetic-head',
          join(root, 'head-synthetic/latest.json'),
          '--out',
          join(root, 'report'),
        ],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        }
      );

      expect(result.status, result.stderr || result.stdout).toBe(0);
      const comment = readFileSync(join(root, 'report/comment.md'), 'utf8');
      const report = JSON.parse(
        readFileSync(join(root, 'report/report.json'), 'utf8')
      );
      expect(comment).toContain('### Production Build Benchmarks');
      expect(comment).toContain('Rendered 2 production build benchmarks.');
      expect(comment).toContain('### Dev Rollup');
      expect(comment).toContain(
        '| All dev fixtures | 2 | 1.80s | 1.66s | -7.8% | 1.20s | 1.11s | -7.5% | 0.55s | 0.48s | -12.7% | 0.38s | 0.34s | -10.5% | 1.08x |'
      );
      expect(comment).toContain(
        '| Large app | 1 | 1.00s | 0.90s | -10.0% | 0.70s | 0.65s | -7.1% | 0.30s | 0.25s | -16.7% | 0.22s | 0.20s | -9.1% | 1.11x |'
      );
      expect(comment).toContain(
        '| Standard fixtures | 1 | 0.80s | 0.76s | -5.0% | 0.50s | 0.46s | -8.0% | 0.25s | 0.23s | -8.0% | 0.16s | 0.14s | -12.5% | 1.05x |'
      );
      expect(comment).toContain('Rendered 2 dev benchmark fixtures');
      expect(comment).toContain('`large-355-ssr-esm`');
      expect(comment).toContain('`synthetic-256-spa`');
      expect(comment).not.toContain('Dev Route Requests');
      expect(comment).not.toContain('Dev Update Route Requests');
      expect(comment).toContain('#### synthetic-256-spa Plugin Operations');
      expect(comment).toContain('`route:module`');
      expect(comment).toContain('| web | `route:module` | 256 | 600.0ms | 500.0ms | -16.7% | 350.0ms | 18.0ms | 1 |');
      expect(comment).toContain('### Synthetic Rsbuild App');
      expect(comment).toContain('Rendered 1 production build benchmark.');
      expect(comment).toContain('Rendered 1 dev benchmark fixture from the embedded complex app.');
      expect(comment).toContain('complex app');
      expect(comment).toContain('| complex app | 1 | 40.00s | 36.00s | -10.0% | 36.00s | - | 1.11x | - |');
      expect(comment).toContain('| complex app | 1 | 12.00s | 11.00s | -8.3% | 9.00s | 8.50s | 2.20s | 2.00s | 0.80s | 0.70s | -12.5% | 11.00s | - | 1.09x | - |');
      expect(report.benchmarks).toHaveLength(2);
      expect(report.benchmarks.map((benchmark: { id: string }) => benchmark.id)).toEqual([
        'large-355-ssr-esm',
        'synthetic-256-spa',
      ]);
      expect(report.summaryGroups).toHaveLength(3);
      expect(report.summary.headWallMs).toBe(1660);
      expect(report.benchmarks[0].devRouteSummaries).toHaveLength(1);
      expect(
        report.benchmarks.find(
          (benchmark: { id: string }) => benchmark.id === 'synthetic-256-spa'
        ).pluginOperations
      ).toHaveLength(1);
      expect(report.syntheticBenchmark).toMatchObject({
        profile: 'cold',
        baseMedianSeconds: 40,
        headMedianSeconds: 36,
        deltaPercent: -10,
      });
      expect(report.syntheticBenchmarks).toHaveLength(2);
      expect(report.syntheticBenchmarks[1]).toMatchObject({
        profile: 'dev',
        headReadyMs: 8500,
        headRouteTotalMs: 2000,
        headUpdateMs: 700,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
function writeJson(file: string, value: unknown) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
