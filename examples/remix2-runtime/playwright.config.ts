import { defineConfig, devices } from '@playwright/test';

const dev = process.env.REMIX2_TEST_MODE === 'dev';
const port = Number(process.env.PORT || 3032);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  webServer: {
    command: dev ? 'npm run dev' : 'npm run start',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120000,
    env: { PORT: String(port), NODE_ENV: dev ? 'development' : 'production' },
  },
});
