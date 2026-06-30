import assert from 'node:assert/strict';
import test from 'node:test';
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
    parseArgs(['--out=.benchmark/synthetic', '--profile=warm', '--runs=2']),
    {
      out: '.benchmark/synthetic',
      profile: 'warm',
      runs: 2,
    }
  );
});

test('summarizeResults reports the standard Rsbuild median and mean', () => {
  assert.deepEqual(
    summarizeResults([
      { profile: 'cold', run: 1, durationSeconds: 45 },
      { profile: 'cold', run: 2, durationSeconds: 55 },
    ]),
    [
      {
        mode: 'rsbuild',
        profile: 'cold',
        samples: [45, 55],
        median: 50,
        mean: 50,
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
