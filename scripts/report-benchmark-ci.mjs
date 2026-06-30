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
    'build-base': { type: 'string' },
    'build-head': { type: 'string' },
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
const readJsonWithFallback = async (primaryFile, fallbackFile) => {
  try {
    return await readJson(primaryFile);
  } catch (error) {
    if (error?.code !== 'ENOENT' || !fallbackFile) {
      throw error;
    }
    return readJson(fallbackFile);
  }
};
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
const formatMilliseconds = value =>
  typeof value === 'number' ? `${value.toFixed(1)}ms` : '-';
const formatCount = value => (typeof value === 'number' ? String(value) : '-');
const formatBytes = value =>
  typeof value === 'number' ? String(Math.round(value)) : '-';

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
      const payload = await readJsonWithFallback(
        path.resolve(outputDirectory, file),
        path.resolve(path.dirname(manifestPath), path.basename(file))
      );
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
const medianUpdate = benchmark => benchmark?.summary?.updateMs?.median ?? null;
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

const compareRouteSummaries = (baseRoutes = [], headRoutes = []) =>
  [
    ...new Set([
      ...baseRoutes.map(route => route.path),
      ...headRoutes.map(route => route.path),
    ]),
  ].map(routePath => {
    const baseRoute = baseRoutes.find(route => route.path === routePath);
    const headRoute = headRoutes.find(route => route.path === routePath);
    const baseMedianMs = baseRoute?.ms?.median ?? null;
    const headMedianMs = headRoute?.ms?.median ?? null;

    return {
      path: routePath,
      count: headRoute?.count ?? baseRoute?.count ?? null,
      baseMedianMs,
      headMedianMs,
      deltaPercent: percentDelta(baseMedianMs, headMedianMs),
      headMeanMs: headRoute?.ms?.mean ?? null,
      headP95Ms: headRoute?.ms?.p95 ?? null,
      headMedianBytes: headRoute?.bytes?.median ?? null,
      statuses: headRoute?.statuses ?? baseRoute?.statuses ?? [],
      failures: headRoute?.failures ?? baseRoute?.failures ?? null,
    };
  });

const base = await readJson(values.base);
const head = await readJson(values.head);
const buildBase = values['build-base']
  ? await readJson(values['build-base'])
  : null;
const buildHead = values['build-head']
  ? await readJson(values['build-head'])
  : null;
