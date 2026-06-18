import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(__dirname, '../../app');
const restartMarkerPath = join(
  __dirname,
  '../../.react-router/route-watch'
);
const routesConfigPath = join(appDirectory, 'routes.ts');
const addedRoutePath = join(appDirectory, 'routes/dev-added-route.tsx');
const addedRouteUrl = '/dev-added-route';
const addedRouteText = 'Route added while dev server is running';
const editedAddedRouteText = 'Route edited without dev server restart';
const addedRouteConfigEntry = `  route('dev-added-route', 'routes/dev-added-route.tsx'),`;

const removeAddedRouteConfig = (): boolean => {
  const routesConfig = readFileSync(routesConfigPath, 'utf8');
  if (routesConfig.includes(addedRouteConfigEntry)) {
    writeFileSync(
      routesConfigPath,
      routesConfig.replace(`${addedRouteConfigEntry}\n\n`, '')
    );
    return true;
  }
  return false;
};

const removeAddedRouteFile = (): boolean => {
  if (existsSync(addedRoutePath)) {
    rmSync(addedRoutePath, { force: true });
    return true;
  }
  return false;
};

const readRestartMarker = (): string | null =>
  existsSync(restartMarkerPath)
    ? readFileSync(restartMarkerPath, 'utf8')
    : null;

const waitForRouteText = async (
  page: Page,
  url: string,
  text: string
) => {
  await expect
    .poll(
      async () => {
        try {
          const response = await page.request.get(url, {
            timeout: 2000,
          });
          if (!response.ok()) {
            return `status:${response.status()}`;
          }
          const body = await response.text();
          return body.includes(text) ? 'ready' : 'missing-text';
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
      { timeout: 60000 }
    )
    .toBe('ready');
};

test.describe('dev route watch', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    if (removeAddedRouteConfig()) {
      await waitForRouteText(page, '/', 'Welcome to React Router');
    }
    if (removeAddedRouteFile()) {
      await waitForRouteText(page, '/', 'Welcome to React Router');
    }
  });

  test.afterEach(async ({ page }) => {
    if (removeAddedRouteConfig()) {
      await waitForRouteText(page, '/', 'Welcome to React Router');
    }
    if (removeAddedRouteFile()) {
      await waitForRouteText(page, '/', 'Welcome to React Router');
    }
  });

  test('serves a route added after the dev server starts without restarting on later edits', async ({
    page,
  }) => {
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

    await waitForRouteText(page, addedRouteUrl, addedRouteText);

    await page.goto(addedRouteUrl);
    await expect(page.locator('h1')).toHaveText(addedRouteText);

    await expect.poll(readRestartMarker, { timeout: 10000 }).not.toBe(null);
    const restartMarkerBefore = readRestartMarker();
    writeFileSync(
      addedRoutePath,
      `export default function DevAddedRoute() {
  return <h1>${editedAddedRouteText}</h1>;
}
`
    );

    await waitForRouteText(page, addedRouteUrl, editedAddedRouteText);
    expect(readRestartMarker()).toBe(restartMarkerBefore);
  });
});
