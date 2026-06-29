import { describe, expect, it } from '@rstest/core';
import type { ModuleCache } from 'jiti';
import {
  clearConfigModuleCache,
  collectConfigDependencyWatchPaths,
} from '../src/config-dependencies';

const createModuleCache = (paths: string[]): ModuleCache =>
  Object.fromEntries(
    paths.map(filePath => [
      filePath,
      {
        filename: filePath,
      },
    ])
  ) as ModuleCache;

describe('config dependency helpers', () => {
  it('collects non-package modules loaded while importing config', () => {
    const configPath = '/project/react-router.config.ts';
    const dependencyPath = '/project/config/server-bundles.ts';
    const preexistingPath = '/project/build-tool.js';

    expect(
      collectConfigDependencyWatchPaths(
        configPath,
        createModuleCache([
          preexistingPath,
          '/project/node_modules/jiti/dist/jiti.cjs',
          configPath,
          dependencyPath,
        ]),
        new Set([preexistingPath])
      )
    ).toEqual([dependencyPath]);
  });

  it('clears only config modules loaded while collecting dependencies', () => {
    const configPath = '/project/react-router.config.ts';
    const dependencyPath = '/project/config/server-bundles.ts';
    const buildToolPath = '/project/node_modules/@rspack/core/dist/index.js';
    const moduleCache = createModuleCache([
      buildToolPath,
      configPath,
      dependencyPath,
    ]);

    clearConfigModuleCache(moduleCache, [configPath, dependencyPath]);

    expect(moduleCache).toEqual(createModuleCache([buildToolPath]));
  });
});
