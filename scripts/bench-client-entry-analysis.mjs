#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs as parseCliArgs } from 'node:util';
import { createJiti } from 'jiti';
import { generateSyntheticFixture, routeFile } from './benchmark/fixture.mjs';

const rootDir = process.cwd();
const schemaVersion = 1;

const parseArgs = argv => {
  const { values } = parseCliArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      routes: { type: 'string', default: '256' },
      variant: { type: 'string', default: 'ssr-esm-split' },
      fixture: { type: 'string', default: 'default' },
      iterations: { type: 'string', default: '50' },
      warmup: { type: 'string', default: '5' },
      out: {
        type: 'string',
        default: path.join(
          '.benchmark',
          'results',
          'micro-client-entry-analysis.json'
        ),
      },
      'fixture-root': { type: 'string' },
      'reuse-fixture': { type: 'boolean', default: false },
      environment: { type: 'string', default: 'both' },
      cache: { type: 'string', default: 'cold' },
      format: { type: 'string', default: 'both' },
    },
  });

  const args = {
    routes: Number(values.routes),
    variant: values.variant,
    fixture: values.fixture,
    iterations: Number(values.iterations),
    warmup: Number(values.warmup),
    out: values.out,
    fixtureRoot: values['fixture-root'],
    reuseFixture: values['reuse-fixture'],
    environment: values.environment,
    cache: values.cache,
    format: values.format,
  };

  if (!Number.isInteger(args.routes) || args.routes < 1) {
    throw new Error('--routes must be a positive integer.');
  }
  if (!Number.isInteger(args.iterations) || args.iterations < 1) {
    throw new Error('--iterations must be a positive integer.');
  }
  if (!Number.isInteger(args.warmup) || args.warmup < 0) {
    throw new Error('--warmup must be a non-negative integer.');
  }
  if (!['client', 'server', 'both'].includes(args.environment)) {
    throw new Error('--environment must be client, server, or both.');
  }
  if (!['cold', 'warm'].includes(args.cache)) {
    throw new Error('--cache must be cold or warm.');
  }
  if (!['json', 'md', 'markdown', 'both'].includes(args.format)) {
    throw new Error('--format must be json, md, markdown, or both.');
  }

  return args;
};

const summarizeMetric = values => {
  const sorted = values
    .filter(value => typeof value === 'number' && Number.isFinite(value))
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { min: null, mean: null, p95: null, stdev: null, max: null };
  }
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  const p95Index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  );
  return {
    min: sorted[0],
    mean,
    p95: sorted[p95Index],
    stdev: Math.sqrt(variance),
    max: sorted[sorted.length - 1],
  };
};

const timeAsync = async callback => {
  const start = performance.now();
  const value = await callback();
  return { value, ms: performance.now() - start };
};

const timeSync = callback => {
  const start = performance.now();
  const value = callback();
  return { value, ms: performance.now() - start };
};

const environmentNames = mode => {
  if (mode === 'both') {
    return ['client', 'server'];
  }
  return [mode];
};

const shouldSplitRouteModules = variant => variant.includes('split');

const loadPluginInternals = async () => {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
  });
  const [exportUtils, routeArtifacts] = await Promise.all([
    jiti.import(path.join(rootDir, 'src/export-utils.ts')),
    jiti.import(path.join(rootDir, 'src/route-artifacts.ts')),
  ]);
  return {
    getBundlerRouteAnalysis: exportUtils.getBundlerRouteAnalysis,
    buildRouteClientEntryCode: routeArtifacts.buildRouteClientEntryCode,
  };
};

const readRouteSources = async (fixtureRoot, routeCount) =>
  Promise.all(
    Array.from({ length: routeCount }, async (_, routeIndex) => {
      const index = routeIndex + 1;
      const resourcePath = path.join(fixtureRoot, 'app', routeFile(index));
      return {
        index,
        resourcePath,
        source: await readFile(resourcePath, 'utf8'),
      };
    })
  );

