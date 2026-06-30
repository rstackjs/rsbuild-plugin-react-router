import { availableParallelism, cpus } from 'node:os';

export const DEFAULT_MODES = [
  'rsbuild-optimized',
  'rsbuild-js-transform-contention',
];

const VALID_PROFILES = new Set(['cold', 'warm', 'both']);
const REACT_ROUTER_PERFORMANCE_LOG_PREFIX = '[react-router:performance]';
const REACT_ROUTER_PERFORMANCE_ENV = 'SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE';
const FAST_LOADER_WORKER_THREADS = resolveFastLoaderWorkerThreads();
const OPTIMIZED_RSBUILD_ENV = {
  RSPACK_LOADER_WORKER_THREADS: FAST_LOADER_WORKER_THREADS,
  SYNTHETIC_RSBUILD_LIGHTNINGCSS: '1',
};

const MODE_BUILD_CONFIGS = {
  'rsbuild-optimized': {
    config: 'rsbuild.fast.config.ts',
    env: OPTIMIZED_RSBUILD_ENV,
  },
  'rsbuild-js-transform-contention': {
    config: 'rsbuild.fast.config.ts',
    env: {
      RSPACK_LOADER_WORKER_THREADS: FAST_LOADER_WORKER_THREADS,
      SYNTHETIC_REACT_COMPILER: 'with-react-compiler',
      SYNTHETIC_RSBUILD_APP_BABEL: '1',
      SYNTHETIC_RSBUILD_LIGHTNINGCSS: '1',
    },
  },
};
const VALID_MODES = new Set(Object.keys(MODE_BUILD_CONFIGS));

export function resolveFastLoaderWorkerThreads() {
  const availableCores = availableParallelism?.() ?? cpus().length;
  return String(Math.max(1, availableCores - 2));
}

export function isReactRouterPerformanceLoggingEnabled(env = process.env) {
  const value = env[REACT_ROUTER_PERFORMANCE_ENV];
  return value === '1' || value === 'true';
}

export function parseReactRouterPerformanceLogs(logs) {
  const entries = [];
  for (const line of logs.split(/\r?\n/)) {
    const prefixIndex = line.indexOf(REACT_ROUTER_PERFORMANCE_LOG_PREFIX);
    if (prefixIndex === -1) {
      continue;
    }
    const json = line
      .slice(prefixIndex + REACT_ROUTER_PERFORMANCE_LOG_PREFIX.length)
      .trim();
    try {
      entries.push(JSON.parse(json));
    } catch (error) {
      throw new Error(`Invalid React Router performance log JSON: ${json}`, {
        cause: error,
      });
    }
  }
  return entries;
}

export function parseArgs(argv) {
  const option = (name, fallback) =>
    argv.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ??
    fallback;
  const runs = Number(option('runs', '10'));
  const profile = option('profile', 'cold');
  const out = option('out', 'benchmark-results');
  const modes = option('modes', DEFAULT_MODES.join(','))
    .split(',')
    .map(mode => mode.trim())
    .filter(Boolean);

  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error('--runs must be positive');
  }
  if (!VALID_PROFILES.has(profile)) {
    throw new Error('--profile must be cold, warm, or both');
  }
  if (modes.length === 0 || modes.some(mode => !VALID_MODES.has(mode))) {
    throw new Error(
      `--modes accepts ${Object.keys(MODE_BUILD_CONFIGS).join(',')}`
    );
  }

  return { modes, out, profile, runs };
}

export function getModeBuildConfig(mode) {
  const config = MODE_BUILD_CONFIGS[mode];
  if (!config) {
    throw new Error(`Unknown Rsbuild benchmark mode: ${mode}`);
  }
  return {
    config: config.config,
    env: { ...config.env },
  };
}

export function summarizeResults(results) {
  const modeOrder = [...new Set(results.map(result => result.mode))];
  const summaries = modeOrder.map(mode => {
    const samples = results
      .filter(result => result.mode === mode)
      .map(result => result.durationSeconds);
    const sorted = [...samples].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
    const mean =
      samples.reduce((sum, value) => sum + value, 0) / samples.length;
    return { mode, samples, median, mean, fastest: false };
  });

  const fastestMedian = Math.min(...summaries.map(summary => summary.median));
  return summaries.map(summary => ({
    ...summary,
    fastest: summary.median === fastestMedian,
  }));
}

export function formatMarkdown({
  generatedAt,
  node,
  platform,
  profile,
  runs,
  summaries,
}) {
  const stamp = generatedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
  return [
    `# Benchmark Rsbuild Modes ${stamp}`,
    '',
    `Node: \`${node}\` on \`${platform}\``,
    `Profile: \`${profile}\`; runs: \`${runs}\``,
    '',
    '| Mode | Profile | Samples (s) | Median (s) | Mean (s) | Result |',
    '| --- | --- | ---: | ---: | ---: | --- |',
    ...summaries.map(
      summary =>
        `| ${summary.mode} | ${summary.profile ?? profile} | ${summary.samples
          .map(value => value.toFixed(2))
          .join(', ')} | ${summary.median.toFixed(2)} | ${summary.mean.toFixed(
          2
        )} | ${summary.fastest ? 'fastest' : ''} |`
    ),
    '',
  ].join('\n');
}
