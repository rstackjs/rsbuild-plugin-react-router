import { describe, expect, it, rstest } from '@rstest/core';
import { getFixtureWorkspaceNodeModulesPath } from './react-router-framework/integration/helpers/fixture-workspace-dependencies.js';
import {
  assertResourceGuardrail,
  countFrameworkTestResources,
  filterFrameworkTestProcesses,
  getFrameworkCacheEnv,
  killProcessGroup,
  resolveFrameworkInstallLimit,
  resolveFrameworkWorkerLimit,
  withFrameworkTestRunEnv,
} from './react-router-framework/integration/helpers/test-resource-guard.js';

describe('React Router framework test resource guard', () => {
  it('caps requested Playwright workers', () => {
    expect(
      resolveFrameworkWorkerLimit({
        argv: ['playwright', 'test', '--workers=64'],
        cpuCount: 64,
        env: {},
      })
    ).toEqual({ cap: 6, requested: 64, workers: 6 });
  });

  it('lets the environment lower or raise the worker cap explicitly', () => {
    expect(
      resolveFrameworkWorkerLimit({
        argv: ['playwright', 'test'],
        cpuCount: 64,
        env: { RR_FRAMEWORK_MAX_WORKERS: '4' },
      })
    ).toEqual({ cap: 4, requested: undefined, workers: 4 });
  });

  it('lets the environment set the install cap explicitly', () => {
    expect(resolveFrameworkInstallLimit({ RR_FRAMEWORK_MAX_INSTALLS: '1' })).toBe(1);
  });

  it('disallows per-fixture pnpm installs by default', () => {
    expect(resolveFrameworkInstallLimit({})).toBe(0);
  });

  it('counts scoped worker, browser, and pnpm install processes', () => {
    expect(
      countFrameworkTestResources(
        [
          { pid: 1, args: 'node playwright/lib/worker/workerProcessEntry.js' },
          { pid: 2, args: 'chrome-headless-shell --playwright' },
          { pid: 3, args: 'pnpm install --frozen-lockfile' },
          { pid: 4, args: 'pnpm test:react-router-framework' },
        ],
        { isOwnedPid: (pid: number) => pid !== 4 }
      )
    ).toEqual({ browsers: 1, installs: 1, workers: 1 });
  });

  it('reuses package and browser caches across child processes', () => {
    const cacheEnv = getFrameworkCacheEnv('/repo');
    expect(cacheEnv.APPORT_DISABLE).toBe('1');
    expect(cacheEnv.PLAYWRIGHT_BROWSERS_PATH).toBe('/repo/node_modules/.cache/ms-playwright');
    expect(cacheEnv.PNPM_HOME).toBe('/repo/node_modules/.cache/pnpm-home');
    expect(cacheEnv.PNPM_STORE_DIR).toBe('/repo/node_modules/.pnpm-store');
    expect(withFrameworkTestRunEnv({ ...cacheEnv })).toMatchObject(cacheEnv);
  });

  it('kills child process groups on non-Windows platforms', () => {
    const kill = rstest
      .spyOn(process, 'kill')
      .mockImplementation((() => true) as typeof process.kill);

    try {
      killProcessGroup({ pid: 123 });
      expect(kill).toHaveBeenCalledWith(process.platform === 'win32' ? 123 : -123, 'SIGTERM');
      if (process.platform !== 'win32') {
        expect(kill).toHaveBeenCalledWith(123, 'SIGTERM');
      }
    } finally {
      kill.mockRestore();
    }
  });

  it('fails fast when active scoped resources exceed guardrails', () => {
    expect(() =>
      assertResourceGuardrail({
        counts: { browsers: 13, installs: 1, workers: 7 },
        env: { RR_FRAMEWORK_MAX_WORKERS: '6' },
      })
    ).toThrow(
      'Refusing to continue runaway React Router framework test load: workers=7/6, browsers=13/12, installs=1/0.'
    );
  });

  it('does not treat unrelated Playwright browser processes as cleanup candidates', () => {
    expect(
      filterFrameworkTestProcesses(
        [{ pid: 1, args: 'chrome-headless-shell --playwright' }],
        { isOwnedPid: () => false, runId: 'this-run' }
      )
    ).toEqual([]);
  });

  it('keeps cleanup candidates scoped to the current run', () => {
    const processes = [
      { pid: 1, args: 'node server.js' },
      { pid: 2, args: 'chrome-headless-shell --playwright' },
      {
        pid: 3,
        args: '/tests/react-router-framework/.tmp/integration/rr-test/node server.js',
      },
      { pid: 4, args: 'node server.js --run this-run' },
    ];

    expect(
      filterFrameworkTestProcesses(processes, {
        isOwnedPid: (pid: number) => pid === 2,
        runId: 'this-run',
      }).map(({ pid }: { pid: number }) => pid)
    ).toEqual([2, 4]);
  });

  it('resolves fixture dependencies from committed workspace templates', () => {
    expect(getFixtureWorkspaceNodeModulesPath('rsbuild-template')).toMatch(
      /tests\/react-router-framework\/integration\/helpers\/rsbuild-template\/node_modules$/
    );
  });
});
