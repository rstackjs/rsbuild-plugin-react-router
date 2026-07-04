import { test, expect } from "@playwright/test";
import getPort from "get-port";

import { createProject, customDev, rsbuildConfig } from "./helpers/rsbuild.js";

let port: number;
let cwd: string;
let stop: () => void;

test.beforeAll(async () => {
  port = await getPort();
  cwd = await createProject({
    "rsbuild.config.ts": await rsbuildConfig.basic({ port }),
    "app/context.ts": String.raw`
      import { createContext } from "react-router";
      export const valueContext = createContext<string>();
    `,
    "server.mjs": String.raw`
      import { createRequestHandler } from "@react-router/express";
      import { RouterContextProvider } from "react-router";
      import express from "express";

      const app = express();

      if (process.env.NODE_ENV !== "production") {
        // Dev-mode custom load context is not yet supported by the Rsbuild
        // adapter: injecting a caller-owned RouterContextProvider requires the
        // route's context module (\`app/context.ts\`) to resolve to the SAME
        // instance the server bundle uses. The plugin owns the node
        // environment's entry list (\`modePlan.nodeEntries\`), so a fixture
        // cannot expose the context module as a separate \`loadBundle\` entry,
        // and the ServerBuild does not re-export it. Supporting this needs a
        // plugin-side change (e.g. exposing route context modules to custom
        // dev servers), which is out of scope for the test harness.
        throw new Error(
          "Custom dev servers with a custom load context need an Rsbuild dev-server adapter that can expose the route context module",
        );
      }
      app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
      app.use(express.static("build/client", { maxAge: "1h" }));

      app.all(
        "*",
        createRequestHandler({
          build: await import("./build/index.js"),
          getLoadContext: async () => {
            let { valueContext } = await import("./build/server/app/context.js");
            return new RouterContextProvider([[valueContext, "value"]]);
          },
        })
      );

      const port = ${port};
      app.listen(port, () => console.log('http://localhost:' + port));
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
test.afterAll(() => stop());

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
