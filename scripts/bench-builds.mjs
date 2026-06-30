#!/usr/bin/env node
import {
  access,
  cp,
  mkdir,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { parseArgs as parseCliArgs } from 'node:util';
import { execa } from 'execa';
import { generateSyntheticFixture } from './benchmark/fixture.mjs';

const rootDir = process.cwd();
const benchmarkRoot = path.join(rootDir, '.benchmark');
const rsbuildBin = path.join(
  rootDir,
  'node_modules',
  '@rsbuild',
  'core',
  'bin',
  'rsbuild.js'
);

const profiles = {
  smoke: [{ id: 'synthetic-48-ssr-esm', routeCount: 48, variant: 'ssr-esm' }],
  default: [
    { id: 'synthetic-256-ssr-esm', routeCount: 256, variant: 'ssr-esm' },
    {
      id: 'synthetic-256-ssr-esm-split',
      routeCount: 256,
      variant: 'ssr-esm-split',
    },
    { id: 'synthetic-256-spa', routeCount: 256, variant: 'spa' },
    {
      id: 'synthetic-256-sourcemaps',
      routeCount: 256,
      variant: 'ssr-esm',
      sourceMap: true,
    },
  ],
  ci: [
    { id: 'synthetic-1024-ssr-esm', routeCount: 1024, variant: 'ssr-esm' },
    {
      id: 'synthetic-1024-ssr-esm-split',
      routeCount: 1024,
      variant: 'ssr-esm-split',
    },
  ],
  full: [
    { id: 'synthetic-48-ssr-esm', routeCount: 48, variant: 'ssr-esm' },
    { id: 'synthetic-256-ssr-esm', routeCount: 256, variant: 'ssr-esm' },
    { id: 'synthetic-1024-ssr-esm', routeCount: 1024, variant: 'ssr-esm' },
    {
      id: 'synthetic-256-ssr-esm-split',
      routeCount: 256,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-1024-ssr-esm-split',
      routeCount: 1024,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-256-sourcemaps',
      routeCount: 256,
      variant: 'ssr-esm',
      sourceMap: true,
    },
  ],
  large: [
    {
      id: 'large-355-ssr-esm',
      routeCount: 355,
      variant: 'ssr-esm',
      fixture: 'large',
      devRoutePathOffset: 0,
    },
  ],
};

const parseArgs = argv => {
  const { values } = parseCliArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      profile: { type: 'string', default: 'default' },
      mode: { type: 'string', default: 'build' },
      iterations: { type: 'string', default: '5' },
      warmup: { type: 'string', default: '1' },
      format: { type: 'string', default: 'both' },
      out: {
        type: 'string',
        default: path.join('.benchmark', 'results', 'baseline'),
      },
      clean: { type: 'string', default: 'build' },
      filter: { type: 'string' },
      'parallel-route-transform': { type: 'string' },
      'rspack-profile': { type: 'string' },
      'rspack-trace-output': { type: 'string' },
      'fail-fast': { type: 'boolean', default: false },
      'skip-root-build': { type: 'boolean', default: false },
      'log-performance': { type: 'boolean', default: false },
      'dev-port-base': { type: 'string', default: '43000' },
      'dev-timeout': { type: 'string', default: '120000' },
      'dev-routes': { type: 'string', default: 'auto' },
      'dev-route-timeout': { type: 'string', default: '30000' },
    },
  });

  const parseParallelRouteTransform = value => {
    if (value === undefined) {
      return undefined;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
    if (value === 'auto') {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    const workerCount = Number(value);
    if (!Number.isInteger(workerCount) || workerCount < 1) {
      throw new Error(
        '--parallel-route-transform must be true, false, auto, or a positive integer.'
      );
    }
    return workerCount;
  };

  const args = {
    profile: values.profile,
    mode: values.mode,
    iterations: Number(values.iterations),
    warmup: Number(values.warmup),
    format: values.format,
    out: values.out,
    clean: values.clean,
    filter: values.filter ?? null,
    parallelRouteTransform: parseParallelRouteTransform(
      values['parallel-route-transform']
    ),
    rspackProfile: values['rspack-profile'] ?? null,
    rspackTraceOutput: values['rspack-trace-output'] ?? null,
    failFast: values['fail-fast'],
    skipRootBuild: values['skip-root-build'],
    logPerformance: values['log-performance'],
    devPortBase: Number(values['dev-port-base']),
    devTimeoutMs: Number(values['dev-timeout']),
    devRoutes: values['dev-routes'],
    devRouteTimeoutMs: Number(values['dev-route-timeout']),
  };

  if (!profiles[args.profile]) {
    throw new Error(
      `Unknown profile "${args.profile}". Use ${Object.keys(profiles).join(', ')}.`
    );
  }
  if (!['build', 'dev'].includes(args.mode)) {
    throw new Error('--mode must be build or dev.');
  }
  if (!Number.isInteger(args.iterations) || args.iterations < 1) {
    throw new Error('--iterations must be a positive integer.');
  }
  if (!Number.isInteger(args.warmup) || args.warmup < 0) {
    throw new Error('--warmup must be a non-negative integer.');
  }
  if (!['json', 'md', 'markdown', 'both'].includes(args.format)) {
    throw new Error('--format must be json, md, markdown, or both.');
  }
  if (!['none', 'build', 'cold'].includes(args.clean)) {
    throw new Error('--clean must be none, build, or cold.');
  }
  if (args.rspackProfile !== null && args.rspackProfile.trim() === '') {
    throw new Error('--rspack-profile must not be empty.');
  }
  if (args.rspackTraceOutput !== null && args.rspackTraceOutput.trim() === '') {
    throw new Error('--rspack-trace-output must not be empty.');
  }
  if (!Number.isInteger(args.devPortBase) || args.devPortBase < 1024) {
    throw new Error('--dev-port-base must be an integer greater than 1023.');
  }
  if (!Number.isInteger(args.devTimeoutMs) || args.devTimeoutMs < 1000) {
    throw new Error('--dev-timeout must be an integer of at least 1000 ms.');
  }
  if (args.devRoutes.trim() === '') {
    throw new Error(
      '--dev-routes must be auto, none, or a comma-separated list.'
    );
  }
  if (
    !Number.isInteger(args.devRouteTimeoutMs) ||
    args.devRouteTimeoutMs < 1000
  ) {
    throw new Error(
      '--dev-route-timeout must be an integer of at least 1000 ms.'
    );
  }
  if (
    args.mode === 'dev' &&
    (args.rspackProfile !== null || args.rspackTraceOutput !== null)
  ) {
    throw new Error(
      '--rspack-profile and --rspack-trace-output require --mode build.'
    );
  }

  return args;
};

const hasGnuTime = async () => {
  try {
    await access('/usr/bin/time');
    const probe = await execa(
      '/usr/bin/time',
      ['-v', process.execPath, '-e', ''],
      { reject: false }
    );
    return probe.exitCode === 0;
  } catch {
    return false;
  }
};

const runCommand = async ({
  command,
  args,
  cwd,
  env = {},
  useTime = false,
}) => {
  const startedAt = performance.now();
  const childCommand = useTime ? '/usr/bin/time' : command;
  const childArgs = useTime ? ['-v', command, ...args] : args;

  const child = execa(childCommand, childArgs, {
    cwd,
    env,
    reject: false,
  });

  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  const result = await child;
  return {
    status: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    wallMs: performance.now() - startedAt,
  };
};

const stripAnsi = value => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

const defaultDevRouteIndexes = [0, 1, 2, 10, 50, 100, 200];

const routePathForIndex = (index, { devRoutePathOffset = 1 }) => {
  if (index === 0) {
    return '/';
  }
  const routeNumber = index + devRoutePathOffset;
  return `/route-${String(routeNumber).padStart(4, '0')}`;
};

const resolveAutoDevRoutePaths = benchmark =>
  [...new Set([...defaultDevRouteIndexes, benchmark.routeCount - 1])]
    .filter(
      index =>
        Number.isInteger(index) && index >= 0 && index < benchmark.routeCount
    )
    .map(index => routePathForIndex(index, benchmark));

const normalizeDevRoutePath = (value, benchmark) => {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return routePathForIndex(Number(trimmed), benchmark);
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const resolveDevRoutePaths = (value, benchmark) => {
  if (value === 'none') {
    return [];
  }
  if (value === 'auto') {
    return resolveAutoDevRoutePaths(benchmark);
  }
  const routePaths = [
    ...new Set(
      value
        .split(',')
        .map(routePath => routePath.trim())
        .filter(Boolean)
        .map(routePath => normalizeDevRoutePath(routePath, benchmark))
    ),
  ];
  if (routePaths.length === 0) {
    throw new Error('--dev-routes must include at least one route.');
  }
  return routePaths;
};

const appendNodeOption = (value, option) => {
  const options = (value ?? '').split(/\s+/).filter(Boolean);
  return options.includes(option)
    ? options.join(' ')
    : [...options, option].join(' ');
};

const fetchDevRoute = async ({ origin, routePath, timeoutMs }) => {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();

  try {
    const response = await fetch(new URL(routePath, origin), {
      signal: controller.signal,
    });
    const body = await response.arrayBuffer();
    return {
      path: routePath,
      status: response.status,
      ok: response.ok,
      ms: performance.now() - startedAt,
      bytes: body.byteLength,
    };
  } catch (error) {
    return {
      path: routePath,
      status: null,
      ok: false,
      ms: performance.now() - startedAt,
      bytes: null,
      error:
        error?.name === 'AbortError'
          ? `Timed out after ${timeoutMs} ms`
          : (error?.stack ?? error?.message ?? String(error)),
    };
  } finally {
    clearTimeout(timeout);
  }
};

const fetchDevRoutes = async ({ origin, routePaths, timeoutMs }) => {
  const requests = [];
  for (const routePath of routePaths) {
    requests.push(await fetchDevRoute({ origin, routePath, timeoutMs }));
  }
  return requests;
};

const runDevServerUntilReady = async ({
  command,
  args,
  cwd,
  env = {},
  readyEnvironments,
  devRouteOrigin,
  devRoutePaths = [],
  devRouteTimeoutMs,
  timeoutMs,
}) =>
  new Promise(resolve => {
    const startedAt = performance.now();
    const requiredReady = new Set(readyEnvironments);
    const seenReady = new Set();
    let stdout = '';
    let stderr = '';
    let ready = false;
    let readyMs = null;
    let routePhasePending = false;
    let routeTotalMs = null;
    let routeRequests = [];
    let readyStatus = 0;
    let timedOut = false;
    let settled = false;
    let stopping = false;
    let killTimer = null;

    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== 'win32',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const finish = (status, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutTimer);
      clearTimeout(killTimer);
      resolve({
        status,
        signal,
        stdout,
        stderr,
        wallMs: performance.now() - startedAt,
        readyMs,
        routeTotalMs,
        routeRequests,
        timedOut,
      });
    };

    const signalChild = signal => {
      if (child.exitCode !== null) {
        return;
      }
      try {
        if (process.platform === 'win32' || !child.pid) {
          child.kill(signal);
        } else {
          process.kill(-child.pid, signal);
        }
      } catch (error) {
        if (error?.code !== 'ESRCH') {
          stderr += `${error.stack ?? error.message}\n`;
        }
      }
    };

    const stopChild = () => {
      if (child.exitCode !== null || stopping) {
        return;
      }
      stopping = true;
      signalChild('SIGTERM');
      killTimer = setTimeout(() => {
        signalChild('SIGKILL');
      }, 5_000);
      killTimer.unref?.();
    };

    const handleReady = async () => {
      readyMs = performance.now() - startedAt;
      if (devRoutePaths.length > 0) {
        routePhasePending = true;
        const routeStartedAt = performance.now();
        routeRequests = await fetchDevRoutes({
          origin: devRouteOrigin,
          routePaths: devRoutePaths,
          timeoutMs: devRouteTimeoutMs,
        });
        routeTotalMs = performance.now() - routeStartedAt;
        routePhasePending = false;
        if (routeRequests.some(request => !request.ok)) {
          readyStatus = 1;
        }
      }
      stopChild();
    };

    const scanReady = () => {
      if (ready) {
        return;
      }
      const output = stripAnsi(`${stdout}\n${stderr}`);
      for (const match of output.matchAll(
        /ready\s+built in .*?\((web|node)\)/gi
      )) {
        seenReady.add(match[1].toLowerCase());
      }
      if ([...requiredReady].every(environment => seenReady.has(environment))) {
        ready = true;
        void handleReady();
      }
    };

    child.stdout?.on('data', chunk => {
      const text = String(chunk);
      stdout += text;
      process.stdout.write(text);
      scanReady();
    });
    child.stderr?.on('data', chunk => {
      const text = String(chunk);
      stderr += text;
      process.stderr.write(text);
      scanReady();
    });

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      stopChild();
    }, timeoutMs);
    timeoutTimer.unref?.();

    child.on('error', error => {
      stderr += `${error.stack ?? error.message}\n`;
      finish(1, null);
    });
    child.on('exit', (code, signal) => {
      if (ready) {
        if (routePhasePending) {
          finish(1, signal);
          return;
        }
        finish(readyStatus, signal);
        return;
      }
      finish(code ?? 1, signal);
    });
  });

