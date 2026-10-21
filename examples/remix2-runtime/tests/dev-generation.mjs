import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRsbuild } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginRemix2 } from 'rsbuild-plugin-react-router/remix2';
import { after, test } from 'node:test';

const route = new URL('../app/state.server.ts', import.meta.url);
const root = new URL('../app/root.tsx', import.meta.url);
const original = await readFile(route, 'utf8');
const originalRoot = await readFile(root, 'utf8');
after(async () => {
  await writeFile(route, original);
  await writeFile(root, originalRoot);
});

function configured(probe) {
  return createRsbuild({
    cwd: process.cwd(),
    rsbuildConfig: {
      plugins: [pluginRemix2(), pluginReact(), probe],
      server: { middlewareMode: true },
      dev: { hmr: false, liveReload: false, cliShortcuts: false },
    },
  });
}

test('first failed dev compilation rejects readiness', { timeout: 30000 }, async () => {
  await writeFile(route, original + '\nexport const BROKEN_FIRST_DEV_BUILD = ;\n');
  let server;
  try {
    const rsbuild = await configured({ name: 'acceptance:first-build', setup() {} });
    await assert.rejects(async () => {
      server = await rsbuild.createDevServer();
    }, /compil|build|parse|Syntax|Unexpected/i);
  } finally {
    await server?.close();
    await writeFile(route, original);
  }
});

test('successful rebuild publishes new data, failed rebuild retains its coherent generation', {
  timeout: 60000,
}, async () => {
  let compiler;
  let devServer;
  let http;
  const compileErrors = new Set();
  const rsbuild = await configured({
    name: 'acceptance:real-compiler',
    setup(api) {
      api.onAfterCreateCompiler(({ compiler: created }) => { compiler = created; });
      api.onAfterEnvironmentCompile(({ environment, stats }) => {
        if (stats.hasErrors()) compileErrors.add(environment.name);
      });
    },
  });
  try {
    devServer = await rsbuild.createDevServer();
    http = createServer(devServer.middlewares);
    http.listen(0, '127.0.0.1');
    await once(http, 'listening');
    const base = `http://127.0.0.1:${http.address().port}`;
    const dataURL = `${base}/?_data=routes%2F_index`;
    const initial = await fetch(dataURL);
    assert.equal(initial.status, 200);
    assert.equal((await initial.json()).message, 'native-loader-v1');
    assert(compiler.watching, 'Expected the actual Rsbuild MultiCompiler to watch');

    async function invalidate(source, browserVersion) {
      compileErrors.clear();
      await writeFile(route, source);
      await writeFile(root, originalRoot.replace(
        'Native Remix 2 acceptance',
        `Native Remix 2 acceptance ${browserVersion}`,
      ));
      await new Promise((resolve, reject) => {
        compiler.watching.invalidateWithChangesAndRemovals(
          new Set([route.pathname, root.pathname]),
          new Set(),
          error => error ? reject(error) : resolve(),
        );
      });
    }
    async function documentGeneration() {
      const response = await fetch(base);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /native-loader-v2/);
      assert.match(html, /Native Remix 2 acceptance browser-v2/);
      assert.doesNotMatch(html, /browser-v3/);
      const manifestURL = html.match(/import "([^"]*\/manifest-[^"]+\.js)"/)?.[1];
      assert(manifestURL, 'SSR must use a native matching-generation manifest');
      const manifest = await fetch(new URL(manifestURL, base));
      assert.equal(manifest.status, 200);
      const source = await manifest.text();
      assert.match(source, /__remixManifest/);
      for (const [, url] of source.matchAll(/"module":"([^"]+)"/g)) {
        assert.equal((await fetch(new URL(url, base))).status, 200, `Missing route module ${url}`);
      }
      return { manifestURL, source };
    }

    const updated = original.replace('native-loader-v1', 'native-loader-v2');
    await invalidate(updated, 'browser-v2');
    assert.equal(compileErrors.size, 0);
    assert.equal((await (await fetch(dataURL)).json()).message, 'native-loader-v2');
    const good = await documentGeneration();
    await invalidate(updated + '\nexport const BROKEN_REBUILD = ;\n', 'browser-v3');
    assert(compileErrors.size > 0, 'The failed rebuild must reach the real compiler');
    for (let request = 0; request < 3; request += 1) {
      const retained = await fetch(dataURL);
      assert.equal(retained.status, 200);
      assert.equal((await retained.json()).message, 'native-loader-v2');
      assert.deepEqual(await documentGeneration(), good);
    }
    await invalidate(original, 'browser-v1');
    assert.equal((await (await fetch(dataURL)).json()).message, 'native-loader-v1');
  } finally {
    await writeFile(route, original);
    await writeFile(root, originalRoot);
    if (http?.listening) {
      const closed = once(http, 'close');
      http.close();
      http.closeAllConnections();
      await closed;
    }
    await devServer?.close();
  }
});
