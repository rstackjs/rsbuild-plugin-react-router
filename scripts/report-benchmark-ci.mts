#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { Effect } from 'effect';
import {
  runScriptEffect,
  tryScriptPromise,
  tryScriptSync,
} from './script-effect.mts';

const parseInputEffect = () =>
  tryScriptSync(() => {
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
        'support-base': { type: 'string' },
        'support-head': { type: 'string' },
      },
    });

    if (!values.base || !values.head) {
      throw new Error(
        'Usage: node scripts/report-benchmark-ci.mts --base <base.json> --head <head.json> [--out <dir>]'
      );
    }

    return values;
  });

const readJsonEffect = file =>
  tryScriptPromise(async () => JSON.parse(await readFile(file, 'utf8')));
const formatSeconds = value =>
  typeof value === 'number' ? `${(value / 1000).toFixed(2)}s` : '-';
const formatSecondsFromSeconds = value =>
  typeof value === 'number' ? `${value.toFixed(2)}s` : '-';
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

const findSupportResultPath = wrapper => {
  const resultFile = wrapper?.generatedFiles?.find(file =>
    file.endsWith('-rsbuild-modes.json')
  );
  return resultFile && wrapper.workdir
    ? path.resolve(wrapper.workdir, resultFile)
    : null;
};

const readSupportBenchmarkEffect = file =>
  Effect.gen(function* () {
    const wrapper = yield* readJsonEffect(file);
    const resultPath = findSupportResultPath(wrapper);
    if (!resultPath) {
      return yield* Effect.fail(
        new Error(`${file} does not reference an rsbuild-modes result JSON.`)
      );
    }
    const result = yield* readJsonEffect(resultPath);
    const summary =
      result.summaries?.find(summary => summary.mode === 'rsbuild-fast') ??
      result.summaries?.[0];
    if (!summary) {
      return yield* Effect.fail(
        new Error(`${resultPath} does not contain benchmark summaries.`)
      );
    }
    return {
      mode: summary.mode,
      profile: summary.profile ?? result.profile ?? null,
      samples: summary.samples ?? [],
      medianSeconds: summary.median ?? null,
      meanSeconds: summary.mean ?? null,
      runs: result.runs ?? null,
      generatedAt: result.generatedAt ?? wrapper.generatedAt ?? null,
      packageSpec: wrapper.packageSpec ?? null,
      resultPath,
    };
  });

const createSupportReport = (base, head) => {
  if (!base || !head) {
    return null;
  }
  return {
    base,
    head,
    deltaPercent: percentDelta(base.medianSeconds, head.medianSeconds),
    speedup: speedup(base.medianSeconds, head.medianSeconds),
  };
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

const sumMetric = (benchmarks, key) => {
  const values = benchmarks
    .map(benchmark => benchmark[key])
    .filter(value => typeof value === 'number');
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0);
};

const createReport = (values, base, head, supportBenchmark = null) => {
  const baseMode = base.mode ?? 'build';
  const headMode = head.mode ?? 'build';

  if (baseMode !== headMode) {
    throw new Error(
      `Cannot compare benchmark results with different modes: base=${baseMode}, head=${headMode}.`
    );
  }

  const baseBenchmarks = indexBenchmarks(base);
  const headBenchmarks = indexBenchmarks(head);
  const benchmarkIds = [
    ...new Set([...baseBenchmarks.keys(), ...headBenchmarks.keys()]),
  ].sort();

  const benchmarks = benchmarkIds.map(id => {
    const baseBenchmark = baseBenchmarks.get(id) as any;
    const headBenchmark = headBenchmarks.get(id) as any;
    const baseWallMs = medianWall(baseBenchmark);
    const headWallMs = medianWall(headBenchmark);
    const baseReadyMs = medianReady(baseBenchmark);
    const headReadyMs = medianReady(headBenchmark);
    const baseRouteTotalMs = medianRouteTotal(baseBenchmark);
    const headRouteTotalMs = medianRouteTotal(headBenchmark);
    return {
      id,
      routeCount:
        headBenchmark?.routeCount ?? baseBenchmark?.routeCount ?? null,
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

  return {
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
    mode: headMode,
    iterations: head.iterations ?? base.iterations ?? null,
    warmup: head.warmup ?? base.warmup ?? null,
    summary,
    benchmarks,
    supportBenchmark,
  };
};

const renderComment = report => {
  const { benchmarks, summary, supportBenchmark } = report;
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
    ...(supportBenchmark
      ? [
          '### Support Repo Benchmark',
          '',
          '| Benchmark | Base median | Head median | Delta | Speedup | Runs | Profile |',
          '|---|---:|---:|---:|---:|---:|---|',
          `| \`${supportBenchmark.head.mode ?? 'support-rsbuild-modes'}\` | ${formatSecondsFromSeconds(supportBenchmark.base.medianSeconds)} | ${formatSecondsFromSeconds(supportBenchmark.head.medianSeconds)} | ${formatPercent(supportBenchmark.deltaPercent)} | ${formatSpeedup(supportBenchmark.speedup)} | \`${supportBenchmark.head.runs ?? 'unknown'}\` | \`${supportBenchmark.head.profile ?? 'unknown'}\` |`,
          '',
        ]
      : []),
    '| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of benchmarks) {
    lines.push(
      `| \`${benchmark.id}\` | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.headReadyMs)} | ${formatSeconds(benchmark.headRouteTotalMs)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`
    );
  }

  lines.push(
    '',
    `Profile: \`${report.profile ?? 'unknown'}\`; mode: \`${report.mode ?? 'unknown'}\`; iterations: \`${report.iterations ?? 'unknown'}\`; warmup: \`${report.warmup ?? 'unknown'}\`.`,
    ...(report.runUrl ? [`[Workflow run](${report.runUrl})`] : []),
    ''
  );

  return `${lines.join('\n')}\n`;
};

const writeReportEffect = (outDir, report) =>
  tryScriptPromise(async () => {
    await mkdir(outDir, { recursive: true });
    await writeFile(
      path.join(outDir, 'report.json'),
      `${JSON.stringify(report, null, 2)}\n`
    );
    await writeFile(path.join(outDir, 'comment.md'), renderComment(report));
  });

const mainEffect = Effect.gen(function* () {
  const values = yield* parseInputEffect();
  const [base, head] = yield* Effect.all([
    readJsonEffect(values.base),
    readJsonEffect(values.head),
  ]);
  const supportBenchmark =
    values['support-base'] && values['support-head']
      ? createSupportReport(
          yield* readSupportBenchmarkEffect(values['support-base']),
          yield* readSupportBenchmarkEffect(values['support-head'])
        )
      : null;
  const report = yield* tryScriptSync(() =>
    createReport(values, base, head, supportBenchmark)
  );
  const outDir = path.resolve(values.out);
  yield* writeReportEffect(outDir, report);
  console.log(`Benchmark CI report written to ${outDir}`);
});

runScriptEffect(mainEffect).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
