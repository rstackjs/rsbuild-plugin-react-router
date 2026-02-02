import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rstest/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  tools: {
    swc: {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      remote: path.join(__dirname, 'tests/mocks/remote'),
    },
  },
  testEnvironment: 'jsdom',
  globalSetup: ['./tests/setup/global-setup.ts'],
  include: [
    'app/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    'tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
  ],
  exclude: [
    'tests/e2e/**',
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/server-build/**',
    '**/.react-router/**',
  ],
  setupFiles: ['./tests/setup/setup-test-env.ts'],
});
