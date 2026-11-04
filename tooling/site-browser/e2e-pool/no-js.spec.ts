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

test('draws the default pool and leaves the strip picker out without JavaScript', async ({
  page,
}) => {
  await page.goto('/pool-volume-calculator');
  await expect(page.locator('svg[data-side] [data-side="mark0"]')).toHaveText('3½ FT');
  await expect(page.locator('svg[data-side] [data-side="mark1"]')).toHaveText('8 FT');
  await page.goto('/pool-chlorine-calculator');
  await expect(page.locator('.pool-strip')).toBeHidden();
  await expect(page.locator('[name="current"]')).toBeEditable();
});
