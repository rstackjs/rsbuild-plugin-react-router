import { test, expect } from "@playwright/test";

import {
  createFixture,
  createAppFixture,
  js,
  css,
} from "./helpers/create-fixture.js";
import type { Fixture, AppFixture } from "./helpers/create-fixture.js";
import { PlaywrightFixture } from "./helpers/playwright-fixture.js";
import { type TemplateName, rsbuildConfig } from "./helpers/rsbuild.js";

// Upstream react-router has ZERO Tailwind coverage; these tests define the
// parity bar for `@rsbuild/plugin-tailwindcss`. Tailwind v4 is CSS-first
// (`@import "tailwindcss";`) with no tailwind.config.js — content sources are
// auto-detected. Mirrors rsbuild's own `plugin-tailwindcss/basic` e2e case.
const templateNames = [
  "rsbuild-template",
  "rsc-framework",
] as const satisfies TemplateName[];

// Tailwind v4 automatic content detection anchors at the nearest git root.
// This fixture lives inside the plugin monorepo (`.tmp/integration/...`), whose
// git root carries a huge node_modules/examples tree — unscoped detection walks
// it and the build never completes. `source("../")` (relative to this CSS file
// at app/styles/) scopes detection to `app/`, which is the idiomatic Tailwind v4
// way to bound sources and mirrors how a real app declares its content.
const TAILWIND_CSS = css`
  @import "tailwindcss" source("../");
`;

test.describe("Tailwind", () => {
  for (const templateName of templateNames) {
    test.describe(`template: ${templateName}`, () => {
      let fixture: Fixture;
      let appFixture: AppFixture;

      test.beforeAll(async () => {
        fixture = await createFixture({
          templateName,
          files: {
            "rsbuild.config.ts": await rsbuildConfig.basic({
              templateName,
              tailwind: true,
            }),
            "app/styles/tailwind.css": TAILWIND_CSS,
            // <Links /> is required so classic framework mode injects the
            // route's imported CSS (the Tailwind stylesheet) into the document.
            "app/root.tsx": js`
              import { Links, Meta, Outlet, Scripts } from "react-router"

              export default function Root() {
                return (
                  <html>
                    <head>
                      <Meta />
                      <Links />
                    </head>
                    <body>
                      <main>
                        <Outlet />
                      </main>
                      <Scripts />
                    </body>
                  </html>
                );
              }
            `,
            "app/routes/_index.tsx": js`
              import "../styles/tailwind.css";

              export default function Component() {
                return (
                  <div data-tailwind className="text-3xl font-bold underline">
                    Tailwind utilities applied
                  </div>
                );
              }
            `,
          },
        });

        appFixture = await createAppFixture(fixture);
      });

      test.afterAll(() => {
        appFixture.close();
      });

      test("compiles Tailwind v4 utility classes", async ({ page }) => {
        let app = new PlaywrightFixture(appFixture, page);
        await app.goto("/");

        let el = page.locator("[data-tailwind]");
        await expect(el).toBeAttached();
        // `underline` -> text-decoration-line: underline confirms the Tailwind
        // stylesheet was generated and applied.
        await expect(el).toHaveCSS("text-decoration-line", "underline");
      });
    });
  }
});
