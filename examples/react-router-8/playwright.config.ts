import { defineConfig, devices } from '@playwright/test';

const isProduction = process.env.RR8_E2E_MODE === 'production';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3020',
    trace: 'on-first-retry',
  },
  webServer: {
    command: isProduction ? 'pnpm run start' : 'pnpm run dev',
    url: 'http://127.0.0.1:3020',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
