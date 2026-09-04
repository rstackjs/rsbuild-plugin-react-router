import { expect, type Page } from "@playwright/test";

import {
  reactRouterConfig,
  test,
  type Files,
  type TemplateName,
} from "./helpers/rsbuild.js";

// Adapted from upstream `rsc-client-version-test.ts`. Upstream cross-checks the
// client version against Vite's `__vite_rsc_assets_manifest.js`; this plugin
// derives it from its own build, so the version is read from the manifest
// request the browser issues instead.

const js = String.raw;
const templateName = "rsc-framework" as const satisfies TemplateName;

function getFiles() {
  return {
    "app/root.tsx": js`
      import { Link, Outlet } from "react-router";

      export default function Root() {
        return (
          <html lang="en">
            <body>
              <Link to="/other?token=abc123&ref=campaign#section1">
                Go to Other
              </Link>
              <Outlet />
            </body>
          </html>
        );
      }
    `,
    "app/routes/_index.tsx": js`
      export default function Index() {
        return <h1>Home</h1>;
      }
    `,
    "app/routes/other.tsx": js`
      import { useLocation } from "react-router";

      export default function Other() {
        let location = useLocation();
        return (
          <h1 data-location>
            {location.pathname + location.search + location.hash}
          </h1>
        );
      }
    `,
  };
}

function trackDocumentRequests(page: Page) {
  let requests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") {
      requests.push(request.url());
    }
  });
  return requests;
}

function trackManifestRequests(page: Page) {
  let requests: string[] = [];
  page.on("request", (request) => {
    if (/\.manifest(?:\?|$)/.test(request.url())) {
      requests.push(request.url());
    }
  });
  return requests;
}

async function interceptWithStaleClientVersion(page: Page) {
  let manifestRequests: string[] = [];
  await page.route(/\.manifest(?:\?|$)/, async (route) => {
    let url = new URL(route.request().url());
    manifestRequests.push(url.href);
    url.searchParams.set("version", "stale");
    await route.continue({ url: url.href });
  });
  return manifestRequests;
}

