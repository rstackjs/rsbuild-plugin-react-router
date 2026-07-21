import { defineConfig, devices } from '@playwright/test';

const isProduction = process.env.RSC_E2E_MODE === 'production';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3021',
    trace: 'on-first-retry',
  },
  webServer: {
    command: isProduction ? 'pnpm run start' : 'pnpm run dev',
    url: 'http://127.0.0.1:3021',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
