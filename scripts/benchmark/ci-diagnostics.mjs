#!/usr/bin/env node
import os from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const metricKeys = [
  'wallMs',
  'readyMs',
  'routeTotalMs',
  'updateMs',
  'updateRouteTotalMs',
  'userMs',
  'sysMs',
  'maxRssKb',
];

const percentDelta = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && base !== 0
    ? ((head - base) / base) * 100
    : null;

const formatMs = value =>
  typeof value === 'number' ? `${(value / 1000).toFixed(2)}s` : '-';
const formatNumber = value =>
  typeof value === 'number' ? value.toFixed(1) : '-';
const formatPercent = value =>
  typeof value === 'number'
    ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
    : '-';
const formatRss = value =>
  typeof value === 'number' ? `${Math.round(value / 1024)} MB` : '-';

const readJsonIfExists = async file => {
  if (!file) {
    return null;
  }
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const summarizeSamples = values => {
  const samples = values.filter(value => typeof value === 'number');
  if (samples.length === 0) {
    return { samples: [], min: null, median: null, mean: null, p95: null };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const p95Index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  );
  return {
    samples,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    mean,
    p95: sorted[p95Index],
  };
};

const benchmarkSamples = benchmark => {
  const runs = benchmark?.runs ?? [];
  return Object.fromEntries(
    metricKeys.map(key => [key, summarizeSamples(runs.map(run => run[key]))])
  );
};

const indexBenchmarks = result =>
  new Map(
    (result?.benchmarks ?? []).map(benchmark => [benchmark.id, benchmark])
  );

const compareBenchmarkResults = ({ suite, base, head }) => {
  const baseBenchmarks = indexBenchmarks(base);
  const headBenchmarks = indexBenchmarks(head);
  const ids = [
    ...new Set([...baseBenchmarks.keys(), ...headBenchmarks.keys()]),
  ].sort();

  return ids.map(id => {
    const baseBenchmark = baseBenchmarks.get(id);
    const headBenchmark = headBenchmarks.get(id);
    const baseSamples = benchmarkSamples(baseBenchmark);
    const headSamples = benchmarkSamples(headBenchmark);
    return {
      suite,
      id,
      routeCount:
        headBenchmark?.routeCount ?? baseBenchmark?.routeCount ?? null,
      variant: headBenchmark?.variant ?? baseBenchmark?.variant ?? null,
      base: baseSamples,
      head: headSamples,
      deltas: Object.fromEntries(
        metricKeys.map(key => [
          key,
          percentDelta(baseSamples[key].median, headSamples[key].median),
        ])
      ),
      headPluginOperations: headBenchmark?.pluginOperations ?? [],
      basePluginOperations: baseBenchmark?.pluginOperations ?? [],
    };
  });
};

const slowestPluginOperations = comparisons =>
  comparisons
    .flatMap(comparison =>
      comparison.headPluginOperations.map(operation => ({
        suite: comparison.suite,
        benchmark: comparison.id,
        environment: operation.environment,
        operation: operation.operation,
        count: operation.count,
        totalMs: operation.totalMs,
        wallMs: operation.wallMs,
        maxMs: operation.maxMs,
        reports: operation.reports,
      }))
    )
    .sort((a, b) => (b.wallMs ?? 0) - (a.wallMs ?? 0))
    .slice(0, 30);

const summarizeSyntheticPayload = payload => ({
  file: payload.file,
  generatedAt: payload.generatedAt ?? null,
  node: payload.node ?? null,
  platform: payload.platform ?? null,
  runs: payload.runs ?? null,
  profile: payload.profile ?? null,
  profiles: (payload.summaries ?? []).map(summary => ({
    profile: summary.profile,
    medianSeconds: summary.median ?? null,
    meanSeconds: summary.mean ?? null,
    p95Seconds: summary.p95 ?? null,
    samplesSeconds: summary.samples ?? [],
    readyMs: summary.readyMs ?? null,
    routeTotalMs: summary.routeTotalMs ?? null,
    updateMs: summary.updateMs ?? null,
  })),
});

const readSyntheticPayloads = async manifestPath => {
  const manifest = await readJsonIfExists(manifestPath);
  if (!manifest) {
    return [];
  }
  const outputDirectory =
    manifest.outputDirectory ?? manifest.workdir ?? path.dirname(manifestPath);
  const payloads = [];
  for (const file of manifest.generatedFiles ?? []) {
    const absoluteFile = path.resolve(outputDirectory, file);
    const payload = await readJsonIfExists(absoluteFile);
    if (payload) {
      payloads.push(summarizeSyntheticPayload({ ...payload, file }));
    }
  }
  return payloads;
};

const getRunnerMetadata = () => ({
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: `${process.platform} ${os.release()} ${os.arch()}`,
  cpuCount: os.cpus().length,
  cpuModel: os.cpus()[0]?.model ?? null,
  totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
  loadAverage: os.loadavg(),
  github: {
    actions: process.env.GITHUB_ACTIONS ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    runnerName: process.env.RUNNER_NAME ?? null,
    runnerOs: process.env.RUNNER_OS ?? null,
    runnerArch: process.env.RUNNER_ARCH ?? null,
    imageOs: process.env.ImageOS ?? null,
    imageVersion: process.env.ImageVersion ?? null,
  },
});

export const createDiagnostics = async ({ root }) => {
  const sources = {
    buildBase: path.join(root, 'build/base/baseline.json'),
    buildHead: path.join(root, 'build/head/baseline.json'),
    devBase: path.join(root, 'dev/base/baseline.json'),
    devHead: path.join(root, 'dev/head/baseline.json'),
    syntheticBase: path.join(root, 'synthetic/base/latest.json'),
    syntheticHead: path.join(root, 'synthetic/head/latest.json'),
    report: path.join(root, 'report/report.json'),
  };
  const [buildBase, buildHead, devBase, devHead, report] = await Promise.all([
    readJsonIfExists(sources.buildBase),
    readJsonIfExists(sources.buildHead),
    readJsonIfExists(sources.devBase),
    readJsonIfExists(sources.devHead),
    readJsonIfExists(sources.report),
  ]);
  const [syntheticBasePayloads, syntheticHeadPayloads] = await Promise.all([
    readSyntheticPayloads(sources.syntheticBase),
    readSyntheticPayloads(sources.syntheticHead),
  ]);

  const comparisons = [
    ...(buildBase && buildHead
      ? compareBenchmarkResults({
          suite: 'production build',
          base: buildBase,
          head: buildHead,
        })
      : []),
    ...(devBase && devHead
      ? compareBenchmarkResults({
          suite: 'dev server',
          base: devBase,
          head: devHead,
        })
      : []),
  ];

  return {
    runner: getRunnerMetadata(),
    sources,
    reportContext: report
      ? {
          pullRequest: report.pullRequest ?? null,
          runUrl: report.runUrl ?? null,
          base: report.base ?? null,
          head: report.head ?? null,
        }
      : null,
    comparisons,
    slowestPluginOperations: slowestPluginOperations(comparisons),
    synthetic: {
      base: syntheticBasePayloads,
      head: syntheticHeadPayloads,
    },
  };
};

const renderSamples = samples =>
  samples.length === 0
    ? '-'
    : samples
        .map(value =>
          value >= 1000 ? formatMs(value) : `${formatNumber(value)}ms`
        )
        .join(', ');

export const renderDiagnosticsMarkdown = diagnostics => {
  const lines = [
    '# Benchmark Diagnostics',
    '',
    'This artifact is for debugging benchmark deltas across GitHub-hosted runners and faster local machines. It keeps raw per-run samples close to runner metadata so CI-only slowdowns are easier to classify.',
    '',
    '## Runner',
    '',
    `- Node: ${diagnostics.runner.node}`,
    `- Platform: ${diagnostics.runner.platform}`,
    `- CPU: ${diagnostics.runner.cpuCount} x ${diagnostics.runner.cpuModel ?? 'unknown'}`,
    `- Memory: ${diagnostics.runner.totalMemoryMb} MB`,
    `- Load average: ${diagnostics.runner.loadAverage.map(value => value.toFixed(2)).join(', ')}`,
    `- GitHub runner: ${diagnostics.runner.github.runnerName ?? '-'} / ${diagnostics.runner.github.runnerOs ?? '-'} / ${diagnostics.runner.github.imageVersion ?? '-'}`,
    '',
    '## Wall-Time Samples',
    '',
    '| Suite | Benchmark | Base median | Head median | Delta | Base samples | Head samples |',
    '|---|---|---:|---:|---:|---|---|',
  ];

  for (const comparison of [...diagnostics.comparisons].sort(
    (a, b) => (b.deltas.wallMs ?? -Infinity) - (a.deltas.wallMs ?? -Infinity)
  )) {
    lines.push(
      `| ${comparison.suite} | \`${comparison.id}\` | ${formatMs(comparison.base.wallMs.median)} | ${formatMs(comparison.head.wallMs.median)} | ${formatPercent(comparison.deltas.wallMs)} | ${renderSamples(comparison.base.wallMs.samples)} | ${renderSamples(comparison.head.wallMs.samples)} |`
    );
  }

  lines.push(
    '',
    '## CPU And RSS Samples',
    '',
    '| Suite | Benchmark | Head CPU median | Head RSS p95 | User samples | Sys samples | RSS samples |',
    '|---|---|---:|---:|---|---|---|'
  );
  for (const comparison of diagnostics.comparisons) {
    const headCpuMedian =
      typeof comparison.head.userMs.median === 'number' &&
      typeof comparison.head.sysMs.median === 'number'
        ? comparison.head.userMs.median + comparison.head.sysMs.median
        : null;
    lines.push(
      `| ${comparison.suite} | \`${comparison.id}\` | ${formatMs(headCpuMedian)} | ${formatRss(comparison.head.maxRssKb.p95)} | ${renderSamples(comparison.head.userMs.samples)} | ${renderSamples(comparison.head.sysMs.samples)} | ${comparison.head.maxRssKb.samples.map(formatRss).join(', ') || '-'} |`
    );
  }

  if (diagnostics.slowestPluginOperations.length > 0) {
    lines.push(
      '',
      '## Slowest Head Plugin Operations',
      '',
      '| Suite | Benchmark | Environment | Operation | Wall | Total | Max | Count | Reports |',
      '|---|---|---|---|---:|---:|---:|---:|---:|'
    );
    for (const operation of diagnostics.slowestPluginOperations.slice(0, 20)) {
      lines.push(
        `| ${operation.suite} | \`${operation.benchmark}\` | ${operation.environment} | \`${operation.operation}\` | ${formatMs(operation.wallMs)} | ${formatMs(operation.totalMs)} | ${formatMs(operation.maxMs)} | ${operation.count ?? '-'} | ${operation.reports ?? '-'} |`
      );
    }
  } else {
    lines.push(
      '',
      '## Slowest Head Plugin Operations',
      '',
      'No plugin timing logs were found. Ensure CI benchmark steps pass `--log-performance`.'
    );
  }

  const syntheticHeadProfiles = diagnostics.synthetic.head.flatMap(payload =>
    payload.profiles.map(profile => ({ ...profile, file: payload.file }))
  );
  if (syntheticHeadProfiles.length > 0) {
    lines.push(
      '',
      '## Synthetic App Samples',
      '',
      '| File | Profile | Head median | Head p95 | Samples |',
      '|---|---|---:|---:|---|'
    );
    for (const profile of syntheticHeadProfiles) {
      lines.push(
        `| \`${profile.file}\` | ${profile.profile} | ${formatSeconds(profile.medianSeconds)} | ${formatSeconds(profile.p95Seconds)} | ${profile.samplesSeconds.map(formatSeconds).join(', ') || '-'} |`
      );
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
};

const formatSeconds = value =>
  typeof value === 'number' ? `${value.toFixed(2)}s` : '-';

const main = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    strict: true,
    options: {
      root: { type: 'string', default: 'benchmark-output' },
      out: { type: 'string', default: 'benchmark-output/diagnostics' },
    },
  });
  const root = path.resolve(values.root);
  const outDir = path.resolve(values.out);
  const diagnostics = await createDiagnostics({ root });
  await mkdir(outDir, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outDir, 'summary.json'),
      `${JSON.stringify(diagnostics, null, 2)}\n`
    ),
    writeFile(
      path.join(outDir, 'summary.md'),
      renderDiagnosticsMarkdown(diagnostics)
    ),
  ]);
  console.log(`Benchmark diagnostics written to ${outDir}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
