import { test, expect } from "@playwright/test";

test.describe("Cloudflare Home Page", () => {
  test("should display React Router welcome page with Cloudflare env message", async ({
    page,
  }) => {
    // Navigate to home page
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/New React Router App/);

    // Check React Router logo is visible
    const logo = page.locator('img[alt="React Router"]');
    await expect(logo.first()).toBeVisible();

    // Check "What's next?" text
    const whatNextText = page.locator('text="What\'s next?"');
    await expect(whatNextText).toBeVisible();

    // Check resource links
    const docsLink = page.locator('a[href="https://reactrouter.com/docs"]');
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveText(/React Router Docs/);

    const discordLink = page.locator('a[href="https://rmx.as/discord"]');
    await expect(discordLink).toBeVisible();
    await expect(discordLink).toHaveText(/Join Discord/);

    // Check Cloudflare environment variable message is displayed
    const cloudflareMessage = page.locator("text=Hello from Cloudflare");
    await expect(cloudflareMessage).toBeVisible();
  });

  test("should have external links with proper attributes", async ({
    page,
  }) => {
    await page.goto("/");

    // Check that external links have target="_blank" and rel="noreferrer"
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      await expect(externalLinks.nth(i)).toHaveAttribute("rel", "noreferrer");
    }
  });
});
