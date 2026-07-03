import { test, expect } from '@playwright/test';

// Regression coverage for SPA mode (`ssr: false`) under `rsbuild dev`.
// The dev server used to return 404 for every path because no dev middleware
// was registered and no HTML entry existed; these tests hit the dev server
// directly (see playwright.dev.config.ts), unlike the static-build suite.
test.describe('SPA Mode dev server', () => {
  test('serves the SPA shell at /', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('text/html');

    // The page hydrates and renders the home route client-side.
    await expect(
      page.locator('h1:has-text("Welcome to React Router")')
    ).toBeVisible();
  });

  test('serves the SPA shell for deep links', async ({ page }) => {
    const response = await page.goto('/about');

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1:has-text("About This Demo")')).toBeVisible();

    // Nested routes resolve as document requests too.
    await page.goto('/docs/getting-started');
    await expect(
      page.locator('h1:has-text("Getting Started")')
    ).toBeVisible();
  });

  test('document responses contain SPA hydration data', async ({ page }) => {
    const response = await page.goto('/');
    const html = (await response?.text()) ?? '';

    expect(html).toContain('window.__reactRouterContext');
    expect(html).toContain('"isSpaMode":true');
    expect(html).toContain('"ssr":false');
    expect(html).toContain('entry.client.js');
  });

  test('performs client-side navigation after hydration', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href="/about"]').first().click();
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1:has-text("About This Demo")')).toBeVisible();
  });
});
