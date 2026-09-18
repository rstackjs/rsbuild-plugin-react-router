import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import {
  generateDevHmrRuntimeModule,
  resolveReactRefreshRuntimePath,
} from '../src/dev-hmr';
import { DEV_HDR_UPDATE_EVENT } from '../src/dev-hdr-channel';

const createRuntime = () => {
  rstest.useFakeTimers();
  const listeners = new Map<string, (data: unknown) => void>();
  let status = 'idle';
  const revalidate = rstest.fn(async () => {});
  const router = { revalidate };
  const window = {
    __reactRouterDataRouter: router as typeof router | undefined,
    __reactRouterRouteModules: {},
    __reactRouterManifest: { routes: {} as Record<string, object> },
    __reactRouterContext: {},
  };
  const code = generateDevHmrRuntimeModule({
    reactRefreshRuntimePath: 'react-refresh/runtime',
  })
    .replace(/^import .*;$/m, '')
    .replaceAll('import.meta.webpackHot', 'hot')
    .replaceAll('export function ', 'function ');
  const updateRoute = new Function(
    'window',
    'hot',
    '__refreshRuntimeModule',
    'setTimeout',
    'clearTimeout',
    code + '\nreturn scheduleReactRouterRouteUpdate;'
  )(
    window,
    {
      on: (event: string, listener: (data: unknown) => void) =>
        listeners.set(event, listener),
      status: () => status,
    },
    { performReactRefresh: rstest.fn() },
    setTimeout,
    clearTimeout
  );
  return {
    window,
    router,
    revalidate,
    updateComponent: () => {
      window.__reactRouterManifest.routes.component = {};
      updateRoute('component', {}, () => ({ default: () => null }));
    },
    receive: (revision: number, sessionId = 'first') =>
      listeners.get(DEV_HDR_UPDATE_EVENT)!({ sessionId, revision }),
    setStatus: (next: string) => {
      status = next;
    },
    flush: () => rstest.advanceTimersByTimeAsync(16),
  };
};

afterEach(() => rstest.useRealTimers());

describe('HDR custom events', () => {
  for (const timing of ['same batch', 'after component update']) {
    it(`does not lose coalesced server revisions ${timing}`, async () => {
      const runtime = createRuntime();
      runtime.updateComponent();
      if (timing === 'after component update') await runtime.flush();
      // A reconnect can replay just the latest of a component edit and a
      // subsequent server-only edit; the component must not consume both.
      runtime.receive(2);
      await runtime.flush();
      expect(runtime.revalidate).toHaveBeenCalledTimes(1);
    });
  }

  it('revalidates once for duplicate or older revisions', async () => {
    const runtime = createRuntime();
    runtime.receive(2);
    await runtime.flush();
    runtime.receive(2);
    runtime.receive(1);
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(1);
    runtime.receive(3);
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(2);
  });

  it('retains a revision received before hydration creates the router', async () => {
    const runtime = createRuntime();
    runtime.window.__reactRouterDataRouter = undefined;
    runtime.receive(1);
    await runtime.flush();
    expect(runtime.revalidate).not.toHaveBeenCalled();
    runtime.window.__reactRouterDataRouter = runtime.router;
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(1);
  });

  it('waits until the browser hot update is idle', async () => {
    const runtime = createRuntime();
    runtime.setStatus('apply');
    runtime.receive(1);
    await runtime.flush();
    expect(runtime.revalidate).not.toHaveBeenCalled();
    runtime.setStatus('idle');
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(1);
  });

  it('accepts a replacement session and ignores late events from its predecessor', async () => {
    const runtime = createRuntime();
    runtime.receive(10);
    await runtime.flush();
    runtime.receive(1, 'replacement');
    await runtime.flush();
    runtime.receive(11);
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(2);
  });

  it('retains a newer revision received during an in-flight revalidation', async () => {
    const runtime = createRuntime();
    let complete!: () => void;
    runtime.revalidate.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          complete = resolve;
        })
    );
    runtime.receive(1);
    await runtime.flush();
    runtime.receive(2);
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(1);
    complete();
    await runtime.flush();
    expect(runtime.revalidate).toHaveBeenCalledTimes(2);
  });
});

describe('resolveReactRefreshRuntimePath', () => {
  it('returns undefined for a directory with no @rsbuild/plugin-react', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-dev-hmr-no-plugin-'));
    try {
      expect(resolveReactRefreshRuntimePath(root)).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
