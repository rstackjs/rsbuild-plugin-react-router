import { expect, test } from '@playwright/test';

test('renders server-first RSC routes and hydrates the client island', async ({
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
    page.getByRole('heading', { name: 'Rsbuild React Router RSC' })
  ).toBeVisible();
  await expect(page.getByTestId('server-message')).toHaveText(
    'Message rendered by an RSC loader'
  );
  await expect(page.getByTestId('server-element')).toHaveText(
    'React element returned from the server loader'
  );
  expect(await page.content()).toMatch(
    /\(self\.__FLIGHT_DATA\|\|=\[\]\)\.push\(/
  );

  const counter = page.getByRole('button', { name: /Client island count:/ });
  await expect(counter).toHaveText('Client island count: 0');
  await counter.click();
  await expect(counter).toHaveText('Client island count: 1');

  await page.getByRole('link', { name: 'Client route' }).click();
  await expect(
    page.getByRole('heading', { name: 'Client-first route' })
  ).toBeVisible();
  await expect(page).toHaveTitle('Rsbuild RSC example');

  await page.waitForTimeout(250);
  expect(browserProblems).toEqual([]);
});
