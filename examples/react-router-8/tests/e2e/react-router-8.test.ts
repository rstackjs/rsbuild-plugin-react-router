import { expect, test } from '@playwright/test';

test('renders the React Router 8 default template without browser errors', async ({
  page,
}) => {
  const browserProblems: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      browserProblems.push(`console error: ${message.text()}`);
    }
  });
  page.on('pageerror', error => {
    browserProblems.push(`page error: ${error.message}`);
  });
  page.on('response', response => {
    if (response.status() >= 500) {
      browserProblems.push(`${response.status()} response: ${response.url()}`);
    }
  });
  page.on('requestfailed', request => {
    if (request.resourceType() !== 'websocket') {
      browserProblems.push(
        `${request.method()} ${request.url()} failed: ${
          request.failure()?.errorText ?? 'unknown error'
        }`
      );
    }
  });

  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole('heading', { name: 'Welcome to React Router' })
  ).toBeVisible();
  await expect(page).toHaveTitle('New React Router App');
  await page.waitForFunction(
    () =>
      (window as Window & { __reactRouterRouteModules?: unknown })
        .__reactRouterRouteModules !== undefined
  );
  await page.waitForTimeout(250);

  expect(browserProblems).toEqual([]);
});
