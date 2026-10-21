import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.argv[2];
assert(root, 'Pass the isolated packed fixture directory.');
process.env.NODE_ENV = 'development';
const require = createRequire(resolve(root, 'package.json'));
const { createRsbuild } = await import(
  pathToFileURL(require.resolve('@rsbuild/core')).href
);
const { pluginReact } = await import(
  pathToFileURL(require.resolve('@rsbuild/plugin-react')).href
);
const native = await import(
  pathToFileURL(require.resolve('rsbuild-plugin-react-router/remix2')).href
);
const cjs = require('rsbuild-plugin-react-router/remix2');
const { createRequestHandler } = require('@remix-run/node');
const remix = require('@remix-run/dev/dist/config.js');
const config = await remix.readConfig(root, 'development');
const routeFile = resolve(root, 'app/state.server.ts');
const rootFile = resolve(root, 'app/root.tsx');
const original = await readFile(routeFile, 'utf8');
const originalRoot = await readFile(rootFile, 'utf8');
let server;
let compiler;
try {
  config.serverModuleFormat = 'cjs';
  config.serverBuildPath = resolve(root, 'build/custom-server/index.js');
  const rsbuild = await createRsbuild({
    cwd: root,
    rsbuildConfig: {
      plugins: [
        native.pluginRemix2({ config, customServer: true }),
        pluginReact(),
        {
          name: 'custom-server-probe',
          setup(api) {
            api.onAfterCreateCompiler(({ compiler: created }) => {
              compiler = created;
            });
          },
        },
      ],
      server: { middlewareMode: true },
      dev: { cliShortcuts: false },
    },
  });
  server = await rsbuild.createDevServer();
  const fromESM = await native.loadRemix2ServerBuild(server);
  assert.strictEqual(await cjs.loadRemix2ServerBuild(server), fromESM);
  const diskRequire = createRequire(config.serverBuildPath);
  const diskBuild = diskRequire(config.serverBuildPath);
  assert.equal(diskBuild.assets.version, fromESM.assets.version);
  const handler = createRequestHandler(
    () => native.loadRemix2ServerBuild(server),
    'development'
  );
  assert.equal(
    (
      await (
        await handler(new Request('http://localhost/?_data=routes%2F_index'))
      ).json()
    ).message,
    'native-loader-v1'
  );
  const initialDisk = await readFile(config.serverBuildPath);
  async function invalidate(source, browserVersion) {
    await writeFile(routeFile, source);
    await writeFile(
      rootFile,
      originalRoot.replace('Native Remix 2 acceptance', browserVersion)
    );
    await new Promise((done, fail) =>
      compiler.watching.invalidateWithChangesAndRemovals(
        new Set([routeFile, rootFile]),
        new Set(),
        error => (error ? fail(error) : done())
      )
    );
  }
  await invalidate(
    original.replace('native-loader-v1', 'custom-server-v2'),
    'custom-browser-v2'
  );
  const next = await native.loadRemix2ServerBuild(server);
  assert.notEqual(next.assets.version, fromESM.assets.version);
  assert.equal(
    (
      await (
        await handler(new Request('http://localhost/?_data=routes%2F_index'))
      ).json()
    ).message,
    'custom-server-v2'
  );
  const goodDisk = await readFile(config.serverBuildPath);
  assert.notDeepEqual(goodDisk, initialDisk);
  await invalidate(
    original + '\nexport const BROKEN_CUSTOM_SERVER = ;',
    'broken-browser'
  );
  assert.strictEqual(await native.loadRemix2ServerBuild(server), next);
  assert.deepEqual(await readFile(config.serverBuildPath), goodDisk);
  await invalidate(original, 'restored-browser');
  assert.equal(
    (
      await (
        await handler(new Request('http://localhost/?_data=routes%2F_index'))
      ).json()
    ).message,
    'native-loader-v1'
  );
  await server.close();
  await assert.rejects(native.loadRemix2ServerBuild(server), /not registered/);
  console.log(
    'Custom server CJS disk output, native handler, cross-entry loading, failed-generation retention, repair, and disposal passed.'
  );
} finally {
  await writeFile(routeFile, original);
  await writeFile(rootFile, originalRoot);
  await server?.close();
}
