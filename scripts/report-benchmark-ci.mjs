#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  allowPositionals: false,
  strict: true,
  options: {
    base: { type: 'string' },
    head: { type: 'string' },
    'synthetic-base': { type: 'string' },
    'synthetic-head': { type: 'string' },
    out: { type: 'string', default: '.benchmark/ci-report' },
    pr: { type: 'string' },
    'base-ref': { type: 'string' },
    'base-sha': { type: 'string' },
    'head-ref': { type: 'string' },
    'head-sha': { type: 'string' },
    'run-url': { type: 'string' },
  },
});

if (!values.base || !values.head) {
  throw new Error(
    'Usage: node scripts/report-benchmark-ci.mjs --base <base.json> --head <head.json> [--out <dir>]'
  );
}

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const formatSeconds = value =>
  typeof value === 'number' ? `${(value / 1000).toFixed(2)}s` : '-';
const formatPercent = value =>
  typeof value === 'number'
    ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
    : '-';
const formatSpeedup = value =>
  typeof value === 'number' ? `${value.toFixed(2)}x` : '-';
const formatRss = value =>
  typeof value === 'number' ? `${Math.round(value / 1024)} MB` : '-';
const formatDurationSeconds = value =>
  typeof value === 'number' ? `${value.toFixed(2)}s` : '-';

const percentDelta = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && base !== 0
    ? ((head - base) / base) * 100
    : null;

const speedup = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && head !== 0
    ? base / head
    : null;

const readSyntheticBenchmarkPayloads = async manifestPath => {
  if (!manifestPath) {
    return [];
  }

  const manifest = await readJson(manifestPath);
  const outputDirectory =
    manifest.outputDirectory ?? manifest.workdir ?? path.dirname(manifestPath);
  return Promise.all(
    (manifest.generatedFiles ?? []).map(async file => {
      const payload = await readJson(path.resolve(outputDirectory, file));
      return {
        manifest,
        payload,
      };
    })
  );
};

const medianWall = benchmark => benchmark?.summary?.wallMs?.median ?? null;
const medianReady = benchmark => benchmark?.summary?.readyMs?.median ?? null;
const medianRouteTotal = benchmark =>
  benchmark?.summary?.routeTotalMs?.median ?? null;
const p95Rss = benchmark => benchmark?.summary?.maxRssKb?.p95 ?? null;
const cpuMedian = benchmark => {
  const user = benchmark?.summary?.userMs?.median;
  const sys = benchmark?.summary?.sysMs?.median;
  return typeof user === 'number' && typeof sys === 'number'
    ? user + sys
    : null;
};

const indexBenchmarks = result =>
  new Map(
    (result.benchmarks ?? []).map(benchmark => [benchmark.id, benchmark])
  );

const base = await readJson(values.base);
const head = await readJson(values.head);
const syntheticBasePayloads = await readSyntheticBenchmarkPayloads(
  values['synthetic-base']
);
const syntheticHeadPayloads = await readSyntheticBenchmarkPayloads(
  values['synthetic-head']
);
const baseBenchmarks = indexBenchmarks(base);
const headBenchmarks = indexBenchmarks(head);
const benchmarkIds = [
  ...new Set([...baseBenchmarks.keys(), ...headBenchmarks.keys()]),
].sort();

const benchmarks = benchmarkIds.map(id => {
  const baseBenchmark = baseBenchmarks.get(id);
  const headBenchmark = headBenchmarks.get(id);
  const baseWallMs = medianWall(baseBenchmark);
  const headWallMs = medianWall(headBenchmark);
  const baseReadyMs = medianReady(baseBenchmark);
  const headReadyMs = medianReady(headBenchmark);
  const baseRouteTotalMs = medianRouteTotal(baseBenchmark);
  const headRouteTotalMs = medianRouteTotal(headBenchmark);
  return {
    id,
    routeCount: headBenchmark?.routeCount ?? baseBenchmark?.routeCount ?? null,
    variant: headBenchmark?.variant ?? baseBenchmark?.variant ?? null,
    baseWallMs,
    headWallMs,
    baseReadyMs,
    headReadyMs,
    baseRouteTotalMs,
    headRouteTotalMs,
    wallDeltaPercent: percentDelta(baseWallMs, headWallMs),
    wallSpeedup: speedup(baseWallMs, headWallMs),
    baseCpuMs: cpuMedian(baseBenchmark),
    headCpuMs: cpuMedian(headBenchmark),
    baseRssKb: p95Rss(baseBenchmark),
    headRssKb: p95Rss(headBenchmark),
  };
});

