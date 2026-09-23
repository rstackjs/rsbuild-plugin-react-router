import { join } from "node:path";
import { expect } from "@playwright/test";

import { test, grep } from "../helpers/rsbuild";
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

test('RSC route imports preserve native resolution and prune server exports', async ({
  page,
  rsbuildPreview,
}) => {
  const { port, cwd } = await rsbuildPreview(
    async () => ({
      'app/routes/_index.tsx': js`
      import { customExport as relativeMeta } from "./target";
      import { customExport as aliasMeta } from "@route";
      export function clientLoader() { return { title: aliasMeta()[0].title }; }
      export default function Index() {
        return <h1>{relativeMeta()[0].title} {aliasMeta()[0].title}</h1>;
      }
    `,
      'app/routes/target.tsx': js`
      import { readSecret } from "../secret.server";
      export function loader() { return readSecret(); }
      export function customExport() { return [{ title: "Shared metadata" }]; }
      export default function Target() { return <h1>Target</h1>; }
    `,
      'app/secret.server.ts': js`
      export function readSecret() { return "SERVER_ONLY_SENTINEL"; }
    `,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: { '@route': ['./app/routes/target.tsx'] },
        },
      }),
    }),
    'rsc-framework'
  );
  expect(grep(join(cwd, "build/client"), /SERVER_ONLY_SENTINEL/)).toHaveLength(0);
  await page.goto(`http://localhost:${port}/`);
  await expect(page.getByRole('heading')).toHaveText(
    'Shared metadata Shared metadata'
  );
});