const parseTimeStats = stderr => {
  const user = stderr.match(/User time \(seconds\):\s*([\d.]+)/);
  const sys = stderr.match(/System time \(seconds\):\s*([\d.]+)/);
  const rss = stderr.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  return {
    userMs: user ? Number(user[1]) * 1000 : null,
    sysMs: sys ? Number(sys[1]) * 1000 : null,
    maxRssKb: rss ? Number(rss[1]) : null,
  };
};

const parsePluginReports = output => {
  const reports = [];
  for (const line of output.split(/\r?\n/)) {
    const markerIndex = line.indexOf('[react-router:performance]');
    if (markerIndex === -1) {
      continue;
    }
    const jsonStart = line.indexOf('{', markerIndex);
    if (jsonStart === -1) {
      continue;
    }
    try {
      reports.push(JSON.parse(line.slice(jsonStart)));
    } catch {
      // Keep raw build output useful even if one line is malformed.
    }
  }
  return reports;
};

const summarizeMetric = values => {
  const sorted = values
    .filter(value => typeof value === 'number')
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { min: null, median: null, mean: null, p95: null, stdev: null };
  }
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  const percentileIndex = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  );
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    mean,
    p95: sorted[percentileIndex],
    stdev: Math.sqrt(variance),
  };
};

