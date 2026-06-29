import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Effect } from 'effect';
import {
  runScriptEffect,
  tryScriptPromise,
  tryScriptSync,
} from './script-effect.mts';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const devRuntimeFixtureRoot = fileURLToPath(
  new URL('../tests/fixtures/dev-runtime/', import.meta.url)
);
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

const verifyRegistrationEffect = (writer, reader) =>
  Effect.gen(function* () {
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

    yield* tryScriptPromise(() =>
      writer.pluginReactRouter({ customServer: true }).setup(api)
    );

    const startHook = starts.find(hook => hook.order === 'pre');
    const closeHook = closes.find(hook => hook.order === 'pre');
    yield* tryScriptSync(() => {
      assert(startHook, 'Expected a pre dev-server start hook');
      assert(closeHook, 'Expected a pre dev-server close hook');
    });

    const start = startHook.handler;
    const server = {
      close: async () => undefined,
      environments: { node: { loadBundle: async () => build } },
      sockWrite: noop,
    };
    yield* tryScriptPromise(() => start({ environments: {}, server }));

    const pending = reader.loadReactRouterServerBuild(server);
    for (const close of closes) {
      yield* tryScriptPromise(() =>
        typeof close === 'function' ? close() : close.handler?.()
      );
    }
    yield* tryScriptPromise(() =>
      assert.rejects(pending, /closed before a React Router build was ready/)
    );
    yield* tryScriptPromise(() =>
      assert.rejects(
        reader.loadReactRouterServerBuild(server),
        /not registered/
      )
    );
  });

const verifyPackIncludesOriginalSourceEffect = Effect.gen(function* () {
  const { stdout } = yield* tryScriptPromise(() =>
    execFileAsync('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageRoot,
    })
  );
  const files = yield* tryScriptSync(() => {
    const [pack] = JSON.parse(stdout);
    return new Set(pack.files.map(file => file.path));
  });

  yield* tryScriptSync(() => {
    assert(
      files.has('src/index.ts'),
      'Expected npm package to include src/index.ts'
    );
    assert(
      files.has('src/templates/entry.client.tsx'),
      'Expected npm package to include source templates'
    );
  });
});

const mainEffect = Effect.gen(function* () {
  const esm = yield* tryScriptPromise(() => import('../dist/index.js'));
  const commonjs = yield* tryScriptSync(() => require('../dist/index.cjs'));

  yield* verifyPackIncludesOriginalSourceEffect;
  yield* tryScriptSync(() => process.chdir(devRuntimeFixtureRoot));
  yield* verifyRegistrationEffect(esm, commonjs);
  yield* verifyRegistrationEffect(commonjs, esm);

  yield* tryScriptPromise(async () =>
    assert.deepEqual(
      await esm.resolveReactRouterServerBuild({ default: build }),
      build
    )
  );
  yield* tryScriptPromise(async () =>
    assert.deepEqual(
      await commonjs.resolveReactRouterServerBuild({ default: build }),
      build
    )
  );

  console.log('ESM and CommonJS package entrypoints share runtime state.');
});

runScriptEffect(mainEffect).catch(error => {
  console.error(error);
  process.exit(1);
});
