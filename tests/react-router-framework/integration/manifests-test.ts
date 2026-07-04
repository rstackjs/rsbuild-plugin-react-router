import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import getPort from "get-port";
import dedent from "dedent";

import { createProject, build, rsbuildConfig } from "./helpers/rsbuild.js";

const js = String.raw;

function createRoute(path: string) {
  return {
    [`app/routes/${path}`]: js`
      export default function Route() {
        return <p>Path: ${path}</p>;
      }
    `,
  };
}

const TEST_ROUTES = [
  "_index.tsx",
  "parent-route.tsx",
  "parent-route.child-route.tsx",
];

const files = {
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
  ...Object.assign({}, ...TEST_ROUTES.map(createRoute)),
};

test.describe(() => {
  let cwd: string;

  test.beforeAll(async () => {
    cwd = await createProject({
      "react-router.config.ts": dedent(js`
        export default {
          buildEnd: async ({ buildManifest }) => {
            let fs = await import("node:fs");
            await fs.promises.writeFile(
              "build/test-manifest.json",
              JSON.stringify(buildManifest, null, 2),
              "utf-8",
            );
          },
        }
      `),
      "rsbuild.config.ts": dedent(js`
        import { defineConfig } from "@rsbuild/core";
        import { pluginReact } from "@rsbuild/plugin-react";
        import { pluginReactRouter } from "rsbuild-plugin-react-router";

        export default defineConfig({
          output: { manifest: true }, // Vite: build.manifest
          plugins: [pluginReact(), pluginReactRouter()],
        });
      `),
      ...files,
    });

    build({ cwd });
  });

  test("manifests enabled / Build manifests", () => {
    // rsbuild emits manifest.json at each environment's dist root
    expect(fs.existsSync(path.join(cwd, "build", "client", "manifest.json"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(cwd, "build", "server", "manifest.json"))).toBe(
      true,
    );
  });

  test("manifests enabled / React Router build manifest", async () => {
    let manifestPath = path.join(cwd, "build", "test-manifest.json");
    expect(JSON.parse(fs.readFileSync(manifestPath, "utf8"))).toEqual({
      routes: {
        root: {
          file: "root.tsx",
          id: "root",
          path: "",
        },
        "routes/_index": {
          file: "routes/_index.tsx",
          id: "routes/_index",
          index: true,
          parentId: "root",
        },
        "routes/parent-route": {
          file: "routes/parent-route.tsx",
          id: "routes/parent-route",
          parentId: "root",
          path: "parent-route",
        },
        "routes/parent-route.child-route": {
          file: "routes/parent-route.child-route.tsx",
          id: "routes/parent-route.child-route",
          parentId: "routes/parent-route",
          path: "child-route",
        },
      },
    });
  });
});

test.describe(() => {
  let cwd: string;

  test.beforeAll(async () => {
    cwd = await createProject({
      "rsbuild.config.ts": await rsbuildConfig.basic({ port: await getPort() }),
      ...files,
    });

    build({ cwd });
  });

  test("manifest disabled / Build manifests", () => {
    let manifestClient = path.join(cwd, "build", "client", "manifest.json");
    expect(fs.existsSync(manifestClient)).toBe(false);

    let manifestServer = path.join(cwd, "build", "server", "manifest.json");
    expect(fs.existsSync(manifestServer)).toBe(false);
  });
});