const runRoute = async ({
  route,
  iteration,
  environment,
  cacheMode,
  splitRouteModules,
  routeChunkCache,
  routeChunkConfig,
  internals,
}) => {
  const isServer = environment === 'server';
  const benchmarkSource =
    cacheMode === 'cold'
      ? `${route.source}\nconst __clientEntryAnalysisBenchmarkSalt_${iteration}_${environment}_${route.index} = ${iteration + route.index};\n`
      : route.source;
  const benchmarkResourcePath =
    cacheMode === 'cold'
      ? path.join(
          path.dirname(route.resourcePath),
          `.micro-${iteration}-${environment}-${path.basename(route.resourcePath)}`
        )
      : route.resourcePath;

  const transformExport = await timeAsync(async () => {
    const analysis = await internals.getBundlerRouteAnalysis(
      benchmarkSource,
      benchmarkResourcePath
    );
    const exportNames = await analysis.getExportNames();
    return { analysis, exportNames };
  });

  const routeChunk = await timeAsync(async () => {
    if (isServer || !splitRouteModules) {
      return { chunkedExports: [] };
    }
    return transformExport.value.analysis.getRouteChunkInfo(
      routeChunkCache,
      routeChunkConfig
    );
  });

  const filterCodegen = timeSync(() => {
    return internals.buildRouteClientEntryCode({
      exportNames: transformExport.value.exportNames,
      chunkedExports: routeChunk.value.chunkedExports,
      isServer,
      resourcePath: route.resourcePath,
    });
  });

  const totalMs = transformExport.ms + routeChunk.ms + filterCodegen.ms;
  return {
    route: route.index,
    environment,
    timings: {
      transformExportMs: transformExport.ms,
      routeChunkInfoMs: routeChunk.ms,
      filterCodegenMs: filterCodegen.ms,
      totalMs,
    },
    operations: {
      exportNames: transformExport.value.exportNames.length,
      reexports: filterCodegen.value.reexports.length,
      chunkedExports: routeChunk.value.chunkedExports.length,
      codegenBytes: Buffer.byteLength(filterCodegen.value.code),
    },
  };
};

