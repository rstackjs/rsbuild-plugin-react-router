import { defineConfig, devices } from '@playwright/test';

// Dev-mode config — runs the SPA against `rsbuild dev` instead of the
// prerendered static build. Kept separate from playwright.config.ts because
// the dev server writes to the same build directory the static suite asserts
// against, so the two servers cannot run side by side.
export default defineConfig({
  testDir: './tests/e2e-dev',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev --port 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
