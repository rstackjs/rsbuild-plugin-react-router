import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import {
  assertFrameworkWorkerLimit,
  ensureFrameworkTestRunId,
  getFrameworkCacheEnv,
  resolveFrameworkWorkerLimit,
} from "./helpers/test-resource-guard.js";

// silence expected warnings in Node 22.22 about `require(esm)`
// when it implicitly uses `react-router`'s `module-sync` export condition
process.env.NODE_OPTIONS =
  (process.env.NODE_OPTIONS ?? "") + ` --no-warnings=ExperimentalWarning`;

const isWindows = process.platform === "win32";
Object.assign(process.env, getFrameworkCacheEnv());
ensureFrameworkTestRunId();
const workerLimit = resolveFrameworkWorkerLimit();
assertFrameworkWorkerLimit(workerLimit);

const config: PlaywrightTestConfig = {
  testDir: ".",
  testMatch: ["**/*-test.ts"],
  // Playwright treats our workspace packages as internal by default. If we
  // don't mark them as external, tests hang in Node 20.5.2+
  build: {
    external: ["**/packages/**/*"],
  },
  /* Maximum time one test can run for. */
  timeout: isWindows ? 90_000 : 60_000,
  fullyParallel: false,
  workers: workerLimit.workers,
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: isWindows ? 10_000 : 5_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  reporter: process.env.CI ? "dot" : [["html", { open: "never" }]],
  globalSetup: "./helpers/global-setup.ts",
  globalTeardown: "./helpers/global-teardown.ts",
  use: {
    actionTimeout: 0,
    launchOptions: {
      args: [
        "--disable-breakpad",
        "--disable-crash-reporter",
        "--disable-crashpad",
      ],
    },
  },

  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
};

export default config;
