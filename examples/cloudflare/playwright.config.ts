import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Maximum time one test can run for
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  // Run tests in files in parallel
  fullyParallel: false,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:3004",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshot on test failure
    screenshot: "only-on-failure",
  },

  // Configure only Chrome desktop browser
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Web server configuration - build first then run wrangler dev for Cloudflare
  webServer: {
    command: "pnpm run build && pnpm run start",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