const syntheticBasePayloads = await readSyntheticBenchmarkPayloads(
  values['synthetic-base']
);
const syntheticHeadPayloads = await readSyntheticBenchmarkPayloads(
  values['synthetic-head']
);
const compareBenchmarks = (baseResult, headResult) => {
  const baseBenchmarks = indexBenchmarks(baseResult);
  const headBenchmarks = indexBenchmarks(headResult);
  const benchmarkIds = [
    ...new Set([...baseBenchmarks.keys(), ...headBenchmarks.keys()]),
  ].sort();

  return benchmarkIds.map(id => {
    const baseBenchmark = baseBenchmarks.get(id);
    const headBenchmark = headBenchmarks.get(id);
    const baseWallMs = medianWall(baseBenchmark);
    const headWallMs = medianWall(headBenchmark);
    const baseReadyMs = medianReady(baseBenchmark);
    const headReadyMs = medianReady(headBenchmark);
    const baseRouteTotalMs = medianRouteTotal(baseBenchmark);
    const headRouteTotalMs = medianRouteTotal(headBenchmark);
    const baseUpdateMs = medianUpdate(baseBenchmark);
    const headUpdateMs = medianUpdate(headBenchmark);
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
      baseUpdateMs,
      headUpdateMs,
      updateDeltaPercent: percentDelta(baseUpdateMs, headUpdateMs),
      wallDeltaPercent: percentDelta(baseWallMs, headWallMs),
      wallSpeedup: speedup(baseWallMs, headWallMs),
      baseCpuMs: cpuMedian(baseBenchmark),
      headCpuMs: cpuMedian(headBenchmark),
      baseRssKb: p95Rss(baseBenchmark),
      headRssKb: p95Rss(headBenchmark),
      baseRunCount: baseBenchmark?.runs?.length ?? null,
      headRunCount: headBenchmark?.runs?.length ?? null,
      headWallMeanMs: headBenchmark?.summary?.wallMs?.mean ?? null,
      headWallP95Ms: headBenchmark?.summary?.wallMs?.p95 ?? null,
      devRouteSummaries: compareRouteSummaries(
        baseBenchmark?.devRouteSummary,
        headBenchmark?.devRouteSummary
      ),
      devUpdateRouteSummaries: compareRouteSummaries(
        baseBenchmark?.devUpdateRouteSummary,
        headBenchmark?.devUpdateRouteSummary
      ),
      pluginOperations: [
        ...new Set([
          ...(baseBenchmark?.pluginOperations ?? []).map(
            operation => `${operation.environment}:${operation.operation}`
          ),
          ...(headBenchmark?.pluginOperations ?? []).map(
            operation => `${operation.environment}:${operation.operation}`
          ),
        ]),
      ].map(key => {
        const separatorIndex = key.indexOf(':');
        const environment = key.slice(0, separatorIndex);
        const operation = key.slice(separatorIndex + 1);
        const matches = item =>
          item.environment === environment && item.operation === operation;
        const baseOperation = baseBenchmark?.pluginOperations?.find(matches);
        const headOperation = headBenchmark?.pluginOperations?.find(matches);
        return {
          environment,
          operation,
          baseTotalMs: baseOperation?.totalMs ?? null,
          headTotalMs: headOperation?.totalMs ?? null,
          deltaPercent: percentDelta(
            baseOperation?.totalMs,
            headOperation?.totalMs
          ),
          headWallMs: headOperation?.wallMs ?? null,
          headMaxMs: headOperation?.maxMs ?? null,
          count: headOperation?.count ?? baseOperation?.count ?? null,
          reports: headOperation?.reports ?? baseOperation?.reports ?? null,
        };
      }),
    };
  });
};

const benchmarks = compareBenchmarks(base, head);
const buildBenchmarks =
  buildBase && buildHead ? compareBenchmarks(buildBase, buildHead) : [];

