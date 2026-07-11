import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from '@rstest/core';
import {
  auditUpstream,
  categorizeChanges,
  parseNameStatus,
} from '../scripts/check-react-router-framework-upstream.mjs';

describe('React Router framework upstream audit', () => {
  const workRoots: string[] = [];

  afterEach(async () => {
    await Promise.all(
      workRoots.splice(0).map(workRoot =>
        rm(workRoot, { force: true, recursive: true })
      )
    );
  });

  it('parses zero-delimited add, modify, delete, and rename records', () => {
    const changes = parseNameStatus(
      Buffer.from(
        'A\0integration/new/test.ts\0M\0integration/changed.ts\0' +
          'D\0integration/deleted.ts\0R095\0integration/old.ts\0' +
          'integration/new.ts\0'
      )
    );

    expect(changes).toEqual([
      { kind: 'A', status: 'A', path: 'integration/new/test.ts' },
      { kind: 'M', status: 'M', path: 'integration/changed.ts' },
      { kind: 'D', status: 'D', path: 'integration/deleted.ts' },
      {
        kind: 'R',
        status: 'R095',
        oldPath: 'integration/old.ts',
        path: 'integration/new.ts',
      },
    ]);
  });

  it('deduplicates and sorts directories containing added files', () => {
    const result = categorizeChanges([
      { kind: 'A', status: 'A', path: 'integration/z/two.ts' },
      { kind: 'A', status: 'A', path: 'integration/a/one.ts' },
      { kind: 'A', status: 'A', path: 'integration/z/one.ts' },
    ]);

    expect(result.directoriesWithAddedFiles).toEqual([
      'integration/a',
      'integration/z',
    ]);
    expect(result.added).toEqual([
      'integration/a/one.ts',
      'integration/z/one.ts',
      'integration/z/two.ts',
    ]);
  });

  it('reports no changes without mutating either commit or the working tree', async () => {
    const sourceRoot = await mkdtemp(
      path.join(tmpdir(), 'react-router-upstream-audit-')
    );
    workRoots.push(sourceRoot);
    const trackedFile = path.join(sourceRoot, 'integration/test.ts');
    execFileSync('git', ['init', '-q', sourceRoot]);
    execFileSync('git', ['-C', sourceRoot, 'config', 'user.name', 'Test']);
    execFileSync('git', [
      '-C',
      sourceRoot,
      'config',
      'user.email',
      'test@example.com',
    ]);
    await mkdir(path.dirname(trackedFile), { recursive: true });
    await writeFile(trackedFile, 'original\n');
    execFileSync('git', ['-C', sourceRoot, 'add', '.']);
    execFileSync('git', ['-C', sourceRoot, 'commit', '-qm', 'initial']);
    const headBefore = execFileSync(
      'git',
      ['-C', sourceRoot, 'rev-parse', 'HEAD'],
      { encoding: 'utf8' }
    ).trim();

    const audit = auditUpstream({
      sourceRoot,
      baseRef: headBefore,
      sourceDirs: ['integration'],
    });

    expect(audit.added).toEqual([]);
    expect(audit.modified).toEqual([]);
    expect(audit.deleted).toEqual([]);
    expect(audit.renamed).toEqual([]);
    expect(await readFile(trackedFile, 'utf8')).toBe('original\n');
    expect(
      execFileSync('git', ['-C', sourceRoot, 'status', '--porcelain'], {
        encoding: 'utf8',
      })
    ).toBe('');
    expect(
      execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim()
    ).toBe(headBefore);
  });

  it('rejects an unknown reviewed ref', async () => {
    const sourceRoot = await mkdtemp(
      path.join(tmpdir(), 'react-router-upstream-audit-')
    );
    workRoots.push(sourceRoot);
    execFileSync('git', ['init', '-q', sourceRoot]);

    expect(() =>
      auditUpstream({
        sourceRoot,
        baseRef: 'missing-ref',
        sourceDirs: ['integration'],
      })
    ).toThrow();
  });
});
