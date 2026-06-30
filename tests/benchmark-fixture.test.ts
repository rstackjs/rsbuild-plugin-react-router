import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from '@rstest/core';
import { Effect } from 'effect';

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

  it('parses support reproduction benchmark defaults', async () => {
    const { parseSupportReproArgs } = await import(
      '../scripts/bench-support-repro.mts'
    );
    const options = await Effect.runPromise(parseSupportReproArgs([]));

    expect(options.repo).toBe(
      '/home/zack/Downloads/openai-support/synthetic-build-repro/synthetic-web-bundler-benchmark'
    );
    expect(options.runs).toBe(3);
    expect(options.profile).toBe('cold');
    expect(options.modes).toBe('rsbuild-fast');
    expect(options.packageSpec).toBe('local');
    expect(options.workdir).toBe('.benchmark/support-repro/workdir');
  });

  it('accepts support reproduction benchmark overrides', async () => {
    const { parseSupportReproArgs } = await import(
      '../scripts/bench-support-repro.mts'
    );
    const options = await Effect.runPromise(
      parseSupportReproArgs([
        '--repo=/tmp/synthetic-web-bundler-benchmark',
        '--runs=5',
        '--profile=both',
        '--modes=rsbuild-fast,rsbuild-no-tailwind',
        '--package=installed',
        '--skip-build',
        '--rspack-profile=OVERVIEW',
        '--out=.benchmark/results/support',
        '--workdir=.benchmark/support/workdir',
        '--dry-run',
      ])
    );

    expect(options.repo).toBe('/tmp/synthetic-web-bundler-benchmark');
    expect(options.runs).toBe(5);
    expect(options.profile).toBe('both');
    expect(options.modes).toBe('rsbuild-fast,rsbuild-no-tailwind');
    expect(options.packageSpec).toBe('installed');
    expect(options.skipBuild).toBe(true);
    expect(options.rspackProfile).toBe('OVERVIEW');
    expect(options.out).toBe('.benchmark/results/support');
    expect(options.workdir).toBe('.benchmark/support/workdir');
    expect(options.dryRun).toBe(true);
  });

  it('materializes the support reproduction benchmark without copied build outputs', async () => {
    const { isCopiedSupportEntry, materializeSupportBenchmarkRepo } =
      await import('../scripts/bench-support-repro.mts');
    expect(isCopiedSupportEntry('node_modules')).toBe(false);
    expect(isCopiedSupportEntry('benchmark-results')).toBe(false);
    expect(isCopiedSupportEntry('app')).toBe(true);
    const sourceRoot = mkdtempSync(join(tmpdir(), 'rr-support-source-'));
    const workdir = mkdtempSync(join(tmpdir(), 'rr-support-workdir-'));

    try {
      writeFileSync(
        join(sourceRoot, 'package.json'),
        JSON.stringify({
          scripts: { 'benchmark:rsbuild-modes': 'node scripts/bench.mjs' },
          devDependencies: { 'rsbuild-plugin-react-router': 'file:plugin.tgz' },
        })
      );
      mkdirSync(join(sourceRoot, 'scripts'), { recursive: true });
      writeFileSync(join(sourceRoot, 'scripts/bench.mjs'), '');
      mkdirSync(join(sourceRoot, 'app'), { recursive: true });
      writeFileSync(join(sourceRoot, 'app/root.tsx'), 'export default null;');
      mkdirSync(join(sourceRoot, 'node_modules'), { recursive: true });
      writeFileSync(join(sourceRoot, 'node_modules/ignored.txt'), '');
      mkdirSync(join(sourceRoot, 'benchmark-results'), { recursive: true });
      writeFileSync(join(sourceRoot, 'benchmark-results/ignored.json'), '{}');

      await Effect.runPromise(
        materializeSupportBenchmarkRepo({ sourceRepo: sourceRoot, workdir })
      );

      expect(existsSync(join(workdir, 'package.json'))).toBe(true);
      expect(existsSync(join(workdir, 'scripts/bench.mjs'))).toBe(true);
      expect(existsSync(join(workdir, 'app/root.tsx'))).toBe(true);
      const workdirEntries = readdirSync(workdir).sort();
      expect(workdirEntries).not.toContain('node_modules');
      expect(workdirEntries).not.toContain('benchmark-results');
    } finally {
      rmSync(sourceRoot, { recursive: true, force: true });
      rmSync(workdir, { recursive: true, force: true });
    }
  });

  it('rejects invalid support reproduction run counts', async () => {
    const { parseSupportReproArgs } = await import(
      '../scripts/bench-support-repro.mts'
    );

    await expect(
      Effect.runPromise(parseSupportReproArgs(['--runs=0']))
    ).rejects.toThrow('--runs must be a positive integer.');
  });

  it('rejects mixed benchmark modes in CI reports', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-report-'));
    try {
      const base = join(root, 'base.json');
      const head = join(root, 'head.json');
      writeFileSync(
        base,
        JSON.stringify({ mode: 'build', benchmarks: [] }),
        'utf8'
      );
      writeFileSync(
        head,
        JSON.stringify({ mode: 'dev', benchmarks: [] }),
        'utf8'
      );

      const result = spawnSync(
        process.execPath,
        ['scripts/report-benchmark-ci.mts', '--base', base, '--head', head],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        }
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        'Cannot compare benchmark results with different modes: base=build, head=dev.'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('includes support reproduction benchmarks in CI reports', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-report-'));
    try {
      const base = join(root, 'base.json');
      const head = join(root, 'head.json');
      const supportBase = join(root, 'support-base.json');
      const supportHead = join(root, 'support-head.json');
      const supportBaseWorkdir = join(root, 'support-base-workdir');
      const supportHeadWorkdir = join(root, 'support-head-workdir');
      const outDir = join(root, 'report');
      mkdirSync(join(supportBaseWorkdir, 'benchmark-results'), {
        recursive: true,
      });
      mkdirSync(join(supportHeadWorkdir, 'benchmark-results'), {
        recursive: true,
      });
      writeFileSync(
        base,
        JSON.stringify({ mode: 'dev', benchmarks: [] }),
        'utf8'
      );
      writeFileSync(
        head,
        JSON.stringify({ mode: 'dev', benchmarks: [] }),
        'utf8'
      );
      writeFileSync(
        join(
          supportBaseWorkdir,
          'benchmark-results/2026-06-30T00-00-00Z-rsbuild-modes.json'
        ),
        JSON.stringify({
          profile: 'cold',
          runs: 1,
          summaries: [
            {
              mode: 'rsbuild-fast',
              samples: [70],
              median: 70,
              mean: 70,
            },
          ],
        }),
        'utf8'
      );
      writeFileSync(
        join(
          supportHeadWorkdir,
          'benchmark-results/2026-06-30T00-00-01Z-rsbuild-modes.json'
        ),
        JSON.stringify({
          profile: 'cold',
          runs: 1,
          summaries: [
            {
              mode: 'rsbuild-fast',
              samples: [63],
              median: 63,
              mean: 63,
            },
          ],
        }),
        'utf8'
      );
      writeFileSync(
        supportBase,
        JSON.stringify({
          generatedFiles: [
            'benchmark-results/2026-06-30T00-00-00Z-rsbuild-modes.json',
          ],
          packageSpec: 'base.tgz',
          workdir: supportBaseWorkdir,
        }),
        'utf8'
      );
      writeFileSync(
        supportHead,
        JSON.stringify({
          generatedFiles: [
            'benchmark-results/2026-06-30T00-00-01Z-rsbuild-modes.json',
          ],
          packageSpec: 'head.tgz',
          workdir: supportHeadWorkdir,
        }),
        'utf8'
      );

      const result = spawnSync(
        process.execPath,
        [
          'scripts/report-benchmark-ci.mts',
          '--base',
          base,
          '--head',
          head,
          '--support-base',
          supportBase,
          '--support-head',
          supportHead,
          '--out',
          outDir,
        ],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        }
      );

      expect(result.status).toBe(0);
      const comment = readFileSync(join(outDir, 'comment.md'), 'utf8');
      expect(comment).toContain('### Support Repo Benchmark');
      expect(comment).toContain('| `rsbuild-fast` | 70.00s | 63.00s | -10.0% | 1.11x | `1` | `cold` |');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
