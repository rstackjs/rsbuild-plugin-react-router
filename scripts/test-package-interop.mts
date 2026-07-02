import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const build = {
  entry: { module: { default: () => new Response() } },
  routes: {},
  assets: { routes: {}, version: 'interop' },
  assetsBuildDirectory: '/app/build/client',
  basename: '/',
  future: {},
  isSpaMode: false,
  prerender: [],
  publicPath: '/',
  routeDiscovery: { mode: 'initial' },
  ssr: true,
};

const collect = hooks => hook => hooks.push(hook);
const noop = () => undefined;

const loadEntryPoints = async () => {
  const esm = await import('../dist/index.js');
  const commonjs = require('../dist/index.cjs');
  return [esm, commonjs];
};

const verifyRegistration = async (writer, reader) => {
  const starts = [];
  const closes = [];
  const api = {
    context: { action: 'dev', rootPath: process.cwd() },
    logger: { info: noop, warn: noop, error: noop },
    getNormalizedConfig: () => ({}),
    modifyRsbuildConfig: noop,
    modifyEnvironmentConfig: noop,
    onBeforeBuild: noop,
    onBeforeStartDevServer: collect(starts),
    onAfterStartDevServer: noop,
    onCloseDevServer: collect(closes),
    onCloseBuild: noop,
    onAfterEnvironmentCompile: noop,
    onAfterBuild: noop,
    processAssets: noop,
    transform: noop,
    onBeforeDevCompile: noop,
    onAfterCreateCompiler: noop,
    onAfterDevCompile: noop,
  };
  await writer.pluginReactRouter({ customServer: true }).setup(api);

  const startHook = starts.find(hook => hook.order === 'pre');
  const closeHook = closes.find(hook => hook.order === 'pre');
  assert(startHook, 'Expected a pre dev-server start hook');
  assert(closeHook, 'Expected a pre dev-server close hook');
  const start = startHook.handler;
  const server = {
    close: async () => undefined,
    environments: { node: { loadBundle: async () => build } },
    sockWrite: noop,
  };
  await start({ environments: {}, server });

  const pending = reader.loadReactRouterServerBuild(server);
  for (const close of closes) {
    if (typeof close === 'function') {
      await close();
    } else {
      await close.handler?.();
    }
  }
  await assert.rejects(pending, /closed before a React Router build was ready/);
  await assert.rejects(
    reader.loadReactRouterServerBuild(server),
    /not registered/
  );
};

const verifyPackIncludesOriginalSource = async () => {
  const { stdout } = await execFileAsync(
    'npm',
    ['pack', '--dry-run', '--json'],
    {
      cwd: packageRoot,
    }
  );
  const [pack] = JSON.parse(stdout);
  const files = new Set(pack.files.map(file => file.path));

  assert(
    files.has('src/index.ts'),
    'Expected npm package to include src/index.ts'
  );
  assert(
    files.has('src/templates/entry.client.tsx'),
    'Expected npm package to include source templates'
  );
};

const main = async () => {
  const [esm, commonjs] = await loadEntryPoints();
  await verifyPackIncludesOriginalSource();
  process.chdir(
    fileURLToPath(new URL('../tests/fixtures/dev-runtime/', import.meta.url))
  );
  await verifyRegistration(esm, commonjs);
  await verifyRegistration(commonjs, esm);
  assert.deepEqual(
    await esm.resolveReactRouterServerBuild({ default: build }),
    build
  );
  assert.deepEqual(
    await commonjs.resolveReactRouterServerBuild({ default: build }),
    build
  );
  console.log('ESM and CommonJS package entrypoints share runtime state.');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