const summarizeRuns = runs => ({
  wallMs: summarizeMetric(runs.map(run => run.wallMs)),
  readyMs: summarizeMetric(runs.map(run => run.readyMs)),
  routeTotalMs: summarizeMetric(runs.map(run => run.routeTotalMs)),
  userMs: summarizeMetric(runs.map(run => run.userMs)),
  sysMs: summarizeMetric(runs.map(run => run.sysMs)),
  maxRssKb: summarizeMetric(runs.map(run => run.maxRssKb)),
});

const summarizeDevRouteRequests = runs => {
  const requestsByPath = new Map();
  for (const run of runs) {
    for (const request of run.routeRequests ?? []) {
      const requests = requestsByPath.get(request.path) ?? [];
      requests.push(request);
      requestsByPath.set(request.path, requests);
    }
  }

  return [...requestsByPath.entries()].map(([routePath, requests]) => {
    const statuses = [
      ...new Set(
        requests.map(request =>
          request.status === null ? 'error' : String(request.status)
        )
      ),
    ].sort();
    return {
      path: routePath,
      count: requests.length,
      statuses,
      failures: requests.filter(request => !request.ok).length,
      ms: summarizeMetric(requests.map(request => request.ms)),
      bytes: summarizeMetric(requests.map(request => request.bytes)),
    };
  });
};

