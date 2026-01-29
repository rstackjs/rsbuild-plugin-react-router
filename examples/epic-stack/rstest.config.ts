import { defineConfig } from '@rstest/core';
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
