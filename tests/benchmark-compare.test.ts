import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  compareBenchmarkResults,
  renderBenchmarkComment,
} from '../scripts/benchmark/compare-model.mts';
import {
  findBenchmarkComment,
  run,
} from '../scripts/benchmark/comment.mts';

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

const captureEnvironment = (keys: readonly string[]) => {
  const previousValues = new Map(
    keys.map(key => [key, process.env[key]] as const)
  );
  return () => {
    for (const [key, value] of previousValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
};

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

  it('rejects benchmark cases without samples', () => {
    const head = headPayload();
    head.cases[0].samplesMs = [];

    expect(() => compareBenchmarkResults(basePayload(), head)).toThrow(
      'Benchmark case "build-256-ssr" in head result must include at least one sample.'
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

describe('benchmark pull-request comments', () => {
  it('selects the newest comment with the benchmark marker', () => {
    const olderComment = {
      id: 101,
      body: '<!-- react-router-benchmark-ci -->\nOlder report',
    };
    const newestComment = {
      id: 303,
      body: '<!-- react-router-benchmark-ci -->\nNewest report',
    };

    expect(
      findBenchmarkComment([
        olderComment,
        { id: 202, body: 'Unrelated comment' },
        newestComment,
      ])
    ).toBe(newestComment);
  });

  it('returns null when no comment has the benchmark marker', () => {
    expect(
      findBenchmarkComment([
        { id: 101, body: 'First comment' },
        { id: 202, body: null },
      ])
    ).toBeNull();
  });

  it('paginates comments and patches the newest marker match', async () => {
    const restoreEnvironment = captureEnvironment([
      'GH_TOKEN',
      'GITHUB_REPOSITORY',
      'PR_NUMBER',
      'COMMENT_BODY',
    ]);
    const originalFetch = globalThis.fetch;
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const repositoryUrl = 'https://api.github.com/repos/acme/widgets';
    const commentsUrl = `${repositoryUrl}/issues/17/comments`;
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      body:
        index === 0
          ? '<!-- react-router-benchmark-ci -->\nOlder report'
          : 'Unrelated comment',
    }));

    process.env.GH_TOKEN = 'token';
    process.env.GITHUB_REPOSITORY = 'acme/widgets';
    process.env.PR_NUMBER = '17';
    process.env.COMMENT_BODY = 'Updated report';
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push({ url, init });
      if (url.endsWith('?per_page=100&page=1')) {
        return { ok: true, json: async () => firstPage } as Response;
      }
      if (url.endsWith('?per_page=100&page=2')) {
        return {
          ok: true,
          json: async () => [
            {
              id: 303,
              body: '<!-- react-router-benchmark-ci -->\nNewest report',
            },
          ],
        } as Response;
      }
      return { ok: true } as Response;
    }) as typeof fetch;

    try {
      await run();

      expect(requests.map(request => request.url)).toEqual([
        `${commentsUrl}?per_page=100&page=1`,
        `${commentsUrl}?per_page=100&page=2`,
        `${repositoryUrl}/issues/comments/303`,
      ]);
      expect(requests[2].init).toMatchObject({
        method: 'PATCH',
        body: JSON.stringify({ body: 'Updated report' }),
      });
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment();
    }
  });

  it('creates a comment when no marker exists', async () => {
    const restoreEnvironment = captureEnvironment([
      'GH_TOKEN',
      'GITHUB_REPOSITORY',
      'PR_NUMBER',
      'COMMENT_BODY',
    ]);
    const originalFetch = globalThis.fetch;
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const repositoryUrl = 'https://api.github.com/repos/acme/widgets';
    const commentsUrl = `${repositoryUrl}/issues/17/comments`;

    process.env.GH_TOKEN = 'token';
    process.env.GITHUB_REPOSITORY = 'acme/widgets';
    process.env.PR_NUMBER = '17';
    process.env.COMMENT_BODY = 'New report';
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ url: String(input), init });
      return { ok: true, json: async () => [] } as Response;
    }) as typeof fetch;

    try {
      await run();

      expect(requests.map(request => request.url)).toEqual([
        `${commentsUrl}?per_page=100&page=1`,
        commentsUrl,
      ]);
      expect(requests[1].init).toMatchObject({
        method: 'POST',
        body: JSON.stringify({ body: 'New report' }),
      });
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment();
    }
  });
});
