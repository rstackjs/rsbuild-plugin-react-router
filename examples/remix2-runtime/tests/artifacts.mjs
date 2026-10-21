import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = resolve(process.env.REMIX2_CLIENT_BUILD || 'public/build');
let count = 0;
async function scan(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(?:js|css|map)$/.test(file)) {
      const source = await readFile(file, 'utf8');
      assert.doesNotMatch(source, /REMIX2_LOADER_ONLY_NODE_SENTINEL|node:crypto/);
      assert.doesNotMatch(source, /__reactRouterManifest|__reactRouterContext/);
      count += 1;
    }
  }
}
await scan(directory);
assert(count > 0, 'The browser artifact directory must not be empty');
const build = await import(pathToFileURL(resolve(
  process.env.REMIX2_SERVER_BUILD || 'build/server/index.js',
)).href);
assert.equal(typeof build.entry.module.default, 'function');
assert.equal(build.routes['routes/_index'].module.loader instanceof Function, true);
assert.equal(build.routes['routes/_index'].module.action instanceof Function, true);
assert.equal(build.assets.routes['routes/_index'].hasLoader, true);
assert.equal(build.assets.routes['routes/_index'].hasAction, true);
assert.equal(build.assets.routes['routes/deferred'].hasLoader, true);
assert.equal(build.publicPath, '/build/');
assert.notEqual(build.isSpaMode, true);
assert(!('prerender' in build), 'Do not emit an RR7 ServerBuild');
console.log(`Native server build and ${count} pruned browser artifacts verified.`);
