import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { after, test } from 'node:test';
import { createRsbuild } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import {
  pluginRemix2,
  loadRemix2ServerBuild,
} from 'rsbuild-plugin-react-router/remix2';
import { createRequestHandler } from '@remix-run/node';

const require = createRequire(import.meta.url);
const exec = promisify(execFile);
const { readConfig } = require('@remix-run/dev/dist/config.js');
const { defineRoutes } = require('@remix-run/dev/dist/config/routes.js');
const rootFile = resolve('app/root.tsx');
const stateFile = resolve('app/state.server.ts');
const originalRoot = await readFile(rootFile, 'utf8');
const originalState = await readFile(stateFile, 'utf8');
after(async () => {
  await writeFile(rootFile, originalRoot);
  await writeFile(stateFile, originalState);
});

async function promptly(promise, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), 5000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function configured(options = {}, probe = {}) {
  let compiler;
  const rsbuild = await createRsbuild({
    cwd: process.cwd(),
    rsbuildConfig: {
      plugins: [
        pluginRemix2(options),
        pluginReact(),
        {
          name: 'acceptance:review-real-compiler',
          setup(api) {
            api.onAfterCreateCompiler(({ compiler: created }) => {
              compiler = created;
              probe.compiler?.(created);
            });
          },
        },
      ],
      server: { middlewareMode: true },
      dev: { cliShortcuts: false },
    },
  });
  return { rsbuild, compiler: () => compiler };
}

function invalidate(compiler, files = [rootFile, stateFile]) {
  return new Promise(resolve => {
    compiler.watching.invalidateWithChangesAndRemovals(
      new Set(files),
      new Set(),
      error => resolve(error ?? undefined)
    );
  });
}

test(
  'superseding a paused browser attempt advances all public loader waiters to a coherent build',
  {
    timeout: 30000,
  },
  async () => {
    let server;
    let release;
    let paused;
    const entered = new Promise(resolve => {
      paused = resolve;
    });
    const gate = new Promise(resolve => {
      release = resolve;
    });
    let transforms = 0;
    const app = await configured({
      transformManifest: async draft => {
        transforms += 1;
        if (transforms === 2) {
          paused();
          await gate;
        }
        return { ...draft, reviewAttempt: transforms };
      },
    });
    try {
      server = await app.rsbuild.createDevServer();
      await writeFile(
        rootFile,
        originalRoot.replace('acceptance', 'review-browser-v2')
      );
      const second = invalidate(app.compiler());
      await entered;
      const priorLoad = loadRemix2ServerBuild(server);
      await writeFile(
        rootFile,
        originalRoot.replace('acceptance', 'review-browser-v3')
      );
      await writeFile(
        stateFile,
        originalState.replace('native-loader-v1', 'review-server-v3')
      );
      const third = invalidate(app.compiler());
      release();
      assert.equal(
        await promptly(second, 'second invalidation hung'),
        undefined
      );
      assert.equal(await promptly(third, 'third invalidation hung'), undefined);
      const fresh = await promptly(
        loadRemix2ServerBuild(server),
        'fresh loader hung'
      );
      const prior = await promptly(
        priorLoad,
        'superseded attempt stranded its prior loader'
      );
      assert.strictEqual(prior, fresh);
      assert(
        fresh.assets.reviewAttempt >= 3,
        'Only a post-supersession manifest may publish'
      );
      const response = await createRequestHandler(
        fresh,
        'development'
      )(new Request('http://localhost/?_data=routes%2F_index'));
      assert.equal((await response.json()).message, 'review-server-v3');
      const browser = app
        .compiler()
        .compilers.find(child => child.name === 'web');
      const output = browser.outputFileSystem;
      const modulePath = resolve(
        browser.outputPath,
        fresh.assets.routes.root.module.replace('/build/', '')
      );
      assert.match(
        output.readFileSync(modulePath, 'utf8'),
        /review-browser-v3/
      );
    } finally {
      release();
      await server?.close();
      await writeFile(rootFile, originalRoot);
      await writeFile(stateFile, originalState);
    }
  }
);

