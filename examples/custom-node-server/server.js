import { createRsbuild, loadConfig } from '@rsbuild/core';
import { createRequestHandler } from '@react-router/express';
import {
  loadReactRouterServerBuild,
  resolveReactRouterServerBuild,
} from 'rsbuild-plugin-react-router';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  /** @type {import('@rsbuild/core').RsbuildDevServer | undefined} */
  let devServer;
  /** @type {import('react-router').ServerBuild | (() => Promise<import('react-router').ServerBuild>)} */
  let build;

  if (isDev) {
    const config = await loadConfig();
    const rsbuild = await createRsbuild({
      rsbuildConfig: config.content,
    });
    const currentDevServer = await rsbuild.createDevServer();
    devServer = currentDevServer;
    app.use(currentDevServer.middlewares);
    build = () => loadReactRouterServerBuild(currentDevServer);
  } else {
    app.use(
      express.static(path.join(__dirname, 'build/client'), {
        index: false,
      })
    );
    const productionBuildPath = './build/server/static/js/app.js';
    build = await resolveReactRouterServerBuild(import(productionBuildPath));
  }

  app.use(
    createRequestHandler({
      build,
      mode: isDev ? 'development' : 'production',
      getLoadContext() {
        return {
          VALUE_FROM_EXPRESS: 'Hello from Express',
        };
      },
    })
  );

  const port = Number.parseInt(process.env.PORT || '3000', 10);
  const server = app.listen(port, () => {
    const mode = isDev ? 'Development' : 'Production';
    console.log(`${mode} server is running on http://localhost:${port}`);
    devServer?.afterListen();
  });
  devServer?.connectWebSocket({ server });
}

startServer().catch(console.error);
