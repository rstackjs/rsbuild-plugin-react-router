import { test, expect } from '@playwright/test';

test('client-only module hydrates on the client', async ({ page }) => {
  await page.goto('/client-only');

  const value = page.getByTestId('client-value');
  await expect(value).toHaveText(/client:\/client-only/);
});