test(
  'fatal manifest-hook rebuild errors retain the last complete generation',
  {
    timeout: 30000,
  },
  async () => {
    let server;
    let fail = false;
    let release;
    let paused;
    const entered = new Promise(resolve => {
      paused = resolve;
    });
    const gate = new Promise(resolve => {
      release = resolve;
    });
    const app = await configured({
      transformManifest: async draft => {
        if (fail) {
          paused();
          await gate;
          throw new Error('intentional-review-manifest-failure');
        }
        return draft;
      },
    });
    try {
      server = await app.rsbuild.createDevServer();
      const good = await loadRemix2ServerBuild(server);
      fail = true;
      await writeFile(
        rootFile,
        originalRoot.replace('acceptance', 'review-fatal-browser')
      );
      const invalidated = invalidate(app.compiler());
      await entered;
      const waiting = loadRemix2ServerBuild(server);
      release();
      const error = await promptly(
        invalidated,
        'fatal invalidation callback hung'
      );
      assert.match(String(error), /intentional-review-manifest-failure/);
      assert.strictEqual(
        await promptly(waiting, 'fatal hook stranded a pending loader'),
        good
      );
      assert.strictEqual(
        await promptly(
          loadRemix2ServerBuild(server),
          'fatal hook stranded last-good loader'
        ),
        good
      );
    } finally {
      release();
      await server?.close();
      await writeFile(rootFile, originalRoot);
    }
  }
);

test(
  'a fatal first manifest hook rejects native startup readiness',
  { timeout: 30000 },
  async () => {
    const app = await configured({
      transformManifest() {
        throw new Error('intentional-review-first-manifest-failure');
      },
    });
    await assert.rejects(
      app.rsbuild.createDevServer(),
      /intentional-review-first-manifest-failure/
    );
  }
);

