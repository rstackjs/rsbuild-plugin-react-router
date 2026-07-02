import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createDiagnostics,
  renderDiagnosticsMarkdown,
} from './ci-diagnostics.mjs';

const writeJson = (file, value) =>
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

const benchmarkResult = ({
  commit,
  mode,
  id,
  wallMs,
  pluginOperations = [],
}) => ({
  commit,
  mode,
  profile: 'full',
  iterations: wallMs.length,
  warmup: 0,
  benchmarks: [
    {
      id,
      routeCount: 256,
      variant: 'ssr-esm',
      runs: wallMs.map((sample, index) => ({
        status: 0,
        wallMs: sample,
        readyMs: mode === 'dev' ? sample - 100 : null,
        routeTotalMs: mode === 'dev' ? 200 + index : null,
        updateMs: mode === 'dev' ? 300 + index : null,
        updateRouteTotalMs: mode === 'dev' ? 100 + index : null,
        userMs: sample * 2,
        sysMs: 100 + index,
        maxRssKb: 300000 + index * 1024,
        pluginReports: [],
        rspackProfiles: [],
        rspackTraceOutput: null,
      })),
      summary: {},
      pluginOperations,
    },
  ],
});

test('createDiagnostics preserves benchmark samples and plugin operation timings', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'rr-ci-diag-'));
  await Promise.all([
    mkdir(path.join(root, 'build/base'), { recursive: true }),
    mkdir(path.join(root, 'build/head'), { recursive: true }),
    mkdir(path.join(root, 'dev/base'), { recursive: true }),
    mkdir(path.join(root, 'dev/head'), { recursive: true }),
    mkdir(path.join(root, 'report'), { recursive: true }),
  ]);

  await Promise.all([
    writeJson(
      path.join(root, 'build/base/baseline.json'),
      benchmarkResult({
        commit: 'base',
        mode: 'build',
        id: 'synthetic-256-ssr-esm',
        wallMs: [2000, 2100, 2200],
      })
    ),
    writeJson(
      path.join(root, 'build/head/baseline.json'),
      benchmarkResult({
        commit: 'head',
        mode: 'build',
        id: 'synthetic-256-ssr-esm',
        wallMs: [1800, 1900, 2000],
        pluginOperations: [
          {
            environment: 'web',
            operation: 'route:module',
            count: 3,
            totalMs: 900,
            wallMs: 300,
            maxMs: 120,
            reports: 3,
          },
        ],
      })
    ),
    writeJson(
      path.join(root, 'dev/base/baseline.json'),
      benchmarkResult({
        commit: 'base',
        mode: 'dev',
        id: 'large-355-ssr-esm',
        wallMs: [10000, 11000, 12000],
      })
    ),
    writeJson(
      path.join(root, 'dev/head/baseline.json'),
      benchmarkResult({
        commit: 'head',
        mode: 'dev',
        id: 'large-355-ssr-esm',
        wallMs: [9000, 9500, 10000],
      })
    ),
    writeJson(path.join(root, 'report/report.json'), {
      pullRequest: '54',
      runUrl: 'https://example.test/run',
      base: { sha: 'base' },
      head: { sha: 'head' },
    }),
  ]);

  const diagnostics = await createDiagnostics({ root });
  assert.equal(diagnostics.reportContext.pullRequest, '54');
  assert.equal(diagnostics.comparisons.length, 2);

  const build = diagnostics.comparisons.find(
    comparison => comparison.suite === 'production build'
  );
  assert.deepEqual(build.head.wallMs.samples, [1800, 1900, 2000]);
  assert.equal(build.head.wallMs.median, 1900);
  assert.equal(build.deltas.wallMs.toFixed(1), '-9.5');

  assert.equal(diagnostics.slowestPluginOperations.length, 1);
  assert.equal(
    diagnostics.slowestPluginOperations[0].operation,
    'route:module'
  );

  const markdown = renderDiagnosticsMarkdown(diagnostics);
  assert.match(markdown, /Benchmark Diagnostics/);
  assert.match(markdown, /synthetic-256-ssr-esm/);
  assert.match(markdown, /route:module/);
});
