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

const productionBenchmarkTableHeader = [
  '| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
];

const devBenchmarkTableHeader = [
  '| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
];

const benchmarkRunCount = benchmark =>
  benchmark.headRunCount ?? benchmark.baseRunCount;

const renderBuildBenchmarkRow = benchmark =>
  `| \`${benchmark.id}\` | ${formatCount(benchmarkRunCount(benchmark))} | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.headWallMeanMs)} | ${formatSeconds(benchmark.headWallP95Ms)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`;

const renderDevBenchmarkRow = benchmark =>
  `| \`${benchmark.id}\` | ${formatCount(benchmarkRunCount(benchmark))} | ${formatSeconds(benchmark.baseWallMs)} | ${formatSeconds(benchmark.headWallMs)} | ${formatPercent(benchmark.wallDeltaPercent)} | ${formatSeconds(benchmark.baseReadyMs)} | ${formatSeconds(benchmark.headReadyMs)} | ${formatSeconds(benchmark.baseRouteTotalMs)} | ${formatSeconds(benchmark.headRouteTotalMs)} | ${formatSeconds(benchmark.baseUpdateMs)} | ${formatSeconds(benchmark.headUpdateMs)} | ${formatPercent(benchmark.updateDeltaPercent)} | ${formatSeconds(benchmark.headWallMeanMs)} | ${formatSeconds(benchmark.headWallP95Ms)} | ${formatSpeedup(benchmark.wallSpeedup)} | ${formatRss(benchmark.headRssKb)} |`;

const renderSyntheticBuildBenchmarkRow = benchmark =>
  `| complex app | ${formatCount(benchmark.runs)} | ${formatDurationSeconds(benchmark.baseMedianSeconds)} | ${formatDurationSeconds(benchmark.headMedianSeconds)} | ${formatPercent(benchmark.deltaPercent)} | ${formatDurationSeconds(benchmark.headMeanSeconds)} | ${formatDurationSeconds(benchmark.headP95Seconds)} | ${formatSpeedup(benchmark.speedup)} | - |`;

const renderSyntheticDevBenchmarkRow = benchmark =>
  `| complex app | ${formatCount(benchmark.runs)} | ${formatDurationSeconds(benchmark.baseMedianSeconds)} | ${formatDurationSeconds(benchmark.headMedianSeconds)} | ${formatPercent(benchmark.deltaPercent)} | ${formatSeconds(benchmark.baseReadyMs)} | ${formatSeconds(benchmark.headReadyMs)} | ${formatSeconds(benchmark.baseRouteTotalMs)} | ${formatSeconds(benchmark.headRouteTotalMs)} | ${formatSeconds(benchmark.baseUpdateMs)} | ${formatSeconds(benchmark.headUpdateMs)} | ${formatPercent(benchmark.updateDeltaPercent)} | ${formatDurationSeconds(benchmark.headMeanSeconds)} | ${formatDurationSeconds(benchmark.headP95Seconds)} | ${formatSpeedup(benchmark.speedup)} | - |`;

const appendDevRollup = (lines, report) => {
  if (report.mode !== 'dev') {
    lines.push(
      `**Total median wall time:** ${formatSeconds(report.summary.baseWallMs)} -> ${formatSeconds(report.summary.headWallMs)} (${formatPercent(report.summary.wallDeltaPercent)}, ${formatSpeedup(report.summary.wallSpeedup)} speedup)`,
      ''
    );
    return;
  }

  lines.push(
    '### Dev Rollup',
    '',
    '| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
  );
  for (const group of report.summaryGroups) {
    lines.push(
      `| ${group.label} | ${formatCount(group.count)} | ${formatSeconds(group.baseWallMs)} | ${formatSeconds(group.headWallMs)} | ${formatPercent(group.wallDeltaPercent)} | ${formatSeconds(group.baseReadyMs)} | ${formatSeconds(group.headReadyMs)} | ${formatPercent(group.readyDeltaPercent)} | ${formatSeconds(group.baseRouteTotalMs)} | ${formatSeconds(group.headRouteTotalMs)} | ${formatPercent(group.routeTotalDeltaPercent)} | ${formatSeconds(group.baseUpdateMs)} | ${formatSeconds(group.headUpdateMs)} | ${formatPercent(group.updateDeltaPercent)} | ${formatSpeedup(group.wallSpeedup)} |`
    );
  }
  lines.push('');
};

