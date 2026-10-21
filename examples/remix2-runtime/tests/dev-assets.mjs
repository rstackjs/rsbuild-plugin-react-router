import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createRsbuild } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { chromium } from '@playwright/test';
import {
  pluginRemix2,
  loadRemix2ServerBuild,
} from 'rsbuild-plugin-react-router/remix2';

const require = createRequire(import.meta.url);
const { readConfig } = require('@remix-run/dev/dist/config.js');
const rootFile = resolve('app/root.tsx');
const routeFile = resolve('app/routes/_index.tsx');
const stateFile = resolve('app/state.server.ts');

function gate() {
  let release;
  const promise = new Promise(done => {
    release = done;
  });
  return { promise, release };
}

async function promptly(promise, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), 10000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function assetURLs(manifest) {
  return [
    ...new Set([
      manifest.url,
      ...[manifest.entry, ...Object.values(manifest.routes)].flatMap(assets => [
        assets.module,
        ...assets.imports,
        ...(assets.css ?? []),
      ]),
    ]),
  ];
}

for (const customServer of [false, true]) {
  test(
    `late native documents hydrate retained assets across normal watch generations (customServer=${customServer})`,
    { timeout: 60000 },
    async () => {
      const originalRoot = await readFile(rootFile, 'utf8');
      const originalRoute = await readFile(routeFile, 'utf8');
      const originalState = await readFile(stateFile, 'utf8');
      const entered = gate();
      const blocked = gate();
      let devServer;
      let http;
      let browser;
      let compiler;
      let mutable = 'generation-1';
      let published;
      let failed;
      let includeUnpublished = false;
      let disposed = false;
      const errors = [];
      const requests = [];
      globalThis.__remix2AssetDocument = async () => {
        entered.release();
        await blocked.promise;
      };
      try {
        await writeFile(
          routeFile,
          originalRoute.replace(
            'export function loader() {',
            'export async function loader() { await globalThis.__remix2AssetDocument?.();'
          )
        );
        const config = await readConfig(process.cwd(), 'development');
        config.serverModuleFormat = customServer ? 'cjs' : 'esm';
        config.publicPath = '/__retained-assets/';
        config.assetsBuildDirectory = resolve('build/dev-assets-browser');
        config.serverBuildPath = resolve('build/dev-assets-server/index.js');
        const rsbuild = await createRsbuild({
          cwd: process.cwd(),
          rsbuildConfig: {
            plugins: [
              pluginRemix2({ config, customServer }),
              pluginReact(),
              {
                name: 'acceptance:dev-assets',
                setup(api) {
                  api.onAfterCreateCompiler(({ compiler: created }) => {
                    compiler = created;
                  });
                  api.processAssets(
                    { environments: ['web'], stage: 'report' },
                    ({ compilation, sources }) => {
                      compilation.emitAsset(
                        'mutable.txt',
                        new sources.RawSource(mutable)
                      );
                      if (includeUnpublished)
                        compilation.emitAsset(
                          'unpublished-hashed.js',
                          new sources.RawSource('window.__unpublished = true;'),
                          { immutable: true }
                        );
                    }
                  );
                  api.onAfterEnvironmentCompile(({ environment, stats }) => {
                    if (environment.name === 'node') {
                      if (stats.hasErrors()) failed?.release();
                      else published?.release();
                    }
                  });
                },
              },
            ],
            server: { middlewareMode: true },
            dev: { cliShortcuts: false },
          },
        });
        devServer = await rsbuild.createDevServer();
        const first = await loadRemix2ServerBuild(devServer);
        const nativeHandler = customServer
          ? require('@remix-run/node').createRequestHandler(
              () => loadRemix2ServerBuild(devServer),
              'development'
            )
          : undefined;
        const listener = nativeHandler
          ? (
              await import('@remix-run/node-fetch-server')
            ).createRequestListener(nativeHandler)
          : undefined;
        http = createServer((req, res) => {
          devServer.middlewares(req, res, error => {
            if (disposed) {
              res.statusCode = 404;
              res.end('closed');
            } else if (error) {
              res.statusCode = 500;
              res.end(String(error));
            } else if (listener) {
              listener(req, res);
            } else {
              res.statusCode = 404;
              res.end('not found');
            }
          });
        });
        http.listen(0, '127.0.0.1');
        await once(http, 'listening');
        const base = `http://127.0.0.1:${http.address().port}`;
        const oldBytes = new Map();
        for (const url of assetURLs(first.assets)) {
          const response = await fetch(base + url);
          assert.equal(response.status, 200, url);
          oldBytes.set(url, Buffer.from(await response.arrayBuffer()));
        }
        assert.equal(
          await (await fetch(base + config.publicPath + 'mutable.txt')).text(),
          mutable
        );
        browser = await chromium.launch();
        const page = await browser.newPage();
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => {
          if (
            message.type() === 'error' &&
            !message
              .text()
              .startsWith(
                'Warning: Extra attributes from the server: %s%s data-remix2-entry '
              )
          )
            errors.push(message.text());
        });
        page.on('response', response => {
          if (new URL(response.url()).pathname.startsWith(config.publicPath))
            requests.push({
              url: new URL(response.url()).pathname,
              status: response.status(),
            });
        });
        const navigation = page.goto(base);
        await promptly(
          entered.promise,
          'Native document did not acquire generation 1'
        );
        assert(compiler.watching, 'The real compiler must be watching');
        let current = first;
        for (let version = 2; version <= 4; version += 1) {
          mutable = `generation-${version}`;
          published = gate();
          await writeFile(
            rootFile,
            originalRoot.replace(
              'acceptance',
              `acceptance generation-${version}`
            )
          );
          await promptly(
            published.promise,
            `Normal watch did not finish generation ${version}`
          );
          current = await loadRemix2ServerBuild(devServer);
          assert.notEqual(current.assets.version, first.assets.version);
          assert.equal(
            await (
              await fetch(base + config.publicPath + 'mutable.txt')
            ).text(),
            mutable
          );
        }
        blocked.release();
        const response = await promptly(
          navigation,
          'Late native document did not finish'
        );
        assert.equal(response.status(), 200);
        const html = await response.text();
        assert(
          html.includes(first.assets.url),
          'Late document must keep its acquired manifest'
        );
        assert.match(html, /Native Remix 2 acceptance<\/h1>/);
        await page
          .getByRole('button', { name: 'Count 0', exact: true })
          .click({ timeout: 10000 });
        await page
          .getByRole('button', { name: 'Count 1', exact: true })
          .waitFor({ timeout: 10000 });
        assert.equal(
          await page.evaluate(() => window.__remixManifest.version),
          first.assets.version
        );
        assert.deepEqual(errors, []);
        assert(requests.some(request => request.url === first.assets.url));
        assert(
          requests.some(
            request => request.url === first.assets.routes.root.module
          )
        );
        assert(
          requests.every(request => request.status === 200),
          JSON.stringify(requests)
        );
        for (const [url, bytes] of oldBytes) {
          const get = await fetch(base + url);
          assert.equal(get.status, 200, `Superseded asset ${url}`);
          assert.deepEqual(Buffer.from(await get.arrayBuffer()), bytes, url);
          const head = await fetch(base + url, { method: 'HEAD' });
          assert.equal(head.status, 200, url);
          assert.equal((await head.arrayBuffer()).byteLength, 0);
          if (customServer)
            assert.deepEqual(
              await readFile(
                resolve(
                  config.assetsBuildDirectory,
                  url.slice(config.publicPath.length)
                )
              ),
              bytes
            );
        }
        const fresh = await fetch(base);
        const freshHTML = await fresh.text();
        assert.equal(fresh.status, 200);
        assert(freshHTML.includes(current.assets.url));
        assert(!freshHTML.includes(first.assets.url));
        assert.match(freshHTML, /acceptance generation-4/);
        failed = gate();
        mutable = 'unpublished-generation';
        includeUnpublished = true;
        await writeFile(
          stateFile,
          originalState + '\nexport const BROKEN_ASSET_GENERATION = ;\n'
        );
        await promptly(
          failed.promise,
          'Failed generation did not reach the native compiler'
        );
        assert.strictEqual(await loadRemix2ServerBuild(devServer), current);
        assert.equal(
          await (await fetch(base + config.publicPath + 'mutable.txt')).text(),
          'generation-4'
        );
        assert.equal(
          (await fetch(base + config.publicPath + 'unpublished-hashed.js'))
            .status,
          404,
          'A successful browser half with a failed server must not publish assets'
        );
        console.log(
          `Retained ${oldBytes.size} immutable URLs through three replacements; old Chromium hydrated, fresh document current, failed attempt unpublished, customServer=${customServer}`
        );
        await browser.close();
        browser = undefined;
        await devServer.close();
        disposed = true;
        await assert.rejects(
          loadRemix2ServerBuild(devServer),
          /not registered/
        );
        const closedAsset = await fetch(base + first.assets.url);
        assert.notEqual(
          closedAsset.status,
          200,
          'Close must release retained middleware assets'
        );
      } finally {
        blocked.release();
        delete globalThis.__remix2AssetDocument;
        await browser?.close();
        if (http?.listening) {
          const closed = once(http, 'close');
          http.close();
          http.closeAllConnections();
          await closed;
        }
        await devServer?.close();
        await writeFile(rootFile, originalRoot);
        await writeFile(routeFile, originalRoute);
        await writeFile(stateFile, originalState);
      }
    }
  );
}
