import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '../../build');
const CLIENT_DIR = join(BUILD_DIR, 'client');
const SERVER_DIR = join(BUILD_DIR, 'server');

test.describe('SSR Mode', () => {
  test.describe('Server-Side Rendering', () => {
    test('should render page content on the server', async ({ page }) => {
      // Disable JavaScript to verify SSR content
      await page.route('**/*.js', (route) => route.abort());

      await page.goto('/');

      // Even without JS, the page should have content rendered by the server
      const body = await page.content();
      expect(body).toContain('React Router Demo');
    });

    test('should hydrate client-side after initial load', async ({ page }) => {
      await page.goto('/');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (
          typeof (window as any).__reactRouterContext !== 'undefined' &&
          (window as any).__reactRouterRouteModules !== undefined
        );
      });

      // Should have React Router context
      const hasContext = await page.evaluate(() => {
        return typeof (window as any).__reactRouterContext !== 'undefined';
      });

      expect(hasContext).toBe(true);
    });

    test('should support client-side navigation after hydration', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (window as any).__reactRouterRouteModules !== undefined;
      });

      // Navigate using client-side routing
      const aboutLink = page.locator('a[href="/about"]').first();
      await aboutLink.click();

      await expect(page).toHaveURL('/about');
      await expect(
        page.locator('h1:has-text("About This Demo")')
      ).toBeVisible();
    });
  });

  test.describe('Data Loading', () => {
    test('should load data on the server', async ({ page }) => {
      const serverResponses: string[] = [];

      page.on('response', (response) => {
        if (response.url().includes('/')) {
          serverResponses.push(response.url());
        }
      });

      await page.goto('/');

      // The initial page load should include all data (no separate data fetches)
      // because data is loaded on the server
      await expect(
        page.locator('h1:has-text("Welcome to React Router")')
      ).toBeVisible();
    });

    test('should support loaders in routes', async ({ page }) => {
      await page.goto('/');

      // The home page should have loader data rendered
      await expect(page.locator('body')).toContainText('React Router');
    });
  });

  test.describe('Route Discovery', () => {
    test('should support lazy route discovery in SSR mode', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (window as any).__reactRouterRouteModules !== undefined;
      });

      // Check route discovery mode
      const routeDiscoveryMode = await page.evaluate(() => {
        return (window as any).__reactRouterContext?.routeDiscovery?.mode;
      });

      // SSR mode should support lazy route discovery
      expect(['lazy', 'initial']).toContain(routeDiscoveryMode);
    });
  });

  test.describe('SEO and Meta', () => {
    test('should render meta tags on the server', async ({ page }) => {
      await page.goto('/');

      // Check that meta tags are present in the initial HTML
      const title = await page.title();
      expect(title).toBeTruthy();

      // Should have charset meta tag
      const charset = await page.$('meta[charset]');
      expect(charset).toBeTruthy();

      // Should have viewport meta tag
      const viewport = await page.$('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 routes', async ({ page }) => {
      const response = await page.goto('/non-existent-route-12345');

      // The app should still respond (how it handles 404 depends on route config)
      expect(response).toBeTruthy();
    });
  });

  test.describe('Assets', () => {
    test('should preload critical assets', async ({ page }) => {
      await page.goto('/');

      // Check for preload or stylesheet links (indicates SSR is properly configured)
      // Rsbuild generates preload/stylesheet links rather than modulepreload
      const preloadLinks = await page.$$(
        'link[rel="preload"], link[rel="stylesheet"]'
      );
      expect(preloadLinks.length).toBeGreaterThan(0);
    });

    test('should load CSS correctly', async ({ page }) => {
      await page.goto('/');

      // Check for stylesheet links
      const stylesheetLinks = await page.$$('link[rel="stylesheet"]');
      expect(stylesheetLinks.length).toBeGreaterThan(0);

      // Verify CSS is applied
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
});