const appendProductionBenchmarks = (lines, benchmarks, heading) => {
  if (benchmarks.length === 0) {
    return;
  }

  lines.push(
    `### ${heading}`,
    '',
    `Rendered ${benchmarks.length} production build benchmark${benchmarks.length === 1 ? '' : 's'}.`,
    '',
    ...productionBenchmarkTableHeader
  );
  for (const benchmark of benchmarks) {
    lines.push(renderBuildBenchmarkRow(benchmark));
  }
  lines.push('');
};

const appendDevBenchmarks = ({ lines, benchmarks, heading, description }) => {
  if (benchmarks.length === 0) {
    return;
  }

  lines.push(`### ${heading}`, '', description, '', ...devBenchmarkTableHeader);
  for (const benchmark of benchmarks) {
    lines.push(renderDevBenchmarkRow(benchmark));
  }
};

const appendPluginOperations = (lines, benchmarks) => {
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
};

const appendSyntheticBenchmarks = (lines, report) => {
  const syntheticBuildBenchmarks = report.syntheticBenchmarks.filter(
    benchmark => benchmark.profile !== 'dev'
  );
  const syntheticDevBenchmarks = report.syntheticBenchmarks.filter(
    benchmark => benchmark.profile === 'dev'
  );

  if (
    syntheticBuildBenchmarks.length === 0 &&
    syntheticDevBenchmarks.length === 0
  ) {
    return;
  }

  lines.push('', '### Synthetic Rsbuild App', '');
  if (syntheticBuildBenchmarks.length > 0) {
    lines.push(
      `Rendered ${syntheticBuildBenchmarks.length} production build benchmark${syntheticBuildBenchmarks.length === 1 ? '' : 's'}.`,
      '',
      ...productionBenchmarkTableHeader
    );
    for (const benchmark of syntheticBuildBenchmarks) {
      lines.push(renderSyntheticBuildBenchmarkRow(benchmark));
    }
    lines.push('');
  }
  if (syntheticDevBenchmarks.length > 0) {
    lines.push(
      `Rendered ${syntheticDevBenchmarks.length} dev benchmark fixture${syntheticDevBenchmarks.length === 1 ? '' : 's'} from the embedded complex app.`,
      '',
      ...devBenchmarkTableHeader
    );
    for (const benchmark of syntheticDevBenchmarks) {
      lines.push(renderSyntheticDevBenchmarkRow(benchmark));
    }
  }
};

export const renderBenchmarkComment = report => {
  const lines = [
    '<!-- react-router-benchmark-ci -->',
    '## Benchmark Results',
    '',
    `Compared PR head \`${report.head.sha?.slice(0, 7) ?? 'unknown'}\` against base \`${report.base.sha?.slice(0, 7) ?? 'unknown'}\`.`,
    '',
  ];

  appendDevRollup(lines, report);
  appendProductionBenchmarks(
    lines,
    report.buildBenchmarks,
    'Production Build Benchmarks'
  );
  appendDevBenchmarks({
    lines,
    benchmarks: report.benchmarks,
    heading: `${report.profile ?? 'Benchmark'} Dev Fixture Summary`,
    description: `Rendered ${report.benchmarks.length} dev benchmark fixture${report.benchmarks.length === 1 ? '' : 's'} from the \`${report.profile ?? 'unknown'}\` profile.`,
  });
  appendPluginOperations(lines, report.benchmarks);
  appendSyntheticBenchmarks(lines, report);
  lines.push(
    '',
    `Profile: \`${report.profile ?? 'unknown'}\`; mode: \`${report.mode ?? 'unknown'}\`; iterations: \`${report.iterations ?? 'unknown'}\`; warmup: \`${report.warmup ?? 'unknown'}\`.`,
    'The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.',
    ...(report.runUrl ? [`[Workflow run](${report.runUrl})`] : []),
    ''
  );

  return `${lines.join('\n')}\n`;
};
