import type { Page } from "@playwright/test";

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
