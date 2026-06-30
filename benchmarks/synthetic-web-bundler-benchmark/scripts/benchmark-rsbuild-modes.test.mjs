import assert from 'node:assert/strict';
import { availableParallelism, cpus } from 'node:os';
import test from 'node:test';
import {
  DEFAULT_MODES,
  formatMarkdown,
  getModeBuildConfig,
  parseArgs,
  parseReactRouterPerformanceLogs,
  resolveFastLoaderWorkerThreads,
  summarizeResults,
} from './rsbuild-mode-utils.mjs';

test('parseArgs defaults to embedded Rsbuild benchmark modes', () => {
  assert.deepEqual(parseArgs([]), {
    modes: ['rsbuild-optimized', 'rsbuild-js-transform-contention'],
    out: 'benchmark-results',
    profile: 'cold',
    runs: 10,
  });
  assert.deepEqual(DEFAULT_MODES, [
    'rsbuild-optimized',
    'rsbuild-js-transform-contention',
  ]);
});

test('parseArgs accepts explicit modes, runs, profile, and output directory', () => {
  assert.deepEqual(
    parseArgs([
      '--modes=rsbuild-js-transform-contention',
      '--out=.benchmark/synthetic',
      '--profile=warm',
      '--runs=2',
    ]),
    {
      modes: ['rsbuild-js-transform-contention'],
      out: '.benchmark/synthetic',
      profile: 'warm',
      runs: 2,
    }
  );
});

test('benchmark modes set explicit Rsbuild env', () => {
  const workerThreads = resolveFastLoaderWorkerThreads();
  assert.deepEqual(getModeBuildConfig('rsbuild-optimized'), {
    config: 'rsbuild.fast.config.ts',
    env: {
      RSPACK_LOADER_WORKER_THREADS: workerThreads,
      SYNTHETIC_RSBUILD_LIGHTNINGCSS: '1',
    },
  });
  assert.deepEqual(getModeBuildConfig('rsbuild-js-transform-contention'), {
    config: 'rsbuild.fast.config.ts',
    env: {
      RSPACK_LOADER_WORKER_THREADS: workerThreads,
      SYNTHETIC_REACT_COMPILER: 'with-react-compiler',
      SYNTHETIC_RSBUILD_APP_BABEL: '1',
      SYNTHETIC_RSBUILD_LIGHTNINGCSS: '1',
    },
  });
  assert.throws(() => getModeBuildConfig('rsbuild-fast'), /Unknown/);
});

test('fast loader workers default to available CPU cores minus two', () => {
  const availableCores = availableParallelism?.() ?? cpus().length;

  assert.equal(
    resolveFastLoaderWorkerThreads(),
    String(Math.max(1, availableCores - 2))
  );
});

test('summarizeResults marks the lowest median mode as fastest', () => {
  const summaries = summarizeResults([
    { mode: 'rsbuild-optimized', run: 1, durationSeconds: 45 },
    { mode: 'rsbuild-optimized', run: 2, durationSeconds: 55 },
    { mode: 'rsbuild-js-transform-contention', run: 1, durationSeconds: 60 },
    { mode: 'rsbuild-js-transform-contention', run: 2, durationSeconds: 64 },
  ]);

  assert.equal(
    summaries.find(summary => summary.mode === 'rsbuild-optimized').fastest,
    true
  );
  assert.equal(
    summaries.find(
      summary => summary.mode === 'rsbuild-js-transform-contention'
    ).fastest,
    false
  );
});

test('formatMarkdown includes samples, median, mean, and fastest marker', () => {
  const markdown = formatMarkdown({
    generatedAt: '2026-06-15T00:00:00.000Z',
    node: 'v22.22.2',
    platform: 'linux-x64',
    profile: 'cold',
    runs: 1,
    summaries: [
      {
        mode: 'rsbuild-optimized',
        fastest: true,
        samples: [47.09],
        median: 47.09,
        mean: 47.09,
      },
    ],
  });

  assert.match(markdown, /Benchmark Rsbuild Modes/);
  assert.match(markdown, /rsbuild-optimized/);
  assert.match(markdown, /47\.09/);
  assert.match(markdown, /fastest/);
});

test('parseReactRouterPerformanceLogs extracts JSON payloads from benchmark logs', () => {
  const logs = [
    'info starting build',
    'info [react-router:performance] {"environment":"web","compilerLifecycleMs":123.4,"operations":{"transform":{"count":2,"totalMs":12.3}}}',
    'info [react-router:performance] {"environment":"node","compilerLifecycleMs":45.6,"operations":{}}',
    'ready built in 10.2 s (web)',
  ].join('\n');

  assert.deepEqual(parseReactRouterPerformanceLogs(logs), [
    {
      environment: 'web',
      compilerLifecycleMs: 123.4,
      operations: {
        transform: {
          count: 2,
          totalMs: 12.3,
        },
      },
    },
    {
      environment: 'node',
      compilerLifecycleMs: 45.6,
      operations: {},
    },
  ]);
});

test('parseReactRouterPerformanceLogs rejects malformed prefixed JSON', () => {
  assert.throws(
    () => parseReactRouterPerformanceLogs('[react-router:performance] {nope'),
    /Invalid React Router performance log JSON/
  );
});
