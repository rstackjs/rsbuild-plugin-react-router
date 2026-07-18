import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  createReadyLogObserver,
  runDevServerBenchmark,
} from '../../../scripts/benchmark/dev-server.mjs';
import {
  expandProfiles,
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

test('expandProfiles maps grouped profiles to concrete benchmark runs', () => {
  assert.deepEqual(expandProfiles('cold'), ['cold']);
  assert.deepEqual(expandProfiles('both'), ['cold', 'warm']);
  assert.deepEqual(expandProfiles('all'), ['cold', 'warm', 'dev']);
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

const withTempDir = async callback => {
  const dir = await mkdtemp(join(tmpdir(), 'rr-benchmark-test-'));
  try {
    return await callback(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const writeChildScript = async (dir, source) => {
  const script = join(dir, 'child.mjs');
  await writeFile(script, source);
  return script;
};

test('runDevServerBenchmark stops a ready dev server successfully', async () => {
  await withTempDir(async dir => {
    const script = await writeChildScript(
      dir,
      [
        "console.log('ready built in 1.0s (web)');",
        "console.error('ready built in 1.1s (node)');",
        'setTimeout(() => {}, 10_000);',
      ].join('\n')
    );

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web', 'node'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 1_000,
      captureOutput: false,
    });

    assert.equal(result.status, 0);
    assert.equal(result.signal, 'SIGTERM');
    assert.equal(result.timedOut, false);
    assert.equal(typeof result.readyMs, 'number');
  });
});

test('runDevServerBenchmark preserves successful cleanup when SIGTERM maps to a nonzero exit', async () => {
  await withTempDir(async dir => {
    const script = await writeChildScript(
      dir,
      [
        "process.on('SIGTERM', () => process.exit(143));",
        "console.log('ready built in 1.0s (web)');",
        'setTimeout(() => {}, 10_000);',
      ].join('\n')
    );

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 1_000,
      captureOutput: false,
    });

    assert.equal(result.status, 0);
    assert.equal(result.signal, null);
  });
});

test('runDevServerBenchmark propagates a nonzero exit after readiness before cleanup', async () => {
  await withTempDir(async dir => {
    const script = await writeChildScript(
      dir,
      [
        "console.log('ready built in 1.0s (web)');",
        'setTimeout(() => process.exit(7), 50);',
      ].join('\n')
    );

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 1_000,
      stopAfterReady: false,
      captureOutput: false,
    });

    assert.equal(result.status, 7);
    assert.equal(result.signal, null);
  });
});

test('runDevServerBenchmark settles a timed-out ready rebuild', async () => {
  await withTempDir(async dir => {
    const updateFile = join(dir, 'route.ts');
    const source = 'export const value = 1;\n';
    await writeFile(updateFile, source);
    const script = await writeChildScript(
      dir,
      [
        "console.log('ready built in 1.0s (web)');",
        'setTimeout(() => {}, 10_000);',
      ].join('\n')
    );
    const runner = [
      "import { runDevServerBenchmark } from './scripts/benchmark/dev-server.mjs';",
      `const result = await runDevServerBenchmark(${JSON.stringify({
        command: process.execPath,
        args: [script],
        cwd: dir,
        readyEnvironments: ['web'],
        origin: 'http://127.0.0.1:1',
        routeTimeoutMs: 100,
        updateFile,
        updateRoutePaths: [],
        timeoutMs: 100,
        captureOutput: false,
      })});`,
      'console.log(JSON.stringify(result));',
    ].join('\n');

    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '--eval', runner],
      { cwd: process.cwd(), encoding: 'utf8', timeout: 2_000 }
    );

    assert.equal(result.error, undefined);
    assert.equal(result.status, 0);
    const benchmark = JSON.parse(result.stdout);
    assert.equal(benchmark.status, 1);
    assert.equal(benchmark.timedOut, true);
    assert.equal(await readFile(updateFile, 'utf8'), source);
  });
});

test('runDevServerBenchmark reports exit before readiness', async () => {
  await withTempDir(async dir => {
    const script = await writeChildScript(dir, 'process.exit(7);');

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 1_000,
      captureOutput: false,
    });

    assert.equal(result.status, 7);
    assert.equal(result.readyMs, null);
    assert.equal(result.timedOut, false);
  });
});

test('runDevServerBenchmark times out before readiness', async () => {
  await withTempDir(async dir => {
    const script = await writeChildScript(dir, 'setTimeout(() => {}, 10_000);');

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 100,
      captureOutput: false,
    });

    assert.equal(result.status, 1);
    assert.equal(result.readyMs, null);
    assert.equal(result.timedOut, true);
  });
});

test('runDevServerBenchmark restores update files after rebuild failure', async () => {
  await withTempDir(async dir => {
    const routeFile = join(dir, 'route.ts');
    const source = 'export const value = 1;\n';
    await writeFile(routeFile, source);
    const script = await writeChildScript(
      dir,
      [
        "console.log('ready built in 1.0s (web)');",
        'setTimeout(() => process.exit(0), 50);',
      ].join('\n')
    );

    const result = await runDevServerBenchmark({
      command: process.execPath,
      args: [script],
      cwd: dir,
      readyEnvironments: ['web'],
      origin: 'http://127.0.0.1:1',
      routeTimeoutMs: 100,
      timeoutMs: 1_000,
      updateFile: routeFile,
      updateRoutePaths: ['/'],
      captureOutput: false,
    });

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Dev server exited before update rebuild completed/
    );
    assert.equal(await readFile(routeFile, 'utf8'), source);
  });
});

test('parseReactRouterPerformanceLogs rejects malformed prefixed JSON', () => {
  assert.throws(
    () => parseReactRouterPerformanceLogs('[react-router:performance] {nope'),
    /Invalid React Router performance log JSON/
  );
});