const summarizePluginOperations = runs => {
  const operations = new Map();

  for (const run of runs) {
    for (const report of run.pluginReports) {
      for (const [operation, metrics] of Object.entries(
        report.operations ?? {}
      )) {
        if (!metrics || typeof metrics !== 'object') {
          continue;
        }

        const count = typeof metrics.count === 'number' ? metrics.count : 0;
        const totalMs =
          typeof metrics.totalMs === 'number' ? metrics.totalMs : 0;
        const wallMs =
          typeof metrics.wallMs === 'number' ? metrics.wallMs : null;
        const maxMs = typeof metrics.maxMs === 'number' ? metrics.maxMs : 0;

        const key = `${report.environment}:${operation}`;
        const current = operations.get(key) ?? {
          environment: report.environment,
          operation,
          count: 0,
          totalMs: 0,
          wallMs: null,
          maxMs: 0,
          reports: 0,
        };
        current.count += count;
        current.totalMs += totalMs;
        if (wallMs !== null) {
          current.wallMs = (current.wallMs ?? 0) + wallMs;
        }
        current.maxMs = Math.max(current.maxMs, maxMs);
        current.reports += 1;
        operations.set(key, current);
      }
    }
  }

  return [...operations.values()].sort((a, b) => {
    if (b.totalMs !== a.totalMs) {
      return b.totalMs - a.totalMs;
    }
    return `${a.environment}:${a.operation}`.localeCompare(
      `${b.environment}:${b.operation}`
    );
  });
};