const indexSyntheticSummaries = payloads => {
  const summaries = new Map();
  for (const entry of payloads) {
    for (const summary of entry.payload?.summaries ?? []) {
      summaries.set(summary.profile, {
        ...summary,
        node: entry.payload.node ?? null,
        platform: entry.payload.platform ?? null,
        runs: entry.payload.runs ?? null,
      });
    }
  }
  return summaries;
};
const syntheticBaseSummaries = indexSyntheticSummaries(syntheticBasePayloads);
const syntheticHeadSummaries = indexSyntheticSummaries(syntheticHeadPayloads);
const syntheticProfiles = [
  ...new Set([
    ...syntheticBaseSummaries.keys(),
    ...syntheticHeadSummaries.keys(),
  ]),
].sort();
const syntheticBenchmarks = syntheticProfiles.map(profile => {
  const baseSummary = syntheticBaseSummaries.get(profile);
  const headSummary = syntheticHeadSummaries.get(profile);
  const baseMedianSeconds = baseSummary?.median ?? null;
  const headMedianSeconds = headSummary?.median ?? null;
  const baseReadyMs = baseSummary?.readyMs?.median ?? null;
  const headReadyMs = headSummary?.readyMs?.median ?? null;
  const baseRouteTotalMs = baseSummary?.routeTotalMs?.median ?? null;
  const headRouteTotalMs = headSummary?.routeTotalMs?.median ?? null;
  const baseUpdateMs = baseSummary?.updateMs?.median ?? null;
  const headUpdateMs = headSummary?.updateMs?.median ?? null;
  return {
    profile,
    baseMedianSeconds,
    headMedianSeconds,
    deltaPercent: percentDelta(baseMedianSeconds, headMedianSeconds),
    speedup: speedup(baseMedianSeconds, headMedianSeconds),
    baseReadyMs,
    headReadyMs,
    readyDeltaPercent: percentDelta(baseReadyMs, headReadyMs),
    baseRouteTotalMs,
    headRouteTotalMs,
    routeTotalDeltaPercent: percentDelta(baseRouteTotalMs, headRouteTotalMs),
    baseUpdateMs,
    headUpdateMs,
    updateDeltaPercent: percentDelta(baseUpdateMs, headUpdateMs),
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
const totalBaseUpdateMs = sumMetric(benchmarks, 'baseUpdateMs');
const totalHeadUpdateMs = sumMetric(benchmarks, 'headUpdateMs');

const summary = {
  baseWallMs: totalBaseWallMs,
  headWallMs: totalHeadWallMs,
  baseReadyMs: totalBaseReadyMs,
  headReadyMs: totalHeadReadyMs,
  baseRouteTotalMs: totalBaseRouteTotalMs,
  headRouteTotalMs: totalHeadRouteTotalMs,
  baseUpdateMs: totalBaseUpdateMs,
  headUpdateMs: totalHeadUpdateMs,
  wallDeltaPercent: percentDelta(totalBaseWallMs, totalHeadWallMs),
  wallSpeedup: speedup(totalBaseWallMs, totalHeadWallMs),
  readyDeltaPercent: percentDelta(totalBaseReadyMs, totalHeadReadyMs),
  routeTotalDeltaPercent: percentDelta(
    totalBaseRouteTotalMs,
    totalHeadRouteTotalMs
  ),
  updateDeltaPercent: percentDelta(totalBaseUpdateMs, totalHeadUpdateMs),
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
  buildBenchmarks,
  benchmarks,
  syntheticBenchmark: syntheticBenchmarks[0] ?? null,
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
          `**Update/HMR median:** ${formatSeconds(summary.baseUpdateMs)} -> ${formatSeconds(summary.headUpdateMs)} (${formatPercent(summary.updateDeltaPercent)})`,
        ]
      : []),
    '',
  ];

  if (buildBenchmarks.length > 0) {
    lines.push(
      '### Production Build Benchmarks',
      '',
      `Rendered ${buildBenchmarks.length} production build benchmark${buildBenchmarks.length === 1 ? '' : 's'}.`,
      '',
      '| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |',
      '|---|---:|---:|---:|---:|---:|---:|---:|---:|'
    );
    for (const benchmark of buildBenchmarks) {
      lines.push(
        `| \`${benchmark.id}\` | ${formatCount(benchmark.headRunCount ?? benchmark.baseRunCount)} | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.headWallMeanMs)} | ${formatSeconds(benchmark.headWallP95Ms)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`
      );
    }
    lines.push('');
  }

  lines.push(
    `### ${report.profile ?? 'Benchmark'} Dev Fixture Summary`,
    '',
    `Rendered ${benchmarks.length} dev benchmark fixture${benchmarks.length === 1 ? '' : 's'} from the \`${report.profile ?? 'unknown'}\` profile.`,
    '',
    '| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
  );

  for (const benchmark of benchmarks) {
    lines.push(
      `| \`${benchmark.id}\` | ${formatCount(benchmark.headRunCount ?? benchmark.baseRunCount)} | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.baseReadyMs)} | ${formatSeconds(benchmark.headReadyMs)} | ${formatSeconds(benchmark.baseRouteTotalMs)} | ${formatSeconds(benchmark.headRouteTotalMs)} | ${formatSeconds(benchmark.baseUpdateMs)} | ${formatSeconds(benchmark.headUpdateMs)} | ${formatPercent(benchmark.updateDeltaPercent)} | ${formatSeconds(benchmark.headWallMeanMs)} | ${formatSeconds(benchmark.headWallP95Ms)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`
    );
  }

  for (const benchmark of benchmarks) {
    if (benchmark.devRouteSummaries.length === 0) {
      continue;
    }
    lines.push(
      '',
      `#### ${benchmark.id} Dev Route Requests`,
      '',
      '| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |',
      '|---|---:|---:|---:|---:|---:|---:|---:|---|---:|'
    );
    for (const route of benchmark.devRouteSummaries) {
      lines.push(
        `| \`${route.path}\` | ${formatCount(route.count)} | ${formatSeconds(route.baseMedianMs)} | ${formatSeconds(route.headMedianMs)} | ${formatPercent(route.deltaPercent)} | ${formatSeconds(route.headMeanMs)} | ${formatSeconds(route.headP95Ms)} | ${formatBytes(route.headMedianBytes)} | ${route.statuses.join(', ') || '-'} | ${formatCount(route.failures)} |`
      );
    }
  }

  for (const benchmark of benchmarks) {
    if (benchmark.devUpdateRouteSummaries.length === 0) {
      continue;
    }
    lines.push(
      '',
      `#### ${benchmark.id} Dev Update Route Requests`,
      '',
      '| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |',
      '|---|---:|---:|---:|---:|---:|---:|---:|---|---:|'
    );
    for (const route of benchmark.devUpdateRouteSummaries) {
      lines.push(
        `| \`${route.path}\` | ${formatCount(route.count)} | ${formatSeconds(route.baseMedianMs)} | ${formatSeconds(route.headMedianMs)} | ${formatPercent(route.deltaPercent)} | ${formatSeconds(route.headMeanMs)} | ${formatSeconds(route.headP95Ms)} | ${formatBytes(route.headMedianBytes)} | ${route.statuses.join(', ') || '-'} | ${formatCount(route.failures)} |`
      );
    }
  }

  for (const benchmark of benchmarks) {
    if (benchmark.pluginOperations.length === 0) {
      continue;
    }
    lines.push(
      '',
      `#### ${benchmark.id} Plugin Operations`,
      '',
      '| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |',
      '|---|---|---:|---:|---:|---:|---:|---:|---:|'
    );
    for (const operation of benchmark.pluginOperations.slice(0, 12)) {
      lines.push(
        `| ${operation.environment} | \`${operation.operation}\` | ${formatCount(operation.count)} | ${formatMilliseconds(operation.baseTotalMs)} | ${formatMilliseconds(operation.headTotalMs)} | ${formatPercent(operation.deltaPercent)} | ${formatMilliseconds(operation.headWallMs)} | ${formatMilliseconds(operation.headMaxMs)} | ${formatCount(operation.reports)} |`
      );
    }
  }

  if (syntheticBenchmarks.length > 0) {
    lines.push(
      '',
      '### Synthetic Rsbuild App',
      '',
      '| Benchmark | Profile | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup | Runs |',
      '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
    );

    for (const syntheticBenchmark of syntheticBenchmarks) {
      lines.push(
        `| complex app | \`${syntheticBenchmark.profile ?? 'unknown'}\` | ${formatDurationSeconds(syntheticBenchmark.baseMedianSeconds)} | ${formatDurationSeconds(syntheticBenchmark.headMedianSeconds)} | ${formatPercent(syntheticBenchmark.deltaPercent)} | ${formatSeconds(syntheticBenchmark.baseReadyMs)} | ${formatSeconds(syntheticBenchmark.headReadyMs)} | ${formatPercent(syntheticBenchmark.readyDeltaPercent)} | ${formatSeconds(syntheticBenchmark.baseRouteTotalMs)} | ${formatSeconds(syntheticBenchmark.headRouteTotalMs)} | ${formatPercent(syntheticBenchmark.routeTotalDeltaPercent)} | ${formatSeconds(syntheticBenchmark.baseUpdateMs)} | ${formatSeconds(syntheticBenchmark.headUpdateMs)} | ${formatPercent(syntheticBenchmark.updateDeltaPercent)} | ${formatSpeedup(syntheticBenchmark.speedup)} | ${syntheticBenchmark.runs ?? '-'} |`
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
