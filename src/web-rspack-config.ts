import type { Rspack } from '@rsbuild/core';

export const createWebOutputConfig = (
  isBuild: boolean
): NonNullable<Rspack.Configuration['output']> => ({
  chunkFormat: 'module',
  chunkLoading: 'import',
  ...(isBuild
    ? {
        chunkFilename: 'static/js/async/[id]-[contenthash:16].js',
      }
    : {}),
  workerChunkLoading: 'import',
  wasmLoading: 'fetch',
  library: { type: 'module' },
  module: true,
});

export const createWebOptimizationConfig = (
  isBuild: boolean
): NonNullable<Rspack.Configuration['optimization']> => ({
  avoidEntryIife: true,
  ...(isBuild
    ? {
        mangleExports: 'size',
        usedExports: 'global',
      }
    : {}),
  runtimeChunk: 'single',
});
