import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: [
    'tests/**/*.test.ts',
    'tests/react-router-framework/react-router-dev/__tests__/rsc-virtual-route-modules-test.ts',
  ],
  exclude: ['**/node_modules/**', '**/dist/**', 'examples/**'],
  isolate: false,
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.ts'],
});
