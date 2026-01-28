import { createCookieSessionStorage } from 'react-router'
import { type ProviderName } from './connections.tsx'
import { GitHubProvider } from './providers/github.server.ts'
import { type AuthProvider } from './providers/provider.ts'
import { type Timings } from './timing.server.ts'

export const connectionSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'en_connection',
		sameSite: 'lax', // CSRF protection is advised if changing to 'none'
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		secrets: (process.env.SESSION_SECRET ?? 'development-session-secret').split(
			',',
		),
		secure: process.env.NODE_ENV === 'production',
	},
})

export const providers: Partial<Record<ProviderName, AuthProvider>> = {}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
	providers.github = new GitHubProvider()
}

export function handleMockAction(providerName: ProviderName, request: Request) {
	const provider = providers[providerName]
	if (!provider) {
		throw new Error(`Auth provider "${providerName}" is not configured`)
	}
	return provider.handleMockAction(request)
}

export function resolveConnectionData(
	providerName: ProviderName,
	providerId: string,
	options?: { timings?: Timings },
) {
	const provider = providers[providerName]
	if (!provider) {
		throw new Error(`Auth provider "${providerName}" is not configured`)
	}
	return provider.resolveConnectionData(providerId, options)
}
