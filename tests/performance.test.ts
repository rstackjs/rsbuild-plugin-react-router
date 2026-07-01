import { describe, expect, it } from '@rstest/core';
import { createReactRouterPerformanceProfiler } from '../src/performance';

const parsePerformanceReport = (message: string) => {
  const prefix = '[react-router:performance] ';
  expect(message.startsWith(prefix)).toBe(true);
  return JSON.parse(message.slice(prefix.length));
};

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

    const report = parsePerformanceReport(logs[0]);
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
    const secondReport = parsePerformanceReport(logs[1]);
    expect(secondReport.operations['route:client-entry'].count).toBe(1);
    expect(secondReport.operations['manifest:stage']).toBeUndefined();
  });

  it('reports interval-union wall time without changing summed timing fields', async () => {
    const logs: string[] = [];
    const originalNow = performance.now;
    let now = 0;
    let resolveFirst: (value: string) => void = () => {};
    let resolveSecond: (value: string) => void = () => {};
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });

    try {
      performance.now = () => now;

      const first = profiler.record('web', 'route:module', 'app/routes/a.tsx', () => {
        return new Promise<string>(resolve => {
          resolveFirst = resolve;
        });
      });

      now = 10;
      const second = profiler.record('web', 'route:module', 'app/routes/b.tsx', () => {
        return new Promise<string>(resolve => {
          resolveSecond = resolve;
        });
      });

      now = 25;
      resolveSecond('second');
      await second;

      now = 40;
      resolveFirst('first');
      await first;

      profiler.flush('web');

      const report = parsePerformanceReport(logs[0]);
      expect(report.operations['route:module']).toMatchObject({
        count: 2,
        totalMs: 55,
        wallMs: 40,
        maxMs: 40,
      });
      expect(report.operations['route:module'].slowest).toEqual([
        { durationMs: 40, resource: 'app/routes/a.tsx' },
        { durationMs: 15, resource: 'app/routes/b.tsx' },
      ]);
    } finally {
      performance.now = originalNow;
    }
  });

  it('keeps only the five slowest operation entries in descending order', () => {
    const logs: string[] = [];
    const originalNow = performance.now;
    const times = [
      0, 3, 3, 12, 12, 14, 14, 20, 20, 21, 21, 29, 29, 33,
    ];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });

    try {
      performance.now = () => {
        const time = times.shift();
        if (time === undefined) {
          throw new Error('unexpected timer read');
        }
        return time;
      };

      for (const resource of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        profiler.recordSync('web', 'route:module', resource, () => resource);
      }
      profiler.flush('web');

      const report = parsePerformanceReport(logs[0]);
      expect(report.operations['route:module'].slowest).toEqual([
        { durationMs: 9, resource: 'b' },
        { durationMs: 8, resource: 'f' },
        { durationMs: 6, resource: 'd' },
        { durationMs: 4, resource: 'g' },
        { durationMs: 3, resource: 'a' },
      ]);
    } finally {
      performance.now = originalNow;
    }
  });

  it('rounds reported operation timings when flushing', () => {
    const logs: string[] = [];
    const originalNow = performance.now;
    const times = [0, 1.04, 1.04, 1.16];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });

    try {
      performance.now = () => {
        const time = times.shift();
        if (time === undefined) {
          throw new Error('unexpected timer read');
        }
        return time;
      };

      profiler.recordSync('web', 'route:module', 'app/routes/a.tsx', () => {});
      profiler.recordSync('web', 'route:module', 'app/routes/b.tsx', () => {});
      profiler.flush('web');

      const report = parsePerformanceReport(logs[0]);
      expect(report.operations['route:module']).toMatchObject({
        totalMs: 1.2,
        wallMs: 1.2,
        maxMs: 1,
      });
      expect(report.operations['route:module'].slowest).toEqual([
        { durationMs: 1, resource: 'app/routes/a.tsx' },
        { durationMs: 0.1, resource: 'app/routes/b.tsx' },
      ]);
    } finally {
      performance.now = originalNow;
    }
  });

  it('records async operations without Promise finally overhead', async () => {
    const logs: string[] = [];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });
    const operation = Promise.resolve('route-module');
    operation.finally = () => {
      throw new Error('profiler should avoid Promise.prototype.finally');
    };

    await expect(
      profiler.record('web', 'route:module', 'app/routes/a.tsx', () => {
        return operation;
      })
    ).resolves.toBe('route-module');
    profiler.flush('web');

    const report = parsePerformanceReport(logs[0]);
    expect(report.operations['route:module'].count).toBe(1);
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

  it('returns a rejected promise for synchronous record failures when disabled', async () => {
    const profiler = createReactRouterPerformanceProfiler({
      enabled: false,
      log: () => {},
    });

    await expect(
      profiler.record('web', 'route:module', 'app/routes/a.tsx', () => {
        throw new Error('sync failure');
      })
    ).rejects.toThrow('sync failure');
  });

  it('flushes timings recorded before an environment is known', async () => {
    const logs: string[] = [];
    const profiler = createReactRouterPerformanceProfiler({
      enabled: true,
      log: message => logs.push(message),
    });

    await profiler.record(
      undefined,
      'route:module',
      'app/routes/a.tsx',
      async () => 'route-module'
    );
    profiler.flush(undefined);

    expect(logs).toHaveLength(1);
    const report = parsePerformanceReport(logs[0]);
    expect(report.environment).toBe('unknown');
    expect(report.operations['route:module'].count).toBe(1);
  });
});
