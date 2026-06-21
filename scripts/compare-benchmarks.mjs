#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  allowPositionals: false,
  strict: true,
  options: {
    before: { type: 'string' },
    after: { type: 'string' },
    benchmark: { type: 'string', default: 'synthetic-256-ssr-esm-split' },
  },
});

if (!values.before || !values.after) {
  throw new Error(
    'Usage: node scripts/compare-benchmarks.mjs --before <before.json> --after <after.json> [--benchmark <id>]'
  );
}

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const before = await readJson(values.before);
const after = await readJson(values.after);

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

const percentDelta = (beforeValue, afterValue) => {
  if (beforeValue == null || afterValue == null || beforeValue === 0) {
    return '-';
  }
  return `${(((afterValue - beforeValue) / beforeValue) * 100).toFixed(1)}%`;
};

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

console.log(`Benchmark comparison: ${values.benchmark}`);
console.log('');
console.log('| Metric | Before | After | Delta |');
console.log('|---|---:|---:|---:|');
for (const row of rows) {
  console.log(
    `| ${row.label} | ${row.format(row.before)} | ${row.format(row.after)} | ${percentDelta(row.before, row.after)} |`
  );
}
