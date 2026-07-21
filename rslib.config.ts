import {
  cjsConfig,
  commonExternals,
  esmConfig,
} from '@rsbuild/config/rslib.config.js';
import { defineConfig } from '@rslib/core';
const config = defineConfig({
  lib: [
    {
      ...esmConfig,
      source: {
        entry: {
          index: './src/index.ts',
          'route-module-transform-loader':
            './src/route-module-transform-loader.ts',
          'templates/entry.server': './src/templates/entry.server.tsx',
          'templates/entry.client': './src/templates/entry.client.tsx',
        },
      },
    },
    {
      ...cjsConfig,
      source: {
        entry: {
          index: './src/index.ts',
          'templates/entry.server': './src/templates/entry.server.tsx',
          'templates/entry.client': './src/templates/entry.client.tsx',
        },
      },
    },
  ],
  tools: {
    rspack: {
      externals: [
        ...commonExternals,
        'user-routes',
        /^react-router-dom/,
        /^react-router/,
        /^@react-router/,
        'react',
        /^react-dom/,
      ],
    },
  },
});
export default config;
