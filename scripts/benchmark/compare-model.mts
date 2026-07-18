import { benchmarkCases } from '../../benchmarks/cases.mts';

type BenchmarkCaseResult = {
  id: string;
  samplesMs: number[];
  medianMs: number;
};

type BenchmarkPayload = {
  cases: BenchmarkCaseResult[];
};

type BenchmarkSide = 'base' | 'head';

export type BenchmarkComparison = {
  id: string;
  baseMedianMs: number;
  headMedianMs: number;
  deltaPercent: number;
};

export type BenchmarkComparisonReport = {
  version: 1;
  cases: BenchmarkComparison[];
};

const expectedCaseIds = benchmarkCases.map(({ id }) => id);
const expectedCaseIdSet = new Set(expectedCaseIds);

const invalidPayloadError = (side: BenchmarkSide) =>
  new Error(`Invalid ${side} benchmark result: expected a cases array.`);

const validatePayload = (payload: unknown, side: BenchmarkSide) => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray((payload as BenchmarkPayload).cases)
  ) {
    throw invalidPayloadError(side);
  }

  const cases = new Map<string, BenchmarkCaseResult>();
  for (const result of (payload as BenchmarkPayload).cases) {
    if (!result || typeof result.id !== 'string') {
      throw invalidPayloadError(side);
    }
    if (cases.has(result.id)) {
      throw new Error(
        `Duplicate benchmark case "${result.id}" in ${side} result.`
      );
    }
    if (!expectedCaseIdSet.has(result.id)) {
      throw new Error(
        `Unexpected benchmark case "${result.id}" in ${side} result.`
      );
    }
    if (!Array.isArray(result.samplesMs)) {
      throw new Error(
        `Benchmark case "${result.id}" in ${side} result must include samples.`
      );
    }
    if (result.samplesMs.length === 0) {
      throw new Error(
        `Benchmark case "${result.id}" in ${side} result must include at least one sample.`
      );
    }
    if (result.samplesMs.some(sample => !Number.isFinite(sample))) {
      throw new Error(
        `Benchmark case "${result.id}" in ${side} result contains a non-finite sample.`
      );
    }
    if (!Number.isFinite(result.medianMs)) {
      throw new Error(
        `Benchmark case "${result.id}" in ${side} result has a non-finite median.`
      );
    }
    if (side === 'base' && result.medianMs === 0) {
      throw new Error(
        `Benchmark case "${result.id}" in base result has a zero median.`
      );
    }
    cases.set(result.id, result);
  }

  for (const id of expectedCaseIds) {
    if (!cases.has(id)) {
      throw new Error(`Missing benchmark case "${id}" in ${side} result.`);
    }
  }

  return cases;
};

export const compareBenchmarkResults = (
  base: unknown,
  head: unknown
): BenchmarkComparisonReport => {
  const baseCases = validatePayload(base, 'base');
  const headCases = validatePayload(head, 'head');

  return {
    version: 1,
    cases: expectedCaseIds.map(id => {
      const baseMedianMs = baseCases.get(id)!.medianMs;
      const headMedianMs = headCases.get(id)!.medianMs;
      return {
        id,
        baseMedianMs,
        headMedianMs,
        deltaPercent: ((headMedianMs - baseMedianMs) / baseMedianMs) * 100,
      };
    }),
  };
};

const formatMilliseconds = (value: number) => `${value.toFixed(1)} ms`;
const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

export const renderBenchmarkComment = (report: BenchmarkComparisonReport) =>
  [
    '<!-- react-router-benchmark-ci -->',
    '## Benchmark results',
    '',
    '| Case | Base | Head | Delta |',
    '|---|---:|---:|---:|',
    ...report.cases.map(
      ({ id, baseMedianMs, headMedianMs, deltaPercent }) =>
        `| ${id} | ${formatMilliseconds(baseMedianMs)} | ${formatMilliseconds(headMedianMs)} | ${formatPercent(deltaPercent)} |`
    ),
    '',
  ].join('\n');
