import { expect, test, type Page } from '@playwright/test';
import {
  existsSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(__dirname, '../../app');
const restartMarkerPath = join(
  __dirname,
  '../../build/client/.react-router/route-watch'
);
const devRoutesConfigPath = join(appDirectory, 'dev-routes.ts');
const addedRoutePath = join(appDirectory, 'routes/dev-added-route.tsx');
const addedRouteUrl = '/dev-added-route';
const addedRouteText = 'Route added while dev server is running';
const editedAddedRouteText = 'Route edited without dev server restart';
const emptyDevRoutesConfig = `import type { RouteConfig } from '@react-router/dev/routes';

// Kept separate so the dev-route-watch E2E covers route-config dependencies,
// not the direct reload-server watch on app/routes.ts.
export default [] satisfies RouteConfig;
`;
const populatedDevRoutesConfig = `import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('dev-added-route', 'routes/dev-added-route.tsx'),
] satisfies RouteConfig;
`;

const removeAddedRouteConfig = (): boolean => {
  const routesConfig = readFileSync(devRoutesConfigPath, 'utf8');
  if (routesConfig !== emptyDevRoutesConfig) {
    writeFileSync(devRoutesConfigPath, emptyDevRoutesConfig);
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

const readRestartMarkerVersion = (): string | null => {
  try {
    if (!existsSync(restartMarkerPath)) {
      return null;
    }
    const { mtimeNs } = statSync(restartMarkerPath, { bigint: true });
    return `${readFileSync(restartMarkerPath, 'utf8')}:${mtimeNs}`;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const expectRestartMarkerStable = async (
  expectedMarker: string | null,
  quietMs = 750
) => {
  const startedAt = Date.now();
  await expect
    .poll(
      () => {
        const marker = readRestartMarkerVersion();
        if (marker !== expectedMarker) {
          return `changed:${marker ?? 'missing'}`;
        }
        return Date.now() - startedAt >= quietMs ? 'stable' : 'waiting';
      },
      { intervals: [100], timeout: quietMs + 1000 }
    )
    .toBe('stable');
};

const waitForRouteText = async (page: Page, url: string, text: string) => {
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

const waitForRouteToBeRemoved = async (page: Page, url: string) => {
  await expect
    .poll(
      async () => {
        try {
          const response = await page.request.get(url, { timeout: 2000 });
          return response.status() === 404 ? 'removed' : response.status();
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
      { timeout: 60000 }
    )
    .toBe('removed');
};

test.describe('dev route watch', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    if (removeAddedRouteConfig()) {
      await waitForRouteToBeRemoved(page, addedRouteUrl);
    }
    removeAddedRouteFile();
  });

  test.afterEach(async ({ page }) => {
    if (removeAddedRouteConfig()) {
      await waitForRouteToBeRemoved(page, addedRouteUrl);
    }
    removeAddedRouteFile();
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

    writeFileSync(devRoutesConfigPath, populatedDevRoutesConfig);

    await waitForRouteText(page, addedRouteUrl, addedRouteText);

    await page.goto(addedRouteUrl);
    await expect(page.locator('h1')).toHaveText(addedRouteText);

    const restartMarkerBefore = readRestartMarkerVersion();
    writeFileSync(
      addedRoutePath,
      `export default function DevAddedRoute() {
  return <h1>${editedAddedRouteText}</h1>;
}
`
    );

    await waitForRouteText(page, addedRouteUrl, editedAddedRouteText);
    await expectRestartMarkerStable(restartMarkerBefore);
  });
});
