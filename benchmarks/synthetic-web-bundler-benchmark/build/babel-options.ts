import type { PluginItem } from '@babel/core';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const directory = path.dirname(fileURLToPath(import.meta.url));

export function createBabelPlugins(
  stripRestrictedImports: boolean
): PluginItem[] {
  return [
    [
      require.resolve('babel-plugin-formatjs'),
      {
        ast: true,
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        removeDefaultMessage: false,
      },
    ],
    path.join(directory, 'babel-plugin-secret-hash.cjs'),
    ...(stripRestrictedImports
      ? [path.join(directory, 'babel-plugin-restricted-imports.cjs')]
      : []),
  ];
}