const renderMarkdown = result => {
  const lines = [
    '# Route Client-entry Analysis Microbenchmark',
    '',
    `- Schema version: ${result.schemaVersion}`,
    `- Date: ${result.date}`,
    `- Node: ${result.node}`,
    `- Platform: ${result.platform}`,
    `- Routes: ${result.routeCount}`,
    `- Variant: ${result.variant}`,
    `- Fixture: ${result.fixture}`,
    `- Split route modules: ${result.splitRouteModules}`,
    `- Cache mode: ${result.cacheMode}`,
    `- Environments: ${result.environments.join(', ')}`,
    `- Iterations: ${result.iterations}`,
    `- Warmup: ${result.warmup}`,
    '',
    '## Phase timings per route',
    '',
    '| Phase | Mean | p95 | Stdev |',
    '|---|---:|---:|---:|',
  ];

  for (const [phase, stats] of Object.entries(result.summary.phases)) {
    lines.push(
      `| ${phase} | ${stats.mean?.toFixed(3) ?? '-'}ms | ${stats.p95?.toFixed(3) ?? '-'}ms | ${stats.stdev?.toFixed(3) ?? '-'}ms |`
    );
  }

  lines.push(
    '',
    '## Operation counts',
    '',
    '| Operation | Count |',
    '|---|---:|'
  );
  for (const [operation, count] of Object.entries(result.operationCounts)) {
    lines.push(`| ${operation} | ${count} |`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
};

const writeOutputs = async (result, args) => {
  const outPath = path.resolve(rootDir, args.out);
  const format = args.format === 'markdown' ? 'md' : args.format;
  const writeJson = format === 'json' || format === 'both';
  const writeMd = format === 'md' || format === 'both';
  const jsonPath = outPath.endsWith('.json') ? outPath : `${outPath}.json`;
  const mdPath = outPath.endsWith('.json')
    ? outPath.replace(/\.json$/, '.md')
    : `${outPath}.md`;

  await mkdir(path.dirname(outPath), { recursive: true });
  if (writeJson) {
    await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  if (writeMd) {
    await writeFile(mdPath, renderMarkdown(result));
  }
  return {
    jsonPath: writeJson ? jsonPath : null,
    mdPath: writeMd ? mdPath : null,
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const fixtureRoot = path.resolve(
    rootDir,
    args.fixtureRoot ??
      path.join(
        '.benchmark',
        'fixtures',
        `micro-client-entry-${args.routes}-${args.variant}-${args.fixture}`
      )
  );

  if (!args.reuseFixture) {
    await generateSyntheticFixture({
      root: fixtureRoot,
      routeCount: args.routes,
      variant: args.variant,
      fixture: args.fixture,
    });
  }

  const internals = await loadPluginInternals();
  const routes = await readRouteSources(fixtureRoot, args.routes);
  const environments = environmentNames(args.environment);
  const splitRouteModules = shouldSplitRouteModules(args.variant);
  const routeChunkConfig = {
    splitRouteModules,
    appDirectory: path.join(fixtureRoot, 'app'),
    rootRouteFile: 'root.tsx',
  };
  const routeChunkCache = args.cache === 'warm' ? new Map() : undefined;

  const measuredIterations = [];
  const phaseSamples = {
    transformExportMs: [],
    routeChunkInfoMs: [],
    filterCodegenMs: [],
    totalMs: [],
  };
  const operationCounts = {
    routeExecutions: 0,
    exportNames: 0,
    reexports: 0,
    chunkedExports: 0,
    codegenBytes: 0,
  };

  const totalRuns = args.warmup + args.iterations;
  for (let iteration = 0; iteration < totalRuns; iteration += 1) {
    const measured = iteration >= args.warmup;
    const heapBefore = process.memoryUsage().heapUsed;
    const startedAt = performance.now();
    const routeResults = [];

    for (const environment of environments) {
      for (const route of routes) {
        const result = await runRoute({
          route,
          iteration,
          environment,
          cacheMode: args.cache,
          splitRouteModules,
          routeChunkCache: args.cache === 'cold' ? new Map() : routeChunkCache,
          routeChunkConfig,
          internals,
        });
        routeResults.push(result);
      }
    }

    const heapAfter = process.memoryUsage().heapUsed;
    if (measured) {
      for (const result of routeResults) {
        for (const [phase, value] of Object.entries(result.timings)) {
          phaseSamples[phase].push(value);
        }
        operationCounts.routeExecutions += 1;
        operationCounts.exportNames += result.operations.exportNames;
        operationCounts.reexports += result.operations.reexports;
        operationCounts.chunkedExports += result.operations.chunkedExports;
        operationCounts.codegenBytes += result.operations.codegenBytes;
      }
      measuredIterations.push({
        iteration: measuredIterations.length + 1,
        wallMs: performance.now() - startedAt,
        heapDeltaBytes: heapAfter - heapBefore,
        routeExecutions: routeResults.length,
      });
    }
  }

  const result = {
    schema: 'rsbuild-plugin-react-router/client-entry-analysis-benchmark',
    schemaVersion,
    date: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    routeCount: args.routes,
    variant: args.variant,
    fixture: args.fixture,
    splitRouteModules,
    environments,
    cacheMode: args.cache,
    iterations: args.iterations,
    warmup: args.warmup,
    fixtureRoot,
    summary: {
      phases: Object.fromEntries(
        Object.entries(phaseSamples).map(([phase, samples]) => [
          phase,
          summarizeMetric(samples),
        ])
      ),
      iterationWallMs: summarizeMetric(
        measuredIterations.map(run => run.wallMs)
      ),
      heapDeltaBytes: summarizeMetric(
        measuredIterations.map(run => run.heapDeltaBytes)
      ),
    },
    operationCounts,
    runs: measuredIterations,
  };

  const outputs = await writeOutputs(result, args);
  console.log(
    `Wrote client-entry analysis benchmark${outputs.jsonPath ? ` JSON to ${path.relative(rootDir, outputs.jsonPath)}` : ''}${outputs.mdPath ? ` and markdown to ${path.relative(rootDir, outputs.mdPath)}` : ''}.`
  );
};

main().catch(error => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
