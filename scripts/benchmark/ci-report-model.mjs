import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { classifyBenchmarkSignal } from './statistics.mjs';

export const readJson = async file => JSON.parse(await readFile(file, 'utf8'));

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

export const readSyntheticBenchmarkPayloads = async manifestPath => {
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

const percentDelta = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && base !== 0
    ? ((head - base) / base) * 100
    : null;

const speedup = (base, head) =>
  typeof base === 'number' && typeof head === 'number' && head !== 0
    ? base / head
    : null;

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

const comparePluginOperations = (baseBenchmark, headBenchmark) =>
  [
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
  });

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
    const stability = classifyBenchmarkSignal(
      (baseBenchmark?.runs ?? []).map(run => run.wallMs),
      (headBenchmark?.runs ?? []).map(run => run.wallMs)
    );

    return {
      id,
      fixture: headBenchmark?.fixture ?? baseBenchmark?.fixture ?? null,
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
      stability,
      devRouteSummaries: compareRouteSummaries(
        baseBenchmark?.devRouteSummary,
        headBenchmark?.devRouteSummary
      ),
      devUpdateRouteSummaries: compareRouteSummaries(
        baseBenchmark?.devUpdateRouteSummary,
        headBenchmark?.devUpdateRouteSummary
      ),
      pluginOperations: comparePluginOperations(baseBenchmark, headBenchmark),
    };
  });
};

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

const compareSyntheticBenchmarks = (basePayloads, headPayloads) => {
  const baseSummaries = indexSyntheticSummaries(basePayloads);
  const headSummaries = indexSyntheticSummaries(headPayloads);
  const profiles = [
    ...new Set([...baseSummaries.keys(), ...headSummaries.keys()]),
  ].sort();

  return profiles.map(profile => {
    const baseSummary = baseSummaries.get(profile);
    const headSummary = headSummaries.get(profile);
    const baseMedianSeconds = baseSummary?.median ?? null;
    const headMedianSeconds = headSummary?.median ?? null;
    const baseReadyMs = baseSummary?.readyMs?.median ?? null;
    const headReadyMs = headSummary?.readyMs?.median ?? null;
    const baseRouteTotalMs = baseSummary?.routeTotalMs?.median ?? null;
    const headRouteTotalMs = headSummary?.routeTotalMs?.median ?? null;
    const baseUpdateMs = baseSummary?.updateMs?.median ?? null;
    const headUpdateMs = headSummary?.updateMs?.median ?? null;
    const stability = classifyBenchmarkSignal(
      baseSummary?.samples ?? [],
      headSummary?.samples ?? []
    );

    return {
      profile,
      baseMedianSeconds,
      headMedianSeconds,
      headMeanSeconds: headSummary?.mean ?? null,
      headP95Seconds: headSummary?.p95 ?? null,
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
      stability,
    };
  });
};

const sumMetric = (benchmarks, key) => {
  const values = benchmarks
    .map(benchmark => benchmark[key])
    .filter(value => typeof value === 'number');
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0);
};

const summarizeBenchmarkGroup = groupBenchmarks => {
  const baseWallMs = sumMetric(groupBenchmarks, 'baseWallMs');
  const headWallMs = sumMetric(groupBenchmarks, 'headWallMs');
  const baseReadyMs = sumMetric(groupBenchmarks, 'baseReadyMs');
  const headReadyMs = sumMetric(groupBenchmarks, 'headReadyMs');
  const baseRouteTotalMs = sumMetric(groupBenchmarks, 'baseRouteTotalMs');
  const headRouteTotalMs = sumMetric(groupBenchmarks, 'headRouteTotalMs');
  const baseUpdateMs = sumMetric(groupBenchmarks, 'baseUpdateMs');
  const headUpdateMs = sumMetric(groupBenchmarks, 'headUpdateMs');

  return {
    count: groupBenchmarks.length,
    baseWallMs,
    headWallMs,
    baseReadyMs,
    headReadyMs,
    baseRouteTotalMs,
    headRouteTotalMs,
    baseUpdateMs,
    headUpdateMs,
    wallDeltaPercent: percentDelta(baseWallMs, headWallMs),
    wallSpeedup: speedup(baseWallMs, headWallMs),
    readyDeltaPercent: percentDelta(baseReadyMs, headReadyMs),
    routeTotalDeltaPercent: percentDelta(baseRouteTotalMs, headRouteTotalMs),
    updateDeltaPercent: percentDelta(baseUpdateMs, headUpdateMs),
  };
};

const isLargeAppBenchmark = benchmark =>
  benchmark.fixture === 'large' || benchmark.id.startsWith('large-');

export const createBenchmarkReport = ({
  base,
  head,
  buildBase,
  buildHead,
  syntheticBasePayloads,
  syntheticHeadPayloads,
  metadata,
}) => {
  const benchmarks = compareBenchmarks(base, head);
  const buildBenchmarks =
    buildBase && buildHead ? compareBenchmarks(buildBase, buildHead) : [];
  const syntheticBenchmarks = compareSyntheticBenchmarks(
    syntheticBasePayloads,
    syntheticHeadPayloads
  );
  const summary = summarizeBenchmarkGroup(benchmarks);
  const summaryGroups = [
    { label: 'All dev fixtures', benchmarks },
    {
      label: 'Large app',
      benchmarks: benchmarks.filter(isLargeAppBenchmark),
    },
    {
      label: 'Standard fixtures',
      benchmarks: benchmarks.filter(
        benchmark => !isLargeAppBenchmark(benchmark)
      ),
    },
  ]
    .filter(group => group.benchmarks.length > 0)
    .map(group => ({
      label: group.label,
      ...summarizeBenchmarkGroup(group.benchmarks),
    }));

  return {
    generatedAt: new Date().toISOString(),
    pullRequest: metadata.pr ?? null,
    base: {
      ref: metadata.baseRef ?? null,
      sha: metadata.baseSha ?? base.commit ?? null,
      benchmarkCommit: base.commit ?? null,
    },
    head: {
      ref: metadata.headRef ?? null,
      sha: metadata.headSha ?? head.commit ?? null,
      benchmarkCommit: head.commit ?? null,
    },
    runUrl: metadata.runUrl ?? null,
    profile: head.profile ?? base.profile ?? null,
    mode: head.mode ?? base.mode ?? 'build',
    iterations: head.iterations ?? base.iterations ?? null,
    warmup: head.warmup ?? base.warmup ?? null,
    summary,
    summaryGroups,
    buildBenchmarks,
    benchmarks,
    syntheticBenchmark: syntheticBenchmarks[0] ?? null,
    syntheticBenchmarks,
  };
};
