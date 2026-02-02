import { test, expect } from '@playwright/test';

test('styling route loads and applies module styles', async ({ page }) => {
  await page.goto('/styling');

  await expect(page.locator('h1')).toContainText('CSS Modules');

  // Verify LESS module style applied.
  const lessBox = page.locator('text=This box is styled by `styling.module.less`');
  await expect(lessBox).toBeVisible();
  const lessBorderStyle = await lessBox.evaluate((el) => getComputedStyle(el).borderStyle);
  expect(lessBorderStyle).toBe('dashed');

  // Verify SASS module style applied.
  const scssBox = page.locator('text=This box is styled by `styling.module.scss`');
  await expect(scssBox).toBeVisible();
  const scssBorderStyle = await scssBox.evaluate((el) => getComputedStyle(el).borderStyle);
  expect(scssBorderStyle).toBe('solid');
});
