import { describe, expect, it } from '@rstest/core';
import type { ModuleCache } from 'jiti';
import {
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