test.describe("RSC client versions", () => {
  test("sends a stable client version with route discovery", async ({
    page,
    request,
    rsbuildPreview,
  }) => {
    let files: Files = async () => getFiles();
    let { port } = await rsbuildPreview(files, templateName);
    let baseUrl = `http://localhost:${port}`;
    let documentRequests = trackDocumentRequests(page);
    let manifestRequests = trackManifestRequests(page);

    await page.goto(`${baseUrl}/`);
    await expect.poll(() => manifestRequests.length).toBeGreaterThan(0);
    // Upstream's Vite build uses an 8-character version; this plugin emits a
    // longer content hash. Only the shape matters here.
    expect(manifestRequests[0]).toMatch(
      /\/other\.manifest\?version=[a-f0-9]{8,}$/,
    );

    let clientVersion = new URL(manifestRequests[0]).searchParams.get(
      "version",
    );
    let currentResponse = await request.get(
      `${baseUrl}/other.manifest?version=${clientVersion}`,
    );
    expect(currentResponse.status()).toBe(200);

    await page.getByRole("link", { name: "Go to Other" }).click();
    await expect(page.locator("[data-location]")).toHaveText(
      "/other?token=abc123&ref=campaign#section1",
    );
    expect(documentRequests).toHaveLength(1);
  });

  test("defers an eager discovery mismatch until navigation, then reloads the destination", async ({
    page,
    rsbuildPreview,
  }) => {
    let files: Files = async () => getFiles();
    let { port } = await rsbuildPreview(files, templateName);
    let baseUrl = `http://localhost:${port}`;
    let documentRequests = trackDocumentRequests(page);
    let manifestRequests = await interceptWithStaleClientVersion(page);
    let eagerMismatch = page.waitForResponse(
      (response) =>
        response.url().includes(".manifest") && response.status() === 204,
    );

    await page.goto(`${baseUrl}/`);
    await eagerMismatch;
    await expect.poll(() => manifestRequests.length).toBeGreaterThan(0);

    // An eager discovery mismatch should not disrupt the current document.
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    expect(documentRequests).toHaveLength(1);

    await page.getByRole("link", { name: "Go to Other" }).click();

    await expect(page.locator("[data-location]")).toHaveText(
      "/other?token=abc123&ref=campaign#section1",
    );
    expect(page.url()).toBe(
      `${baseUrl}/other?token=abc123&ref=campaign#section1`,
    );
    expect(documentRequests).toHaveLength(2);
    expect(documentRequests[1]).toBe(
      `${baseUrl}/other?token=abc123&ref=campaign`,
    );
  });

  test("reloads when a prerendered RSC payload has a new client version", async ({
    page,
    request,
    rsbuildPreview,
  }) => {
    let files: Files = async () => ({
      ...getFiles(),
      "react-router.config.ts": reactRouterConfig({
        ssr: false,
        prerender: ["/", "/other"],
      }),
      "app/root.tsx": js`
        import { Link, Outlet } from "react-router";

        export default function Root() {
          return (
            <html lang="en">
              <body>
                <Link to="/other">Go to Other</Link>
                <Outlet />
              </body>
            </html>
          );
        }
      `,
    });
    let { port } = await rsbuildPreview(files, templateName);
    let baseUrl = `http://localhost:${port}`;
    let documentRequests = trackDocumentRequests(page);

    // With `ssr: false` every route is in the initial manifest, so no discovery
    // request reveals the client version. Read it from the prerendered payload
    // itself, then rewrite the first payload the browser fetches for /other so
    // it advertises a different version.
    let prerenderedPayload = await (
      await request.get(`${baseUrl}/other.rsc`)
    ).text();
    let clientVersion = /"clientVersion":"([a-f0-9]+)"/.exec(
      prerenderedPayload,
    )?.[1];
    expect(clientVersion).toMatch(/^[a-f0-9]{8,}$/);
    let newVersion = clientVersion === "deadbeef" ? "feedface" : "deadbeef";

    let replacedVersion = false;
    await page.route(/\/other\.rsc(?:\?|$)/, async (route) => {
      if (replacedVersion) {
        await route.continue();
        return;
      }

      replacedVersion = true;
      let response = await route.fetch();
      let source = await response.text();
      expect(source).toContain(clientVersion!);
      await route.fulfill({
        response,
        body: source.replaceAll(clientVersion!, newVersion),
      });
    });

    await page.goto(`${baseUrl}/`);
    let rscResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/other.rsc") && response.status() === 200,
    );

    await page.getByRole("link", { name: "Go to Other" }).click();
    await rscResponse;

    await expect(page.locator("[data-location]")).toHaveText("/other");
    expect(documentRequests).toHaveLength(2);
    expect(documentRequests[1]).toBe(`${baseUrl}/other`);
  });

  test("does not reload repeatedly for the same stale client version", async ({
    page,
    rsbuildPreview,
  }) => {
    let files: Files = async () => getFiles();
    let { port } = await rsbuildPreview(files, templateName);
    let baseUrl = `http://localhost:${port}`;
    let documentRequests = trackDocumentRequests(page);
    let manifestRequests = await interceptWithStaleClientVersion(page);
    let consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    let eagerMismatch = page.waitForResponse(
      (response) =>
        response.url().includes(".manifest") && response.status() === 204,
    );

    await page.goto(`${baseUrl}/`);
    await eagerMismatch;
    await expect.poll(() => manifestRequests.length).toBeGreaterThan(0);

    let clientVersion = new URL(manifestRequests[0]).searchParams.get(
      "version",
    );
    await page.evaluate((version) => {
      sessionStorage.setItem("react-router-manifest-version", version!);
    }, clientVersion);

    await page.getByRole("link", { name: "Go to Other" }).click();
    await expect.poll(() => manifestRequests.length).toBeGreaterThan(1);
    await expect
      .poll(() => consoleErrors)
      .toContain("Unable to discover routes due to manifest version mismatch.");

    expect(documentRequests).toHaveLength(1);
  });
});
