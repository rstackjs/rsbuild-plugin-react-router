import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => {
    const intentionalNativeRejection = process.env.REMIX2_TEST_MODE === 'dev' &&
      testInfo.title.includes('native defer document') &&
      error.message === 'intentional-native-defer-rejection';
    if (!intentionalNativeRejection) errors.push(error.message);
  });
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    const dev = process.env.REMIX2_TEST_MODE === 'dev';
    const customEntryDiagnostic = dev && text.startsWith(
      'Warning: Extra attributes from the server: %s%s data-remix2-entry ',
    );
    const deferredDiagnostic = dev &&
      testInfo.title.includes('native defer document') &&
      text === 'intentional-native-defer-rejection';
    if (!customEntryDiagnostic && !deferredDiagnostic) errors.push(text);
  });
  (page as Page & { nativeErrors: string[] }).nativeErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect((page as Page & { nativeErrors: string[] }).nativeErrors).toEqual([]);
});

async function hydrated(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-remix2-entry', 'custom-client');
  await page.getByRole('button', { name: 'Count 0', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Count 1', exact: true })).toBeVisible();
}

test('JavaScript-disabled SSR contains loader data and the custom response header', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(baseURL!);
    expect(response?.headers()['x-remix2-entry']).toBe('custom-server');
    await expect(page.getByTestId('loader-message')).toHaveText('native-loader-v1');
    await expect(page.getByRole('button', { name: 'Count 0', exact: true })).toBeVisible();
    await expect(page.locator('html')).not.toHaveAttribute('data-remix2-entry');
  } finally {
    await context.close();
  }
});

test('hydration and Link navigation use RR6 native _data without document reload', async ({ page }) => {
  let documents = 0;
  page.on('request', request => { if (request.resourceType() === 'document') documents += 1; });
  await page.goto('/');
  await hydrated(page);
  const response = page.waitForResponse(response =>
    new URL(response.url()).searchParams.get('_data') === 'routes/next',
  );
  await page.getByRole('link', { name: 'Next loader' }).click();
  await expect(page.getByTestId('navigation-state')).toHaveText('loading');
  expect(await (await response).json()).toEqual({ message: 'native-next-loader' });
  await expect(page.getByTestId('next-message')).toHaveText('native-next-loader');
  expect(documents).toBe(1);
  const globals = await page.evaluate(() => ({
    remix: '__remixManifest' in window,
    rr7: '__reactRouterManifest' in window || '__reactRouterContext' in window,
  }));
  expect(globals).toEqual({ remix: true, rr7: false });
});

test('Form and fetcher POST preserve action status and headers and revalidate loaders', async ({ page }) => {
  let documents = 0;
  page.on('request', request => { if (request.resourceType() === 'document') documents += 1; });
  await page.goto('/');
  await hydrated(page);
  const before = Number(await page.getByTestId('loader-revision').textContent());
  for (const [button, result, message, revision] of [
    ['Submit form', 'action-result', 'form-native', before + 1],
    ['Submit fetcher', 'fetcher-result', 'fetcher-native', before + 2],
  ] as const) {
    const response = page.waitForResponse(response =>
      response.request().method() === 'POST' &&
      new URL(response.url()).searchParams.get('_data') === 'routes/_index',
    );
    await page.getByRole('button', { name: button, exact: true }).click();
    const action = await response;
    expect(action.status()).toBe(201);
    expect(action.headers()['x-remix2-action']).toBe('native');
    expect(await action.json()).toEqual({ submitted: message, revision });
    await expect(page.getByTestId(result)).toHaveText(message);
    await expect(page.getByTestId('loader-revision')).toHaveText(String(revision));
  }
  await expect(page.getByTestId('fetcher-state')).toHaveText('idle');
  expect(documents).toBe(1);
});

test('native Form redirect reaches the next loader without a document reload', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  const response = page.waitForResponse(response =>
    response.request().method() === 'POST' &&
    response.headers()['x-remix-redirect'] === '/next?redirected=1',
  );
  await page.getByRole('button', { name: 'Redirect action', exact: true }).click();
  expect((await response).headers()['x-remix-status']).toBe('303');
  await expect(page).toHaveURL('/next?redirected=1');
  await expect(page.getByTestId('next-message')).toHaveText('native-next-loader');
});

for (const navigation of ['document', 'link'] as const) {
  test(`native defer ${navigation} handles pre-resolved, pending, and rejected promises`, async ({ page }) => {
    if (navigation === 'document') {
      await page.goto('/deferred', { waitUntil: 'domcontentloaded' });
    } else {
      await page.goto('/');
      await hydrated(page);
      const response = page.waitForResponse(response =>
        new URL(response.url()).searchParams.get('_data') === 'routes/deferred',
      );
      await page.getByRole('link', { name: 'Deferred route' }).click();
      const data = await response;
      expect(data.headers()['content-type']).toBe('text/remix-deferred; charset=utf-8');
      await expect(page.getByTestId('defer-pending-fallback')).toBeVisible();
      expect(await data.text()).toContain('error:{"rejected":');
    }
    await expect(page.getByTestId('defer-resolved')).toHaveText('already-resolved-native');
    await expect(page.getByTestId('defer-pending')).toHaveText('pending-resolved-native');
    await expect(page.getByTestId('defer-rejected')).toHaveText('Rejected handled natively');
    await expect(page.locator('html')).toHaveAttribute('data-remix2-entry', 'custom-client');
  });
}