const formatMs = value =>
  value == null ? '-' : `${(value / 1000).toFixed(2)}s`;
const formatReportMs = value => (value == null ? '-' : `${value.toFixed(1)}ms`);
const formatRss = value =>
  value == null ? '-' : `${Math.round(value / 1024)} MB`;

const renderMarkdown = result => {
  const lines = [
    '# Rsbuild React Router Benchmark Baseline',
    '',
    `- Date: ${result.date}`,
    `- Commit: ${result.commit}`,
    `- Node: ${result.node}`,
    `- pnpm: ${result.pnpm}`,
    `- Platform: ${result.platform}`,
    `- Profile: ${result.profile}`,
    `- Mode: ${result.mode}`,
    `- Iterations: ${result.iterations}`,
    `- Warmup: ${result.warmup}`,
    ...(result.mode === 'dev'
      ? [
          `- Dev routes: ${result.devRoutes}`,
          `- Dev route timeout: ${result.devRouteTimeoutMs} ms`,
        ]
      : []),
    `- Parallel route transform: ${formatParallelRouteTransform(result.parallelRouteTransform)}`,
    `- Plugin performance logging: ${String(result.logPerformance)}`,
    `- Rspack profile: ${result.rspackProfile ?? 'false'}`,
    ...(result.rspackTraceOutput
      ? [`- Rspack trace output: ${result.rspackTraceOutput}`]
      : []),
    '',
    '| Benchmark | Routes | Variant | Median ready | Median route load | Median wall | Mean wall | p95 wall | Max RSS | Plugin reports (--log-performance) |',
    '|---|---:|---|---:|---:|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of result.benchmarks) {
    lines.push(
      [
        benchmark.id,
        benchmark.routeCount,
        benchmark.variant,
        formatMs(benchmark.summary.readyMs.median),
        formatMs(benchmark.summary.routeTotalMs.median),
        formatMs(benchmark.summary.wallMs.median),
        formatMs(benchmark.summary.wallMs.mean),
        formatMs(benchmark.summary.wallMs.p95),
        formatRss(benchmark.summary.maxRssKb.p95),
        benchmark.runs.reduce((sum, run) => sum + run.pluginReports.length, 0),
      ]
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    );
  }

  for (const benchmark of result.benchmarks) {
    if (!benchmark.devRouteSummary?.length) {
      continue;
    }
    lines.push(
      '',
      `## ${benchmark.id} Dev Route Requests`,
      '',
      '| Route | Median | Mean | p95 | Median bytes | Statuses | Failures |',
      '|---|---:|---:|---:|---:|---|---:|'
    );
    for (const request of benchmark.devRouteSummary) {
      lines.push(
        [
          `\`${request.path}\``,
          formatMs(request.ms.median),
          formatMs(request.ms.mean),
          formatMs(request.ms.p95),
          request.bytes.median == null
            ? '-'
            : String(Math.round(request.bytes.median)),
          request.statuses.join(', '),
          request.failures,
        ]
          .join(' | ')
          .replace(/^/, '| ')
          .replace(/$/, ' |')
      );
    }
  }

  for (const benchmark of result.benchmarks) {
    if (benchmark.pluginOperations.length === 0) {
      continue;
    }
    lines.push(
      '',
      `## ${benchmark.id} Plugin Operations`,
      '',
      'Total is the sum of all measured operation durations. Wall merges overlapping intervals to approximate elapsed plugin time. Max is the slowest single operation call.',
      '',
      '| Environment | Operation | Count | Total | Wall | Max | Reports |',
      '|---|---|---:|---:|---:|---:|---:|'
    );
    for (const operation of benchmark.pluginOperations.slice(0, 12)) {
      lines.push(
        [
          operation.environment,
          operation.operation,
          operation.count,
          formatReportMs(operation.totalMs),
          formatReportMs(operation.wallMs),
          formatReportMs(operation.maxMs),
          operation.reports,
        ]
          .join(' | ')
          .replace(/^/, '| ')
          .replace(/$/, ' |')
      );
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
};

const resolveOutputPaths = args => {
  const outPath = path.resolve(rootDir, args.out);
  const format = args.format === 'markdown' ? 'md' : args.format;
  const writeJson = format === 'json' || format === 'both';
  const writeMd = format === 'md' || format === 'both';

  if (writeJson && writeMd) {
    return {
      artifactRoot: outPath,
      jsonPath: path.join(outPath, 'baseline.json'),
      mdPath: path.join(outPath, 'baseline.md'),
      outPath,
      writeJson,
      writeMd,
    };
  }

  const artifactRoot = path.extname(outPath)
    ? path.join(path.dirname(outPath), `${path.basename(outPath)}.artifacts`)
    : `${outPath}.artifacts`;

  return {
    artifactRoot,
    jsonPath: writeJson ? outPath : null,
    mdPath: writeMd ? outPath : null,
    outPath,
    writeJson,
    writeMd,
  };
};

const writeOutputs = async (result, outputPaths) => {
  const { jsonPath, mdPath, outPath, writeJson, writeMd } = outputPaths;

  if (writeJson && writeMd) {
    await mkdir(outPath, { recursive: true });
    await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
    await writeFile(mdPath, renderMarkdown(result));
    return;
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  if (writeJson) {
    await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  } else {
    await writeFile(mdPath, renderMarkdown(result));
  }
};

const formatParallelRouteTransform = parallelRouteTransform => {
  if (parallelRouteTransform === undefined) {
    return 'adaptive';
  }
  if (!parallelRouteTransform) {
    return 'false';
  }
  if (parallelRouteTransform === true) {
    return 'true';
  }
  return `workers=${parallelRouteTransform}`;
};

const git = async args => {
  const result = await runCommand({
    command: 'git',
    args,
    cwd: rootDir,
    useTime: false,
  });
  return result.status === 0 ? result.stdout.trim() : null;
};

const pnpmVersion = async () => {
  const result = await runCommand({
    command: 'pnpm',
    args: ['--version'],
    cwd: rootDir,
    useTime: false,
  });
  return result.status === 0 ? result.stdout.trim() : null;
};

const cleanBuildOutputs = async fixtureRoot => {
  await Promise.all([
    rm(path.join(fixtureRoot, 'build'), { recursive: true, force: true }),
    rm(path.join(fixtureRoot, '.react-router'), {
      recursive: true,
      force: true,
    }),
  ]);
};

const listRspackProfileDirs = async cwd => {
  const entries = await readdir(cwd, { withFileTypes: true });
  return entries
    .filter(
      entry => entry.isDirectory() && entry.name.startsWith('.rspack-profile-')
    )
    .map(entry => entry.name)
    .sort();
};

const moveDirectory = async (source, destination) => {
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await rename(source, destination);
  } catch (error) {
    if (error?.code !== 'EXDEV') {
      throw error;
    }
    await cp(source, destination, { recursive: true });
    await rm(source, { recursive: true, force: true });
  }
};

const collectRspackProfiles = async ({
  fixtureRoot,
  beforeProfiles,
  destinationRoot,
}) => {
  const before = new Set(beforeProfiles);
  const afterProfiles = await listRspackProfileDirs(fixtureRoot);
  const createdProfiles = afterProfiles.filter(profile => !before.has(profile));
  const collected = [];

  for (const profile of createdProfiles) {
    const source = path.join(fixtureRoot, profile);
    const destination = path.join(destinationRoot, profile.slice(1));
    await moveDirectory(source, destination);
    collected.push(path.relative(rootDir, destination));
  }

  return collected;
};

const isTraceOutputStream = value => value === 'stdout' || value === 'stderr';

const resolveRspackTraceOutput = async ({
  traceOutput,
  benchmarkId,
  runLabel,
}) => {
  if (!traceOutput || isTraceOutputStream(traceOutput)) {
    return traceOutput;
  }

  const tracePath = path.resolve(
    rootDir,
    traceOutput,
    benchmarkId,
    `${runLabel}.log`
  );
  await mkdir(path.dirname(tracePath), { recursive: true });
  return tracePath;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const useTime = await hasGnuTime();
  const outputPaths = resolveOutputPaths(args);
  const pluginImportPath = pathToFileURL(
    path.join(rootDir, 'dist/index.js')
  ).href;
  const pluginReactImportPath =
    process.env.REACT_ROUTER_BENCHMARK_PLUGIN_REACT_IMPORT ??
    '@rsbuild/plugin-react';
  const selectedBenchmarks = profiles[args.profile].filter(benchmark =>
    args.filter ? benchmark.id.includes(args.filter) : true
  );

  if (selectedBenchmarks.length === 0) {
    throw new Error(`No benchmarks matched filter "${args.filter}".`);
  }

  if (!args.skipRootBuild) {
    console.log('Building plugin package before benchmarks...');
    const buildResult = await runCommand({
      command: 'pnpm',
      args: ['build'],
      cwd: rootDir,
    });
    if (buildResult.status !== 0) {
      process.exit(buildResult.status ?? 1);
    }
  }

  const benchmarks = [];
  for (const [benchmarkIndex, benchmark] of selectedBenchmarks.entries()) {
    const fixtureRoot = path.join(benchmarkRoot, 'fixtures', benchmark.id);
    const devRoutePaths =
      args.mode === 'dev'
        ? resolveDevRoutePaths(args.devRoutes, benchmark)
        : [];
    const fixtureResult = await generateSyntheticFixture({
      root: fixtureRoot,
      routeCount: benchmark.routeCount,
      variant: benchmark.variant,
      sourceMap: benchmark.sourceMap ?? false,
      fixture: benchmark.fixture ?? 'default',
      pluginImportPath,
      pluginReactImportPath,
      parallelRouteTransform: args.parallelRouteTransform,
    });

    const runs = [];
    const totalRuns = args.warmup + args.iterations;
    for (let index = 0; index < totalRuns; index += 1) {
      const measured = index >= args.warmup;
      if (args.clean !== 'none') {
        await cleanBuildOutputs(fixtureRoot);
      }
      if (args.clean === 'cold') {
        await rm(path.join(fixtureRoot, 'node_modules'), {
          recursive: true,
          force: true,
        });
      }

      console.log(
        `${measured ? 'Measuring' : 'Warming'} ${benchmark.id} (${index + 1}/${totalRuns})`
      );
      const rspackProfileEnabled =
        args.mode === 'build' && Boolean(args.rspackProfile);
      const beforeRspackProfiles = rspackProfileEnabled
        ? await listRspackProfileDirs(fixtureRoot)
        : [];
      const runLabel = `${measured ? 'run' : 'warmup'}-${
        measured ? index - args.warmup + 1 : index + 1
      }`;
      const rspackTraceOutput =
        args.mode === 'build'
          ? await resolveRspackTraceOutput({
              traceOutput: args.rspackTraceOutput,
              benchmarkId: benchmark.id,
              runLabel,
            })
          : null;
      const commonEnv = {
        NODE_ENV: args.mode === 'build' ? 'production' : 'development',
        ...(args.logPerformance
          ? { REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE: '1' }
          : {}),
      };
      const commandResult =
        args.mode === 'dev'
          ? await (() => {
              const devPort = args.devPortBase + benchmarkIndex * 100 + index;
              return runDevServerUntilReady({
                command: process.execPath,
                args: [
                  rsbuildBin,
                  'dev',
                  '--config',
                  'rsbuild.config.mjs',
                  '--port',
                  String(devPort),
                ],
                cwd: fixtureRoot,
                env: {
                  ...commonEnv,
                  ...(devRoutePaths.length > 0
                    ? {
                        NODE_OPTIONS: appendNodeOption(
                          process.env.NODE_OPTIONS,
                          '--experimental-vm-modules'
                        ),
                      }
                    : {}),
                },
                readyEnvironments:
                  benchmark.variant === 'spa' ? ['web'] : ['web', 'node'],
                devRouteOrigin: `http://localhost:${devPort}`,
                devRoutePaths,
                devRouteTimeoutMs: args.devRouteTimeoutMs,
                timeoutMs: args.devTimeoutMs,
              });
            })()
          : await runCommand({
              command: process.execPath,
              args: [rsbuildBin, 'build', '--config', 'rsbuild.config.mjs'],
              cwd: fixtureRoot,
              env: {
                ...commonEnv,
                ...(args.rspackProfile
                  ? { RSPACK_PROFILE: args.rspackProfile }
                  : {}),
                ...(rspackTraceOutput
                  ? { RSPACK_TRACE_OUTPUT: rspackTraceOutput }
                  : {}),
              },
              useTime,
            });
      const rspackProfiles = rspackProfileEnabled
        ? await collectRspackProfiles({
            fixtureRoot,
            beforeProfiles: beforeRspackProfiles,
            destinationRoot: path.join(
              outputPaths.artifactRoot,
              'rspack-profiles',
              benchmark.id,
              runLabel
            ),
          })
        : [];
      const timeStats =
        args.mode === 'build' && useTime
          ? parseTimeStats(commandResult.stderr)
          : {};
      const pluginReports = parsePluginReports(
        `${commandResult.stdout}\n${commandResult.stderr}`
      );

      if (commandResult.status !== 0 && args.failFast) {
        process.exit(commandResult.status ?? 1);
      }

      if (measured) {
        runs.push({
          status: commandResult.status,
          wallMs: commandResult.wallMs,
          readyMs: commandResult.readyMs ?? null,
          routeTotalMs: commandResult.routeTotalMs ?? null,
          routeRequests: commandResult.routeRequests ?? [],
          userMs: timeStats.userMs ?? null,
          sysMs: timeStats.sysMs ?? null,
          maxRssKb: timeStats.maxRssKb ?? null,
          pluginReports,
          rspackProfiles,
          rspackTraceOutput:
            rspackTraceOutput && !isTraceOutputStream(rspackTraceOutput)
              ? path.relative(rootDir, rspackTraceOutput)
              : rspackTraceOutput,
        });
      }
    }

    benchmarks.push({
      ...benchmark,
      fixture: fixtureResult.fixture,
      fixtureStats: fixtureResult.stats ?? null,
      parallelRouteTransform: args.parallelRouteTransform,
      devRoutePaths,
      cwd: path.relative(rootDir, fixtureRoot),
      command:
        args.mode === 'dev'
          ? 'node <repo>/node_modules/@rsbuild/core/bin/rsbuild.js dev --config rsbuild.config.mjs --port <port>'
          : 'node <repo>/node_modules/@rsbuild/core/bin/rsbuild.js build --config rsbuild.config.mjs',
      runs,
      summary: summarizeRuns(runs),
      devRouteSummary: summarizeDevRouteRequests(runs),
      pluginOperations: summarizePluginOperations(runs),
    });
  }

  const failed = benchmarks.some(benchmark =>
    benchmark.runs.some(run => run.status !== 0)
  );
  const result = {
    repo: 'rsbuild-plugin-react-router',
    commit: await git(['rev-parse', 'HEAD']),
    date: new Date().toISOString(),
    node: process.version,
    pnpm: await pnpmVersion(),
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    profile: args.profile,
    mode: args.mode,
    iterations: args.iterations,
    warmup: args.warmup,
    clean: args.clean,
    logPerformance: args.logPerformance,
    devRoutes: args.mode === 'dev' ? args.devRoutes : null,
    devRouteTimeoutMs: args.mode === 'dev' ? args.devRouteTimeoutMs : null,
    parallelRouteTransform: args.parallelRouteTransform,
    rspackProfile: args.rspackProfile,
    rspackTraceOutput: args.rspackTraceOutput,
    failed,
    benchmarks,
  };

  await writeOutputs(result, outputPaths);
  console.log(`Benchmark results written to ${outputPaths.outPath}`);

  if (failed) {
    console.error('One or more measured benchmark builds failed.');
    process.exitCode = 1;
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
