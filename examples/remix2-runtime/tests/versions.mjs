import assert from 'node:assert/strict';
import { readdir, readFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const root = await realpath(process.cwd());
const expected = {
  '@remix-run/dev': '2.11.2',
  '@remix-run/express': '2.11.2',
  '@remix-run/node': '2.11.2',
  '@remix-run/react': '2.11.2',
  '@remix-run/server-runtime': '2.11.2',
  '@remix-run/router': '1.19.1',
  'react-router': '6.26.1',
  'react-router-dom': '6.26.1',
  react: '18.3.1',
  'react-dom': '18.3.1',
};

for (const [name, version] of Object.entries(expected)) {
  const location = await realpath(require.resolve(`${name}/package.json`));
  assert(location.startsWith(`${root}${sep}node_modules${sep}`), `${name} escaped the isolated install`);
  const pkg = JSON.parse(await readFile(location, 'utf8'));
  assert.equal(pkg.version, version, `Wrong native version for ${name}`);
  console.log(`${name}@${pkg.version} ${location}`);
}

const seen = new Set();
async function scan(directory) {
  if (seen.has(directory)) return;
  seen.add(directory);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const path = resolve(directory, entry.name);
    if (entry.name.startsWith('@')) {
      await scan(path);
      continue;
    }
    const pkg = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf8'));
    assert(!pkg.name.startsWith('@react-router/'), `Forbidden RR7/8 package ${pkg.name}@${pkg.version}`);
    if (pkg.name in expected) {
      assert.equal(pkg.version, expected[pkg.name], `Nested runtime leakage at ${path}`);
    }
    const children = await readdir(path);
    if (children.includes('node_modules')) await scan(resolve(path, 'node_modules'));
  }
}
await scan(resolve(root, 'node_modules'));
for (const name of ['@react-router/dev', '@react-router/node', '@react-router/serve']) {
  assert.throws(() => require.resolve(name), { code: 'MODULE_NOT_FOUND' });
}
console.log('All installed native runtime copies are exact. No RR7/8 package is available.');
