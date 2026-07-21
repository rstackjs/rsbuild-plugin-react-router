import { expect } from "@playwright/test";

import { test } from "../helpers/rsbuild";
import { js, validateRSCHtml } from "./utils";

test.describe("RSC Framework", () => {
  test("serves document responses with React Server Components payloads", async ({
    page,
    rsbuildPreview,
  }) => {
    let { port } = await rsbuildPreview(
      async () => ({
        "app/root.tsx": js`
          import { Links, Meta, Outlet } from "react-router";

          export function ServerLayout({ children }: { children: React.ReactNode }) {
            return (
              <html lang="en">
                <head>
                  <meta charSet="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <Meta />
                  <Links />
                </head>
                <body>
                  {children}
                </body>
              </html>
            );
          }

          export function ServerComponent() {
            return <Outlet />;
          }
        `,
        "app/routes/_index.tsx": js`
          export function ServerComponent() {
            return <h1 data-testid="rsc-title">RSC Framework Home</h1>;
          }
        `,
      }),
      "rsc-framework",
    );

    await page.goto(`http://localhost:${port}/`);

    await expect(page.getByTestId("rsc-title")).toHaveText(
      "RSC Framework Home",
    );
    validateRSCHtml(await page.content());
  });
});
