import { test, expect } from '@playwright/test';

test('client loader runs on client navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Client Features' }).click();
  await expect(page.getByTestId('loader-source')).toHaveText('client');
});

test('client action responds to fetcher submission', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Client Features' }).click();
  const actionSource = page.getByTestId('action-source');
  await expect(actionSource).toHaveText('idle');
  await page.getByRole('button', { name: 'Run client action' }).click();
  await expect(actionSource).toHaveText(/client|server/);
});
