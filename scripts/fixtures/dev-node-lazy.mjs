import assert from 'node:assert/strict';
import {
  appendFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, createLogger } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { createRequestHandler } from 'react-router';
import {
  pluginReactRouter,
  loadReactRouterServerBuild,
} from '../../dist/index.js';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const format = process.argv[2] ?? 'cjs';
const count = Number(process.argv[3] ?? 4);
const scenario = process.argv[4] ?? 'basic';
const failureFlag = `__routerLazyFailure_${format}_${scenario}`;
const holdFlag = `__routerLazyHold_${format}_${scenario}`;
const root = await mkdtemp(join(repository, 'tests/.tmp-node-lazy-'));
const waitFor = async (predicate, label) => {
  const deadline = Date.now() + 10000;
  while (!(await predicate())) {
    if (Date.now() >= deadline)
      throw new Error(`Timed out waiting for ${label}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};
const within = async (promise, label) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timed out waiting for ${label}`)),
          10000
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};
let server;
let latestNode;
let nodeBuilds = 0;
const errors = [];
const origins = [];
let duringFirstActivation;
let lazyInvalidations = 0;
let nodeCompiler;
let latestWeb;
let webHeld = false;
let releaseWeb;
const webScenario = scenario === 'web-pending' || scenario === 'web-error';
async function run() {
  try {
    await cp(
      join(repository, 'tests/fixtures/dev-runtime/app'),
      join(root, 'app'),
      { recursive: true }
    );
    if (webScenario) {
      await appendFile(
        join(root, 'app/entry.client.tsx'),
        `\nglobalThis.__loadWebFixture = () => import('./web-only');`
      );
      await writeFile(
        join(root, 'app/web-only.ts'),
        `export const value = 'Web optional leaf';`
      );
    }
    if (scenario === 'ordinary-tla')
      await appendFile(
        join(root, 'app/entry.server.tsx'),
        `\nconst bootstrap = await import('node:path'); if (bootstrap.basename('/accepted/path') !== 'path') throw new Error('Nonlazy bootstrap failed');`
      );
    await writeFile(
      join(root, 'react-router.config.ts'),
      `export default { ssr: true, appDirectory: 'app', buildDirectory: 'build', serverModuleFormat: ${JSON.stringify(format)} };`
    );
    await writeFile(
      join(root, 'app/routes.ts'),
      `import { index, route } from '@react-router/dev/routes'; export default [index('routes/index.tsx'), route('catalog/:item', 'routes/catalog.tsx')];`
    );
    await writeFile(
      join(root, 'app/routes/index.tsx'),
      `export function loader() { return { value: 'index accepted' }; } export default function Index() { return <input aria-label="Retained text" />; }`
    );
    await mkdir(join(root, 'app/generated'));
    for (let index = 0; index < count; index++)
      await writeFile(
        join(root, `app/generated/optional-${index}.ts`),
        `export const value = 'Optional item ${index}';`
      );
    await writeFile(
      join(root, 'app/generated/registry.ts'),
      `export const optional = [${Array.from({ length: count }, (_, index) => `() => import('./optional-${index}')`).join(',')}];`
    );
    if (scenario === 'context')
      await writeFile(
        join(root, 'app/generated/registry.ts'),
        `export const optional = Array.from({ length: ${count} }, (_, index) => () => import(\`./optional-\${index}.ts\`));`
      );
    if (scenario === 'custom-loader') {
      await writeFile(
        join(root, 'app/generated/registry.ts'),
        `export { optional } from './registry.custom';`
      );
      await writeFile(
        join(root, 'app/generated/registry.custom'),
        `export const optional = [() => import('./optional-0')];`
      );
      await writeFile(
        join(root, 'custom-loader.cjs'),
        `module.exports = source => source;`
      );
    }
    if (scenario === 'dependency') {
      const dependency = join(root, 'node_modules/lazy-fixture-dependency');
      await mkdir(dependency, { recursive: true });
      await writeFile(
        join(dependency, 'package.json'),
        JSON.stringify({
          name: 'lazy-fixture-dependency',
          type: 'module',
          main: 'index.js',
        })
      );
      await writeFile(
        join(dependency, 'index.js'),
        `export const optional = [${Array.from({ length: count }, (_, index) => `() => import('../../app/generated/optional-${index}')`).join(',')}];`
      );
    }
    if (scenario === 'compile-error')
      await writeFile(
        join(root, 'app/generated/optional-1.ts'),
        `export const value = ;`
      );
    if (scenario === 'nested') {
      await writeFile(join(root, 'app/inner.ts'), `export const value = '1';`);
      await writeFile(
        join(root, 'app/generated/optional-1.ts'),
        `const inner = await import('../inner'); export const value = 'Optional item ' + inner.value;`
      );
    }
    const catalog =
      marker => `import { useLoaderData } from 'react-router'; import { optional } from '${scenario === 'dependency' ? 'lazy-fixture-dependency' : '../generated/registry'}';
if (import.meta.webpackHot) import.meta.webpackHot.addStatusHandler(status => { if (status === 'apply' && globalThis[${JSON.stringify(failureFlag)}]) return new Promise((_, reject) => setTimeout(() => reject(new Error('Application status hook failed')), 40)); });
if (import.meta.webpackHot) import.meta.webpackHot.addStatusHandler(status => { if (status === 'apply' && globalThis[${JSON.stringify(holdFlag)}]) return globalThis[${JSON.stringify(holdFlag)}](); });
${scenario === 'bootstrap' ? `const bootstrap = await import('../generated/optional-0');` : ''}
export async function loader({params}) { const result = await optional[Number(params.item)](); return { value: ${JSON.stringify(marker)} + result.value }; }
export default function Catalog() { const data = useLoaderData(); return <p>{data.value}</p>; }`;
    await writeFile(join(root, 'app/routes/catalog.tsx'), catalog(''));
    const logger = createLogger({ level: 'silent' });
    logger.error = message => {
      errors.push(String(message));
    };
    const rsbuild = await createRsbuild({
      cwd: root,
      config: {
        root,
        customLogger: logger,
        plugins: [
          pluginReactRouter({
            typegen: false,
            unstableServerLazyCompilation: true,
          }),
          pluginReact(),
          {
            name: 'observe-node-lazy-fixture',
            setup(api) {
              api.onBeforeStartDevServer(({ server: value }) => {
                server = value;
              });
              api.onAfterCreateCompiler(({ compiler }) => {
                const web = compiler.compilers.find(
                  child => child.name === 'web'
                );
                web.hooks.afterCompile.tapPromise(
                  'fixture-web-settlement',
                  async compilation => {
                    if (
                      !webScenario ||
                      !compilation.rebuildOrigin.causes.some(
                        event => event.cause.kind === 'lazy'
                      )
                    )
                      return;
                    webHeld = true;
                    await new Promise(resolve => {
                      releaseWeb = resolve;
                    });
                    if (scenario === 'web-error')
                      compilation.errors.push(
                        new Error('Web lazy compilation rejected')
                      );
                  }
                );
                const node = compiler.compilers.find(
                  child => child.name === 'node'
                );
                nodeCompiler = node;
                node.hooks.watchInvalidation.tap('fixture-origin', event => {
                  if (event.cause.kind === 'lazy') lazyInvalidations++;
                });
                node.hooks.afterEmit.tapPromise(
                  'fixture-overlap',
                  async compilation => {
                    if (
                      duringFirstActivation &&
                      compilation.rebuildOrigin.causes.some(
                        event => event.cause.kind === 'lazy'
                      )
                    ) {
                      const callback = duringFirstActivation;
                      duringFirstActivation = undefined;
                      callback();
                      await waitFor(
                        () => lazyInvalidations >= 2,
                        'second import during first emission'
                      );
                    }
                  }
                );
              });
              api.onAfterEnvironmentCompile(({ environment, stats }) => {
                if (environment.name === 'web' && stats) latestWeb = stats;
                if (environment.name === 'node' && stats) {
                  latestNode = stats;
                  nodeBuilds++;
                  origins.push(stats.compilation.rebuildOrigin);
                }
              });
            },
          },
        ],
        server: { host: '127.0.0.1', port: 0 },
        dev: {
          cliShortcuts: false,
          lazyCompilation: webScenario
            ? { entries: false, imports: true }
            : false,
        },
        tools: {
          rspack(config) {
            config.watchOptions = {
              ...config.watchOptions,
              aggregateTimeout: 10,
              poll: 50,
            };
            if (scenario === 'custom-loader')
              config.module.rules.push({
                test: /\.custom$/,
                type: 'javascript/auto',
                use: [join(root, 'custom-loader.cjs')],
              });
          },
        },
      },
    });
    const started = await within(rsbuild.startDevServer(), 'server startup');
    server = started.server;
    let build = await within(
      loadReactRouterServerBuild(server),
      'initial build'
    );
    const leaves = () =>
      [...latestNode.compilation.modules].filter(
        module =>
          /app\/generated\/optional-\d+\.ts$/.test(
            module.nameForCondition() ?? ''
          ) && !module.identifier().startsWith('lazy-compilation-proxy|')
      ).length;
    assert.equal(leaves(), 0, 'unused server leaves are deferred');
    const loader = build.routes['routes/catalog'].module.loader;
    let hdr = 0;
    if (webScenario) {
      const hot = server.environments.web.hot;
      const send = hot.send.bind(hot);
      hot.send = (type, data) => {
        if (type === 'custom' && data.event === 'react-router:hdr-update')
          hdr++;
        return send(type, data);
      };
      const modules = [...latestWeb.compilation.modules];
      const proxy = modules.find(module =>
        module.identifier().startsWith('lazy-compilation-proxy|')
      );
      const client = modules.find(module =>
        module.resource?.includes('/hot/lazy-compilation-web.js?')
      );
      assert.ok(proxy, 'Web lazy proxy is present');
      assert.ok(client, 'installed Web lazy client is present');
      const endpoint = decodeURIComponent(client.resource.split('?')[1]);
      const response = await fetch(
        new URL(
          endpoint,
          `http://127.0.0.1:${server.httpServer.address().port}`
        ),
        { method: 'POST', body: proxy.identifier() }
      );
      assert.equal(response.status, 200);
      await waitFor(() => webHeld, 'pending Web lazy compilation');
    }
    let simultaneous;
    let enteredApply = false;
    let finishHeldApply;
    if (scenario === 'during-apply')
      globalThis[holdFlag] = () => {
        enteredApply = true;
        return new Promise(resolve => {
          finishHeldApply = resolve;
        });
      };
    if (scenario === 'simultaneous')
      duringFirstActivation = () => {
        simultaneous = loader({
          params: { item: '2' },
          request: new Request('http://localhost/catalog/2'),
        });
      };
    const pending = loader({
      params: { item: '1' },
      request: new Request('http://localhost/catalog/1'),
    });
    void pending.catch(() => undefined);
    if (scenario === 'during-apply') {
      await waitFor(() => enteredApply, 'first asynchronous native apply');
      simultaneous = loader({
        params: { item: '2' },
        request: new Request('http://localhost/catalog/2'),
      });
      void simultaneous.catch(() => undefined);
      await waitFor(
        () => lazyInvalidations >= 2,
        'second demand during native apply'
      );
      delete globalThis[holdFlag];
      finishHeldApply();
    }
    if (webScenario) {
      let settled = false;
      void pending.then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        }
      );
      await waitFor(
        () => nodeBuilds > 1,
        'successful Node emission while Web is pending'
      );
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(
        settled,
        false,
        'an unsettled Web compilation retains the original Node import'
      );
      assert.equal(hdr, 0, 'pending lazy activation does not request HDR');
      releaseWeb();
      if (scenario === 'web-error') {
        await assert.rejects(
          within(pending, 'failed Web compilation'),
          /compilation failed/
        );
        assert.deepEqual(await build.routes['routes/index'].module.loader(), {
          value: 'index accepted',
        });
        assert.equal(hdr, 0, 'failed lazy activation does not request HDR');
        console.log(JSON.stringify({ format, scenario, result: 'passed' }));
        return;
      }
    }
    if (scenario === 'compile-error') {
      await assert.rejects(
        within(pending, 'failed lazy compilation'),
        /[Cc]ompil|[Bb]uild/
      );
      assert.deepEqual(await build.routes['routes/index'].module.loader(), {
        value: 'index accepted',
      });
      console.log(JSON.stringify({ format, scenario, result: 'passed' }));
      return;
    }
    assert.deepEqual(await within(pending, 'first lazy loader'), {
      value: 'Optional item 1',
    });
    if (webScenario)
      assert.equal(hdr, 0, 'settled lazy activation does not request HDR');
    assert.equal(
      leaves(),
      scenario === 'simultaneous' || scenario === 'during-apply' ? 2 : 1
    );
    if (simultaneous)
      assert.deepEqual(await within(simultaneous, 'overlapping lazy loader'), {
        value: 'Optional item 2',
      });
    if (scenario === 'reject') {
      globalThis[failureFlag] = true;
      await assert.rejects(
        within(
          loader({
            params: { item: '2' },
            request: new Request('http://localhost/catalog/2'),
          }),
          'rejected apply'
        ),
        /Application status hook failed/
      );
      delete globalThis[failureFlag];
      const restored = await within(
        loadReactRouterServerBuild(server),
        'recovered build'
      );
      assert.deepEqual(
        await within(
          restored.routes['routes/catalog'].module.loader({
            params: { item: '1' },
            request: new Request('http://localhost/catalog/1'),
          }),
          'previously activated last-good leaf'
        ),
        { value: 'Optional item 1' }
      );
      for (const item of ['2', '3'])
        await assert.rejects(
          within(
            restored.routes['routes/catalog'].module.loader({
              params: { item },
              request: new Request(`http://localhost/catalog/${item}`),
            }),
            'cold import after failed apply'
          ),
          /Edit a server source file/
        );
    }
    if (scenario === 'supersede') {
      let entered = false;
      let finishApply;
      globalThis[holdFlag] = () => {
        entered = true;
        return new Promise(resolve => {
          finishApply = resolve;
        });
      };
      const suspended = loader({
        params: { item: '2' },
        request: new Request('http://localhost/catalog/2'),
      });
      void suspended.catch(() => undefined);
      await waitFor(() => entered, 'native apply before source edit');
      await writeFile(
        join(root, 'app/routes/catalog.tsx'),
        catalog('superseded ')
      );
      await assert.rejects(within(suspended, 'superseded import'), /supersed/i);
      await waitFor(
        async () =>
          (await loadReactRouterServerBuild(server)).routes['routes/catalog']
            .module.loader !== loader,
        'new source publication during apply'
      );
      delete globalThis[holdFlag];
      finishApply();
      const next = await loadReactRouterServerBuild(server);
      assert.deepEqual(
        await within(
          next.routes['routes/catalog'].module.loader({
            params: { item: '1' },
            request: new Request('http://localhost/catalog/1'),
          }),
          'new source after superseded apply'
        ),
        { value: 'superseded Optional item 1' }
      );
      console.log(JSON.stringify({ format, scenario, result: 'passed' }));
      return;
    }
    if (scenario === 'shutdown') {
      let entered = false;
      globalThis[holdFlag] = () => {
        entered = true;
        return new Promise(() => {});
      };
      const pendingClose = loader({
        params: { item: '2' },
        request: new Request('http://localhost/catalog/2'),
      });
      void pendingClose.catch(() => undefined);
      await waitFor(() => entered, 'native asynchronous apply');
      await within(server.close(), 'shutdown during native apply');
      await assert.rejects(pendingClose, /clos|stop/i);
      assert.deepEqual(
        await readdir(join(root, 'node_modules/.cache/react-router/runtimes')),
        [],
        'shutdown awaits artifact cleanup'
      );
      console.log(JSON.stringify({ format, scenario, result: 'passed' }));
      return;
    }
    if (scenario === 'unknown') {
      duringFirstActivation = () => nodeCompiler.watching.invalidate();
      lazyInvalidations = 1;
      const pendingUnknown = loader({
        params: { item: '2' },
        request: new Request('http://localhost/catalog/2'),
      });
      void pendingUnknown.catch(() => undefined);
      await assert.rejects(
        within(pendingUnknown, 'manual invalidation'),
        /invalidat|supersed/i
      );
      assert.deepEqual(await build.routes['routes/index'].module.loader(), {
        value: 'index accepted',
      });
      console.log(JSON.stringify({ format, scenario, result: 'passed' }));
      return;
    }
    if (scenario !== 'reject')
      assert.deepEqual(
        await within(
          loader({
            params: { item: '2' },
            request: new Request('http://localhost/catalog/2'),
          }),
          'second lazy loader'
        ),
        { value: 'Optional item 2' }
      );
    assert.equal(leaves(), 2);
    const currentLoader = (await loadReactRouterServerBuild(server)).routes[
      'routes/catalog'
    ].module.loader;
    assert.deepEqual(
      await within(
        currentLoader({
          params: { item: '1' },
          request: new Request('http://localhost/catalog/1'),
        }),
        'repeated lazy loader'
      ),
      { value: 'Optional item 1' }
    );
    const response = await within(
      createRequestHandler(
        await loadReactRouterServerBuild(server),
        'development'
      )(new Request('http://localhost/catalog/1')),
      'public SSR request'
    );
    assert.match(await response.text(), /Optional item 1/);
    if (scenario === 'source-error') {
      const beforeFailure = errors.length;
      await writeFile(
        join(root, 'app/routes/catalog.tsx'),
        catalog('') + `\nthrow new Error('Rejected source evaluation');`
      );
      await waitFor(
        () => errors.length > beforeFailure,
        'source evaluation failure'
      );
      assert.match(
        errors.slice(beforeFailure).join('\n'),
        /Rejected source evaluation/
      );
      const accepted = await loadReactRouterServerBuild(server);
      assert.deepEqual(
        await within(
          accepted.routes['routes/catalog'].module.loader({
            params: { item: '1' },
            request: new Request('http://localhost/catalog/1'),
          }),
          'last accepted source'
        ),
        { value: 'Optional item 1' }
      );
      errors.splice(beforeFailure);
    }
    const beforeEdit = nodeBuilds;
    await writeFile(join(root, 'app/routes/catalog.tsx'), catalog('edited '));
    await waitFor(() => nodeBuilds > beforeEdit, 'source compile');
    await waitFor(
      () =>
        errors.length > 0 ||
        latestNode.compilation.rebuildOrigin?.causes.some(
          event => event.cause.kind === 'source'
        ),
      'source origin'
    );
    await waitFor(
      () => nodeBuilds > beforeEdit && !latestNode.hasErrors(),
      'successful source compile'
    );
    await waitFor(
      async () =>
        (await loadReactRouterServerBuild(server)).routes['routes/catalog']
          .module.loader !== currentLoader,
      'source publication'
    );
    build = await loadReactRouterServerBuild(server);
    assert.deepEqual(
      await within(
        build.routes['routes/catalog'].module.loader({
          params: { item: '1' },
          request: new Request('http://localhost/catalog/1'),
        }),
        'edited loader'
      ),
      { value: 'edited Optional item 1' }
    );
    if (scenario === 'reject') {
      assert.deepEqual(
        await within(
          build.routes['routes/catalog'].module.loader({
            params: { item: '3' },
            request: new Request('http://localhost/catalog/3'),
          }),
          'fresh cold import after source recovery'
        ),
        { value: 'edited Optional item 3' }
      );
    }
    assert.equal(
      errors.filter(
        error =>
          scenario !== 'reject' ||
          !error.includes('Application status hook failed')
      ).length,
      0,
      errors.join('\n')
    );
    console.log(
      JSON.stringify({
        format,
        count,
        scenario,
        leaves: leaves(),
        nodeBuilds,
        origins: origins.map(origin => ({
          hash: origin?.throughRevision,
          causes: origin?.causes.map(event => event.cause.kind),
          consumed: origin?.consumedLazyKeys.length,
        })),
        result: 'passed',
      })
    );
  } catch (error) {
    if (
      (scenario === 'bootstrap' &&
        /cannot activate before initial publication/.test(error.message)) ||
      (scenario === 'custom-loader' &&
        /unwrapped import\(\).*registry\.custom/.test(
          error.message + errors.join('\n')
        ))
    ) {
      console.log(
        JSON.stringify({
          format,
          count,
          scenario,
          error: error.message,
          result: 'passed',
        })
      );
    } else {
      console.error(
        JSON.stringify({
          root,
          format,
          scenario,
          errors,
          nodeBuilds,
          origins,
          error: error.stack,
        })
      );
      throw error;
    }
  } finally {
    delete globalThis[failureFlag];
    delete globalThis[holdFlag];
    await server?.close();
    if (!process.env.KEEP_NODE_LAZY_FIXTURE)
      await rm(root, { recursive: true, force: true });
  }
}
await run();
