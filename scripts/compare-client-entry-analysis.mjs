#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const expectedSchema =
  'rsbuild-plugin-react-router/client-entry-analysis-benchmark';
const expectedSchemaVersion = 1;

const { values } = parseArgs({
  allowPositionals: false,
  strict: true,
  options: {
    before: { type: 'string' },
    after: { type: 'string' },
  },
});

if (!values.before || !values.after) {
  throw new Error(
    'Usage: node scripts/compare-client-entry-analysis.mjs --before <micro-before.json> --after <micro-after.json>'
  );
}

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));

const validateResult = (result, label) => {
  if (result.schema !== expectedSchema) {
    throw new Error(
      `${label} has unsupported schema ${JSON.stringify(result.schema)}; expected ${JSON.stringify(expectedSchema)}.`
    );
  }
  if (result.schemaVersion !== expectedSchemaVersion) {
    throw new Error(
      `${label} has unsupported schemaVersion ${JSON.stringify(result.schemaVersion)}; expected ${expectedSchemaVersion}.`
    );
  }
};

const percentDelta = (beforeValue, afterValue) => {
  if (beforeValue == null || afterValue == null || beforeValue === 0) {
    return '-';
  }
  return `${(((afterValue - beforeValue) / beforeValue) * 100).toFixed(1)}%`;
};

const formatMs = value => (value == null ? '-' : `${value.toFixed(3)}ms`);
const formatBytes = value =>
  value == null ? '-' : `${Math.round(value / 1024).toLocaleString()} KiB`;
const formatCount = value =>
  value == null ? '-' : Math.round(value).toLocaleString();

const metric = (result, path) =>
  path.split('.').reduce((value, key) => value?.[key], result);

const sameConfigKeys = [
  'routeCount',
  'variant',
  'fixture',
  'splitRouteModules',
  'cacheMode',
  'iterations',
  'warmup',
];

const before = await readJson(values.before);
const after = await readJson(values.after);
validateResult(before, 'before');
validateResult(after, 'after');

const mismatches = sameConfigKeys.filter(
  key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
);
if (mismatches.length > 0) {
  throw new Error(
    `Cannot compare benchmark files with different ${mismatches.join(', ')} values.`
  );
}
if (
  JSON.stringify(before.environments) !== JSON.stringify(after.environments)
) {
  throw new Error(
    'Cannot compare benchmark files with different environments.'
  );
}

const rows = [
  {
    label: 'transform/export-info mean',
    before: metric(before, 'summary.phases.transformExportMs.mean'),
    after: metric(after, 'summary.phases.transformExportMs.mean'),
    format: formatMs,
  },
  {
    label: 'transform/export-info p95',
    before: metric(before, 'summary.phases.transformExportMs.p95'),
    after: metric(after, 'summary.phases.transformExportMs.p95'),
    format: formatMs,
  },
  {
    label: 'route-chunk-info mean',
    before: metric(before, 'summary.phases.routeChunkInfoMs.mean'),
    after: metric(after, 'summary.phases.routeChunkInfoMs.mean'),
    format: formatMs,
  },
  {
    label: 'filter/codegen-string mean',
    before: metric(before, 'summary.phases.filterCodegenMs.mean'),
    after: metric(after, 'summary.phases.filterCodegenMs.mean'),
    format: formatMs,
  },
  {
    label: 'total per-route mean',
    before: metric(before, 'summary.phases.totalMs.mean'),
    after: metric(after, 'summary.phases.totalMs.mean'),
    format: formatMs,
  },
  {
    label: 'iteration wall mean',
    before: metric(before, 'summary.iterationWallMs.mean'),
    after: metric(after, 'summary.iterationWallMs.mean'),
    format: formatMs,
  },
  {
    label: 'heap delta mean',
    before: metric(before, 'summary.heapDeltaBytes.mean'),
    after: metric(after, 'summary.heapDeltaBytes.mean'),
    format: formatBytes,
  },
  {
    label: 'route executions',
    before: metric(before, 'operationCounts.routeExecutions'),
    after: metric(after, 'operationCounts.routeExecutions'),
    format: formatCount,
  },
  {
    label: 'export names scanned',
    before: metric(before, 'operationCounts.exportNames'),
    after: metric(after, 'operationCounts.exportNames'),
    format: formatCount,
  },
  {
    label: 'generated reexports',
    before: metric(before, 'operationCounts.reexports'),
    after: metric(after, 'operationCounts.reexports'),
    format: formatCount,
  },
];

console.log(
  `Client-entry analysis comparison: ${before.routeCount} routes, ${before.variant}, ${before.fixture}, environments=${before.environments.join(',')}`
);
console.log('');
console.log('| Metric | Before | After | Delta |');
console.log('|---|---:|---:|---:|');
for (const row of rows) {
  console.log(
    `| ${row.label} | ${row.format(row.before)} | ${row.format(row.after)} | ${percentDelta(row.before, row.after)} |`
  );
}
