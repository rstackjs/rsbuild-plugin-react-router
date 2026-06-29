#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { Effect } from 'effect';
import { runScriptEffect, tryScriptPromise } from './script-effect.mts';

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

const readJsonEffect = file =>
  tryScriptPromise(async () => JSON.parse(await readFile(file, 'utf8')));
const [before, after] = await runScriptEffect(
  Effect.all([readJsonEffect(values.before), readJsonEffect(values.after)])
);
const operations = new Set(
  values.operations
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
);

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
    before:
      metric(beforeBenchmark, 'summary.userMs.median') == null ||
      metric(beforeBenchmark, 'summary.sysMs.median') == null
        ? null
        : metric(beforeBenchmark, 'summary.userMs.median') +
          metric(beforeBenchmark, 'summary.sysMs.median'),
    after:
      metric(afterBenchmark, 'summary.userMs.median') == null ||
      metric(afterBenchmark, 'summary.sysMs.median') == null
        ? null
        : metric(afterBenchmark, 'summary.userMs.median') +
          metric(afterBenchmark, 'summary.sysMs.median'),
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
