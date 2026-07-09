import { accessSync, existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import {
  assertNoViteConfigFiles,
  finalizeFixtureProject,
} from './react-router-framework/integration/helpers/rsbuild-adapter';

describe('React Router framework fixture adapter', () => {
  beforeEach(() => {
    rstest.mocked(existsSync).mockImplementation(file => {
      try {
        accessSync(file);
        return true;
      } catch {
        return false;
      }
    });
  });

  afterEach(() => {
    rstest.mocked(existsSync).mockReturnValue(true);
  });

  it.each([
    'vite.config.ts',
    'vite.config.js',
    'vite.config.cjs',
    'vite.config.mjs',
    'vite.config.cts',
    'vite.config.mts',
  ])('rejects unsupported fixture config %s', filename => {
    expect(() => assertNoViteConfigFiles({ [filename]: 'config' })).toThrow(
      `[rsbuild-adapter] Unsupported fixture config "${filename}". Author rsbuild.config.ts explicitly so test-specific options are preserved.`
    );
  });

  it('returns ordinary fixture files and rsbuild.config.ts unchanged', () => {
    const files = {
      'app/root.tsx': 'export default function Root() {}',
      'rsbuild.config.ts': 'export default {};',
    };

    expect(assertNoViteConfigFiles(files)).toBe(files);
  });

  it('preserves an authored tsconfig.json', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));
    const authored = JSON.stringify({
      include: ['custom/**/*'],
      compilerOptions: {
        moduleDetection: 'force',
        types: ['custom-runtime'],
        paths: { '#custom/*': ['./src/*'] },
      },
    });

    try {
      await writeFile(join(projectDir, 'tsconfig.json'), authored);

      await finalizeFixtureProject({ projectDir });

      expect(await readFile(join(projectDir, 'tsconfig.json'), 'utf8')).toBe(
        authored
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('creates the default tsconfig.json when it is missing', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));

    try {
      await finalizeFixtureProject({ projectDir });

      const tsconfig = JSON.parse(
        await readFile(join(projectDir, 'tsconfig.json'), 'utf8')
      );
      expect(tsconfig.include).toEqual([
        'env.d.ts',
        '**/*.ts',
        '**/*.tsx',
        '.react-router/types/**/*',
      ]);
      expect(tsconfig.compilerOptions.rootDirs).toEqual([
        '.',
        '.react-router/types/',
      ]);
      expect(tsconfig.compilerOptions.paths).toEqual({
        '~/*': ['./app/*'],
      });
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});
