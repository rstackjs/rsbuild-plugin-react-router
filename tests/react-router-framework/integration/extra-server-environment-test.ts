import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import path from "node:path";

import { build, createProject, reactRouterConfig } from "./helpers/rsbuild.js";

const js = String.raw;

test("ignores external server environments without skipping React Router build hooks", async () => {
  let cwd = await createProject(
    {
      "react-router.config.ts": reactRouterConfig(),
      "rsbuild.config.ts": js`
        import { defineConfig } from "@rsbuild/core";
        import { pluginReact } from "@rsbuild/plugin-react";
        import { pluginReactRouter } from "rsbuild-plugin-react-router";

        export default defineConfig({
          // External build orchestrators can introduce additional server
          // environments that React Router should ignore.
          environments: {
            externalServerEnv: {
              output: { target: "node" },
              source: { entry: { index: "./external-server-env.ts" } },
            },
          },
          output: {
            dataUriLimit: 0, // Vite: build.assetsInlineLimit
          },
          plugins: [pluginReact(), pluginReactRouter()],
        });
      `,
      "app/root.tsx": js`
        import { Links, Meta, Outlet, Scripts } from "react-router";

        export default function Root() {
          return (
            <html lang="en">
              <head>
                <Meta />
                <Links />
              </head>
              <body>
                <Outlet />
                <Scripts />
              </body>
            </html>
          );
        }
      `,
      "app/routes/_index.tsx": js`
        export default function Index() {
          return <h1>Hello</h1>;
        }
      `,
      "app/assets/test.txt": "test",
      "app/ssr-only-asset.server.ts": js`
        import txtUrl from "./assets/test.txt?url";

        export { txtUrl };
      `,
      "app/routes/ssr-only-assets.tsx": js`
        import { useLoaderData } from "react-router";

        export const loader = async () => {
          let { txtUrl } = await import("../ssr-only-asset.server");
          return { txtUrl };
        };

        export default function SsrOnlyAssetsRoute() {
          const loaderData = useLoaderData<typeof loader>();
          return <a href={loaderData.txtUrl}>txtUrl</a>;
        }
      `,
      "external-server-env.ts": js`
        export default {
          async fetch() {
            return new Response("ok");
          },
        };
      `,
    },
    "rsbuild-template",
  );

  let { status, stderr } = build({ cwd });

  expect(stderr.toString().trim()).toBeFalsy();
  expect(status).toBe(0);
  // rsbuild emits static assets as static/assets/[name].[hash][ext]
  expect(
    fs
      .readdirSync(path.join(cwd, "build/client/static/assets"))
      .filter((file) => /^test\..*\.txt$/.test(file)).length,
  ).toBe(1);
});
