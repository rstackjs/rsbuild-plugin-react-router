import { describe, expect, it } from '@rstest/core';
import { classifyBenchmarkSignal } from '../scripts/benchmark/statistics.mjs';
import { createBenchmarkReport } from '../scripts/benchmark/ci-report-model.mjs';
import { renderBenchmarkComment } from '../scripts/benchmark/ci-report-markdown.mjs';

describe('benchmark signal classification', () => {
  it('treats identical zero-variance samples as inconclusive', () => {
    expect(
      classifyBenchmarkSignal([100, 100, 100, 100, 100], [100, 100, 100, 100, 100])
    ).toMatchObject({
      deltaPercent: 0,
      baseRelativeMadPercent: 0,
      headRelativeMadPercent: 0,
      noiseBandPercent: 2,
      classification: 'inconclusive',
    });
  });

  it('does not call a delta outside noisy samples a regression', () => {
    const result = classifyBenchmarkSignal(
      [90, 95, 100, 105, 110],
      [100, 105, 110, 115, 120]
    );

    expect(result.deltaPercent).toBe(10);
    expect(result.noiseBandPercent).toBeGreaterThan(10);
    expect(result.classification).toBe('inconclusive');
  });

  it('classifies a clear stable regression', () => {
    const result = classifyBenchmarkSignal(
      [99, 100, 101, 100, 100],
      [119, 120, 121, 120, 120]
    );

    expect(result.deltaPercent).toBe(20);
    expect(result.noiseBandPercent).toBeLessThan(20);
    expect(result.classification).toBe('regression');
  });

  it('classifies a clear stable improvement', () => {
    const result = classifyBenchmarkSignal(
      [119, 120, 121, 120, 120],
      [99, 100, 101, 100, 100]
    );

    expect(result.deltaPercent).toBeCloseTo(-16.6666667);
    expect(result.noiseBandPercent).toBeLessThan(16);
    expect(result.classification).toBe('improvement');
  });

  it.each([
    { base: [], head: [100, 100, 100] },
    { base: [100, 100], head: [110, 110] },
    { base: [100, Number.NaN, 100], head: [110, 110, 110] },
  ])('requires at least three finite samples on each side', ({ base, head }) => {
    expect(classifyBenchmarkSignal(base, head)).toMatchObject({
      classification: 'insufficient-data',
      noiseBandPercent: null,
    });
  });
});

describe('benchmark report stability metadata', () => {
  it('attaches raw wall-time stability evidence to fixture comparisons', () => {
    const benchmark = (commit: string, samples: number[]) => ({
      commit,
      profile: 'ci-small',
      mode: 'build',
      iterations: samples.length,
      warmup: 1,
      benchmarks: [
        {
          id: 'fixture',
          routeCount: 1,
          summary: {
            wallMs: { median: samples[Math.floor(samples.length / 2)] },
          },
          runs: samples.map(wallMs => ({ wallMs })),
        },
      ],
    });

    const report = createBenchmarkReport({
      base: benchmark('base', [99, 100, 101, 100, 100]),
      head: benchmark('head', [119, 120, 121, 120, 120]),
      buildBase: null,
      buildHead: null,
      syntheticBasePayloads: [],
      syntheticHeadPayloads: [],
      metadata: {},
    });

    expect(report.benchmarks[0].stability).toMatchObject({
      deltaPercent: 20,
      classification: 'regression',
      baseRelativeMadPercent: 0,
      headRelativeMadPercent: 0,
      noiseBandPercent: 2,
    });
  });

  it('attaches stability evidence to synthetic samples', () => {
    const payload = (samples: number[]) => [
      {
        manifest: {},
        payload: {
          runs: samples.length,
          summaries: [
            {
              profile: 'cold',
              median: samples[Math.floor(samples.length / 2)],
              samples,
            },
          ],
        },
      },
    ];

    const report = createBenchmarkReport({
      base: { benchmarks: [] },
      head: { benchmarks: [] },
      buildBase: null,
      buildHead: null,
      syntheticBasePayloads: payload([99, 100, 101, 100, 100]),
      syntheticHeadPayloads: payload([89, 90, 91, 90, 90]),
      metadata: {},
    });

    expect(report.syntheticBenchmarks[0].stability).toMatchObject({
      classification: 'improvement',
      deltaPercent: -10,
    });
  });

  it('keeps raw deltas visible while explaining signal confidence', () => {
    const report = createBenchmarkReport({
      base: {
        mode: 'build',
        benchmarks: [
          {
            id: 'fixture',
            summary: { wallMs: { median: 100 } },
            runs: [99, 100, 101, 100, 100].map(wallMs => ({ wallMs })),
          },
        ],
      },
      head: {
        mode: 'build',
        benchmarks: [
          {
            id: 'fixture',
            summary: { wallMs: { median: 120 } },
            runs: [119, 120, 121, 120, 120].map(wallMs => ({ wallMs })),
          },
        ],
      },
      buildBase: null,
      buildHead: null,
      syntheticBasePayloads: [],
      syntheticHeadPayloads: [],
      metadata: {},
    });

    const comment = renderBenchmarkComment(report);
    expect(comment).toContain('### Reading benchmark confidence');
    expect(comment).toContain('Raw deltas are always shown');
    expect(comment).toContain('| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |');
    expect(comment).toContain('| `fixture (dev)` | 5 | 0.10s | 0.12s | +20.0% | 0.0% | 0.0% | ±2.0% | 🔴 regression |');
  });
});
