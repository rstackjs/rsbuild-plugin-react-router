import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { applyCorpusRenames } from '../scripts/sync-react-router-framework-tests.mjs';

describe('React Router framework corpus sync', () => {
  const workRoots: string[] = [];

  beforeEach(() => {
    rstest.restoreAllMocks();
  });

  const createWorkRoot = async () => {
    const workRoot = await mkdtemp(
      path.join(tmpdir(), 'react-router-framework-sync-')
    );
    workRoots.push(workRoot);
    return workRoot;
  };

  afterEach(async () => {
    await Promise.all(
      workRoots.splice(0).map(workRoot =>
        rm(workRoot, { force: true, recursive: true })
      )
    );
  });

  it('renames a corpus file and preserves its bytes', async () => {
    const workRoot = await createWorkRoot();
    const source = path.join(workRoot, 'integration/helpers/vite.ts');
    const target = path.join(workRoot, 'integration/helpers/rsbuild.ts');
    const contents = Buffer.from([0, 1, 2, 255]);
    await mkdir(path.dirname(source), { recursive: true });
    await writeFile(source, contents);

    await applyCorpusRenames(workRoot);

    expect(existsSync(source)).toBe(false);
    expect(await readFile(target)).toEqual(contents);
  });

  it('renames a corpus directory and preserves nested file bytes', async () => {
    const workRoot = await createWorkRoot();
    const source = path.join(workRoot, 'integration/helpers/rsc-vite');
    const target = path.join(workRoot, 'integration/helpers/rsc-preview');
    const contents = Buffer.from('nested template bytes');
    await mkdir(path.join(source, 'nested'), { recursive: true });
    await writeFile(path.join(source, 'nested/template.txt'), contents);

    await applyCorpusRenames(workRoot);

    expect(existsSync(source)).toBe(false);
    expect(await readFile(path.join(target, 'nested/template.txt'))).toEqual(
      contents
    );
  });

  it('leaves an existing destination untouched when its source is missing', async () => {
    const workRoot = await createWorkRoot();
    const target = path.join(workRoot, 'integration/helpers/rsbuild.ts');
    const contents = Buffer.from('existing adapter bytes');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);

    await applyCorpusRenames(workRoot);

    expect(await readFile(target)).toEqual(contents);
  });

  it('collapses Vite template versions into the Vite 7 template rename', async () => {
    const workRoot = await createWorkRoot();
    const vite7 = path.join(
      workRoot,
      'integration/helpers/vite-7-template'
    );
    const vite8 = path.join(
      workRoot,
      'integration/helpers/vite-8-template'
    );
    const target = path.join(
      workRoot,
      'integration/helpers/rsbuild-template'
    );
    const vite7Contents = Buffer.from('Vite 7 template bytes');
    await mkdir(vite7, { recursive: true });
    await mkdir(vite8, { recursive: true });
    await writeFile(path.join(vite7, 'template.txt'), vite7Contents);
    await writeFile(path.join(vite8, 'template.txt'), 'Vite 8 template bytes');

    await applyCorpusRenames(workRoot);

    expect(existsSync(vite7)).toBe(false);
    expect(existsSync(vite8)).toBe(false);
    expect(await readFile(path.join(target, 'template.txt'))).toEqual(
      vite7Contents
    );
  });
});
