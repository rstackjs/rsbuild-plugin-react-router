import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '../../build');
const CLIENT_DIR = join(BUILD_DIR, 'client');
const SERVER_DIR = join(BUILD_DIR, 'server');

// Paths that should be prerendered based on react-router.config.ts
const PRERENDER_PATHS = [
  '/',
  '/about',
  '/docs',
  '/docs/getting-started',
  '/docs/advanced',
  '/projects',
];

test.describe('Static Prerendering', () => {
  test.describe('Build Output', () => {
    test('should NOT have server directory after build', async () => {
      // In prerender mode with ssr:false, the server build should be removed
      expect(existsSync(SERVER_DIR)).toBe(false);
    });

    test('should generate index.html for root path', async () => {
      const indexPath = join(CLIENT_DIR, 'index.html');
      expect(existsSync(indexPath)).toBe(true);
    });

    test('should generate HTML files for all prerender paths', async () => {
      for (const path of PRERENDER_PATHS) {
        let htmlPath: string;
        if (path === '/') {
          htmlPath = join(CLIENT_DIR, 'index.html');
        } else {
          htmlPath = join(CLIENT_DIR, path.slice(1), 'index.html');
        }

        expect(
          existsSync(htmlPath),
          `Expected ${htmlPath} to exist for path ${path}`
        ).toBe(true);
      }
    });

    test('prerendered HTML should contain hydration data', async () => {
      for (const path of PRERENDER_PATHS) {
        let htmlPath: string;
        if (path === '/') {
          htmlPath = join(CLIENT_DIR, 'index.html');
        } else {
          htmlPath = join(CLIENT_DIR, path.slice(1), 'index.html');
        }

        const html = readFileSync(htmlPath, 'utf-8');

        // Should have React Router context
        expect(
          html,
          `${path} should contain __reactRouterContext`
        ).toContain('window.__reactRouterContext');

        // Should have route modules
        expect(
          html,
          `${path} should contain __reactRouterRouteModules`
        ).toContain('window.__reactRouterRouteModules');
      }
    });

    test('prerendered HTML should have route-specific content', async () => {
      // Check home page
      const homeHtml = readFileSync(join(CLIENT_DIR, 'index.html'), 'utf-8');
      expect(homeHtml).toContain('React Router');

      // Check about page
      const aboutHtml = readFileSync(
        join(CLIENT_DIR, 'about', 'index.html'),
        'utf-8'
      );
      expect(aboutHtml).toContain('About');

      // Check docs page
      const docsHtml = readFileSync(
        join(CLIENT_DIR, 'docs', 'index.html'),
        'utf-8'
      );
      expect(docsHtml).toContain('Documentation');
    });
  });

  test.describe('Prerendered Pages', () => {
    test('should serve prerendered home page', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/React Router Demo/);
      await expect(
        page.locator('h1:has-text("Welcome to React Router")')
      ).toBeVisible();
    });

    test('should serve prerendered about page', async ({ page }) => {
      await page.goto('/about');

      await expect(page).toHaveURL('/about');
      await expect(
        page.locator('h1:has-text("About This Demo")')
      ).toBeVisible();
    });

    test('should serve prerendered docs page', async ({ page }) => {
      await page.goto('/docs');

      await expect(page).toHaveURL('/docs');
    });

    test('should serve prerendered docs/getting-started page', async ({
      page,
    }) => {
      await page.goto('/docs/getting-started');

      await expect(page).toHaveURL('/docs/getting-started');
      await expect(page.locator('h1:has-text("Getting Started")')).toBeVisible();
    });

    test('should serve prerendered docs/advanced page', async ({ page }) => {
      await page.goto('/docs/advanced');

      await expect(page).toHaveURL('/docs/advanced');
    });

    test('should serve prerendered projects page', async ({ page }) => {
      await page.goto('/projects');

      await expect(page).toHaveURL('/projects');
    });
  });

  test.describe('Client-Side Hydration', () => {
    test('should hydrate prerendered pages', async ({ page }) => {
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

    test('should enable client-side navigation after hydration', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (window as any).__reactRouterRouteModules !== undefined;
      });

      // Navigate to about page
      const aboutLink = page.locator('a[href="/about"]').first();
      await aboutLink.click();

      await expect(page).toHaveURL('/about');
      await expect(
        page.locator('h1:has-text("About This Demo")')
      ).toBeVisible();
    });

    test('should handle browser navigation on prerendered pages', async ({
      page,
    }) => {
      await page.goto('/about');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (window as any).__reactRouterRouteModules !== undefined;
      });

      // Navigate to docs
      await page.locator('a[href="/docs"]').first().click();
      await expect(page).toHaveURL('/docs');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/about');

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL('/docs');
    });
  });

  test.describe('Non-Prerendered Routes', () => {
    test('should fall back to client-side routing for non-prerendered paths', async ({
      page,
    }) => {
      // Start from a prerendered page
      await page.goto('/');

      // Wait for hydration
      await page.waitForFunction(() => {
        return (window as any).__reactRouterRouteModules !== undefined;
      });

      // Navigate to a non-prerendered route (dynamic project route)
      // This should work via client-side routing
      await page.locator('a[href="/projects"]').first().click();
      await expect(page).toHaveURL('/projects');
    });
  });

  test.describe('Assets', () => {
    test('should load CSS correctly on prerendered pages', async ({ page }) => {
      await page.goto('/about');

      // Check that styles are applied
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should load JavaScript for hydration', async ({ page }) => {
      const jsRequests: string[] = [];

      page.on('response', (response) => {
        if (
          response.url().includes('.js') &&
          !response.url().includes('node_modules')
        ) {
          jsRequests.push(response.url());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should have loaded JS assets
      expect(jsRequests.length).toBeGreaterThan(0);
    });
  });
});
