import { globSync, readFileSync } from "node:fs";
import path from "pathe";
import { expect, test } from "@playwright/test";

import {
  createAppFixture,
  createFixture,
  js,
  type AppFixture,
  type Fixture,
} from "./helpers/create-fixture.js";
import { PlaywrightFixture } from "./helpers/playwright-fixture.js";
import { reactRouterConfig } from "./helpers/rsbuild.js";

test.describe("SPA recovery route export stripping", () => {
  let fixture: Fixture;
  let appFixture: AppFixture;

  test.beforeAll(async () => {
    fixture = await createFixture({
      spaMode: true,
      stripServerOnlyRouteExportsInSpa: true,
      files: {
        "react-router.config.ts": reactRouterConfig({
          ssr: false,
          splitRouteModules: true,
        }),
        "app/root.tsx": js`
          import { Links, Meta, Outlet, Scripts } from "react-router";

          const serverOnly = "SERVER_EXPORT_EXECUTED";
          export function loader() { throw new Error(serverOnly); }
          export function clientLoader() { return "root client data"; }
          export function action() { throw new Error(serverOnly); }
          export function clientAction() { return "root client action"; }
          export function headers() { throw new Error(serverOnly); }

          export function HydrateFallback() {
            return (
              <html><head><Meta /><Links /></head><body>
                <p data-fallback>Loading recovery app</p><Scripts />
              </body></html>
            );
          }

          export default function Root() {
            return (
              <html><head><Meta /><Links /></head><body>
                <p data-root>Recovery app</p><Outlet /><Scripts />
              </body></html>
            );
          }
        `,
        "app/routes/_index.tsx": js`
          import { Link } from "react-router";
          export default function Index() {
            return <><h1>Home</h1><Link to="/deep">Deep route</Link></>;
          }
        `,
        "app/routes/deep.tsx": js`
          import { Form, Link, useActionData, useLoaderData } from "react-router";

          const serverOnly = "DEEP_SERVER_EXPORT_EXECUTED";
          export function loader() { throw new Error(serverOnly); }
          export function clientLoader() { return "deep client data"; }
          export function action() { throw new Error(serverOnly); }
          export function clientAction() { return "deep client action"; }
          export function headers() { throw new Error(serverOnly); }

          export default function Deep() {
            const loaderData = useLoaderData();
            const actionData = useActionData();
            return <>
              <h1>Deep</h1>
              <p data-loader>{loaderData}</p>
              <p data-action>{actionData}</p>
              <Form method="post"><button type="submit">Run action</button></Form>
              <Link to="/">Home</Link>
            </>;
          }
        `,
      },
    });
    appFixture = await createAppFixture(fixture);
  });

  test.afterAll(() => appFixture.close());

  test("build strips server exports from build-time and browser route modules", () => {
    const emittedJavaScript = globSync("build/**/*.js", {
      cwd: fixture.projectDir,
    })
      .map((file) => readFileSync(path.join(fixture.projectDir, file), "utf8"))
      .join("\n");
    expect(emittedJavaScript).not.toContain("SERVER_EXPORT_EXECUTED");
    expect(emittedJavaScript).not.toContain("DEEP_SERVER_EXPORT_EXECUTED");
  });

  test("deep static-host navigation stays client-only", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const app = new PlaywrightFixture(appFixture, page);
    const dataResponses = app.collectSingleFetchResponses();
    await app.goto("/deep", true);

    await expect(page.locator("[data-loader]")).toHaveText("deep client data");
    expect(
      await page.evaluate(() => {
        const route = (window as any).__reactRouterManifest.routes["routes/deep"];
        return {
          hasLoader: route.hasLoader,
          hasAction: route.hasAction,
          hasClientLoader: route.hasClientLoader,
          hasClientAction: route.hasClientAction,
        };
      }),
    ).toEqual({
      hasLoader: false,
      hasAction: false,
      hasClientLoader: true,
      hasClientAction: true,
    });

    await page.getByRole("button", { name: "Run action" }).click();
    await expect(page.locator("[data-action]")).toHaveText(
      "deep client action",
    );
    await app.clickLink("/");
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await page.context().setOffline(true);
    await app.clickLink("/deep");
    await expect(page.locator("[data-loader]")).toHaveText("deep client data");

    expect(dataResponses).toHaveLength(0);
    expect(errors).toEqual([]);
  });
});
