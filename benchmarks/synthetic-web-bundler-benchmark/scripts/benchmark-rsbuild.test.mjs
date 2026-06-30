import assert from 'node:assert/strict';
import test from 'node:test';
import { createReadyLogObserver } from '../../../scripts/benchmark/dev-server.mjs';
import {
  formatMarkdown,
  parseArgs,
  parseReactRouterPerformanceLogs,
  summarizeResults,
} from './benchmark-rsbuild-utils.mjs';

test('parseArgs defaults to the standard Rsbuild benchmark', () => {
  assert.deepEqual(parseArgs([]), {
    out: 'benchmark-results',
    profile: 'cold',
    runs: 10,
  });
});

test('parseArgs accepts runs, profile, and output directory', () => {
  assert.deepEqual(
    parseArgs(['--out=.benchmark/synthetic', '--profile=all', '--runs=2']),
    {
      out: '.benchmark/synthetic',
      profile: 'all',
      runs: 2,
    }
  );
});

test('summarizeResults reports build and dev metrics', () => {
  assert.deepEqual(
    summarizeResults([
      { profile: 'cold', run: 1, durationSeconds: 45 },
      { profile: 'cold', run: 2, durationSeconds: 55 },
      {
        profile: 'dev',
        run: 1,
        durationSeconds: 12,
        readyMs: 9000,
        routeTotalMs: 2000,
        updateMs: 500,
      },
    ]),
    [
      {
        mode: 'rsbuild',
        profile: 'cold',
        samples: [45, 55],
        median: 50,
        mean: 50,
        readyMs: { samples: [], median: null, mean: null },
        routeTotalMs: { samples: [], median: null, mean: null },
        updateMs: { samples: [], median: null, mean: null },
      },
      {
        mode: 'rsbuild',
        profile: 'dev',
        samples: [12],
        median: 12,
        mean: 12,
        readyMs: { samples: [9000], median: 9000, mean: 9000 },
        routeTotalMs: { samples: [2000], median: 2000, mean: 2000 },
        updateMs: { samples: [500], median: 500, mean: 500 },
      },
    ]
  );
});

test('formatMarkdown includes samples, median, and mean', () => {
  const markdown = formatMarkdown({
    generatedAt: '2026-06-15T00:00:00.000Z',
    node: 'v22.22.2',
    platform: 'linux-x64',
    profile: 'cold',
    runs: 1,
    summaries: [
      {
        mode: 'rsbuild',
        profile: 'cold',
        samples: [47.09],
        median: 47.09,
        mean: 47.09,
      },
    ],
  });

  assert.match(markdown, /Benchmark Rsbuild/);
  assert.match(markdown, /cold/);
  assert.match(markdown, /47\.09/);
  assert.match(markdown, /Update\/HMR rebuild/);
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

test('createReadyLogObserver handles ready lines split across chunks', () => {
  const environments = [];
  const observer = createReadyLogObserver(environment => {
    environments.push(environment);
  });

  observer.observe('stdout', 'ready   built in 1.');
  observer.observe('stdout', '23s (web)\nrea');
  observer.observe('stderr', 'ready   built in 0.');
  observer.observe('stderr', '45s ');
  observer.observe('stdout', 'dy   built in 2.34s (node)\n');
  observer.observe('stderr', '(node)\n');

  assert.deepEqual(environments, ['web', 'node', 'node']);
});

test('parseReactRouterPerformanceLogs rejects malformed prefixed JSON', () => {
  assert.throws(
    () => parseReactRouterPerformanceLogs('[react-router:performance] {nope'),
    /Invalid React Router performance log JSON/
  );
});
