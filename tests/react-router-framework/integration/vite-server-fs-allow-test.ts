import { test, expect } from "@playwright/test";
import getPort from "get-port";

import {
  createProject,
  customDev,
  EXPRESS_SERVER,
  viteConfig,
} from "./helpers/vite.js";

let files = {
  "app/routes/test-route.tsx": String.raw`
    export default function IndexRoute() {
      return <div id="test">Hello world</div>
    }
  `,
};

// Skipped: Vite's server.fs.allow is a Vite-only static file serving
// restriction with no rsbuild equivalent; without it this test asserts
// nothing beyond basic rendering covered elsewhere.
test.describe.skip(async () => {
  let port: number;
  let cwd: string;
  let stop: () => void;

  test.beforeAll(async () => {
    port = await getPort();
    cwd = await createProject({
      "rsbuild.config.ts": await viteConfig.basic({ port }),
      "server.mjs": EXPRESS_SERVER({ port }),
      ...files,
    });
    stop = await customDev({ cwd, port });
  });
  test.afterAll(() => stop());

  test("Vite / server.fs.allow / works with basic allow list", async ({
    page,
  }) => {
    let pageErrors: unknown[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(`http://localhost:${port}/test-route`, {
      waitUntil: "networkidle",
    });
    expect(pageErrors).toEqual([]);

    let testContent = page.locator("#test");
    await expect(testContent).toBeAttached();

    expect(pageErrors).toEqual([]);
  });
});
