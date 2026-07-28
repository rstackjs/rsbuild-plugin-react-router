import { describe, expect, it } from '@rstest/core';
import { summarizePluginOperations } from '../scripts/benchmark/results.mts';

describe('benchmark plugin result summaries', () => {
  it('retains attribution for partial reports from distinct loader workers', () => {
    const [operation] = summarizePluginOperations([
      {
        pluginReports: [
          {
            environment: 'web',
            partial: true,
            workerId: 'process-1:thread-1',
            operations: {
              'route:module': {
                count: 2,
                totalMs: 10,
                wallMs: 8,
                maxMs: 6,
              },
            },
          },
          {
            environment: 'web',
            partial: true,
            workerId: 'process-1:thread-2',
            operations: {
              'route:module': {
                count: 3,
                totalMs: 12,
                wallMs: 9,
                maxMs: 5,
              },
            },
          },
        ],
      },
    ]);

    expect(operation).toMatchObject({
      environment: 'web',
      operation: 'route:module',
      count: 5,
      reports: 2,
      partialReports: 2,
      workers: 2,
      wallMs: null,
    });
  });
});
