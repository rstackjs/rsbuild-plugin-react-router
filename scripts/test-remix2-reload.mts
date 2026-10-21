import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
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
const { pluginRemix2 } = await import(
  pathToFileURL(require.resolve('rsbuild-plugin-react-router/remix2')).href
);
const { chromium } = require('@playwright/test');
const route = resolve(root, 'app/state.server.ts');
const original = await readFile(route, 'utf8');
let compiler;
let dev;
let http;
let browser;
try {
  const rsbuild = await createRsbuild({
    cwd: root,
    rsbuildConfig: {
      plugins: [
        pluginRemix2(),
        pluginReact(),
        {
          name: 'reload-probe',
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
  dev = await rsbuild.createDevServer();
  http = createServer(dev.middlewares);
  http.listen(0, '127.0.0.1');
  await once(http, 'listening');
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${http.address().port}`);
  await page.getByRole('button', { name: 'Count 0', exact: true }).click();
  await page.getByRole('button', { name: 'Count 1', exact: true }).waitFor();
  const requests = [];
  page.on('request', request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      requests.push(request.url());
  });
  await writeFile(
    route,
    original.replace('native-loader-v1', 'reload-loader-v2')
  );
  await new Promise((done, fail) =>
    compiler.watching.invalidateWithChangesAndRemovals(
      new Set([route]),
      new Set(),
      error => (error ? fail(error) : done())
    )
  );
  await page
    .getByTestId('loader-message')
    .filter({ hasText: 'reload-loader-v2' })
    .waitFor();
  await page.getByRole('button', { name: 'Count 0', exact: true }).waitFor();
  assert(
    requests.length > 0,
    'Server-only edits must trigger a full document reload.'
  );
  const count = requests.length;
  await writeFile(route, original + '\nexport const BROKEN_RELOAD = ;');
  await new Promise((done, fail) =>
    compiler.watching.invalidateWithChangesAndRemovals(
      new Set([route]),
      new Set(),
      error => (error ? fail(error) : done())
    )
  );
  await page.waitForTimeout(200);
  assert.equal(
    requests.length,
    count,
    'Failed builds must not reload the browser.'
  );
  assert.equal(
    await page.getByTestId('loader-message').textContent(),
    'reload-loader-v2'
  );
  console.log(
    'Native browser full reload for server-only edits and no reload on a failed generation passed.'
  );
} finally {
  await writeFile(route, original);
  await browser?.close();
  if (http?.listening) {
    const closed = once(http, 'close');
    http.close();
    http.closeAllConnections();
    await closed;
  }
  await dev?.close();
}
