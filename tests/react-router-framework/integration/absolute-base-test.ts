import { expect } from "@playwright/test";

import type { Files } from "./helpers/rsbuild.js";
import { test, rsbuildConfig } from "./helpers/rsbuild.js";

let files: Files = async ({ port }) => ({
  // Vite absolute-URL `base` -> rsbuild dev/output asset prefixes
  "rsbuild.config.ts": await rsbuildConfig.basic({
    port,
    base: `http://localhost:${port}/`,
  }),
  "app/routes/_index.tsx": `
    export default () => <h1 data-title>This should work</h1>;
  `,
});

test("absolute base / dev", async ({ page, dev }) => {
  let { port } = await dev(files);

  await page.goto(`http://localhost:${port}/`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("[data-title]")).toHaveText("This should work");
  expect(page.errors).toEqual([]);
});

test("absolute base / build", async ({ page, reactRouterServe }) => {
  let { port } = await reactRouterServe(files);

  await page.goto(`http://localhost:${port}/`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("[data-title]")).toHaveText("This should work");
  expect(page.errors).toEqual([]);
});
