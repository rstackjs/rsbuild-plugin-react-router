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
  const { values } = parseCliArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      profile: { type: 'string', default: 'default' },
      iterations: { type: 'string', default: '5' },
      warmup: { type: 'string', default: '1' },
      format: { type: 'string', default: 'both' },
      out: {
        type: 'string',
        default: path.join('.benchmark', 'results', 'baseline'),
      },
      clean: { type: 'string', default: 'build' },
      filter: { type: 'string' },
      'parallel-transforms': { type: 'string' },
      'rspack-profile': { type: 'string' },
      'rspack-trace-output': { type: 'string' },
      'fail-fast': { type: 'boolean', default: false },
      'skip-root-build': { type: 'boolean', default: false },
    },
  });

  const parseParallelTransforms = value => {
    if (value === undefined) {
      return undefined;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
    if (value === 'true' || value === '1' || value === 'auto') {
      return true;
    }
    const maxWorkers = Number(value);
    if (!Number.isInteger(maxWorkers) || maxWorkers < 1) {
      throw new Error(
        '--parallel-transforms must be true, false, auto, or a positive integer.'
      );
    }
    return { maxWorkers };
  };

  const args = {
    profile: values.profile,
    iterations: Number(values.iterations),
    warmup: Number(values.warmup),
    format: values.format,
    out: values.out,
    clean: values.clean,
    filter: values.filter ?? null,
    parallelTransforms: parseParallelTransforms(values['parallel-transforms']),
    rspackProfile: values['rspack-profile'] ?? null,
    rspackTraceOutput: values['rspack-trace-output'] ?? null,
    failFast: values['fail-fast'],
    skipRootBuild: values['skip-root-build'],
  };

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
  if (args.rspackProfile !== null && args.rspackProfile.trim() === '') {
    throw new Error('--rspack-profile must not be empty.');
  }
  if (
    args.rspackTraceOutput !== null &&
    args.rspackTraceOutput.trim() === ''
  ) {
    throw new Error('--rspack-trace-output must not be empty.');
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
          wallMs: null,
          maxMs: 0,
          reports: 0,
        };
        current.count += metrics.count ?? 0;
        current.totalMs += metrics.totalMs ?? 0;
        if (typeof metrics.wallMs === 'number') {
          current.wallMs = (current.wallMs ?? 0) + metrics.wallMs;
        }
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
    `- Parallel transforms: ${formatParallelTransforms(result.parallelTransforms)}`,
    `- Rspack profile: ${result.rspackProfile ?? 'false'}`,
    ...(result.rspackTraceOutput
      ? [`- Rspack trace output: ${result.rspackTraceOutput}`]
      : []),
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

const formatParallelTransforms = parallelTransforms => {
  if (parallelTransforms === undefined) {
    return 'default';
  }
  if (!parallelTransforms) {
    return 'false';
  }
  if (parallelTransforms === true) {
    return 'true';
  }
  return `maxWorkers=${parallelTransforms.maxWorkers}`;
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

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const useTime = await hasGnuTime();
  const outputPaths = resolveOutputPaths(args);
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
      parallelTransforms: args.parallelTransforms,
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
      const rspackProfileEnabled = Boolean(args.rspackProfile);
      const beforeRspackProfiles = rspackProfileEnabled
        ? await listRspackProfileDirs(fixtureRoot)
        : [];
      const commandResult = await runCommand({
        command: process.execPath,
        args: [rsbuildBin, 'build', '--config', 'rsbuild.config.mjs'],
        cwd: fixtureRoot,
        env: {
          NODE_ENV: 'production',
          REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE: '1',
          ...(args.rspackProfile
            ? { RSPACK_PROFILE: args.rspackProfile }
            : {}),
          ...(args.rspackTraceOutput
            ? { RSPACK_TRACE_OUTPUT: args.rspackTraceOutput }
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
              `${measured ? 'run' : 'warmup'}-${
                measured ? index - args.warmup + 1 : index + 1
              }`
            ),
          })
        : [];
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
          rspackProfiles,
        });
      }
    }

    benchmarks.push({
      ...benchmark,
      parallelTransforms: args.parallelTransforms,
      cwd: path.relative(rootDir, fixtureRoot),
      command:
        'node <repo>/node_modules/@rsbuild/core/bin/rsbuild.js build --config rsbuild.config.mjs',
      runs,
      summary: summarizeRuns(runs),
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
    iterations: args.iterations,
    warmup: args.warmup,
    parallelTransforms: args.parallelTransforms,
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
