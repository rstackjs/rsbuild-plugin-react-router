import assert from 'node:assert/strict';
import { readFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const specifier = 'rsbuild-plugin-react-router/remix2';
const nodeModules = await realpath(resolve('node_modules'));
const failures = [];
for (const mode of ['import', 'require']) {
  try {
    const location = mode === 'import'
      ? fileURLToPath(import.meta.resolve(specifier))
      : require.resolve(specifier);
    assert((await realpath(location)).startsWith(nodeModules + '/'));
    const entry = mode === 'import' ? await import(specifier) : require(specifier);
    assert.equal(typeof entry.pluginRemix2, 'function', `${mode} must export pluginRemix2`);
    console.log(`${mode} ${location}`);
  } catch (error) {
    failures.push(`${mode}: ${error.code || error.name}: ${error.message}`);
  }
}
assert.equal(failures.length, 0, `Native Remix2 package entry red gate:\n${failures.join('\n')}`);

const packageRoot = await realpath(resolve('node_modules/rsbuild-plugin-react-router'));
const pkg = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
assert(pkg.exports['./remix2'].types, 'The subpath must publish independent declarations');
const pending = [
  fileURLToPath(import.meta.resolve(specifier)),
  require.resolve(specifier),
  resolve(packageRoot, pkg.exports['./remix2'].types),
];
const visited = new Set();
while (pending.length) {
  const file = pending.pop();
  if (visited.has(file)) continue;
  visited.add(file);
  assert(file.startsWith(packageRoot + '/'), `Subpath escaped packed plugin at ${file}`);
  const source = await readFile(file, 'utf8');
  assert.doesNotMatch(source, /["']@react-router\//, `RR7 import or declaration at ${file}`);
  assert.doesNotMatch(source, /["']rsbuild-plugin-react-router["']/, `Root entry import at ${file}`);
  for (const [, dependency] of source.matchAll(
    /(?:\bfrom\s*|\b(?:import|require)\s*\(?\s*)["'](\.{1,2}\/[^"']+)["']/g,
  )) {
    const target = resolve(dirname(file), dependency);
    assert(!['index.js', 'index.cjs', 'index.d.ts'].some(name =>
      target === resolve(packageRoot, 'dist', name)),
      `Subpath reaches root entry at ${target}`);
    pending.push(file.endsWith('.d.ts') && target.endsWith('.js')
      ? target.replace(/\.js$/, '.d.ts')
      : target);
  }
}
console.log(`Independent ESM, CommonJS, and declaration graphs checked in ${visited.size} files.`);
