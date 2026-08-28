import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

import { createProject, build, reactRouterConfig } from "./helpers/rsbuild.js";

const js = String.raw;

// `fs.globSync("**/*")` silently stops short of deeply nested files, which is
// precisely where a leaked absolute path lands, so walk the tree instead.
const listEmittedFiles = (cwd: string, dir: string) =>
  readdirSync(path.join(cwd, dir), { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".js"));

// A route table built with `relative()` resolves route files to absolute paths,
// so React Router relativizes `file` but derives an *absolute* route id. The id
// is an opaque runtime identifier; when it is used as an rspack entry name the
// chunk is written into a directory tree mirroring the developer's checkout and
// that path is published in the browser manifest.
test.describe("Route entry names", () => {
  test("keeps the app directory out of emitted assets and the browser manifest", async () => {
    let cwd = await createProject({
      // SPA + framework mode, where this was first observed. SSR shares the very
      // same route entry construction.
      "react-router.config.ts": reactRouterConfig({ ssr: false }),
      "app/routes.ts": js`
        import type { RouteConfig } from "@react-router/dev/routes";
        import { relative } from "@react-router/dev/routes";

        const { route } = relative(import.meta.dirname);

        export default [
          route("customers", "routes/customers.tsx"),
        ] satisfies RouteConfig;
      `,
      "app/routes/customers.tsx": js`
        export async function clientLoader() {
          return { name: "Ada" };
        }

        export default function Customers() {
          return <h1 data-testid="customers">Customers</h1>;
        }
      `,
    });

    let { status, stderr } = build({ cwd });
    expect(stderr.toString()).toBe("");
    expect(status).toBe(0);

    let emitted = listEmittedFiles(cwd, "build/client");

    // An absolute path leaks either verbatim or with its leading separator
    // swallowed by the `static/js/` join, so check for both shapes.
    let appDirectory = path.join(cwd, "app");
    let leaks = [cwd, appDirectory].flatMap((absolute) => [
      absolute,
      absolute.replace(/^[/\\]+/, ""),
    ]);
    let leaking = (text: string) => leaks.filter((leak) => text.includes(leak));

    expect(emitted.filter((file) => leaking(file).length > 0)).toEqual([]);

    // The route chunk must be a sibling of the route entry itself.
    expect(emitted).toContain(
      path.join("static/js/routes/customers-client-loader.js"),
    );

    let manifestFile = emitted.find((file) =>
      /static[/\\]js[/\\]manifest-[^/\\]+\.js$/.test(file),
    );
    expect(manifestFile).toBeDefined();

    let manifestSource = readFileSync(
      path.join(cwd, "build/client", manifestFile!),
      "utf8",
    );
    let assetUrls = (manifestSource.match(/['"]\/static\/[^'"]*['"]/g) ?? []).map(
      (quoted) => quoted.slice(1, -1),
    );
    // Guard against a vacuous pass if the manifest format ever changes.
    expect(assetUrls.length).toBeGreaterThan(0);

    expect(assetUrls.filter((url) => leaking(url).length > 0)).toEqual([]);
    // An entry name starting with `/` produced a `/static/js//...` double slash.
    expect(assetUrls.filter((url) => url.includes("//"))).toEqual([]);
    expect(assetUrls).toContain("/static/js/routes/customers-client-loader.js");

    // The route id itself stays absolute: it is the runtime contract behind
    // `useRouteLoaderData(id)` and `matches[].id`, and must not be sanitized.
    expect(manifestSource).toContain(path.join(appDirectory, "routes/customers"));
  });
});
