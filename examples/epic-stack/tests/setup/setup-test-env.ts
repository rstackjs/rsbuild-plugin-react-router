import 'dotenv/config'
import { Buffer } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import path from 'node:path'

const workerId = process.env.RSTEST_WORKER_ID ?? '0'
const databaseFile = `./tests/prisma/data.${workerId}.db`
const databasePath = path.join(process.cwd(), databaseFile)
const cacheDatabasePath = path.join(process.cwd(), `./tests/prisma/cache.${workerId}.db`)

process.env.NODE_ENV ??= 'test'
process.env.DATABASE_URL ??= `file:${databasePath}`
process.env.DATABASE_PATH ??= databasePath
process.env.CACHE_DATABASE_PATH ??= cacheDatabasePath
process.env.SESSION_SECRET ??= 'rstest-session-secret'
process.env.INTERNAL_COMMAND_TOKEN ??= 'rstest-internal-token'
process.env.HONEYPOT_SECRET ??= 'rstest-honeypot-secret'
process.env.APP_BASE_URL ??= 'https://www.epicstack.dev'
process.env.GITHUB_REDIRECT_URI ??= new URL('/auth/github/callback', process.env.APP_BASE_URL).toString()
process.env.GITHUB_CLIENT_ID ??= 'MOCK_GITHUB_CLIENT_ID'
process.env.GITHUB_CLIENT_SECRET ??= 'MOCK_GITHUB_CLIENT_SECRET'
process.env.GITHUB_TOKEN ??= 'MOCK_GITHUB_TOKEN'

const nodeCrypto = webcrypto as typeof globalThis.crypto
if (globalThis.crypto !== nodeCrypto) {
	Object.defineProperty(globalThis, 'crypto', {
		value: nodeCrypto,
		configurable: true,
	})
}

const subtle = globalThis.crypto?.subtle
if (subtle?.importKey) {
	const originalImportKey = subtle.importKey.bind(subtle)
	const wrappedImportKey: typeof subtle.importKey = (
		format,
		keyData,
		algorithm,
		extractable,
		keyUsages,
	) => {
		let normalizedKeyData = keyData
		if (keyData instanceof ArrayBuffer) {
			normalizedKeyData = Buffer.from(keyData)
		} else if (ArrayBuffer.isView(keyData)) {
			normalizedKeyData = Buffer.from(
				keyData.buffer,
				keyData.byteOffset,
				keyData.byteLength,
			)
		}
		return originalImportKey(
			format,
			normalizedKeyData,
			algorithm,
			extractable,
			keyUsages,
		)
	}
	try {
		Object.defineProperty(subtle, 'importKey', {
			value: wrappedImportKey,
			configurable: true,
		})
	} catch {
		try {
			;(subtle as { importKey: typeof wrappedImportKey }).importKey =
				wrappedImportKey
		} catch {
			// ignore if SubtleCrypto is not writable
		}
	}
}

const { setupCustomMatchers } = await import('./custom-matchers.ts')
setupCustomMatchers()

await import('./db-setup.ts')
await import('#app/utils/env.server.ts')
// we need these to be imported first 👆

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, rstest, type MockInstance } from '@rstest/core'
import { server } from '#tests/mocks/index.ts'

afterEach(() => server.resetHandlers())
afterEach(() => cleanup())

export let consoleError: MockInstance<(typeof console)['error']>

beforeEach(() => {
	const originalConsoleError = console.error
	consoleError = rstest.spyOn(console, 'error')
	consoleError.mockImplementation(
		(...args: Parameters<typeof console.error>) => {
			originalConsoleError(...args)
			throw new Error(
				'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.',
			)
		},
	)
})
