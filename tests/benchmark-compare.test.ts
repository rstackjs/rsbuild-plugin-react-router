import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  compareBenchmarkResults,
  renderBenchmarkComment,
} from '../scripts/benchmark/compare-model.mts';

type BenchmarkCaseResult = {
  id: string;
  samplesMs: number[];
  medianMs: number;
};

type BenchmarkPayload = {
  version: 1;
  cases: BenchmarkCaseResult[];
};

const createPayload = (
  cases: BenchmarkCaseResult[]
): BenchmarkPayload => ({ version: 1, cases });

const basePayload = () =>
  createPayload([
    { id: 'build-256-ssr', samplesMs: [90, 100, 110], medianMs: 100 },
    { id: 'dev-48-ssr', samplesMs: [190, 200, 210], medianMs: 200 },
  ]);

const headPayload = () =>
  createPayload([
    { id: 'build-256-ssr', samplesMs: [100, 110, 120], medianMs: 110 },
    { id: 'dev-48-ssr', samplesMs: [170, 180, 190], medianMs: 180 },
  ]);

describe('CodSpeed benchmark comparison model', () => {
  it('renders every case with base, head, and signed median deltas', () => {
    const report = compareBenchmarkResults(basePayload(), headPayload());
    const comment = renderBenchmarkComment(report);

    expect(report.cases).toEqual([
      {
        id: 'build-256-ssr',
        baseMedianMs: 100,
        headMedianMs: 110,
        deltaPercent: 10,
      },
      {
        id: 'dev-48-ssr',
        baseMedianMs: 200,
        headMedianMs: 180,
        deltaPercent: -10,
      },
    ]);
    expect(comment).toContain('<!-- react-router-benchmark-ci -->');
    expect(comment).toContain('| Case | Base | Head | Delta |');
    expect(comment).toContain('| build-256-ssr | 100.0 ms | 110.0 ms | +10.0% |');
    expect(comment).toContain('| dev-48-ssr | 200.0 ms | 180.0 ms | -10.0% |');
  });

  it('rejects results whose case ids do not match the shared suite', () => {
    const head = headPayload();
    head.cases[1] = {
      id: 'dev-unknown',
      samplesMs: [170, 180, 190],
      medianMs: 180,
    };

    expect(() => compareBenchmarkResults(basePayload(), head)).toThrow(
      'Unexpected benchmark case "dev-unknown" in head result.'
    );
  });

  it('rejects duplicate case ids', () => {
    const base = basePayload();
    base.cases.push({
      id: 'build-256-ssr',
      samplesMs: [90, 100, 110],
      medianMs: 100,
    });

    expect(() => compareBenchmarkResults(base, headPayload())).toThrow(
      'Duplicate benchmark case "build-256-ssr" in base result.'
    );
  });

  it('rejects non-finite samples', () => {
    const head = headPayload();
    head.cases[0].samplesMs[1] = Number.NaN;

    expect(() => compareBenchmarkResults(basePayload(), head)).toThrow(
      'Benchmark case "build-256-ssr" in head result contains a non-finite sample.'
    );
  });

  it('rejects zero base medians', () => {
    const base = basePayload();
    base.cases[0] = {
      id: 'build-256-ssr',
      samplesMs: [0, 0, 0],
      medianMs: 0,
    };

    expect(() => compareBenchmarkResults(base, headPayload())).toThrow(
      'Benchmark case "build-256-ssr" in base result has a zero median.'
    );
  });
});

describe('benchmark comparison CLI', () => {
  it('writes JSON and Markdown reports from both benchmark payloads', () => {
    const root = mkdtempSync(join(tmpdir(), 'benchmark-compare-'));
    const baseFile = join(root, 'base.json');
    const headFile = join(root, 'head.json');
    const outDirectory = join(root, 'report');

    try {
      writeFileSync(baseFile, JSON.stringify(basePayload()));
      writeFileSync(headFile, JSON.stringify(headPayload()));

      const result = spawnSync(
        process.execPath,
        [
          'scripts/benchmark/compare.mts',
          '--base',
          baseFile,
          '--head',
          headFile,
          '--out',
          outDirectory,
        ],
        { cwd: process.cwd(), encoding: 'utf8' }
      );

      expect(result.status, result.stderr || result.stdout).toBe(0);
      const report = JSON.parse(
        readFileSync(join(outDirectory, 'report.json'), 'utf8')
      );
      expect(report.cases[0]).toMatchObject({
        id: 'build-256-ssr',
        deltaPercent: 10,
      });
      expect(readFileSync(join(outDirectory, 'comment.md'), 'utf8')).toContain(
        '<!-- react-router-benchmark-ci -->'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('exits nonzero when a benchmark input is invalid', () => {
    const root = mkdtempSync(join(tmpdir(), 'benchmark-compare-'));
    const baseFile = join(root, 'base.json');
    const headFile = join(root, 'head.json');

    try {
      writeFileSync(baseFile, JSON.stringify({ version: 1 }));
      writeFileSync(headFile, JSON.stringify(headPayload()));

      const result = spawnSync(
        process.execPath,
        [
          'scripts/benchmark/compare.mts',
          '--base',
          baseFile,
          '--head',
          headFile,
          '--out',
          join(root, 'report'),
        ],
        { cwd: process.cwd(), encoding: 'utf8' }
      );

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain(
        'Invalid base benchmark result: expected a cases array.'
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
