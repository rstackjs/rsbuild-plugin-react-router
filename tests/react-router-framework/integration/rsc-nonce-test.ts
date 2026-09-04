import { expect, type Page } from "@playwright/test";
import getPort from "get-port";

import { js } from "./helpers/create-fixture.js";
import { test } from "./helpers/rsbuild.js";
import { implementations, setupRscTest } from "./rsc/utils.js";

// Adapted from upstream `rsc-nonce-test.ts`. The user-provided SSR entries use
// this plugin's React Server touchpoints (`react-server-dom-rspack`) and receive
// the client bootstrap scripts from the RSC server entry instead of Vite's
// `import.meta.viteRsc.loadBootstrapScriptContent`.

async function expectNonceSupport(page: Page, nonce: string) {
  const scripts = page.locator("script");
  const count = await scripts.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++) {
    expect(
      await scripts
        .nth(index)
        .evaluate((script: HTMLScriptElement) => script.nonce),
    ).toBe(nonce);
  }

  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();
}

const nonceSsrEntry = (exportName: "generateHTML" | "default") => js`
  import * as React from "react";
  import { renderToReadableStream } from "react-dom/server";
  import {
    unstable_routeRSCServerRequest as routeRSCServerRequest,
    unstable_RSCStaticRouter as RSCStaticRouter,
  } from "react-router";
  import { createFromReadableStream } from "react-server-dom-rspack/client.node";

  export ${exportName === "default" ? "default " : ""}async function ${
    exportName === "default" ? "handler" : "generateHTML"
  }(
    request: Request,
    serverResponse: Response,
    options: { bootstrapScripts?: string[]; bootstrapModules?: string[] } = {},
  ) {
    const nonce = crypto.randomUUID();
    const response = await routeRSCServerRequest({
      request,
      serverResponse,
      // React Router does not forward the nonce to the Flight client, and the
      // rspack Flight client preloads client-reference chunks with <script>
      // tags, so hand it the nonce here too.
      createFromReadableStream: (body: ReadableStream<Uint8Array>) =>
        createFromReadableStream(body, { nonce }),
      nonce,
      async renderHTML(getPayload, renderOptions) {
        const payload = await getPayload();
        const formState =
          payload.type === "render" ? await payload.formState : undefined;

        return renderToReadableStream(
          <RSCStaticRouter getPayload={getPayload} nonce={renderOptions.nonce} />,
          {
            ...renderOptions,
            bootstrapScripts: options.bootstrapScripts,
            bootstrapModules: options.bootstrapModules,
            formState,
            signal: request.signal,
          },
        );
      },
    });
    response.headers.set(
      "Content-Security-Policy",
      "script-src 'self' 'nonce-" + nonce + "'",
    );
    return response;
  }
`;

test.describe("RSC CSP nonces", () => {
  test.describe("RSC Framework", () => {
    test("adds the nonce to document scripts and hydrates under a strict CSP", async ({
      page,
      rsbuildPreview,
    }) => {
      const { port } = await rsbuildPreview(
        async () => ({
          "app/entry.ssr.tsx": nonceSsrEntry("generateHTML"),
          "app/routes/_index.tsx": js`
            "use client";

            import { useState } from "react";

            export default function Index() {
              const [count, setCount] = useState(0);
              return (
                <button onClick={() => setCount(count + 1)}>
                  Count: {count}
                </button>
              );
            }
          `,
        }),
        "rsc-framework",
      );

      const response = await page.goto(`http://localhost:${port}`);
      const policy = response?.headers()["content-security-policy"];
      const nonce = policy?.match(/'nonce-([^']+)'/)?.[1];
      expect(nonce).toBeTruthy();
      await expectNonceSupport(page, nonce!);
    });
  });

  implementations.forEach((implementation) => {
    test.describe(`RSC Data (${implementation.name})`, () => {
      let port: number;
      let stop: (() => void) | undefined;

      test.beforeAll(async () => {
        port = await getPort();
        stop = await setupRscTest({
          implementation,
          port,
          files: {
            "src/entry.ssr.tsx": nonceSsrEntry("default"),
            "src/routes/home.client.tsx": js`
              "use client";

              import { useState } from "react";

              export default function Counter() {
                const [count, setCount] = useState(0);
                return (
                  <button onClick={() => setCount(count + 1)}>
                    Count: {count}
                  </button>
                );
              }
            `,
            "src/routes/home.tsx": js`
              import Counter from "./home.client";

              export default function HomeRoute() {
                return <Counter />;
              }
            `,
          },
        });
      });

      test.afterAll(() => {
        stop?.();
      });

      test("adds the nonce to document scripts and hydrates under a strict CSP", async ({
        page,
      }) => {
        const response = await page.goto(`http://localhost:${port}`);
        const policy = response?.headers()["content-security-policy"];
        const nonce = policy?.match(/'nonce-([^']+)'/)?.[1];
        expect(nonce).toBeTruthy();
        await expectNonceSupport(page, nonce!);
      });
    });
  });
});
