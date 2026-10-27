import { createRsbuild, loadConfig } from '@rsbuild/core'
import { loadReactRouterServerBuild } from 'rsbuild-plugin-react-router'
import 'dotenv/config'

async function startServer() {
	const config = await loadConfig()
	const rsbuild = await createRsbuild({
		rsbuildConfig: config.content,
	})
	const devServer = await rsbuild.createDevServer()

	// Load the bundle first to get createApp
	if (!devServer.environments?.node) {
		throw new Error('Node environment not found in dev server')
	}

	const bundle = await devServer.environments.node.loadBundle('static/js/app')
	const { createApp } = bundle
	const app = await createApp(
		devServer,
		() => loadReactRouterServerBuild(devServer),
	)

	devServer.connectWebSocket({ server: app })
}

void startServer().catch(console.error)
