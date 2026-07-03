import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

// Dev-mode config — runs the SPA against `rsbuild dev` instead of the
// prerendered static build. Kept separate from playwright.config.ts because
// the dev server writes to the same build directory the static suite asserts
// against, so the two servers cannot run side by side.
export default defineConfig({
  ...baseConfig,
  testDir: './tests/e2e-dev',
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:3002',
  },
  webServer: {
    ...baseConfig.webServer,
    command: 'pnpm run dev --port 3002',
    url: 'http://localhost:3002',
  },
});
