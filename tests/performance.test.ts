import { describe, expect, it } from '@rstest/core';
import { createReactRouterPerformanceProfiler } from '../src/performance';

describe('React Router performance profiler', () => {
  it('aggregates operation timings by environment and logs structured JSON', async () => {
    const logs: string[] = [];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });

    await profiler.record('web', 'route:client-entry', 'app/routes/a.tsx', async () => {
      return 'client-entry';
    });
    await profiler.record('web', 'route:client-entry', 'app/routes/b.tsx', async () => {
      return 'client-entry';
    });
    await profiler.record('node', 'route:module', 'app/routes/a.tsx', async () => {
      return 'route-module';
    });
    profiler.recordSync('web', 'manifest:stage', 'virtual/react-router/browser-manifest', () => {
      return 'manifest';
    });

    profiler.flush('web', { compilerLifecycleMs: 123.4 });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('[react-router:performance]');

    const report = JSON.parse(logs[0].replace(/^.*?\{/, '{'));
    expect(report.environment).toBe('web');
    expect(report.compilerLifecycleMs).toBe(123.4);
    expect(report.operations['route:client-entry'].count).toBe(2);
    expect(report.operations['route:client-entry'].slowest).toHaveLength(2);
    expect(report.operations['manifest:stage'].count).toBe(1);
    expect(report.operations['route:module']).toBeUndefined();

    await profiler.record('web', 'route:client-entry', 'app/routes/c.tsx', async () => {
      return 'client-entry';
    });
    profiler.flush('web');

    expect(logs).toHaveLength(2);
    const secondReport = JSON.parse(logs[1].replace(/^.*?\{/, '{'));
    expect(secondReport.operations['route:client-entry'].count).toBe(1);
    expect(secondReport.operations['manifest:stage']).toBeUndefined();
  });

  it('does not evaluate timers or log output when disabled', async () => {
    const logs: string[] = [];
    const originalNow = performance.now;
    const nowCalls: string[] = [];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: false,
      log: message => logs.push(message),
    });

    try {
      performance.now = () => {
        nowCalls.push('now');
        throw new Error('disabled profiler should not read timers');
      };

      const asyncResult = await profiler.record(
        'web',
        'route:module',
        'app/routes/a.tsx',
        async () => 'unchanged'
      );
      const syncResult = profiler.recordSync(
        'web',
        'manifest:stage',
        'virtual/react-router/browser-manifest',
        () => 'sync-unchanged'
      );
      profiler.flush('web');

      expect(asyncResult).toBe('unchanged');
      expect(syncResult).toBe('sync-unchanged');
      expect(nowCalls).toEqual([]);
      expect(logs).toEqual([]);
    } finally {
      performance.now = originalNow;
    }
  });
});
