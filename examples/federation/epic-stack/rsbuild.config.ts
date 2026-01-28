import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginReactRouter } from 'rsbuild-plugin-react-router'

import 'react-router'

const REMOTE_PORT = Number(process.env.REMOTE_PORT || 3007)
const REMOTE_ORIGIN =
	process.env.REMOTE_ORIGIN ?? `http://localhost:${REMOTE_PORT}`

// Common shared dependencies for Module Federation
const sharedDependencies = {
	'react-router': {
		singleton: true,
	},
	'react-router/': {
		singleton: true,
	},
	react: {
		singleton: true,
	},
	'react/': {
		singleton: true,
	},
	'react-dom': {
		singleton: true,
	},
	'react-dom/': {
		singleton: true,
	},
}

// Common Module Federation configuration
const commonFederationConfig = {
	name: 'host',
	shareStrategy: "loaded-first" as const,
	shared: sharedDependencies
}

// Web-specific federation config
const webFederationConfig = {
	...commonFederationConfig,
	experiments: {
		asyncStartup: true,
	},
	dts: false,
	remoteType: 'import' as const,
	remotes: {
		remote: `${REMOTE_ORIGIN}/static/js/remote.js`,
	},
}

// Node-specific federation config
const nodeFederationConfig = {
	...commonFederationConfig,
	experiments: {
		asyncStartup: true,
	},
	dts: false,
	remotes: {
		remote: `remote@${REMOTE_ORIGIN}/static/static/js/remote.js`,
	},
	runtimePlugins: ['@module-federation/node/runtimePlugin'],
}

export default defineConfig({
	dev: {
		client: {
			overlay: false,
		},
	},
	server: {
		port: Number(process.env.PORT || 3000),
	},
	output: {
		externals: ['better-sqlite3', 'express', 'ws'],
	},
	environments: {
		web: {
			tools: {
				rspack: {
					plugins: [
						new ModuleFederationPlugin(webFederationConfig),
					],
				},
			},
			plugins: [],
		},
		node: {
			tools: {
				rspack: {
					plugins: [
						new ModuleFederationPlugin(nodeFederationConfig),
					],
				},
			},
			plugins: [],
		},
	},
	plugins: [
		pluginReactRouter({
			customServer: true,
			serverOutput: 'commonjs',
			federation: true,
		}),
		pluginReact({
			fastRefresh: false,
			swcReactOptions: {
				refresh: false,
				development: false,
			},
			splitChunks: {
				react: false,
				router: false,
			},
			reactRefreshOptions: {
				overlay: false,
				exclude: /root/,
			},
		}),
	],
})
