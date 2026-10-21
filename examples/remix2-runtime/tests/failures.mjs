import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { after, test } from 'node:test';

const exec = promisify(execFile);
const route = resolve('app/state.server.ts');
const entry = resolve('app/entry.server.tsx');
const originalRoute = await readFile(route, 'utf8');
const originalEntry = await readFile(entry);
const compile = () => exec(process.execPath, ['node_modules/@rsbuild/core/bin/rsbuild.js', 'build'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production' },
  timeout: 30000,
  maxBuffer: 4 * 1024 * 1024,
});
after(async () => {
  await writeFile(route, originalRoute);
  await writeFile(entry, originalEntry);
});

test('an invalid first build rejects rather than returning a usable generation', async () => {
  await writeFile(route, originalRoute + '\nexport const BROKEN_FIRST_BUILD = ;\n');
  try {
    await assert.rejects(compile(), error => {
      assert(!error.killed, 'Build failure must reject, not hang until the timeout');
      assert.match(error.stdout + error.stderr, /BROKEN_FIRST_BUILD|Syntax|parse|Unexpected/i);
      return true;
    });
  } finally {
    await writeFile(route, originalRoute);
  }
});

async function dependencySnapshot(path = resolve('node_modules'), result = {}) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) await dependencySnapshot(file, result);
    else if (entry.name === 'package.json') {
      result[file] = createHash('sha256').update(await readFile(file)).digest('hex');
    }
  }
  return result;
}

test('default server entry without declared isbot fails without installing or mutating dependencies', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert(!pkg.dependencies.isbot, 'This case requires undeclared isbot');
  const files = ['package.json', 'package-lock.json'];
  const before = await Promise.all(files.map(file => readFile(file)));
  const dependencies = await dependencySnapshot();
  await rename(entry, entry + '.acceptance-disabled');
  try {
    await assert.rejects(compile(), error => {
      assert(!error.killed, 'Missing isbot must fail promptly');
      assert.match(error.stdout + error.stderr, /isbot/i);
      return true;
    });
    for (const [index, file] of files.entries()) {
      assert.deepEqual(await readFile(file), before[index], `${file} mutated during config resolution`);
    }
    assert.deepEqual(await dependencySnapshot(), dependencies, 'Installed dependency manifests changed');
  } finally {
    await rename(entry + '.acceptance-disabled', entry);
  }
});
