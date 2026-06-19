import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from '@rstest/core';

describe('benchmark fixture generator', () => {
  it('creates a deterministic synthetic React Router app', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mjs'
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
      expect(rsbuildConfig).toContain('sourceMap: true');
      expect(rsbuildConfig).not.toContain('parallelTransforms:');

      const reactRouterConfig = readFileSync(
        join(root, 'react-router.config.ts'),
        'utf8'
      );
      expect(reactRouterConfig).toContain('v8_splitRouteModules');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('can point the benchmark config at an explicit built plugin import', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mjs'
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
      '../scripts/benchmark/fixture.mjs'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 1,
        variant: 'ssr-esm',
        parallelTransforms: { maxWorkers: 3 },
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(result.parallelTransforms).toEqual({ maxWorkers: 3 });
      expect(rsbuildConfig).toContain(
        'parallelTransforms: { maxWorkers: 3 },'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('can explicitly disable parallel route transforms in benchmark config', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mjs'
    );
    const root = mkdtempSync(join(tmpdir(), 'rr-benchmark-fixture-'));

    try {
      const result = await generateSyntheticFixture({
        root,
        routeCount: 1,
        variant: 'ssr-esm',
        parallelTransforms: false,
      });

      const rsbuildConfig = readFileSync(join(root, 'rsbuild.config.mjs'), 'utf8');
      expect(result.parallelTransforms).toBe(false);
      expect(rsbuildConfig).toContain('parallelTransforms: false,');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('omits server-only route exports from SPA benchmark fixtures', async () => {
    const { generateSyntheticFixture } = await import(
      '../scripts/benchmark/fixture.mjs'
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
      '../scripts/benchmark/fixture.mjs'
    );
    expect(benchmarkFixtureNames).toEqual([
      'default',
      'export-heavy',
      'reexports',
      'import-fanout',
      'chunk-saturated',
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

  it('accepts equals-form CLI options before benchmark selection', () => {
    const result = spawnSync(
      process.execPath,
      [
        'scripts/bench-builds.mjs',
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
});
