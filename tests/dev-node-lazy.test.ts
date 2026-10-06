import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Rspack } from '@rsbuild/core';
import { expect, it, rstest } from '@rstest/core';
import { createDevNodeLazyOwner } from '../src/dev-node-lazy';
import type {
  NodeLazyBridge,
  NodeLazyHotRuntime,
} from '../src/dev-node-lazy-protocol';
import type { ReactRouterServerBuilds } from '../src/dev-runtime-artifacts';
import type { RebuildOrigin } from '../src/dev-node-lazy';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), 'router-lazy-owner-'));
  const key = randomUUID();
  let bridge!: NodeLazyBridge;
  let target = 'initial';
  let apply = async () => undefined;
  const updates: string[] = [];
  Reflect.set(globalThis, key, {
    create(initial: string): NodeLazyHotRuntime {
      let hash = initial;
      return {
        hash: () => hash,
        check: async () => ['proxy'],
        async apply() {
          await apply();
          hash = target;
          updates.push(hash);
          return ['proxy'];
        },
      };
    },
    bind(value: NodeLazyBridge) {
      bridge = value;
    },
  });
  const owner = createDevNodeLazyOwner(['index']);
  const compile = (
    hash: string,
    revision: number,
    active: boolean,
    source = 'accepted',
    causes: RebuildOrigin['causes'] = [
      {
        watchId: 'watch',
        revision,
        cause: active
          ? { kind: 'lazy', keys: ['opaque-key'] }
          : { kind: 'initial' },
      },
    ]
  ) => {
    const entry = { identifier: () => 'entry' };
    const proxy = { identifier: () => 'opaque-key' };
    const leaf = { identifier: () => 'leaf' };
    const modules = [entry, proxy, ...(active ? [leaf] : [])];
    const code = `const control = globalThis[${JSON.stringify(key)}]; const bridge = require('./__react_router_node_lazy.cjs').register(control.create(${JSON.stringify(hash)})); control.bind(bridge);
module.exports = { entry: { module: { default: () => new Response() } }, routes: { index: { module: { loader: () => ${JSON.stringify(source)} } } }, assets: {}, assetsBuildDirectory: '', basename: '/', future: {}, isSpaMode: false, prerender: [], publicPath: '/', ssr: true };`;
    return {
      hash,
      compiler: { context: root },
      outputOptions: { module: false },
      rebuildOrigin: {
        watchId: 'watch',
        throughRevision: revision,
        causes,
        consumedLazyKeys: active ? ['opaque-key'] : [],
      },
      modules,
      entrypoints: new Map([
        [
          'index',
          { getEntrypointChunk: () => ({ files: new Set(['index.js']) }) },
        ],
      ]),
      getAsset: () => ({ info: {} }),
      getAssets: () => [
        { name: 'index.js', source: { buffer: () => Buffer.from(code) } },
      ],
      chunkGraph: {
        getModuleChunksIterable: () => [{ runtime: new Set(['index']) }],
        getModuleHash: (module: typeof entry) =>
          module === proxy
            ? String(active)
            : module.identifier() + (module === entry ? source : ''),
        getModuleId: (module: typeof entry) =>
          module === proxy ? 'proxy' : module.identifier(),
      },
      moduleGraph: {
        getOutgoingConnections: (module: typeof entry) =>
          module === entry
            ? [{ module: proxy }]
            : module === proxy && active
              ? [{ module: leaf, dependency: { type: 'lazy import()' } }]
              : [],
      },
    } as unknown as Rspack.Compilation;
  };
  const initial = compile('initial', 1, false);
  owner.capture(initial);
  let published!: ReactRouterServerBuilds;
  const publish = (builds: ReactRouterServerBuilds) => {
    published = builds;
    return true;
  };
  await owner.evaluateAndPublish(
    { compilation: initial, isCurrent: () => true, recover: publish },
    publish
  );
  return {
    owner,
    compile,
    publish,
    get published() {
      return published;
    },
    get bridge() {
      return bridge;
    },
    updates,
    setApply(hash: string, callback: () => Promise<void>) {
      target = hash;
      apply = callback;
    },
    async close() {
      await owner.close(new Error('closed'));
      Reflect.deleteProperty(globalThis, key);
      await rm(root, { recursive: true, force: true });
    },
  };
};

it('holds the application promise until publication and rejects delayed hot-apply failure', async () => {
  const test = await fixture();
  const fetch = rstest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response());
  try {
    const native = deferred<string>();
    const status = deferred<void>();
    const applied = deferred<void>();
    const pending = test.bridge.gate(native.promise);
    test.bridge.demand(
      { active: false, data: 'opaque-key', onError() {} },
      'http://localhost/lazy'
    );
    const compilation = test.compile('activation', 2, true);
    test.owner.capture(compilation);
    test.setApply('activation', async () => {
      native.resolve('too early');
      applied.resolve();
      await status.promise;
    });
    const evaluation = test.owner.evaluateAndPublish(
      { compilation, isCurrent: () => true, recover: test.publish },
      test.publish
    );
    await applied.promise;
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );
    await Promise.resolve();
    expect(settled).toBe(false);
    status.reject(new Error('Application status hook failed'));
    await expect(pending).rejects.toThrow('Application status hook failed');
    await expect(evaluation).rejects.toThrow('Application status hook failed');
    const loader = test.published.index.routes.index.module
      .loader as () => string;
    expect(loader()).toBe('accepted');
  } finally {
    fetch.mockRestore();
    await test.close();
  }
});

