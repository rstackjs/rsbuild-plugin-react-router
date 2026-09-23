import { mkdirSync, renameSync, symlinkSync } from "node:fs";
import * as path from "node:path";
import { expect } from "@playwright/test";
import stripAnsi from "strip-ansi";
import dedent from "dedent";

import type { Files } from "./helpers/rsbuild.js";
import {
  test,
  createProject,
  grep,
  build,
  rsbuildConfig,
} from "./helpers/rsbuild.js";

let serverOnlyModule = `
  export const serverOnly = "SERVER_ONLY";
  export default serverOnly;
`;

let tsconfig = (aliases: Record<string, string[]>) => `
  {
    "include": ["env.d.ts", "**/*.ts", "**/*.tsx"],
    "compilerOptions": {
      "lib": ["DOM", "DOM.Iterable", "ES2022"],
      "verbatimModuleSyntax": true,
      "esModuleInterop": true,
      "jsx": "react-jsx",
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "resolveJsonModule": true,
      "target": "ES2022",
      "strict": true,
      "allowJs": true,
      "baseUrl": ".",
      "paths": ${JSON.stringify(aliases)},
      "noEmit": true
    }
  }
`;

test("dead-code elimination for server exports", async () => {
  let cwd = await createProject({
    "app/utils.server.ts": serverOnlyModule,
    "app/.server/utils.ts": serverOnlyModule,
    "app/routes/remove-server-exports-and-dce.tsx": `
      import fs from "node:fs";
      import { useLoaderData } from "react-router";

      import { serverOnly as serverOnlyFile } from "../utils.server";
      import { serverOnly as serverOnlyDir } from "../.server/utils";

      export const loader = () => {
        let contents = fs.readFileSync("server_only.txt");
        return { serverOnlyFile, serverOnlyDir, contents }
      }

      export const action = () => {
        let contents = fs.readFileSync("server_only.txt");
        console.log({ serverOnlyFile, serverOnlyDir, contents });
        return null;
      }

      export default function() {
        let { data } = useLoaderData<typeof loader>();
        return <pre>{JSON.stringify(data)}</pre>;
      }
    `,
  });
  let { status } = build({ cwd });
  expect(status).toBe(0);

  let lines = grep(
    path.join(cwd, "build/client"),
    /SERVER_ONLY|SERVER_ONLY|node:fs/,
  );
  expect(lines).toHaveLength(0);
});

test.describe("route / server-only module referenced by client", () => {
  let matrix: Array<{
    type: string;
    path: string;
    specifier: string;
  }> = [
    {
      type: "file",
      path: "app/utils.server.ts",
      specifier: `~/utils.server`,
    },
    {
      type: "dir",
      path: "app/.server/utils.ts",
      specifier: `~/.server/utils`,
    },

    {
      type: "file alias",
      path: "app/utils.server.ts",
      specifier: `#dot-server-file`,
    },
    {
      type: "dir alias",
      path: "app/.server/utils.ts",
      specifier: `#dot-server-dir/utils`,
    },
  ];

  let cases = matrix.flatMap(({ type, path, specifier }) => [
    {
      name: `default import / .server ${type}`,
      path,
      specifier,
      route: `
        import serverOnly from "${specifier}";
        export default () => <h1>{serverOnly}</h1>;
      `,
    },
    {
      name: `named import / .server ${type}`,
      path,
      specifier,
      route: `
        import { serverOnly } from "${specifier}"
        export default () => <h1>{serverOnly}</h1>;
      `,
    },
    {
      name: `namespace import / .server ${type}`,
      path,
      specifier,
      route: `
        import * as utils from "${specifier}"
        export default () => <h1>{utils.serverOnly}</h1>;
      `,
    },
  ]);

  for (let { name, path, specifier, route } of cases) {
    test(name, async () => {
      let cwd = await createProject({
        "tsconfig.json": tsconfig({
          "~/*": ["app/*"],
          "#dot-server-file": ["app/utils.server.ts"],
          "#dot-server-dir/*": ["app/.server/*"],
        }),
        [path]: serverOnlyModule,
        "app/routes/_index.tsx": route,
      });
      let result = build({ cwd });
      let stderr = stripAnsi(result.stderr.toString("utf8"));

      expect(result.status).not.toBe(0);

      expect(stderr).toMatch(
        `Server-only module referenced by client: ${path}`,
      );

      expect(stderr).toMatch(/Import traces \(entry → error\):/);
      expect(stderr).toMatch(/app\/routes\/_index\.tsx/);
    });
  }
});

