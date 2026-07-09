#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [script, ...rawArgs] = process.argv.slice(2);
const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

if (!script) {
  throw new Error(
    'Usage: node scripts/benchmark/run.mjs <script.mts> [...args]'
  );
}

if (!process.features?.typescript) {
  console.error(
    'Benchmark scripts require Node 22.18+ or 23.6+ with native TypeScript support.'
  );
  process.exit(1);
}

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const result = spawnSync(
  process.execPath,
  [path.resolve(root, script), ...args],
  {
    stdio: 'inherit',
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
