import tsx from "dedent";

export function server() {
  return tsx`
    import { createRequestHandler } from "@react-router/express";
    import express from "express";

    const port = process.env.PORT ?? 3000
    const hmrPort = process.env.HMR_PORT ?? 3001

    const app = express();
    let devServer;

    if (process.env.NODE_ENV === "production") {
      app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
      app.use(express.static("build/client", { maxAge: "1h" }));
      app.all("*", createRequestHandler({
        build: await import("./build/index.js"),
      }));
    } else {
      const { createRsbuild, loadConfig } = await import("@rsbuild/core");
      const { content } = await loadConfig();
      const rsbuild = await createRsbuild({ rsbuildConfig: content });
      devServer = await rsbuild.createDevServer();
      app.use(devServer.middlewares);
    }

    const server = app.listen(port, () => {
      console.log('http://localhost:' + port);
      devServer?.afterListen();
    });
    devServer?.connectWebSocket({ server });
  `;
}

export function rsc() {
  return tsx`
    import { createRequestListener } from "@remix-run/node-fetch-server";
    import express from "express";

    const port = process.env.PORT ?? 3000
    const hmrPort = process.env.HMR_PORT ?? 3001

    const app = express();
    let devServer;

    if (process.env.NODE_ENV === "production") {
      app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
      app.all("*", createRequestListener((await import("./build/server/index.js")).default.fetch));
    } else {
      // Rsbuild dev-server adapter (RSC): the plugin attaches its RSC dev
      // request handler to the dev server's middleware chain (see
      // createReactRouterRscDevServerSetup), so delegating to
      // \`devServer.middlewares\` serves RSC documents, assets, and HMR.
      const { createRsbuild, loadConfig } = await import("@rsbuild/core");
      const { content } = await loadConfig();
      const rsbuild = await createRsbuild({ rsbuildConfig: content });
      devServer = await rsbuild.createDevServer();
      app.use(devServer.middlewares);
    }

    const server = app.listen(port, () => {
      console.log('http://localhost:' + port);
      devServer?.afterListen();
    });
    devServer?.connectWebSocket({ server });
  `;
}
