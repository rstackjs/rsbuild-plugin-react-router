import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentRepo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const defaults = {
  side: 'candidate',
  repo: currentRepo,
  count: 100,
  format: 'esm',
  edits: false,
};

function usage() {
  return `Usage: node scripts/verify-react-lazy-catalog.mjs [options]

Options:
  --side candidate|stock       Side to verify (default candidate)
  --stock-repo /path           Stock repository (required for --side stock)
  --count 100|1000             Generated optional route count (default 100)
  --format cjs|esm             React Router server module format (default esm)
  --edits                      Exercise dependency, loader, action, meta, and CSS edits
  --help                       Show this help`;
}

function parseArgs(argv) {
  const config = { ...defaults };
  let explicitSide = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--help') {
      console.log(usage());
      process.exit(0);
    }
    if (arg === '--edits') {
      config.edits = true;
      continue;
    }
    const value = argv[++index];
    if (arg === '--side') {
      config.side = value;
      explicitSide = true;
    } else if (arg === '--stock-repo') {
      if (!value || value.startsWith('--'))
        throw new Error('--stock-repo requires a path');
      config.stockRepo = resolve(value);
      if (!explicitSide) config.side = 'stock';
    } else if (arg === '--count') config.count = Number(value);
    else if (arg === '--format') config.format = value;
    else throw new Error(`Unknown argument ${arg}`);
  }
  if (!['candidate', 'stock'].includes(config.side))
    throw new Error('--side must be candidate or stock');
  if (![100, 1000].includes(config.count))
    throw new Error('--count must be 100 or 1000');
  if (!['cjs', 'esm'].includes(config.format))
    throw new Error('--format must be cjs or esm');
  if (config.side === 'stock' && !config.stockRepo)
    throw new Error('--stock-repo is required with --side stock');
  config.repo = config.side === 'stock' ? config.stockRepo : currentRepo;
  return config;
}

