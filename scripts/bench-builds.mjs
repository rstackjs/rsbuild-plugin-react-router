#!/usr/bin/env node
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
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
};

const parseArgs = argv => {
  const args = {
    profile: 'default',
    iterations: 5,
    warmup: 1,
    format: 'both',
    out: path.join('.benchmark', 'results', 'baseline'),
    clean: 'build',
    filter: null,
    failFast: false,
    skipRootBuild: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const [arg, inlineValue] = argv[index].split('=', 2);
    const next = () => inlineValue ?? argv[++index];
    if (arg === '--profile') args.profile = next();
    else if (arg === '--iterations') args.iterations = Number(next());
    else if (arg === '--warmup') args.warmup = Number(next());
    else if (arg === '--format') args.format = next();
    else if (arg === '--out') args.out = next();
    else if (arg === '--clean') args.clean = next();
    else if (arg === '--filter') args.filter = next();
    else if (arg === '--fail-fast') args.failFast = true;
    else if (arg === '--skip-root-build') args.skipRootBuild = true;
    else {
      throw new Error(`Unknown benchmark argument: ${argv[index]}`);
    }
  }

  if (!profiles[args.profile]) {
    throw new Error(
      `Unknown profile "${args.profile}". Use smoke, default, or full.`
    );
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

  return args;
};

const hasGnuTime = async () => {
  try {
    await access('/usr/bin/time');
    return true;
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

  return new Promise((resolve, reject) => {
    const child = spawn(childCommand, childArgs, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on('close', status => {
      resolve({
        status,
        stdout,
        stderr,
        wallMs: performance.now() - startedAt,
      });
    });
    child.on('error', reject);
  });
};

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
  userMs: summarizeMetric(runs.map(run => run.userMs)),
  sysMs: summarizeMetric(runs.map(run => run.sysMs)),
  maxRssKb: summarizeMetric(runs.map(run => run.maxRssKb)),
});

const summarizePluginOperations = runs => {
  const operations = new Map();

  for (const run of runs) {
    for (const report of run.pluginReports) {
      for (const [operation, metrics] of Object.entries(
        report.operations ?? {}
      )) {
        const key = `${report.environment}:${operation}`;
        const current = operations.get(key) ?? {
          environment: report.environment,
          operation,
          count: 0,
          totalMs: 0,
          maxMs: 0,
          reports: 0,
        };
        current.count += metrics.count ?? 0;
        current.totalMs += metrics.totalMs ?? 0;
        current.maxMs = Math.max(current.maxMs, metrics.maxMs ?? 0);
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
    `- Iterations: ${result.iterations}`,
    `- Warmup: ${result.warmup}`,
    '',
    '| Benchmark | Routes | Variant | Median wall | Mean wall | p95 wall | Max RSS | Plugin reports |',
    '|---|---:|---|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of result.benchmarks) {
    lines.push(
      [
        benchmark.id,
        benchmark.routeCount,
        benchmark.variant,
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
    if (benchmark.pluginOperations.length === 0) {
      continue;
    }
    lines.push(
      '',
      `## ${benchmark.id} Plugin Operations`,
      '',
      '| Environment | Operation | Count | Total | Max | Reports |',
      '|---|---|---:|---:|---:|---:|'
    );
    for (const operation of benchmark.pluginOperations.slice(0, 12)) {
      lines.push(
        [
          operation.environment,
          operation.operation,
          operation.count,
          formatReportMs(operation.totalMs),
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

const writeOutputs = async (result, args) => {
  const outPath = path.resolve(rootDir, args.out);
  const format = args.format === 'markdown' ? 'md' : args.format;
  const writeJson = format === 'json' || format === 'both';
  const writeMd = format === 'md' || format === 'both';

  if (writeJson && writeMd) {
    await mkdir(outPath, { recursive: true });
    await writeFile(
      path.join(outPath, 'baseline.json'),
      `${JSON.stringify(result, null, 2)}\n`
    );
    await writeFile(path.join(outPath, 'baseline.md'), renderMarkdown(result));
    return;
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  if (writeJson) {
    await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);
  } else {
    await writeFile(outPath, renderMarkdown(result));
  }
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
  await rm(path.join(fixtureRoot, 'build'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.react-router'), {
    recursive: true,
    force: true,
  });
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const useTime = await hasGnuTime();
  const pluginImportPath = pathToFileURL(
    path.join(rootDir, 'dist/index.js')
  ).href;
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
  for (const benchmark of selectedBenchmarks) {
    const fixtureRoot = path.join(benchmarkRoot, 'fixtures', benchmark.id);
    await generateSyntheticFixture({
      root: fixtureRoot,
      routeCount: benchmark.routeCount,
      variant: benchmark.variant,
      sourceMap: benchmark.sourceMap ?? false,
      pluginImportPath,
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
      const commandResult = await runCommand({
        command: process.execPath,
        args: [rsbuildBin, 'build', '--config', 'rsbuild.config.mjs'],
        cwd: fixtureRoot,
        env: {
          NODE_ENV: 'production',
          REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE: '1',
        },
        useTime,
      });
      const timeStats = useTime ? parseTimeStats(commandResult.stderr) : {};
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
          userMs: timeStats.userMs ?? null,
          sysMs: timeStats.sysMs ?? null,
          maxRssKb: timeStats.maxRssKb ?? null,
          pluginReports,
        });
      }
    }

    benchmarks.push({
      ...benchmark,
      cwd: path.relative(rootDir, fixtureRoot),
      command:
        'node <repo>/node_modules/@rsbuild/core/bin/rsbuild.js build --config rsbuild.config.mjs',
      runs,
      summary: summarizeRuns(runs),
      pluginOperations: summarizePluginOperations(runs),
    });
  }

  const result = {
    repo: 'rsbuild-plugin-react-router',
    commit: await git(['rev-parse', 'HEAD']),
    date: new Date().toISOString(),
    node: process.version,
    pnpm: await pnpmVersion(),
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    profile: args.profile,
    iterations: args.iterations,
    warmup: args.warmup,
    benchmarks,
  };

  await writeOutputs(result, args);
  console.log(
    `Benchmark results written to ${path.resolve(rootDir, args.out)}`
  );

  if (
    benchmarks.some(benchmark => benchmark.runs.some(run => run.status !== 0))
  ) {
    console.error('One or more measured benchmark builds failed.');
    process.exitCode = 1;
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
