import { describe, expect, it } from '@rstest/core';
import type { ModuleCache } from 'jiti';
import {
  applyConfigDefines,
  clearConfigImportCache,
  collectConfigImportWatchPaths,
} from '../src/config-imports';

const createModuleCache = (paths: string[]): ModuleCache =>
  Object.fromEntries(
    paths.map(filePath => [
      filePath,
      {
        filename: filePath,
      },
    ])
  ) as ModuleCache;

describe('config import helpers', () => {
  it('applies rsbuild source.define values before importing config', () => {
    expect(
      applyConfigDefines(
        'if (import.meta.env.VITE_ENV_ROUTE === "dotenv") route();',
        {
          'import.meta.env.VITE_ENV_ROUTE': '"dotenv"',
        }
      )
    ).toBe('if ("dotenv" === "dotenv") route();');
  });

  it('does not apply source.define values inside non-expression text', () => {
    expect(
      applyConfigDefines(
        [
          'const text = "import.meta.env.VITE_ENV_ROUTE";',
          'const config = { "import.meta.env.VITE_ENV_ROUTE": true };',
          '// import.meta.env.VITE_ENV_ROUTE',
          'if (import.meta.env.VITE_ENV_ROUTE === "dotenv") route();',
        ].join('\n'),
        {
          'import.meta.env.VITE_ENV_ROUTE': '"dotenv"',
        }
      )
    ).toBe(
      [
        'const text = "import.meta.env.VITE_ENV_ROUTE";',
        'const config = { "import.meta.env.VITE_ENV_ROUTE": true };',
        '// import.meta.env.VITE_ENV_ROUTE',
        'if ("dotenv" === "dotenv") route();',
      ].join('\n')
    );
  });

  it('replaces the longest matching member path when a prefix and a deeper path are both defined', () => {
    expect(
      applyConfigDefines('if (import.meta.env.SSR) run();', {
        'import.meta.env': '{"MODE":"test"}',
        'import.meta.env.SSR': 'true',
      })
    ).toBe('if (true) run();');
  });

  it('replaces only the prefix when the deeper path is not defined', () => {
    expect(
      applyConfigDefines('if (import.meta.env.SSR) run();', {
        'import.meta.env': '{"MODE":"test"}',
      })
    ).toBe('if ({"MODE":"test"}.SSR) run();');
  });

  it('replaces the outermost match for computed member access the same as dot access', () => {
    expect(
      applyConfigDefines("if (import.meta.env['SSR']) run();", {
        'import.meta.env.SSR': 'true',
      })
    ).toBe('if (true) run();');
  });

  it('collects local modules loaded while importing config', () => {
    const configPath = '/project/react-router.config.ts';
    const helperPath = '/project/config/server-bundles.ts';
    const preexistingPath = '/project/build-tool.js';

    expect(
      collectConfigImportWatchPaths(
        configPath,
        createModuleCache([
          preexistingPath,
          '/project/node_modules/jiti/dist/jiti.cjs',
          configPath,
          helperPath,
        ]),
        new Set([preexistingPath])
      )
    ).toEqual([helperPath]);
  });

  it('clears only config modules loaded while collecting imports', () => {
    const configPath = '/project/react-router.config.ts';
    const helperPath = '/project/config/server-bundles.ts';
    const rspackPath = '/project/node_modules/@rspack/core/dist/index.js';
    const moduleCache = createModuleCache([rspackPath, configPath, helperPath]);

    clearConfigImportCache(moduleCache, [configPath, helperPath]);

    expect(moduleCache).toEqual(createModuleCache([rspackPath]));
  });
});