const syntheticSummaryKey = summary => `${summary.mode}:${summary.profile}`;
const indexSyntheticSummaries = payloads =>
  new Map(
    payloads.flatMap(({ payload }) =>
      (payload.summaries ?? []).map(summary => [
        syntheticSummaryKey(summary),
        {
          ...summary,
          node: payload.node ?? null,
          platform: payload.platform ?? null,
          runs: payload.runs ?? null,
        },
      ])
    )
  );
const syntheticBaseSummaries = indexSyntheticSummaries(syntheticBasePayloads);
const syntheticHeadSummaries = indexSyntheticSummaries(syntheticHeadPayloads);
const syntheticBenchmarkKeys = [
  ...new Set([
    ...syntheticBaseSummaries.keys(),
    ...syntheticHeadSummaries.keys(),
  ]),
].sort((a, b) => {
  const order = [
    'rsbuild-optimized:cold',
    'rsbuild-optimized:warm',
    'rsbuild-js-transform-contention:cold',
    'rsbuild-js-transform-contention:warm',
  ];
  const aIndex = order.indexOf(a);
  const bIndex = order.indexOf(b);
  if (aIndex !== -1 || bIndex !== -1) {
    return (
      (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
    );
  }
  return a.localeCompare(b);
});
const syntheticBenchmarks = syntheticBenchmarkKeys.map(key => {
  const baseSummary = syntheticBaseSummaries.get(key);
  const headSummary = syntheticHeadSummaries.get(key);
  const [mode, profile] = key.split(':');
  const baseMedianSeconds = baseSummary?.median ?? null;
  const headMedianSeconds = headSummary?.median ?? null;
  return {
    mode,
    profile,
    baseMedianSeconds,
    headMedianSeconds,
    deltaPercent: percentDelta(baseMedianSeconds, headMedianSeconds),
    speedup: speedup(baseMedianSeconds, headMedianSeconds),
    runs: headSummary?.runs ?? baseSummary?.runs ?? null,
    node: headSummary?.node ?? baseSummary?.node ?? null,
    platform: headSummary?.platform ?? baseSummary?.platform ?? null,
  };
});

const sumMetric = (benchmarks, key) => {
  const values = benchmarks
    .map(benchmark => benchmark[key])
    .filter(value => typeof value === 'number');
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0);
};

const totalBaseWallMs = sumMetric(benchmarks, 'baseWallMs');
const totalHeadWallMs = sumMetric(benchmarks, 'headWallMs');
const totalBaseReadyMs = sumMetric(benchmarks, 'baseReadyMs');
const totalHeadReadyMs = sumMetric(benchmarks, 'headReadyMs');
const totalBaseRouteTotalMs = sumMetric(benchmarks, 'baseRouteTotalMs');
const totalHeadRouteTotalMs = sumMetric(benchmarks, 'headRouteTotalMs');

const summary = {
  baseWallMs: totalBaseWallMs,
  headWallMs: totalHeadWallMs,
  baseReadyMs: totalBaseReadyMs,
  headReadyMs: totalHeadReadyMs,
  baseRouteTotalMs: totalBaseRouteTotalMs,
  headRouteTotalMs: totalHeadRouteTotalMs,
  wallDeltaPercent: percentDelta(totalBaseWallMs, totalHeadWallMs),
  wallSpeedup: speedup(totalBaseWallMs, totalHeadWallMs),
  readyDeltaPercent: percentDelta(totalBaseReadyMs, totalHeadReadyMs),
  routeTotalDeltaPercent: percentDelta(
    totalBaseRouteTotalMs,
    totalHeadRouteTotalMs
  ),
};

