import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['tests/**/*.test.ts'],
  exclude: ['**/node_modules/**', '**/dist/**', 'examples/**'],
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.ts'],
});
