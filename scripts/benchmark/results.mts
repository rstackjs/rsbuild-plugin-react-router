import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const parseTimeStats = stderr => {
  const user = stderr.match(/User time \(seconds\):\s*([\d.]+)/);
  const sys = stderr.match(/System time \(seconds\):\s*([\d.]+)/);
  const rss = stderr.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  return {
    userMs: user ? Number(user[1]) * 1000 : null,
    sysMs: sys ? Number(sys[1]) * 1000 : null,
    maxRssKb: rss ? Number(rss[1]) : null,
  };
};

export const parsePluginReports = output => {
  const reports = [];
  for (const line of output.split(/\r?\n/)) {
    const markerIndex = line.indexOf('[react-router:performance]');
    if (markerIndex === -1) {
      continue;
    }
    const jsonStart = line.indexOf('{', markerIndex);
    if (jsonStart === -1) {
      continue;
    }
    try {
      reports.push(JSON.parse(line.slice(jsonStart)));
    } catch {
      // Keep raw build output useful even if one line is malformed.
    }
  }
  return reports;
};

const summarizeMetric = values => {
  const sorted = values
    .filter(value => typeof value === 'number')
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { min: null, median: null, mean: null, p95: null, stdev: null };
  }
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  const percentileIndex = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  );
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    mean,
    p95: sorted[percentileIndex],
    stdev: Math.sqrt(variance),
  };
};

export const summarizeRuns = runs => ({
  wallMs: summarizeMetric(runs.map(run => run.wallMs)),
  readyMs: summarizeMetric(runs.map(run => run.readyMs)),
  routeTotalMs: summarizeMetric(runs.map(run => run.routeTotalMs)),
  updateMs: summarizeMetric(runs.map(run => run.updateMs)),
  updateRouteTotalMs: summarizeMetric(runs.map(run => run.updateRouteTotalMs)),
  userMs: summarizeMetric(runs.map(run => run.userMs)),
  sysMs: summarizeMetric(runs.map(run => run.sysMs)),
  maxRssKb: summarizeMetric(runs.map(run => run.maxRssKb)),
});

const summarizeDevRequests = (runs, key) => {
  const requestsByPath = new Map();
  for (const run of runs) {
    for (const request of run[key] ?? []) {
      const requests = requestsByPath.get(request.path) ?? [];
      requests.push(request);
      requestsByPath.set(request.path, requests);
    }
  }

  return [...requestsByPath.entries()].map(([routePath, requests]) => {
    const statuses = [
      ...new Set(
        requests.map(request =>
          request.status === null ? 'error' : String(request.status)
        )
      ),
    ].sort();
    return {
      path: routePath,
      count: requests.length,
      statuses,
      failures: requests.filter(request => !request.ok).length,
      ms: summarizeMetric(requests.map(request => request.ms)),
      bytes: summarizeMetric(requests.map(request => request.bytes)),
    };
  });
};

export const summarizeDevRouteRequests = runs =>
  summarizeDevRequests(runs, 'routeRequests');

export const summarizeDevUpdateRouteRequests = runs =>
  summarizeDevRequests(runs, 'updateRouteRequests');

const getObjectNumber = (value, key) => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const entry = Object.entries(value).find(([entryKey]) => entryKey === key);
  return typeof entry?.[1] === 'number' ? entry[1] : null;
};

export const summarizePluginOperations = runs => {
  const operations = new Map();

  for (const run of runs) {
    for (const report of run.pluginReports) {
      for (const [operation, metrics] of Object.entries(
        report.operations ?? {}
      )) {
        if (!metrics || typeof metrics !== 'object') {
          continue;
        }

        const count = getObjectNumber(metrics, 'count') ?? 0;
        const totalMs = getObjectNumber(metrics, 'totalMs') ?? 0;
        const wallMs = getObjectNumber(metrics, 'wallMs');
        const maxMs = getObjectNumber(metrics, 'maxMs') ?? 0;

        const key = `${report.environment}:${operation}`;
        const current = operations.get(key) ?? {
          environment: report.environment,
          operation,
          count: 0,
          totalMs: 0,
          wallMs: null,
          maxMs: 0,
          reports: 0,
        };
        current.count += count;
        current.totalMs += totalMs;
        if (wallMs !== null) {
          current.wallMs = (current.wallMs ?? 0) + wallMs;
        }
        current.maxMs = Math.max(current.maxMs, maxMs);
        current.reports += 1;
        operations.set(key, current);
      }
    }
  }

  return [...operations.values()].sort((a, b) => {
    if (b.totalMs !== a.totalMs) {
      return b.totalMs - a.totalMs;
    }
    return `${a.environment}:${a.operation}`.localeCompare(
      `${b.environment}:${b.operation}`
    );
  });
};

const formatMs = value =>
  value == null ? '-' : `${(value / 1000).toFixed(2)}s`;
const formatReportMs = value => (value == null ? '-' : `${value.toFixed(1)}ms`);
const formatRss = value =>
  value == null ? '-' : `${Math.round(value / 1024)} MB`;

const formatParallelRouteTransform = parallelRouteTransform => {
  if (parallelRouteTransform === undefined) {
    return 'adaptive';
  }
  if (!parallelRouteTransform) {
    return 'false';
  }
  if (parallelRouteTransform === true) {
    return 'true';
  }
  return `workers=${parallelRouteTransform}`;
};

