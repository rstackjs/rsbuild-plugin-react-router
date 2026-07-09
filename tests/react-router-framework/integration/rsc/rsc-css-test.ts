import { expect } from "@playwright/test";

import { test } from "../helpers/rsbuild";
import { js, validateRSCHtml } from "./utils";

const css = String.raw;

// End-to-end proof for the `entryCssFiles` streaming fix in
// `src/rsc-route-transforms.ts` (createServerRouteEntry): CSS that is imported
// by a SERVER-FIRST route (imported in the RSC layer, route exports
// `ServerComponent`) must be applied at first paint. The unit tests only pin
// the emitted wrapper code; this confirms rspack's RscServerPlugin actually
// populates `entryCssFiles` at runtime so the stylesheet link is streamed into
// the server-rendered document BEFORE hydration.
test.describe("RSC server-first route CSS", () => {
  test("streams server-first route CSS as a stylesheet link at first paint", async ({
    page,
    browser,
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
        // Server-first route: CSS imported in the RSC layer, route exports
        // ServerComponent (no default/client component). This CSS never reaches
        // the client compilation's <Links>, so it can only reach first paint via
        // the entryCssFiles stream. Colocated inside a route folder so flatRoutes
        // treats route.tsx as the route and does not pick up styles.css itself.
        "app/routes/css/route.tsx": js`
          import "./styles.css";

          export function ServerComponent() {
            return (
              <div id="css-target" className="server-first-css">
                <h1 data-testid="rsc-css-title">RSC Server-First CSS</h1>
              </div>
            );
          }
        `,
        "app/routes/css/styles.css": css`
          .server-first-css {
            padding: 42px;
          }
        `,
      }),
      "rsc-framework",
    );

    let url = `http://localhost:${port}/css`;

    // (a) The raw server-rendered document (no browser JS involved) must contain
    // the stylesheet link. This is the discriminator for the fix: if
    // entryCssFiles is empty at runtime the link never gets streamed and no .css
    // stylesheet link appears in the document.
    let res = await page.request.get(url);
    let html = await res.text();
    validateRSCHtml(html); // confirm this is genuinely an RSC document response
    let cssLink = html.match(
      /<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/,
    );
    expect(
      cssLink,
      `Server document must contain a CSS stylesheet link. If null, entryCssFiles was EMPTY at runtime (mechanism did not populate). Document head:\n${html.slice(
        0,
        2500,
      )}`,
    ).toBeTruthy();

    // (b) First paint proof: with JS disabled the browser only has the streamed
    // server document. If the computed style applies, the stylesheet link was
    // present and resolvable at first paint (before/without hydration).
    let ctx = await browser.newContext({ javaScriptEnabled: false });
    try {
      let nojsPage = await ctx.newPage();
      await nojsPage.goto(url, { waitUntil: "load" });
      await expect(nojsPage.getByTestId("rsc-css-title")).toHaveText(
        "RSC Server-First CSS",
      );
      await expect(nojsPage.locator("#css-target")).toHaveCSS(
        "padding",
        "42px",
      );
    } finally {
      await ctx.close();
    }
  });
});
