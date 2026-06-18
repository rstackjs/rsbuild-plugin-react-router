import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(__dirname, '../../app');
const routesConfigPath = join(appDirectory, 'routes.ts');
const addedRoutePath = join(appDirectory, 'routes/dev-added-route.tsx');
const addedRouteUrl = '/dev-added-route';
const addedRouteText = 'Route added while dev server is running';
const addedRouteConfigEntry = `  route('dev-added-route', 'routes/dev-added-route.tsx'),`;

const cleanupAddedRoute = () => {
  if (existsSync(addedRoutePath)) {
    rmSync(addedRoutePath, { force: true });
  }

  const routesConfig = readFileSync(routesConfigPath, 'utf8');
  if (routesConfig.includes(addedRouteConfigEntry)) {
    writeFileSync(
      routesConfigPath,
      routesConfig.replace(`${addedRouteConfigEntry}\n\n`, '')
    );
  }
};

test.describe('dev route watch', () => {
  test.setTimeout(90000);

  test.beforeEach(cleanupAddedRoute);
  test.afterEach(cleanupAddedRoute);

  test('serves a route added after the dev server starts', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome to React Router');

    writeFileSync(
      addedRoutePath,
      `export default function DevAddedRoute() {
  return <h1>${addedRouteText}</h1>;
}
`
    );

    const routesConfig = readFileSync(routesConfigPath, 'utf8');
    writeFileSync(
      routesConfigPath,
      routesConfig.replace(
        '  // Docs section with nested routes',
        `${addedRouteConfigEntry}\n\n  // Docs section with nested routes`
      )
    );

    await expect
      .poll(
        async () => {
          try {
            const response = await page.request.get(addedRouteUrl, {
              timeout: 2000,
            });
            if (!response.ok()) {
              return `status:${response.status()}`;
            }
            const body = await response.text();
            return body.includes(addedRouteText) ? 'ready' : 'missing-text';
          } catch (error) {
            return error instanceof Error ? error.message : String(error);
          }
        },
        { timeout: 60000 }
      )
      .toBe('ready');

    await page.goto(addedRouteUrl);
    await expect(page.locator('h1')).toHaveText(addedRouteText);
  });
});
