#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readJson } from './benchmark/ci-report-model.mjs';

const parseInput = () => {
  const { values } = parseArgs({
    allowPositionals: false,
    strict: true,
    options: {
      before: { type: 'string' },
      after: { type: 'string' },
      benchmark: { type: 'string', default: 'synthetic-256-ssr-esm-split' },
      operations: {
        type: 'string',
        default: 'route:chunk,route:client-entry,route:split-exports',
      },
    },
  });

  if (!values.before || !values.after) {
    throw new Error(
      'Usage: node scripts/compare-benchmarks.mts --before <baseline.json> --after <comparison.json> [--benchmark <id>] [--operations op,op]'
    );
  }

  return values;
};

const findBenchmark = (result, id) => {
  const benchmark = result.benchmarks?.find(item => item.id === id);
  if (!benchmark) {
    throw new Error(
      `Benchmark "${id}" not found in ${result.date ?? 'input'}.`
    );
  }
  return benchmark;
};

const metric = (benchmark, path) =>
  path.split('.').reduce((value, key) => value?.[key], benchmark);

const metricSum = (benchmark, paths) => {
  const values = paths.map(path => metric(benchmark, path));
  return values.some(value => value == null)
    ? null
    : values.reduce((sum, value) => sum + value, 0);
};

const operationMetric = (benchmark, operation, key) => {
  const matches =
    benchmark.pluginOperations?.filter(item => item.operation === operation) ??
    [];
  const values = matches
    .map(item => item[key])
    .filter(value => typeof value === 'number');
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0);
};

const percentDelta = (beforeValue, afterValue) => {
  if (beforeValue == null || afterValue == null || beforeValue === 0) {
    return '-';
  }
  return `${(((afterValue - beforeValue) / beforeValue) * 100).toFixed(1)}%`;
};

const formatNumber = value => (value == null ? '-' : value.toFixed(1));
const formatMs = value =>
  value == null ? '-' : `${(value / 1000).toFixed(2)}s`;
const formatKb = value =>
  value == null ? '-' : `${Math.round(value / 1024)} MB`;

const main = async () => {
  const values = parseInput();
  const [before, after] = await Promise.all([
    readJson(values.before),
    readJson(values.after),
  ]);

  const operations = new Set(
    values.operations
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );
  const beforeBenchmark = findBenchmark(before, values.benchmark);
  const afterBenchmark = findBenchmark(after, values.benchmark);

  const rows = [
    {
      label: 'Wall median',
      before: metric(beforeBenchmark, 'summary.wallMs.median'),
      after: metric(afterBenchmark, 'summary.wallMs.median'),
      format: formatMs,
    },
    {
      label: 'CPU median (user+sys)',
      before: metricSum(beforeBenchmark, [
        'summary.userMs.median',
        'summary.sysMs.median',
      ]),
      after: metricSum(afterBenchmark, [
        'summary.userMs.median',
        'summary.sysMs.median',
      ]),
      format: formatMs,
    },
    {
      label: 'Peak RSS p95',
      before: metric(beforeBenchmark, 'summary.maxRssKb.p95'),
      after: metric(afterBenchmark, 'summary.maxRssKb.p95'),
      format: formatKb,
    },
  ];

  for (const operation of operations) {
    rows.push(
      {
        label: `${operation} totalMs`,
        before: operationMetric(beforeBenchmark, operation, 'totalMs'),
        after: operationMetric(afterBenchmark, operation, 'totalMs'),
        format: formatNumber,
      },
      {
        label: `${operation} wallMs`,
        before: operationMetric(beforeBenchmark, operation, 'wallMs'),
        after: operationMetric(afterBenchmark, operation, 'wallMs'),
        format: formatNumber,
      }
    );
  }

  console.log(`Benchmark comparison: ${values.benchmark}`);
  console.log('');
  console.log('| Metric | Before | After | Delta |');
  console.log('|---|---:|---:|---:|');
  for (const row of rows) {
    console.log(
      `| ${row.label} | ${row.format(row.before)} | ${row.format(row.after)} | ${percentDelta(row.before, row.after)} |`
    );
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