test(
  'native defineRoutes shared files retain every ID and route-specific browser transforms',
  {
    timeout: 30000,
  },
  async () => {
    const sharedFile = resolve('app/review-shared.tsx');
    await writeFile(
      sharedFile,
      `
    export const loader = () => ({ shared: true });
    export const action = () => ({ action: true });
    export default function Shared() { return null; }
  `
    );
    let server;
    let http;
    let browser;
    try {
      const config = await readConfig(process.cwd(), 'development');
      Object.assign(
        config.routes,
        defineRoutes(route => {
          route('/review-one', 'review-shared.tsx', { id: 'review-one' });
          route('/review-two', 'review-shared.tsx', { id: 'review-two' });
          route('/review-root', 'root.tsx', { id: 'review-root' });
        })
      );
      const seen = new Set();
      const app = await configured({
        config,
        transformClientRoute({ code, route, serverExports }) {
          seen.add(route.id);
          if (route.id.startsWith('review-') && route.id !== 'review-root') {
            assert(serverExports.includes('loader'));
          }
          return (
            code +
            `\nexport const reviewRouteId = ${JSON.stringify(route.id)};` +
            (route.id === 'review-one'
              ? '\nexport const clientLoader = () => "review-one-client";'
              : '') +
            (route.id === 'review-root'
              ? '\nexport const ErrorBoundary = () => null;'
              : '')
          );
        },
      });
      server = await app.rsbuild.createDevServer();
      const build = await loadRemix2ServerBuild(server);
      assert.strictEqual(
        build.routes['review-one'].module,
        build.routes['review-two'].module
      );
      assert.strictEqual(
        build.routes.root.module,
        build.routes['review-root'].module
      );
      for (const id of Object.keys(config.routes))
        assert(seen.has(id), `Hook missed ${id}`);
      assert.equal(build.assets.routes['review-one'].hasLoader, true);
      assert.equal(build.assets.routes['review-two'].hasAction, true);
      assert.equal(build.assets.routes['review-one'].hasClientLoader, true);
      assert.equal(build.assets.routes['review-two'].hasClientLoader, false);
      assert.equal(build.assets.routes.root.hasErrorBoundary, false);
      assert.equal(build.assets.routes['review-root'].hasErrorBoundary, true);
      http = createServer((request, response) => {
        if (request.url === '/__review/blank')
          response.end('<!doctype html><title>Module probe</title>');
        else server.middlewares(request, response);
      });
      http.listen(0, '127.0.0.1');
      await once(http, 'listening');
      const base = `http://127.0.0.1:${http.address().port}`;
      const { chromium } = await import('@playwright/test');
      browser = await chromium.launch();
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(base + '/__review/blank');
      for (const id of ['root', 'review-root', 'review-one', 'review-two']) {
        const result = await page.evaluate(
          async ({ url, imports }) => {
            for (const dependency of imports) await import(dependency);
            const module = await import(url);
            return {
              id: module.reviewRouteId,
              client: module.clientLoader?.(),
              server: 'loader' in module,
            };
          },
          {
            url: base + build.assets.routes[id].module,
            imports: build.assets.routes[id].imports,
          }
        );
        assert.equal(result.id, id);
        assert.equal(result.server, false);
        assert.equal(
          result.client,
          id === 'review-one' ? 'review-one-client' : undefined
        );
      }
      assert.deepEqual(errors, []);
      await server.close();
      server = undefined;
      const configFile = resolve('remix.config.js');
      const originalConfig = await readFile(configFile, 'utf8');
      try {
        await writeFile(
          configFile,
          originalConfig.replace(
            "appDirectory: 'app',",
            `appDirectory: 'app',
        routes(defineRoutes) {
          return defineRoutes(route => {
            route('/review-one', 'review-shared.tsx', { id: 'review-one' });
            route('/review-two', 'review-shared.tsx', { id: 'review-two' });
            route('/review-root', 'root.tsx', { id: 'review-root' });
          });
        },`
          )
        );
        await exec(
          process.execPath,
          ['node_modules/@remix-run/dev/dist/cli.js', 'build'],
          {
            env: { ...process.env, NODE_ENV: 'production' },
            timeout: 30000,
          }
        );
        const stock = await import(
          pathToFileURL(config.serverBuildPath).href +
            '?review-shared-reference'
        );
        for (const id of ['root', 'review-root', 'review-one', 'review-two'])
          assert(stock.routes[id]);
        assert.strictEqual(
          stock.routes['review-one'].module,
          stock.routes['review-two'].module
        );
        assert.strictEqual(
          stock.routes.root.module,
          stock.routes['review-root'].module
        );
      } finally {
        await writeFile(configFile, originalConfig);
      }
    } finally {
      await browser?.close();
      if (http?.listening) {
        const closed = once(http, 'close');
        http.close();
        http.closeAllConnections();
        await closed;
      }
      await server?.close();
      await rm(sharedFile, { force: true });
    }
  }
);