const appendDevRequestSummary = (lines, benchmark, key, title) => {
  const requests = benchmark[key];
  if (!requests?.length) {
    return;
  }

  lines.push(
    '',
    `## ${benchmark.id} ${title}`,
    '',
    '| Route | Median | Mean | p95 | Median bytes | Statuses | Failures |',
    '|---|---:|---:|---:|---:|---|---:|'
  );

  for (const request of requests) {
    lines.push(
      [
        `\`${request.path}\``,
        formatMs(request.ms.median),
        formatMs(request.ms.mean),
        formatMs(request.ms.p95),
        request.bytes.median == null
          ? '-'
          : String(Math.round(request.bytes.median)),
        request.statuses.join(', '),
        request.failures,
      ]
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    );
  }
};

export const renderMarkdown = result => {
  const lines = [
    '# Rsbuild React Router Benchmark Baseline',
    '',
    `- Date: ${result.date}`,
    `- Commit: ${result.commit}`,
    `- Node: ${result.node}`,
    `- pnpm: ${result.pnpm}`,
    `- Platform: ${result.platform}`,
    `- Profile: ${result.profile}`,
    `- Mode: ${result.mode}`,
    `- Iterations: ${result.iterations}`,
    `- Warmup: ${result.warmup}`,
    ...(result.mode === 'dev'
      ? [
          `- Dev routes: ${result.devRoutes}`,
          `- Dev route timeout: ${result.devRouteTimeoutMs} ms`,
        ]
      : []),
    `- Parallel route transform: ${formatParallelRouteTransform(result.parallelRouteTransform)}`,
    `- Plugin performance logging: ${String(result.logPerformance)}`,
    `- Rspack profile: ${result.rspackProfile ?? 'false'}`,
    ...(result.rspackTraceOutput
      ? [`- Rspack trace output: ${result.rspackTraceOutput}`]
      : []),
    '',
    '| Benchmark | Routes | Variant | Median ready | Median route load | Median update/HMR | Median wall | Mean wall | p95 wall | Max RSS | Plugin reports (--log-performance) |',
    '|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];

  for (const benchmark of result.benchmarks) {
    lines.push(
      [
        benchmark.id,
        benchmark.routeCount,
        benchmark.variant,
        formatMs(benchmark.summary.readyMs.median),
        formatMs(benchmark.summary.routeTotalMs.median),
        formatMs(benchmark.summary.updateMs.median),
        formatMs(benchmark.summary.wallMs.median),
        formatMs(benchmark.summary.wallMs.mean),
        formatMs(benchmark.summary.wallMs.p95),
        formatRss(benchmark.summary.maxRssKb.p95),
        benchmark.runs.reduce((sum, run) => sum + run.pluginReports.length, 0),
      ]
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    );
  }

  for (const benchmark of result.benchmarks) {
    appendDevRequestSummary(
      lines,
      benchmark,
      'devRouteSummary',
      'Dev Route Requests'
    );
    appendDevRequestSummary(
      lines,
      benchmark,
      'devUpdateRouteSummary',
      'Dev Update Route Requests'
    );
  }

  for (const benchmark of result.benchmarks) {
    if (benchmark.pluginOperations.length === 0) {
      continue;
    }
    lines.push(
      '',
      `## ${benchmark.id} Plugin Operations`,
      '',
      'Total is the sum of all measured operation durations. Wall merges overlapping intervals to approximate elapsed plugin time. Max is the slowest single operation call.',
      '',
      '| Environment | Operation | Count | Total | Wall | Max | Reports |',
      '|---|---|---:|---:|---:|---:|---:|'
    );
    for (const operation of benchmark.pluginOperations.slice(0, 12)) {
      lines.push(
        [
          operation.environment,
          operation.operation,
          operation.count,
          formatReportMs(operation.totalMs),
          formatReportMs(operation.wallMs),
          formatReportMs(operation.maxMs),
          operation.reports,
        ]
          .join(' | ')
          .replace(/^/, '| ')
          .replace(/$/, ' |')
      );
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
};

export const resolveOutputPaths = (args, rootDir = process.cwd()) => {
  const outPath = path.resolve(rootDir, args.out);
  const format = args.format === 'markdown' ? 'md' : args.format;
  const writeJson = format === 'json' || format === 'both';
  const writeMd = format === 'md' || format === 'both';

  if (writeJson && writeMd) {
    return {
      artifactRoot: outPath,
      jsonPath: path.join(outPath, 'baseline.json'),
      mdPath: path.join(outPath, 'baseline.md'),
      outPath,
      writeJson,
      writeMd,
    };
  }

  const artifactRoot = path.extname(outPath)
    ? path.join(path.dirname(outPath), `${path.basename(outPath)}.artifacts`)
    : `${outPath}.artifacts`;

  return {
    artifactRoot,
    jsonPath: writeJson ? outPath : null,
    mdPath: writeMd ? outPath : null,
    outPath,
    writeJson,
    writeMd,
  };
};

export const writeOutputs = async (result, outputPaths) => {
  const { jsonPath, mdPath, outPath, writeJson, writeMd } = outputPaths;

  if (writeJson && writeMd) {
    await mkdir(outPath, { recursive: true });
    await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
    await writeFile(mdPath, renderMarkdown(result));
    return;
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  if (writeJson) {
    await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  } else {
    await writeFile(mdPath, renderMarkdown(result));
  }
};
