import { expect, test } from '@playwright/test';

test.describe('lazy compilation', () => {
  test('hydrates with entries:true while manifest route modules stay synchronous', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    await page.waitForFunction(() => {
      return (window as any).__reactRouterRouteModules !== undefined;
    });

    const initialRouteModules = await page.evaluate(() => {
      const modules = (window as any).__reactRouterRouteModules ?? {};
      return Object.fromEntries(
        Object.entries(modules).map(([routeId, moduleValue]) => [
          routeId,
          Object.keys(moduleValue as Record<string, unknown>).sort(),
        ])
      );
    });
    expect(initialRouteModules.root).toContain('default');
    expect(initialRouteModules['routes/home']).toContain('default');

    const manifestRouteModules = await page.evaluate(() => {
      const manifest = (window as any).__reactRouterManifest;
      return Object.fromEntries(
        Object.entries(manifest.routes).map(([routeId, route]) => [
          routeId,
          (route as { module: string }).module,
        ])
      );
    });
    const rootRouteAsset = await page.request.get(manifestRouteModules.root);
    expect(await rootRouteAsset.text()).not.toContain(
      'lazy-compilation-proxy'
    );

    const documentRequests: string[] = [];
    page.on('request', (request) => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documentRequests.push(request.url());
      }
    });

    await page.locator('a[href="/about"]').first().click();

    await expect(page).toHaveURL('/about');
    await expect(
      page.locator('h1:has-text("About This Demo")')
    ).toBeVisible();
    expect(documentRequests).toEqual([]);
    expect(errors.join('\n')).not.toMatch(/hydration|Hydration|Component/);
  });
});
