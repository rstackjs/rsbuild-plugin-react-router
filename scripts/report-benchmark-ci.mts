#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  createBenchmarkReport,
  readJson,
  readSyntheticBenchmarkPayloads,
} from './benchmark/ci-report-model.mjs';
import { renderBenchmarkComment } from './benchmark/ci-report-markdown.mjs';

const parseInput = () => {
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
      'Usage: node scripts/report-benchmark-ci.mts --base <base.json> --head <head.json> [--out <dir>]'
    );
  }

  return values;
};

const main = async () => {
  const values = parseInput();
  const [
    base,
    head,
    buildBase,
    buildHead,
    syntheticBasePayloads,
    syntheticHeadPayloads,
  ] = await Promise.all([
    readJson(values.base),
    readJson(values.head),
    values['build-base'] ? readJson(values['build-base']) : null,
    values['build-head'] ? readJson(values['build-head']) : null,
    readSyntheticBenchmarkPayloads(values['synthetic-base']),
    readSyntheticBenchmarkPayloads(values['synthetic-head']),
  ]);

  const report = createBenchmarkReport({
    base,
    head,
    buildBase,
    buildHead,
    syntheticBasePayloads,
    syntheticHeadPayloads,
    metadata: {
      pr: values.pr,
      baseRef: values['base-ref'],
      baseSha: values['base-sha'],
      headRef: values['head-ref'],
      headSha: values['head-sha'],
      runUrl: values['run-url'],
    },
  });

  const outDir = path.resolve(values.out);
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  await writeFile(
    path.join(outDir, 'comment.md'),
    renderBenchmarkComment(report)
  );

  console.log(`Benchmark CI report written to ${outDir}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
