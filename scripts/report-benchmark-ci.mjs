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
    'Usage: node scripts/report-benchmark-ci.mjs --base <baseline.json> --head <baseline.json> [--out <dir>]'
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

const percentDelta = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && base !== 0
    ? ((head - base) / base) * 100
    : null;

const speedup = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && head !== 0
    ? base / head
    : null;

const medianWall = benchmark => benchmark?.summary?.wallMs?.median ?? null;
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
  return {
    id,
    routeCount: headBenchmark?.routeCount ?? baseBenchmark?.routeCount ?? null,
    variant: headBenchmark?.variant ?? baseBenchmark?.variant ?? null,
    baseWallMs,
    headWallMs,
    wallDeltaPercent: percentDelta(baseWallMs, headWallMs),
    wallSpeedup: speedup(baseWallMs, headWallMs),
    baseCpuMs: cpuMedian(baseBenchmark),
    headCpuMs: cpuMedian(headBenchmark),
    baseRssKb: p95Rss(baseBenchmark),
    headRssKb: p95Rss(headBenchmark),
  };
});

const totalBaseWallMs = benchmarks.reduce(
  (sum, benchmark) => sum + (benchmark.baseWallMs ?? 0),
  0
);
const totalHeadWallMs = benchmarks.reduce(
  (sum, benchmark) => sum + (benchmark.headWallMs ?? 0),
  0
);

const summary = {
  baseWallMs: totalBaseWallMs,
  headWallMs: totalHeadWallMs,
  wallDeltaPercent: percentDelta(totalBaseWallMs, totalHeadWallMs),
  wallSpeedup: speedup(totalBaseWallMs, totalHeadWallMs),
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
  iterations: head.iterations ?? base.iterations ?? null,
  warmup: head.warmup ?? base.warmup ?? null,
  summary,
  benchmarks,
};

const renderComment = () => {
  const lines = [
    '<!-- react-router-benchmark-ci -->',
    '## Benchmark Results',
    '',
    `Compared PR head \`${report.head.sha?.slice(0, 7) ?? 'unknown'}\` against base \`${report.base.sha?.slice(0, 7) ?? 'unknown'}\`.`,
    '',
    `**Total median wall time:** ${formatSeconds(summary.baseWallMs)} -> ${formatSeconds(summary.headWallMs)} (${formatPercent(summary.wallDeltaPercent)}, ${formatSpeedup(summary.wallSpeedup)} speedup)`,
    '',
    '| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |',
    '|---|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of benchmarks) {
    lines.push(
      `| \`${benchmark.id}\` | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`
    );
  }

  lines.push(
    '',
    `Profile: \`${report.profile ?? 'unknown'}\`; iterations: \`${report.iterations ?? 'unknown'}\`; warmup: \`${report.warmup ?? 'unknown'}\`.`,
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