const serverMode = process.argv[2] === '--server';
const config = serverMode ? null : parseArgs(process.argv.slice(2));
if (serverMode) {
  const side = process.argv[3];
  const root = process.argv[4];
  const repo =
    side === 'stock'
      ? resolve(process.env.ROUTER_STOCK_REPO ?? '')
      : currentRepo;
  if (side === 'stock' && !process.env.ROUTER_STOCK_REPO)
    throw new Error('ROUTER_STOCK_REPO is required for stock server');
  const require = createRequire(join(repo, 'package.json'));
  const packageImport = name =>
    import(pathToFileURL(require.resolve(name)).href);
  const { createRsbuild, createLogger } = await packageImport('@rsbuild/core');
  const { pluginReact } = await packageImport('@rsbuild/plugin-react');
  const { pluginReactRouter, loadReactRouterServerBuild } = await import(
    pathToFileURL(join(repo, 'dist/index.js')).href
  );
  const logger = createLogger({ level: 'silent' });
  logger.error = message =>
    process.send?.({ event: 'error', message: String(message) });
  const rsbuild = await createRsbuild({
    cwd: root,
    config: {
      root,
      customLogger: logger,
      plugins: [
        pluginReactRouter({
          typegen: false,
          unstableServerLazyCompilation: side === 'candidate',
        }),
        pluginReact(),
        {
          name: 'catalog-census',
          setup(api) {
            api.onAfterEnvironmentCompile(({ environment, stats }) => {
              if (!stats || stats.hasErrors()) return;
              const modules = [...stats.compilation.modules];
              process.send?.({
                event: 'compile',
                side: environment.name,
                hash: stats.hash,
                leaves: modules
                  .filter(
                    module =>
                      /app\/generated\/optional-\d+\.tsx$/.test(
                        module.nameForCondition() ?? ''
                      ) &&
                      !module.identifier().startsWith('lazy-compilation-proxy|')
                  )
                  .map(
                    module =>
                      module.nameForCondition().match(/optional-(\d+)/)[1]
                  ),
                origin: stats.compilation.rebuildOrigin,
              });
            });
          },
        },
      ],
      server: { host: '127.0.0.1', port: 0 },
      dev: {
        cliShortcuts: false,
        lazyCompilation: { entries: false, imports: true },
      },
      tools: {
        rspack(config) {
          config.watchOptions = {
            ...config.watchOptions,
            aggregateTimeout: 10,
            poll: 50,
          };
        },
      },
    },
  });
  const started = await rsbuild.startDevServer();
  await loadReactRouterServerBuild(started.server);
  const address = started.server.httpServer.address();
  process.send?.({
    event: 'ready',
    url: `http://127.0.0.1:${address.port}`,
    versions: {
      rsbuild: require('@rsbuild/core/package.json').version,
      rspack: require('@rspack/core/package.json').version,
    },
  });
  process.on('message', async message => {
    if (message?.event === 'close') {
      await started.server.close();
      process.exit(0);
    }
  });
} else {
  const repo = config.repo;
  const require = createRequire(join(repo, 'package.json'));
  const wait = async (predicate, label, timeout = 20000) => {
    const deadline = Date.now() + timeout;
    while (!(await predicate())) {
      if (Date.now() > deadline)
        throw new Error(`Timed out waiting for ${label}`);
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  };
  const { createReactLazyCatalogFixture } = await import(
    pathToFileURL(join(currentRepo, 'scripts/fixtures/react-lazy-catalog.mjs'))
      .href
  );
  let root;
  let browser;
  let child;
  const compiles = [],
    errors = [],
    browserErrors = [],
    messages = [],
    logs = [];
  let ready, exit;
  let launch;
  const attach = page => {
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('websocket', socket =>
      socket.on('framereceived', frame => {
        try {
          messages.push(JSON.parse(frame.payload.toString()));
        } catch {}
      })
    );
  };
  const interactive = async page => {
    const button = page.getByRole('button', {
      name: /^(Check interactivity|interactive)$/,
    });
    await wait(async () => {
      await button.click();
      return (await button.innerText()) === 'interactive';
    }, 'working hydrated click handler');
  };
  let evidence;
  let inputHash;
  try {
    root = await mkdtemp(join(repo, 'tests/.tmp-catalog-browser-'));
    await createReactLazyCatalogFixture(root, config.count, config.format);
    if (config.edits) {
      const indexPath = join(root, 'app/routes/index.tsx');
      const original = await readFile(indexPath, 'utf8');
      await writeFile(
        indexPath,
        original
          .replace(
            '{ useLoaderData }',
            '{ Form, useActionData, useLoaderData }'
          )
          .replace(
            'const data = useLoaderData();',
            'const data = useLoaderData(); const actionData = useActionData();'
          )
          .replace(
            '<input aria-label=',
            '<Form method="post"><button>Submit action</button></Form><p id="action-value">{actionData?.value ?? "no action"}</p><input aria-label='
          )
      );
    }
    const hash = createHash('sha256');
    const hashDirectory = async directory => {
      for (const entry of (
        await readdir(directory, { withFileTypes: true })
      ).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await hashDirectory(path);
        else {
          hash.update(path.slice(root.length));
          hash.update(await readFile(path));
        }
      }
    };
    await hashDirectory(root);
    inputHash = hash.digest('hex');
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    launch = performance.now();
    child = spawn(
      process.execPath,
      [
        '--experimental-vm-modules',
        fileURLToPath(import.meta.url),
        '--server',
        config.side,
        root,
      ],
      {
        cwd: repo,
        env: { ...process.env, ROUTER_STOCK_REPO: config.stockRepo ?? '' },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      }
    );
    child.on('error', error => {
      errors.push(`child process error: ${error.message}`);
      exit = { error: error.message };
    });
    child.stdout.on('data', value => logs.push(value.toString()));
    child.stderr.on('data', value => logs.push(value.toString()));
    child.on('message', message => {
      if (message.event === 'ready') ready = message;
      if (message.event === 'compile') compiles.push(message);
      if (message.event === 'error') errors.push(message.message);
    });
    child.on('exit', (code, signal) => {
      exit = { code, signal };
    });
    await wait(() => {
      if (exit) throw new Error(JSON.stringify({ exit, logs, errors }));
      return ready;
    }, 'server ready');
    const serverReadyMs = performance.now() - launch;
    const first = await context.newPage();
    attach(first);
    const indexResponse = await first.goto(ready.url);
    assert.equal(indexResponse.status(), 200);
    await interactive(first);
    const startupInteractiveMs = performance.now() - launch;
    const token = randomUUID();
    await first.evaluate(token => {
      window.__catalogDocument = token;
    }, token);
    await first
      .getByRole('textbox', { name: 'Retained text' })
      .fill('retained literal text');
    await new Promise(resolve => setTimeout(resolve, 150));
    const cold = compiles.filter(event => event.side === 'node').at(-1);
    assert.ok(cold, 'actual Node compilation was observed');
    assert.equal(
      cold.leaves.length,
      config.side === 'stock' ? config.count : 0,
      'cold Node leaf census'
    );
    const beforeMessages = messages.length;
    const second = await context.newPage();
    attach(second);
    const network = await context.newCDPSession(second);
    await network.send('Network.enable');
    let request,
      streamRequest,
      streamReady = false,
      firstContentMs;
    const waitingChunks = [];
    let streamedText = '';
    const acceptChunk = data => {
      streamedText += Buffer.from(data, 'base64').toString('utf8');
      if (
        firstContentMs === undefined &&
        streamedText.includes('Optional item 17')
      )
        firstContentMs = performance.now() - request;
    };
    network.on('Network.dataReceived', event => {
      if (event.requestId !== streamRequest || !event.data) return;
      if (streamReady) acceptChunk(event.data);
      else waitingChunks.push(event.data);
    });
    network.on('Network.responseReceived', event => {
      if (
        event.type !== 'Document' ||
        event.response.url !== `${ready.url}/catalog/17`
      )
        return;
      streamRequest = event.requestId;
      void network
        .send('Network.streamResourceContent', { requestId: streamRequest })
        .then(result => {
          acceptChunk(result.bufferedData);
          streamReady = true;
          waitingChunks.splice(0).forEach(acceptChunk);
        })
        .catch(error =>
          errors.push(`SSR stream observation failed: ${error.message}`)
        );
    });
    request = performance.now();
    const response = await second.goto(`${ready.url}/catalog/17`, {
      waitUntil: 'commit',
    });
    assert.equal(response.status(), 200);
    const responseHeadersMs = performance.now() - request;
    await second.getByText('Optional item 17', { exact: true }).waitFor();
    const renderedBody = await response.text();
    assert.match(
      renderedBody,
      /Optional item 17/,
      'the original navigation response contains actual SSR leaf content'
    );
    await wait(
      () => firstContentMs !== undefined,
      'observed SSR leaf stream bytes'
    );
    await interactive(second);
    const requestInteractiveMs = performance.now() - request;
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.equal(
      await first.getByRole('textbox', { name: 'Retained text' }).inputValue(),
      'retained literal text'
    );
    assert.equal(await first.evaluate(() => window.__catalogDocument), token);
    const after = compiles.filter(event => event.side === 'node').at(-1);
    assert.equal(
      after.leaves.length,
      config.side === 'stock' ? config.count : 1,
      'requested Node leaf census'
    );
    assert.ok(after.leaves.includes('17'));
    if (config.side === 'candidate')
      assert.ok(!after.leaves.includes('18'), 'unused leaf18 remains deferred');
    assert.equal(
      await second
        .locator('.optional')
        .evaluate(element => getComputedStyle(element).color),
      'rgb(72, 61, 139)'
    );
    const activationMessages = messages.slice(beforeMessages);
    assert.ok(
      !activationMessages.some(
        message =>
          message.type === 'static-changed' ||
          message.type === 'full-reload' ||
          message.event?.includes('hdr') ||
          message.data?.event?.includes('hdr')
      ),
      JSON.stringify(activationMessages)
    );
    if (config.edits) {
      await writeFile(
        join(root, 'app/shared.ts'),
        "export const dependencyValue = 'loader dependency edited';\n"
      );
      await first
        .getByText('loader dependency edited', { exact: true })
        .waitFor();
      assert.equal(
        await first
          .getByRole('textbox', { name: 'Retained text' })
          .inputValue(),
        'retained literal text'
      );
      const indexPath = join(root, 'app/routes/index.tsx');
      let indexSource = await readFile(indexPath, 'utf8');
      indexSource = indexSource.replace(
        'return { value: dependencyValue };',
        "return { value: 'loader implementation edited' };"
      );
      await writeFile(indexPath, indexSource);
      await first
        .getByText('loader implementation edited', { exact: true })
        .waitFor();
      const submitActionAndWaitForValue = async expected => {
        const button = first.getByRole('button', { name: 'Submit action' });
        const value = first.locator('#action-value');
        for (let attempt = 0; attempt < 10; attempt++) {
          const responsePromise = first.waitForResponse(response => {
            return response.request().method() === 'POST';
          });
          await button.click();
          const response = await responsePromise;
          await response.finished();
          try {
            await value.filter({ hasText: expected }).waitFor({
              timeout: 1000,
            });
            return;
          } catch (error) {
            if (attempt === 9) throw error;
          }
        }
      };
      await submitActionAndWaitForValue('action original');
      indexSource = indexSource.replace('action original', 'action edited');
      await writeFile(indexPath, indexSource);
      await submitActionAndWaitForValue('action edited');
      await writeFile(
        indexPath,
        indexSource +
          "\nexport function meta() { return [{ title: 'route export edited' }]; }\n"
      );
      await wait(
        async () => (await first.title()) === 'route export edited',
        'route meta export HMR'
      );
      assert.equal(
        await first
          .getByRole('textbox', { name: 'Retained text' })
          .inputValue(),
        'retained literal text'
      );
      await writeFile(
        join(root, 'app/routes/catalog.css'),
        '.optional { color: rgb(1, 2, 3); }'
      );
      await wait(
        async () =>
          (await second
            .locator('.optional')
            .evaluate(element => getComputedStyle(element).color)) ===
          'rgb(1, 2, 3)',
        'CSS HMR'
      );
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(browserErrors, []);
    evidence = {
      ...config,
      inputHash,
      versions: ready.versions,
      timings: {
        serverReadyMs,
        startupInteractiveMs,
        responseHeadersMs,
        firstContentMs,
        requestInteractiveMs,
      },
      coldLeaves: cold.leaves.length,
      requestedLeaves: after.leaves.length,
      retainedText: true,
      retainedDocument: true,
      activationMessages,
      compiles,
      result: 'passed',
    };
    console.log(JSON.stringify(evidence));
  } catch (error) {
    console.error(
      JSON.stringify({
        ...config,
        inputHash,
        error: error.stack,
        errors,
        browserErrors,
        messages,
        compiles,
        logs,
        exit,
      })
    );
    process.exitCode = 1;
  } finally {
    if (child?.connected) child.send({ event: 'close' });
    if (child) {
      await wait(() => exit, 'child close', 10000).catch(() => {
        child.kill('SIGKILL');
      });
      await wait(() => exit, 'forced child close', 5000).catch(() => {});
    }
    await browser?.close();
    if (root) await rm(root, { recursive: true, force: true });
  }
}
