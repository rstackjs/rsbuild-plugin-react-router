import { test, expect } from "@playwright/test";

import {
  createFixture,
  createAppFixture,
  js,
} from "./helpers/create-fixture.js";
import type { Fixture, AppFixture } from "./helpers/create-fixture.js";
import { PlaywrightFixture } from "./helpers/playwright-fixture.js";
import { type TemplateName, rsbuildConfig } from "./helpers/rsbuild.js";

// Upstream react-router has ZERO svgr coverage; these tests define the parity
// bar for `@rsbuild/plugin-svgr`. Correct `.svg?react` / `.svg?url` usage
// mirrors rsbuild's own `plugin-svgr/query-react` e2e case.
const templateNames = [
  "rsbuild-template",
  "rsc-framework",
] as const satisfies TemplateName[];

// Simple, server-first-compatible SVG (no runtime hooks). The known viewBox is
// asserted on the inline <svg> the SVGR component renders.
const ICON_SVG = js`
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16v16H4z" fill="currentColor" />
  </svg>
`;

test.describe("SVGR", () => {
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
              svgr: true,
            }),
            "app/assets/icon.svg": ICON_SVG,
            "app/root.tsx": js`
              import { Outlet, Scripts } from "react-router"

              export default function Root() {
                return (
                  <html>
                    <head></head>
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
              import Icon from "../assets/icon.svg?react";
              import iconUrl from "../assets/icon.svg?url";

              export default function Component() {
                return (
                  <>
                    <Icon data-svg-component />
                    <img data-svg-url src={iconUrl} alt="icon" />
                  </>
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

      test("resolves .svg?react to an inline component and .svg?url to an asset URL", async ({
        page,
      }) => {
        let app = new PlaywrightFixture(appFixture, page);
        await app.goto("/");

        // `.svg?react` renders an inline <svg> element carrying the source
        // viewBox and any spread props (data-svg-component).
        let component = page.locator("[data-svg-component]");
        await expect(component).toBeAttached();
        await expect(component).toHaveAttribute("viewBox", "0 0 24 24");
        expect(
          await component.evaluate((el) => el.tagName.toLowerCase()),
        ).toBe("svg");

        // `.svg?url` resolves to an emitted asset URL (or an inlined data URI
        // when under the data-uri limit).
        let urlImg = page.locator("[data-svg-url]");
        await expect(urlImg).toBeAttached();
        let src = await urlImg.getAttribute("src");
        expect(src).toBeTruthy();
        expect(src ?? "").toMatch(/\.svg$|^data:image\/svg/);
      });
    });
  }
});
