#!/usr/bin/env node
import { access, cp, mkdir, readdir, rename, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { parseArgs as parseCliArgs } from 'node:util';
import { Effect } from 'effect';
import { execa } from 'execa';
import {
  appendNodeOption,
  runDevServerBenchmark,
} from './benchmark/dev-server.mjs';
import { generateSyntheticFixture } from './benchmark/fixture.mts';
import { profiles } from './benchmark/profiles.mjs';
import {
  parsePluginReports,
  parseTimeStats,
  resolveOutputPaths,
  summarizeDevRouteRequests,
  summarizeDevUpdateRouteRequests,
  summarizePluginOperations,
  summarizeRuns,
  writeOutputs,
} from './benchmark/results.mts';

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

const toError = error =>
  error instanceof Error ? error : new Error(String(error));

const tryPromise = run =>
  Effect.tryPromise({
    try: run,
    catch: toError,
  });

const failFastError = ({ benchmarkId, runLabel, status }) =>
  Object.assign(
    new Error(
      `Benchmark ${benchmarkId} ${runLabel} failed with status ${status ?? 1}.`
    ),
    { exitCode: status ?? 1 }
  );

const parseArgs = argv => {
  const { values } = parseCliArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      profile: { type: 'string', default: 'default' },
      mode: { type: 'string', default: 'build' },
      iterations: { type: 'string', default: '5' },
      'large-iterations': { type: 'string' },
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
      'cpu-limit': { type: 'string' },
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
    largeIterations:
      values['large-iterations'] === undefined
        ? null
        : Number(values['large-iterations']),
    warmup: Number(values.warmup),
    format: values.format,
    out: values.out,
    clean: values.clean,
    filter: values.filter ?? null,
    parallelRouteTransform: parseParallelRouteTransform(
      values['parallel-route-transform']
    ),
    cpuLimit:
      values['cpu-limit'] === undefined ? null : Number(values['cpu-limit']),
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
  if (
    args.largeIterations !== null &&
    (!Number.isInteger(args.largeIterations) || args.largeIterations < 1)
  ) {
    throw new Error('--large-iterations must be a positive integer.');
  }
  if (!Number.isInteger(args.warmup) || args.warmup < 0) {
    throw new Error('--warmup must be a non-negative integer.');
  }
  if (args.cpuLimit !== null) {
    if (!Number.isInteger(args.cpuLimit) || args.cpuLimit < 1) {
      throw new Error('--cpu-limit must be a positive integer.');
    }
    if (process.platform !== 'linux') {
      throw new Error('--cpu-limit requires Linux (uses taskset).');
    }
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

const isLargeBenchmark = benchmark =>
  benchmark.fixture === 'large' || benchmark.routeCount >= 1024;

const getMeasuredIterationCount = (benchmark, args) =>
  args.largeIterations !== null && isLargeBenchmark(benchmark)
    ? Math.min(args.iterations, args.largeIterations)
    : args.iterations;

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

const withCpuLimit = ({ command, args, cpuLimit }) =>
  cpuLimit === null
    ? { command, args }
    : {
        command: 'taskset',
        args: ['-c', `0-${cpuLimit - 1}`, command, ...args],
      };

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

const runBenchmarkIteration = (benchmarkContext, index) =>
  Effect.gen(function* () {
    const {
      args,
      benchmark,
      benchmarkIndex,
      devRoutePaths,
      fixtureResult,
      fixtureRoot,
      measuredIterations,
      outputPaths,
      useTime,
    } = benchmarkContext;
    const measured = index >= args.warmup;
    const runLabel = `${measured ? 'run' : 'warmup'}-${
      measured ? index - args.warmup + 1 : index + 1
    }`;

    if (args.clean !== 'none') {
      yield* tryPromise(() => cleanBuildOutputs(fixtureRoot));
    }
    if (args.clean === 'cold') {
      yield* tryPromise(() =>
        rm(path.join(fixtureRoot, 'node_modules'), {
          recursive: true,
          force: true,
        })
      );
    }

    console.log(
      `${measured ? 'Measuring' : 'Warming'} ${benchmark.id} (${index + 1}/${
        args.warmup + measuredIterations
      })`
    );

    const rspackProfileEnabled =
      args.mode === 'build' && Boolean(args.rspackProfile);
    const beforeRspackProfiles = rspackProfileEnabled
      ? yield* tryPromise(() => listRspackProfileDirs(fixtureRoot))
      : [];
    const rspackTraceOutput =
      args.mode === 'build'
        ? yield* tryPromise(() =>
            resolveRspackTraceOutput({
              traceOutput: args.rspackTraceOutput,
              benchmarkId: benchmark.id,
              runLabel,
            })
          )
        : null;
    const commonEnv = {
      NODE_ENV: args.mode === 'build' ? 'production' : 'development',
      ...(args.logPerformance
        ? { REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE: '1' }
        : {}),
    };
    const commandResult =
      args.mode === 'dev'
        ? yield* tryPromise(() => {
            const devPort = args.devPortBase + benchmarkIndex * 100 + index;
            return runDevServerBenchmark({
              ...withCpuLimit({
                command: process.execPath,
                args: [
                  rsbuildBin,
                  'dev',
                  '--config',
                  'rsbuild.config.mjs',
                  '--port',
                  String(devPort),
                ],
                cpuLimit: args.cpuLimit,
              }),
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
              origin: `http://localhost:${devPort}`,
              routePaths: devRoutePaths,
              routeTimeoutMs: args.devRouteTimeoutMs,
              updateFile: fixtureResult.updateFile,
              updateRoutePaths: fixtureResult.updateRoutePaths ?? ['/'],
              timeoutMs: args.devTimeoutMs,
            });
          })
        : yield* tryPromise(() =>
            runCommand({
              ...withCpuLimit({
                command: process.execPath,
                args: [rsbuildBin, 'build', '--config', 'rsbuild.config.mjs'],
                cpuLimit: args.cpuLimit,
              }),
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
            })
          );
    const rspackProfiles = rspackProfileEnabled
      ? yield* tryPromise(() =>
          collectRspackProfiles({
            fixtureRoot,
            beforeProfiles: beforeRspackProfiles,
            destinationRoot: path.join(
              outputPaths.artifactRoot,
              'rspack-profiles',
              benchmark.id,
              runLabel
            ),
          })
        )
      : [];
    const timeStats =
      args.mode === 'build' && useTime
        ? parseTimeStats(commandResult.stderr)
        : { userMs: null, sysMs: null, maxRssKb: null };
    const pluginReports = parsePluginReports(
      `${commandResult.stdout}\n${commandResult.stderr}`
    );

    if (commandResult.status !== 0 && args.failFast) {
      yield* Effect.fail(
        failFastError({
          benchmarkId: benchmark.id,
          runLabel,
          status: commandResult.status,
        })
      );
    }

    return measured
      ? {
          status: commandResult.status,
          wallMs: commandResult.wallMs,
          readyMs: commandResult.readyMs ?? null,
          routeTotalMs: commandResult.routeTotalMs ?? null,
          routeRequests: commandResult.routeRequests ?? [],
          updateMs: commandResult.updateMs ?? null,
          updateRouteTotalMs: commandResult.updateRouteTotalMs ?? null,
          updateRouteRequests: commandResult.updateRouteRequests ?? [],
          userMs: timeStats.userMs ?? null,
          sysMs: timeStats.sysMs ?? null,
          maxRssKb: timeStats.maxRssKb ?? null,
          pluginReports,
          rspackProfiles,
          rspackTraceOutput:
            rspackTraceOutput && !isTraceOutputStream(rspackTraceOutput)
              ? path.relative(rootDir, rspackTraceOutput)
              : rspackTraceOutput,
        }
      : null;
  });

const runBenchmark = ({
  args,
  benchmark,
  benchmarkIndex,
  outputPaths,
  pluginImportPath,
  pluginReactImportPath,
  useTime,
}) =>
  Effect.gen(function* () {
    const measuredIterations = getMeasuredIterationCount(benchmark, args);
    const fixtureRoot = path.join(benchmarkRoot, 'fixtures', benchmark.id);
    const devRoutePaths =
      args.mode === 'dev'
        ? resolveDevRoutePaths(args.devRoutes, benchmark)
        : [];
    const fixtureResult = yield* tryPromise(() =>
      generateSyntheticFixture({
        root: fixtureRoot,
        routeCount: benchmark.routeCount,
        variant: benchmark.variant,
        sourceMap: benchmark.sourceMap ?? false,
        fixture: benchmark.fixture ?? 'default',
        pluginImportPath,
        pluginReactImportPath,
        parallelRouteTransform: args.parallelRouteTransform,
        largeConfig: benchmark.largeConfig,
      })
    );
    const totalRuns = args.warmup + measuredIterations;
    const benchmarkContext = {
      args,
      benchmark,
      benchmarkIndex,
      devRoutePaths,
      fixtureResult,
      fixtureRoot,
      measuredIterations,
      outputPaths,
      useTime,
    };
    const runs = (yield* Effect.forEach(
      Array.from({ length: totalRuns }, (_, index) => index),
      index => runBenchmarkIteration(benchmarkContext, index),
      { concurrency: 1 }
    )).filter(Boolean);

    return {
      ...benchmark,
      fixture: fixtureResult.fixture,
      fixtureStats:
        Object.entries(fixtureResult).find(([key]) => key === 'stats')?.[1] ??
        null,
      iterations: measuredIterations,
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
      devUpdateRouteSummary: summarizeDevUpdateRouteRequests(runs),
      pluginOperations: summarizePluginOperations(runs),
    };
  });

const runBenchmarkSuite = argv =>
  Effect.gen(function* () {
    const args = parseArgs(argv);
    const useTime = yield* tryPromise(hasGnuTime);
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
      yield* Effect.fail(
        new Error(`No benchmarks matched filter "${args.filter}".`)
      );
    }

    if (!args.skipRootBuild) {
      console.log('Building plugin package before benchmarks...');
      const buildResult = yield* tryPromise(() =>
        runCommand({
          command: 'pnpm',
          args: ['build'],
          cwd: rootDir,
        })
      );
      if (buildResult.status !== 0) {
        yield* Effect.fail(
          failFastError({
            benchmarkId: 'package-build',
            runLabel: 'build',
            status: buildResult.status,
          })
        );
      }
    }

    const benchmarks = yield* Effect.forEach(
      selectedBenchmarks.map((benchmark, benchmarkIndex) => ({
        benchmark,
        benchmarkIndex,
      })),
      ({ benchmark, benchmarkIndex }) =>
        runBenchmark({
          args,
          benchmark,
          benchmarkIndex,
          outputPaths,
          pluginImportPath,
          pluginReactImportPath,
          useTime,
        }),
      { concurrency: 1 }
    );

    const failed = benchmarks.some(benchmark =>
      benchmark.runs.some(run => run.status !== 0)
    );
    const result = {
      repo: 'rsbuild-plugin-react-router',
      commit: yield* tryPromise(() => git(['rev-parse', 'HEAD'])),
      date: new Date().toISOString(),
      node: process.version,
      pnpm: yield* tryPromise(pnpmVersion),
      platform: `${os.platform()} ${os.release()} ${os.arch()}`,
      profile: args.profile,
      mode: args.mode,
      iterations: args.iterations,
      largeIterations: args.largeIterations,
      warmup: args.warmup,
      clean: args.clean,
      logPerformance: args.logPerformance,
      devRoutes: args.mode === 'dev' ? args.devRoutes : null,
      devRouteTimeoutMs: args.mode === 'dev' ? args.devRouteTimeoutMs : null,
      parallelRouteTransform: args.parallelRouteTransform,
      cpuLimit: args.cpuLimit,
      rspackProfile: args.rspackProfile,
      rspackTraceOutput: args.rspackTraceOutput,
      failed,
      benchmarks,
    };

    yield* tryPromise(() => writeOutputs(result, outputPaths));
    console.log(`Benchmark results written to ${outputPaths.outPath}`);

    if (failed) {
      console.error('One or more measured benchmark builds failed.');
      process.exitCode = 1;
    }
  });

Effect.runPromise(runBenchmarkSuite(process.argv.slice(2))).catch(error => {
  console.error(error);
  process.exit(error?.exitCode ?? 1);
});
