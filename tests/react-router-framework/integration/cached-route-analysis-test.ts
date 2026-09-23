import { globSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { test, expect } from "@playwright/test";
import {
  build,
  createProject,
  expectBuildSucceeded,
  rsbuildConfig,
} from "./helpers/rsbuild.js";

test("warm builds retain and invalidate compiled MDX route analysis", async () => {
  const cwd = await createProject({
    "rsbuild.config.ts": await rsbuildConfig.basic({
      mdx: true,
      buildCache: true,
    }),
    "app/routes/mdx.mdx": `
export const loader = () => ({ content: "MDX loader" });

# Compiled route
`,
  });
  const routeManifest = () => {
    const [manifestPath] = globSync(
      path.join(cwd, "build/client/**/manifest-*.js")
    );
    return runInNewContext(
      `${readFileSync(manifestPath, "utf8")}; window.__reactRouterManifest.routes['routes/mdx']`,
      { window: {} }
    );
  };
  expectBuildSucceeded(build({ cwd }));
  expect(routeManifest()).toMatchObject({
    hasLoader: true,
    hasDefaultExport: true,
  });
  expectBuildSucceeded(build({ cwd }));
  expect(routeManifest()).toMatchObject({
    hasLoader: true,
    hasDefaultExport: true,
  });
  writeFileSync(
    path.join(cwd, "app/routes/mdx.mdx"),
    "# Updated route without a loader\n"
  );
  expectBuildSucceeded(build({ cwd }));
  expect(routeManifest()).toMatchObject({
    hasLoader: false,
    hasDefaultExport: true,
  });
});
