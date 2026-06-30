const VALID_PROFILES = new Set(['cold', 'warm', 'both']);
const REACT_ROUTER_PERFORMANCE_LOG_PREFIX = '[react-router:performance]';
const REACT_ROUTER_PERFORMANCE_ENV = 'SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE';

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

  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error('--runs must be positive');
  }
  if (!VALID_PROFILES.has(profile)) {
    throw new Error('--profile must be cold, warm, or both');
  }

  return { out, profile, runs };
}

export function summarizeResults(results) {
  const profiles = [...new Set(results.map(result => result.profile))];
  return profiles.map(profile => {
    const samples = results
      .filter(result => result.profile === profile)
      .map(result => result.durationSeconds);
    const sorted = [...samples].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
    const mean =
      samples.reduce((sum, value) => sum + value, 0) / samples.length;
    return { mode: 'rsbuild', profile, samples, median, mean };
  });
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
    `# Benchmark Rsbuild ${stamp}`,
    '',
    `Node: \`${node}\` on \`${platform}\``,
    `Profile: \`${profile}\`; runs: \`${runs}\``,
    '',
    '| Profile | Samples (s) | Median (s) | Mean (s) |',
    '| --- | ---: | ---: | ---: |',
    ...summaries.map(
      summary =>
        `| ${summary.profile} | ${summary.samples
          .map(value => value.toFixed(2))
          .join(', ')} | ${summary.median.toFixed(2)} | ${summary.mean.toFixed(
          2
        )} |`
    ),
    '',
  ].join('\n');
}
