import { expect, test } from '@playwright/test';
import { CALCULATORS, PAGES } from './pages.ts';

for (const path of PAGES) {
  test(`${path} reads without JavaScript`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
}

for (const { path, out, initial } of CALCULATORS) {
  test(`${path} shows its default figure without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`[data-out="${out}"]`).first()).toHaveText(initial);
  });
}
