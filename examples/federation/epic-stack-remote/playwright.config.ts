import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const PORT = process.env.PORT || '3007'
const WORKERS = process.env.PW_WORKERS
	? Number(process.env.PW_WORKERS)
	: 1
const RETRIES = process.env.PW_RETRIES
	? Number(process.env.PW_RETRIES)
	: process.env.CI
		? 2
		: 1
const TEST_TIMEOUT = process.env.PW_TEST_TIMEOUT
	? Number(process.env.PW_TEST_TIMEOUT)
	: 30_000
const EXPECT_TIMEOUT = process.env.PW_EXPECT_TIMEOUT
	? Number(process.env.PW_EXPECT_TIMEOUT)
	: 10_000

export default defineConfig({
	testDir: './tests/e2e',
	timeout: TEST_TIMEOUT,
	expect: {
		timeout: EXPECT_TIMEOUT,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: RETRIES,
	workers: WORKERS,
	reporter: 'list',
	use: {
		baseURL: `http://localhost:${PORT}/`,
		headless: true,
		actionTimeout: 10_000,
		navigationTimeout: 20_000,
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],

	webServer: {
		command: 'E2E=true pnpm run dev',
		url: 'http://localhost:3007',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