test(
  'native .client files are empty in evaluated server builds and run unchanged in the browser',
  {
    timeout: 30000,
  },
  async () => {
    const files = ['js', 'ts', 'jsx', 'tsx'].map(extension =>
      resolve(`app/review-probe.client.${extension}`)
    );
    const directory = resolve('app/.client/review-probe.js');
    const otherExtension = resolve('app/review-probe.client.mjs');
    let server;
    let http;
    let browser;
    try {
      for (const [index, file] of files.entries()) {
        await writeFile(
          file,
          `
        window.__reviewClient = (window.__reviewClient || 0) + 1;
        export const value = ${index};
        export default ${index};
      `
        );
      }
      await mkdir(resolve('app/.client'), { recursive: true });
      await writeFile(
        directory,
        'export const value = "classic-client-directory";'
      );
      await writeFile(
        otherExtension,
        'export const value = "classic-client-mjs";'
      );
      await writeFile(
        rootFile,
        files.map(file => `import ${JSON.stringify(file)};`).join('\n') +
          `\nimport * as reviewClient from ${JSON.stringify(files[0])};\n` +
          `import ${JSON.stringify(files[1].replace(/\.ts$/, ''))};\n` +
          `import { value as directoryValue } from ${JSON.stringify(directory)};\n` +
          `import { value as extensionValue } from ${JSON.stringify(otherExtension)};\n` +
          'export const reviewClientValues = [reviewClient.value, reviewClient.default];\n' +
          'export const reviewClassicValues = [directoryValue, extensionValue];\n' +
          originalRoot
      );
      const app = await configured();
      server = await app.rsbuild.createDevServer();
      const build = await loadRemix2ServerBuild(server);
      assert.equal(build.routes.root.module.reviewClientValues[0], undefined);
      assert.deepEqual(
        Object.keys(build.routes.root.module.reviewClientValues[1]),
        []
      );
      assert.deepEqual(
        Array.from(build.routes.root.module.reviewClassicValues),
        ['classic-client-directory', 'classic-client-mjs']
      );
      const response = await createRequestHandler(
        build,
        'development'
      )(new Request('http://localhost'));
      assert.equal(response.status, 200);
      http = createServer((request, response) => {
        if (request.url === '/__review/blank')
          response.end('<!doctype html><title>Module probe</title>');
        else server.middlewares(request, response);
      });
      http.listen(0, '127.0.0.1');
      await once(http, 'listening');
      const { chromium } = await import('@playwright/test');
      browser = await chromium.launch();
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(`http://127.0.0.1:${http.address().port}/__review/blank`);
      const clientValues = await page.evaluate(async ({ module, imports }) => {
        for (const dependency of imports) await import(dependency);
        return (await import(module)).reviewClientValues;
      }, build.assets.routes.root);
      assert.deepEqual(clientValues, [0, 0]);
      assert.equal(await page.evaluate(() => window.__reviewClient), 4);
      assert.deepEqual(errors, []);
      await server.close();
      server = undefined;
      const previousMode = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        const production = await configured();
        await production.rsbuild.build();
      } finally {
        process.env.NODE_ENV = previousMode;
      }
      const compiled = await import(
        pathToFileURL(resolve('build/server/index.js')).href +
          '?review-client-production'
      );
      assert.equal(
        compiled.routes.root.module.reviewClientValues[0],
        undefined
      );
      assert.deepEqual(
        Object.keys(compiled.routes.root.module.reviewClientValues[1]),
        []
      );
      assert.deepEqual(compiled.routes.root.module.reviewClassicValues, [
        'classic-client-directory',
        'classic-client-mjs',
      ]);
      assert.equal(
        (
          await createRequestHandler(
            compiled,
            'production'
          )(new Request('http://localhost'))
        ).status,
        200
      );
      await exec(
        process.execPath,
        ['node_modules/@remix-run/dev/dist/cli.js', 'build'],
        {
          env: { ...process.env, NODE_ENV: 'production' },
          timeout: 30000,
        }
      );
      const stock = await import(
        pathToFileURL(resolve('build/server/index.js')).href +
          '?review-client-reference'
      );
      assert.equal(stock.routes.root.module.reviewClientValues[0], undefined);
      assert.deepEqual(
        Object.keys(stock.routes.root.module.reviewClientValues[1]),
        []
      );
      assert.deepEqual(stock.routes.root.module.reviewClassicValues, [
        'classic-client-directory',
        'classic-client-mjs',
      ]);
    } finally {
      await browser?.close();
      if (http?.listening) {
        const closed = once(http, 'close');
        http.close();
        http.closeAllConnections();
        await closed;
      }
      await server?.close();
      await writeFile(rootFile, originalRoot);
      for (const file of files) await rm(file, { force: true });
      await rm(directory, { force: true });
      await rm(otherExtension, { force: true });
    }
  }
);
