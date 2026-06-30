const VALID_PROFILES = new Set(['cold', 'warm', 'both', 'dev', 'all']);
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
    throw new Error('--profile must be cold, warm, both, dev, or all');
  }

  return { out, profile, runs };
}

const numeric = value => typeof value === 'number' && Number.isFinite(value);

export function summarizeMetric(values) {
  const samples = values.filter(numeric);
  if (samples.length === 0) {
    return { samples: [], median: null, mean: null };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  const mean =
    samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return { samples, median, mean };
}

export function summarizeResults(results) {
  const profiles = [...new Set(results.map(result => result.profile))].sort();
  return profiles.map(profile => {
    const profileResults = results.filter(result => result.profile === profile);
    const duration = summarizeMetric(
      profileResults.map(result => result.durationSeconds)
    );
    const ready = summarizeMetric(profileResults.map(result => result.readyMs));
    const routeTotal = summarizeMetric(
      profileResults.map(result => result.routeTotalMs)
    );
    const update = summarizeMetric(
      profileResults.map(result => result.updateMs)
    );
    return {
      mode: 'rsbuild',
      profile,
      samples: duration.samples,
      median: duration.median,
      mean: duration.mean,
      readyMs: ready,
      routeTotalMs: routeTotal,
      updateMs: update,
    };
  });
}

const formatSeconds = value =>
  typeof value === 'number' ? value.toFixed(2) : '-';

const formatMsAsSeconds = value =>
  typeof value === 'number' ? (value / 1000).toFixed(2) : '-';

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
    '| Profile | Samples (s) | Median (s) | Mean (s) | Ready | Route load | Update/HMR rebuild |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...summaries.map(
      summary =>
        `| ${summary.profile} | ${summary.samples
          .map(value => value.toFixed(2))
          .join(', ')} | ${formatSeconds(summary.median)} | ${formatSeconds(
          summary.mean
        )} | ${formatMsAsSeconds(summary.readyMs?.median)} | ${formatMsAsSeconds(
          summary.routeTotalMs?.median
        )} | ${formatMsAsSeconds(summary.updateMs?.median)} |`
    ),
    '',
  ].join('\n');
}
