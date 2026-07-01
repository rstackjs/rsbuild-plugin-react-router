#!/usr/bin/env node
import { access, appendFile } from 'node:fs/promises';
import path from 'node:path';

const workspace = process.env.GITHUB_WORKSPACE;
const outputPath = process.env.GITHUB_OUTPUT;
const fixture = 'benchmarks/synthetic-web-bundler-benchmark';

if (!workspace || !outputPath) {
  throw new Error('GITHUB_WORKSPACE and GITHUB_OUTPUT are required.');
}

const fileExists = async file => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

let appRoot = '';
let toolRoot = '';
for (const checkout of [
  path.join(workspace, 'head'),
  path.join(workspace, 'base'),
]) {
  if (
    !appRoot &&
    (await fileExists(path.join(checkout, fixture, 'package.json')))
  ) {
    appRoot = path.join(checkout, fixture);
  }
  if (
    !toolRoot &&
    (await fileExists(path.join(checkout, 'scripts/bench-synthetic-app.mjs')))
  ) {
    toolRoot = checkout;
  }
}

const outputs =
  appRoot && toolRoot
    ? { SKIP: 'false', APP_ROOT: appRoot, TOOL_ROOT: toolRoot }
    : { SKIP: 'true' };

await appendFile(
  outputPath,
  Object.entries(outputs)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n'
);
