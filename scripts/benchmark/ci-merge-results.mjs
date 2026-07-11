#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  strict: true,
  options: {
    out: { type: 'string' },
  },
});

if (!values.out || positionals.length === 0) {
  throw new Error(
    'Usage: node scripts/benchmark/ci-merge-results.mjs --out <baseline.json> <shard.json>...'
  );
}

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const inputs = await Promise.all(positionals.map(readJson));
const [first] = inputs;
const benchmarks = inputs.flatMap(input => input.benchmarks ?? []);
const failed = inputs.some(input => input.failed === true);
const profiles = inputs
  .map(input => input.profile)
  .filter((profile, index, all) => profile && all.indexOf(profile) === index);

const merged = {
  ...first,
  profile: profiles.join('+'),
  failed,
  benchmarks,
};

const outPath = path.resolve(values.out);
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Merged ${positionals.length} benchmark shard(s) into ${outPath}`);