it('publishes before resolving the retained application promise', async () => {
  const test = await fixture();
  const fetch = rstest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response());
  try {
    const native = deferred<string>();
    const pending = test.bridge.gate(native.promise);
    test.bridge.demand(
      { active: false, data: 'opaque-key', onError() {} },
      'http://localhost/lazy'
    );
    const compilation = test.compile('activation', 2, true);
    test.owner.capture(compilation);
    const events: string[] = [];
    test.setApply('activation', async () => {
      native.resolve('leaf accepted');
    });
    const observed = pending.then(value => {
      events.push(value);
    });
    await test.owner.evaluateAndPublish(
      { compilation, isCurrent: () => true, recover: test.publish },
      builds => {
        events.push('published');
        return test.publish(builds);
      }
    );
    await observed;
    expect(events).toEqual(['published', 'leaf accepted']);
    expect(test.updates).toEqual(['activation']);
  } finally {
    fetch.mockRestore();
    await test.close();
  }
});

it('restores accepted artifacts when Web fails after a superseded lazy apply settles', async () => {
  const test = await fixture();
  const fetch = rstest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response());
  try {
    const native = deferred<string>();
    const pending = test.bridge.gate(native.promise);
    test.bridge.demand(
      { active: false, data: 'opaque-key', onError() {} },
      'http://localhost/lazy'
    );
    const compilation = test.compile('activation', 2, true);
    test.owner.capture(compilation);
    test.setApply('activation', async () => {
      native.resolve('unpublished leaf');
    });
    expect(
      await test.owner.evaluateAndPublish(
        { compilation, isCurrent: () => false, recover: test.publish },
        test.publish
      )
    ).toBe(false);
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );
    await Promise.resolve();
    expect(settled).toBe(false);
    test.owner.fail(new Error('Web compilation failed'));
    await expect(pending).rejects.toThrow('Web compilation failed');
    await test.owner.ready();
    const loader = test.published.index.routes.index.module
      .loader as () => string;
    expect(loader()).toBe('accepted');
  } finally {
    fetch.mockRestore();
    await test.close();
  }
});

it('rejects unknown origins and shutdown without exposing a lazy result', async () => {
  const test = await fixture();
  const fetch = rstest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response());
  try {
    const native = deferred<string>();
    const pending = test.bridge.gate(native.promise);
    test.bridge.demand(
      { active: false, data: 'opaque-key', onError() {} },
      'http://localhost/lazy'
    );
    const compilation = test.compile('activation', 2, true, 'accepted', [
      { watchId: 'watch', revision: 2, cause: { kind: 'unknown' } },
    ]);
    test.owner.capture(compilation);
    expect(await test.owner.isActivation(compilation)).toBe(false);
    test.owner.close(new Error('Server closed'));
    await expect(pending).rejects.toThrow('Server closed');
    const loader = test.published.index.routes.index.module
      .loader as () => string;
    expect(loader()).toBe('accepted');
  } finally {
    fetch.mockRestore();
    await test.close();
  }
});

it('does not replace a newer source generation when a superseded hot apply fails', async () => {
  const test = await fixture();
  const fetch = rstest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response());
  try {
    const native = deferred<string>();
    const status = deferred<void>();
    const applying = deferred<void>();
    let current = true;
    const pending = test.bridge.gate(native.promise);
    test.bridge.demand(
      { active: false, data: 'opaque-key', onError() {} },
      'http://localhost/lazy'
    );
    const activation = test.compile('activation', 2, true);
    test.owner.capture(activation);
    test.setApply('activation', async () => {
      applying.resolve();
      await status.promise;
    });
    const first = test.owner.evaluateAndPublish(
      {
        compilation: activation,
        isCurrent: () => current,
        recover: test.publish,
      },
      test.publish
    );
    await applying.promise;
    current = false;
    const source = test.compile('source', 3, false, 'new source', [
      {
        watchId: 'watch',
        revision: 3,
        cause: { kind: 'source', changed: ['/app/route.ts'], removed: [] },
      },
    ]);
    test.owner.capture(source);
    await test.owner.evaluateAndPublish(
      { compilation: source, isCurrent: () => true, recover: test.publish },
      test.publish
    );
    status.resolve();
    await expect(first).rejects.toThrow('superseded');
    await expect(pending).rejects.toThrow('superseded');
    const loader = test.published.index.routes.index.module
      .loader as () => string;
    expect(loader()).toBe('new source');
  } finally {
    fetch.mockRestore();
    await test.close();
  }
});
