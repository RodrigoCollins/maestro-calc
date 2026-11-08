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
  test(`${path} shows its starting figure without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`[data-text="${out}"]`).first()).toHaveText(initial);
  });
}

test('draws the bowl and the due date strip, and keeps the chocolate call, without JavaScript', async ({
  page,
}) => {
  await page.goto('/dog-food-calculator');
  await expect(page.locator('.bf-bowl svg')).toBeVisible();
  await page.goto('/dog-pregnancy-calculator');
  await expect(page.locator('.bf-strip svg')).toBeVisible();
  await page.goto('/dog-chocolate-toxicity-calculator');
  await expect(page.locator('.bf-call').first()).toContainText('(888) 426-4435');
});
