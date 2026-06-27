import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { collectConfigDependencyWatchPaths } from '../src/config-dependencies';

describe('collectConfigDependencyWatchPaths', () => {
  it('recursively collects relative config imports and requires', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-config-deps-'));

    try {
      const configPath = join(root, 'react-router.config.ts');
      const serverBundlesPath = join(root, 'config/server-bundles.ts');
      const sharedPath = join(root, 'config/shared.js');

      mkdirSync(join(root, 'config'));
      writeFileSync(
        configPath,
        [
          "import { serverBundles } from './config/server-bundles';",
          "const shared = require('./config/shared.js');",
          'export default { serverBundles, basename: shared.basename };',
        ].join('\n')
      );
      writeFileSync(
        serverBundlesPath,
        [
          "export { bundleId } from './shared.js';",
          "export const serverBundles = async () => 'main';",
        ].join('\n')
      );
      writeFileSync(sharedPath, "export const basename = '/app';");

      await expect(collectConfigDependencyWatchPaths(configPath)).resolves.toEqual(
        [serverBundlesPath, sharedPath]
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
