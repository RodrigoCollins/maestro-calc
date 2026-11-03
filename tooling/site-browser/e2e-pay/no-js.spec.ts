import { expect, test } from '@playwright/test';
import { DEFAULT_PAY, PAGES, TIME_CARD } from './pages.ts';

for (const { path } of PAGES) {
  test(`${path} reads without JavaScript`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
}

for (const { path } of TIME_CARD) {
  test(`${path} shows the default week and its pay without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="totalHours"]')).toHaveText('49.5');
    await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
  });
}

test('the pay converter shows its starting figures without JavaScript', async ({ page }) => {
  await page.goto('/hourly-to-salary-calculator');
  await expect(page.locator('.result-figure')).toHaveText('$45,760.00');
  await page.goto('/es/de-sueldo-anual-a-pago-por-hora');
  await expect(page.locator('.result-figure')).toHaveText('$28.85');
});