const report = {
  generatedAt: new Date().toISOString(),
  pullRequest: values.pr ?? null,
  base: {
    ref: values['base-ref'] ?? null,
    sha: values['base-sha'] ?? base.commit ?? null,
    benchmarkCommit: base.commit ?? null,
  },
  head: {
    ref: values['head-ref'] ?? null,
    sha: values['head-sha'] ?? head.commit ?? null,
    benchmarkCommit: head.commit ?? null,
  },
  runUrl: values['run-url'] ?? null,
  profile: head.profile ?? base.profile ?? null,
  mode: head.mode ?? base.mode ?? 'build',
  iterations: head.iterations ?? base.iterations ?? null,
  warmup: head.warmup ?? base.warmup ?? null,
  summary,
  benchmarks,
  syntheticBenchmarks,
};

const renderComment = () => {
  const lines = [
    '<!-- react-router-benchmark-ci -->',
    '## Benchmark Results',
    '',
    `Compared PR head \`${report.head.sha?.slice(0, 7) ?? 'unknown'}\` against base \`${report.base.sha?.slice(0, 7) ?? 'unknown'}\`.`,
    '',
    `**Total median wall time:** ${formatSeconds(summary.baseWallMs)} -> ${formatSeconds(summary.headWallMs)} (${formatPercent(summary.wallDeltaPercent)}, ${formatSpeedup(summary.wallSpeedup)} speedup)`,
    ...(report.mode === 'dev'
      ? [
          `**Compiler ready median:** ${formatSeconds(summary.baseReadyMs)} -> ${formatSeconds(summary.headReadyMs)} (${formatPercent(summary.readyDeltaPercent)})`,
          `**Route load median:** ${formatSeconds(summary.baseRouteTotalMs)} -> ${formatSeconds(summary.headRouteTotalMs)} (${formatPercent(summary.routeTotalDeltaPercent)})`,
        ]
      : []),
    '',
    '| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of benchmarks) {
    lines.push(
      `| \`${benchmark.id}\` | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.headReadyMs)} | ${formatSeconds(benchmark.headRouteTotalMs)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`
    );
  }

  if (syntheticBenchmarks.length > 0) {
    lines.push(
      '',
      '### Embedded Synthetic App',
      '',
      '| Mode | Profile | Base median | Head median | Delta | Speedup | Runs |',
      '|---|---:|---:|---:|---:|---:|---:|'
    );

    for (const benchmark of syntheticBenchmarks) {
      lines.push(
        `| \`${benchmark.mode}\` | \`${benchmark.profile}\` | ${formatDurationSeconds(benchmark.baseMedianSeconds)} | ${formatDurationSeconds(benchmark.headMedianSeconds)} | ${formatPercent(benchmark.deltaPercent)} | ${formatSpeedup(benchmark.speedup)} | ${benchmark.runs ?? '-'} |`
      );
    }
  }

  lines.push(
    '',
    `Profile: \`${report.profile ?? 'unknown'}\`; mode: \`${report.mode ?? 'unknown'}\`; iterations: \`${report.iterations ?? 'unknown'}\`; warmup: \`${report.warmup ?? 'unknown'}\`.`,
    ...(report.runUrl ? [`[Workflow run](${report.runUrl})`] : []),
    ''
  );

  return `${lines.join('\n')}\n`;
};

const outDir = path.resolve(values.out);
await mkdir(outDir, { recursive: true });
await writeFile(
  path.join(outDir, 'report.json'),
  `${JSON.stringify(report, null, 2)}\n`
);
await writeFile(path.join(outDir, 'comment.md'), renderComment());

console.log(`Benchmark CI report written to ${outDir}`);