test.describe("non-route / server-only module referenced by client", () => {
  let matrix = [
    { type: "file", path: "app/utils.server.ts", specifier: `~/utils.server` },
    { type: "dir", path: "app/.server/utils.ts", specifier: `~/.server/utils` },
  ];

  let cases = matrix.flatMap(({ type, path, specifier }) => [
    {
      name: `default import / .server ${type}`,
      path,
      specifier,
      nonroute: `
        import serverOnly from "${specifier}";
        export const getServerOnly = () => serverOnly;
      `,
    },
    {
      name: `named import / .server ${type}`,
      path,
      specifier,
      nonroute: `
        import { serverOnly } from "${specifier}";
        export const getServerOnly = () => serverOnly;
      `,
    },
    {
      name: `namespace import / .server ${type}`,
      path,
      specifier,
      nonroute: `
        import * as utils from "${specifier}";
        export const getServerOnly = () => utils.serverOnly;
      `,
    },
  ]);

  for (let { name, path, specifier, nonroute } of cases) {
    test(name, async () => {
      let cwd = await createProject({
        [path]: serverOnlyModule,
        "app/reexport-server-only.ts": nonroute,
        "app/routes/_index.tsx": `
          import { serverOnly } from "~/reexport-server-only"
          export default () => <h1>{serverOnly}</h1>;
        `,
      });
      let result = build({ cwd });
      let stderr = stripAnsi(result.stderr.toString("utf8"));

      expect(result.status).not.toBe(0);

      expect(stderr).toMatch(
        `Server-only module referenced by client: ${path}`,
      );

      expect(stderr).toMatch(/Import traces \(entry → error\):/);
      expect(stderr).toMatch(/app\/reexport-server-only\.ts/);
    });
  }
});


test("route re-exports use native dependency aliases and prune server exports", async () => {
  const cwd = await createProject({
    "rsbuild.config.ts": `
      import path from "node:path";
      import { defineConfig } from "@rsbuild/core";
      import { pluginReact } from "@rsbuild/plugin-react";
      import { pluginReactRouter } from "rsbuild-plugin-react-router";
      export default defineConfig({
        plugins: [pluginReact(), pluginReactRouter({ typegen: false })],
        tools: { rspack: { resolve: {
          alias: { "@route": path.resolve("app/routes/wrong.tsx") },
          byDependency: { esm: { alias: { "@route": path.resolve("app/routes/target.tsx") } } },
        } } },
      });
    `,
    "app/secret.server.ts": serverOnlyModule,
    "app/routes/target.tsx": `
      import serverOnly from "../secret.server";
      export function loader() { return serverOnly; }
      export function meta() { return [{ title: "Correct shared metadata" }]; }
      export default function Target() { return <h1>Target</h1>; }
    `,
    "app/routes/wrong.tsx": `export default function Wrong() { return <h1>Wrong</h1>; }`,
    "app/routes/_index.tsx": `
      export { meta } from "@route";
      export default function Index() { return <h1>Index</h1>; }
    `,
    "app/routes/relative.tsx": `
      export { meta } from "./target";
      export default function Relative() { return <h1>Relative</h1>; }
    `,
    "app/routes/named.tsx": `
      import { meta } from "@route";
      export default function Named() { return <h1>{meta()[0].title}</h1>; }
    `,
  });
  const result = build({ cwd });
  expect(result.status, result.stdout.toString() + result.stderr.toString()).toBe(0);
  expect(grep(path.join(cwd, "build/client"), /SERVER_ONLY/)).toHaveLength(0);
  expect(grep(path.join(cwd, "build/server"), /SERVER_ONLY/).length).toBeGreaterThan(0);
});


for (const symlinked of ["route file", "app directory"]) {
  test(`prunes server exports through a symlinked ${symlinked}`, async () => {
    const cwd = await createProject({
      "app/routes.ts": `export default [
        { index: true, file: "routes/_index.tsx" },
        { path: "target", file: "routes/target.tsx" },
      ];`,
      "app/secret.server.ts": serverOnlyModule,
      "app/routes/target.tsx": `
        import serverOnly from "../secret.server";
        export function loader() { return serverOnly; }
        export function meta() { return [{ title: "Symlinked route" }]; }
        export default function Target() { return <h1>Target</h1>; }
      `,
      "app/routes/_index.tsx": `
        export { meta } from "~/routes/target";
        export default function Index() { return <h1>Index</h1>; }
      `,
    });
    if (symlinked === "route file") {
      mkdirSync(path.join(cwd, "app/route-impl"));
      const registered = path.join(cwd, "app/routes/target.tsx");
      const actual = path.join(cwd, "app/route-impl/target.tsx");
      renameSync(registered, actual);
      symlinkSync(actual, registered, "file");
    } else {
      const registered = path.join(cwd, "app");
      const actual = path.join(cwd, "app-real");
      renameSync(registered, actual);
      symlinkSync(actual, registered, "junction");
    }
    const result = build({ cwd });
    expect(result.status, result.stdout.toString() + result.stderr.toString()).toBe(0);
    expect(grep(path.join(cwd, "build/client"), /SERVER_ONLY/)).toHaveLength(0);
    expect(grep(path.join(cwd, "build/server"), /SERVER_ONLY/).length).toBeGreaterThan(0);
  });
}
