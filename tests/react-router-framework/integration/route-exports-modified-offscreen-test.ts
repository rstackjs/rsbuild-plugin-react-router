import { test, expect } from "@playwright/test";
import getPort from "get-port";

import {
  createProject,
  createEditor,
  dev,
  rsbuildConfig,
} from "./helpers/rsbuild.js";

const files = {
  "app/routes/_index.tsx": String.raw`
    import { useState, useEffect } from "react";
    import { Link } from "react-router";

    export default function IndexRoute() {
      const [mounted, setMounted] = useState(false);
      useEffect(() => {
        setMounted(true);
      }, []);

      return (
        <div>
          <p data-mounted>Mounted: {mounted ? "yes" : "no"}</p>
          <Link to="/other">/other</Link>
        </div>
      );
    }
  `,
  "app/routes/other.tsx": String.raw`
    import { useLoaderData } from "react-router";

    export const loader = () => "hello";

    export default function Route() {
      const loaderData = useLoaderData();
      return (
        <div data-loader-data>loaderData = {JSON.stringify(loaderData)}</div>
      );
    }
  `,
};

test.describe(async () => {
  let port: number;
  let cwd: string;
  let stop: () => void;

  test.beforeAll(async () => {
    port = await getPort();
    cwd = await createProject({
      "rsbuild.config.ts": await rsbuildConfig.basic({ port }),
      ...files,
    });
    stop = await dev({ cwd, port });
  });
  test.afterAll(() => stop());

  test("dev / route exports modified offscreen", async ({
    page,
    context,
    browserName,
  }) => {
    let pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    let edit = createEditor(cwd);

    await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-mounted]")).toHaveText("Mounted: yes");
    expect(pageErrors).toEqual([]);

    let originalContents: string;

    // Removing loader export in other page should invalidate manifest
    await edit("app/routes/other.tsx", (contents) => {
      originalContents = contents;
      return contents.replace(/export const loader.*/, "");
    });
    // Wait until the dev server serves the updated route before reloading.
    // Upstream sleeps for 200ms here, but on a loaded CI runner the rebuild
    // can outlast that. The browser would then load the page while the
    // server build is still the previous one, and React Router's stale-client
    // check would resync with a document reload of /other on the very next
    // navigation. A direct document load of a route without a loader hydrates
    // `null` against a server render of `undefined` (a React Router
    // inconsistency), which would surface here as an unrelated hydration error.
    await expect(async () => {
      let response = await page.request.get(`http://localhost:${port}/other`);
      expect(await response.text()).not.toContain("hello");
    }).toPass();

    // After browser reload, client should be aware that there's no loader on the other route
    if (browserName === "webkit") {
      // Force new page instance for webkit.
      // Otherwise browser doesn't seem to fetch new manifest probably due to caching.
      page = await context.newPage();
    }
    // In case the earlier wait wasn't enough, let the test try again
    await expect(async () => {
      await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-mounted]")).toHaveText("Mounted: yes");
      await page.getByRole("link", { name: "/other" }).click();
      await expect(page.locator("[data-loader-data]")).toHaveText(
        "loaderData = null",
      );
    }).toPass();
    expect(pageErrors).toEqual([]);

    // Revert route to original state to check HMR works and to ensure the
    // original file contents were valid
    await edit("app/routes/other.tsx", () => originalContents);
    await expect(page.locator("[data-loader-data]")).toHaveText(
      'loaderData = "hello"',
    );
    expect(pageErrors).toEqual([]);
  });
});
