import { expect, type Page } from "@playwright/test";

const EXAMPLE_DOMAIN_HTML = `<!doctype html>
<html>
  <head><title>Example Domain</title></head>
  <body><h1>Example Domain</h1></body>
</html>`;

// Several upstream tests assert that an external redirect lands on
// https://example.com/. Reaching the real site from CI depends on outbound
// network access and has aborted runs with net::ERR_ABORTED, so serve a local
// stand-in that matches what the assertions look for.
export async function stubExampleDomain(page: Page): Promise<void> {
  await page.route("https://example.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: EXAMPLE_DOMAIN_HTML,
    }),
  );
}

// The RSC error handler assigns `window.location.href` during render and also
// commits a `<meta http-equiv="refresh">`, so the browser can start the
// external navigation more than once and abort the earlier attempts. Poll for
// the final URL instead of latching onto the first navigation, which
// `waitForURL` would reject with net::ERR_ABORTED.
export async function expectExternalRedirect(page: Page): Promise<void> {
  await expect(page).toHaveURL("https://example.com/");
  await expect(page.getByText("Example Domain")).toBeAttached();
}
