import { test, expect } from "@playwright/test";
import dedent from "dedent";
import getPort from "get-port";

import { createProject, customDev } from "./helpers/rsbuild.js";

// Adapted from upstream `vite-loader-context-test.ts`. Vite lets a custom
// server pull the context module out of its module graph with
// `ssrLoadModule("/app/context.ts")`. With a bundled server build the same
// instance is reached through the build itself: `app/entry.server.tsx`
// re-exports the context, and the custom server reads it from
// `build.entry.module`. `loadReactRouterServerBuild` hands out the last-good
// development build, so the loader and the load context share one module.

let port: number;
let cwd: string;
let stop: (() => unknown) | undefined;

test.beforeAll(async () => {
  port = await getPort();
  cwd = await createProject({
    "rsbuild.config.ts": dedent`
      import { defineConfig } from "@rsbuild/core";
      import { pluginReact } from "@rsbuild/plugin-react";
      import { pluginReactRouter } from "rsbuild-plugin-react-router";

      export default defineConfig({
        server: { port: ${port}, strictPort: true },
        plugins: [pluginReact(), pluginReactRouter({ customServer: true })],
      });
    `,
    "app/context.ts": String.raw`
      import { createContext } from "react-router";
      export const valueContext = createContext<string>();
    `,
    "app/entry.server.tsx": String.raw`
      import { renderToString } from "react-dom/server";
      import { ServerRouter, type EntryContext } from "react-router";

      // Re-exported so a custom server can build its load context from the
      // very same context instance the routes import.
      export { valueContext } from "./context";

      export default function handleRequest(
        request: Request,
        responseStatusCode: number,
        responseHeaders: Headers,
        routerContext: EntryContext,
      ) {
        const html = renderToString(
          <ServerRouter context={routerContext} url={request.url} />,
        );
        responseHeaders.set("Content-Type", "text/html");
        return new Response("<!DOCTYPE html>" + html, {
          status: responseStatusCode,
          headers: responseHeaders,
        });
      }
    `,
    "server.mjs": String.raw`
      import { createRequestHandler } from "@react-router/express";
      import { createRsbuild, loadConfig } from "@rsbuild/core";
      import { RouterContextProvider } from "react-router";
      import {
        loadReactRouterServerBuild,
        resolveReactRouterServerBuild,
      } from "rsbuild-plugin-react-router";
      import express from "express";

      const app = express();
      const isDev = process.env.NODE_ENV !== "production";
      let devServer;
      let build;

      if (isDev) {
        const { content } = await loadConfig();
        const rsbuild = await createRsbuild({ rsbuildConfig: content });
        devServer = await rsbuild.createDevServer();
        app.use(devServer.middlewares);
        build = () => loadReactRouterServerBuild(devServer);
      } else {
        app.use(express.static("build/client", { index: false }));
        const productionBuild = await resolveReactRouterServerBuild(
          import("./build/server/static/js/app.js"),
        );
        build = () => Promise.resolve(productionBuild);
      }

      app.all(
        "*",
        createRequestHandler({
          build,
          mode: isDev ? "development" : "production",
          getLoadContext: async () => {
            const { valueContext } = (await build()).entry.module;
            return new RouterContextProvider([[valueContext, "value"]]);
          },
        }),
      );

      const port = ${port};
      const server = app.listen(port, () => {
        console.log('http://localhost:' + port);
        devServer?.afterListen();
      });
      devServer?.connectWebSocket({ server });
    `,
    "app/routes/_index.tsx": String.raw`
      import { useLoaderData } from "react-router";
      import { valueContext } from "../context";

      export const loader = ({ context }) => {
        return { value: context.get(valueContext) }
      }

      export default function IndexRoute() {
        let { value } = useLoaderData<typeof loader>();
        return (
          <div id="index">
            <p data-context>Context: {value}</p>
          </div>
        );
      }
    `,
  });
  stop = await customDev({ cwd, port });
});
test.afterAll(() => stop?.());

test("Load context / express", async ({ page }) => {
  let pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto(`http://localhost:${port}/`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#index [data-context]")).toHaveText(
    "Context: value",
  );
  expect(pageErrors).toEqual([]);
});
