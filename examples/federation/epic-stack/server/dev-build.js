import { createRsbuild, loadConfig } from '@rsbuild/core'
import 'dotenv/config'
import { execa } from 'execa'

async function startServer() {
  if (process.env.E2E === 'true') {
    await execa('pnpm', ['prisma', 'migrate', 'reset', '--force'], {
      stdio: 'inherit',
    })
  }
  const config = await loadConfig()
  const rsbuild = await createRsbuild({
    rsbuildConfig: config.content,
  })
  const devServer = await rsbuild.createDevServer()

  // Load the bundle first to get createApp
  if (!devServer.environments?.node) {
    throw new Error('Node environment not found in dev server')
  }

  const bundle = await devServer.environments.node.loadBundle('app')
  await new Promise(resolve => setTimeout(resolve, 5000))
  const resolved = await resolveBundle(bundle)
  const createApp = resolved?.createApp ?? resolved
  const app = await createApp(devServer)

  devServer.connectWebSocket({ server: app })
}

async function resolveBundle(bundle) {
  let resolved = bundle
  for (let i = 0; i < 3; i++) {
    resolved = await resolved
    if (resolved && typeof resolved === 'object' && 'default' in resolved) {
      resolved = resolved.default
      continue
    }
    return resolved
  }
  return resolved
}

void startServer().catch(console.error)
