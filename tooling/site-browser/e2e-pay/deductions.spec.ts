import { expect, test } from '@playwright/test';

// Defaults: overtime $22 x 300 h x 0.5 = $3,300; tips $8,000. Both at MAGI under the limit.
for (const path of [
  '/no-tax-on-overtime-calculator',
  '/es/calculadora-horas-extra-sin-impuestos',
]) {
  test.describe(path, () => {
    test('starts at the default deduction with a clean URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText('$3,300.00');
      expect(new URL(page.url()).search).toBe('');
    });

    test('switches to the W-2 amount and phases it out by income', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('input[name="premium"]')).toBeHidden();
      await page.locator('select[name="source"]').selectOption('amount');
      await expect(page.locator('input[name="rate"]')).toBeHidden();
      await page.locator('input[name="premium"]').fill('20000');
      await page.locator('input[name="magi"]').fill('165500');
      await expect(page.locator('.result-figure')).toHaveText('$11,000.00');
      await page.goto(page.url());
      await expect(page.locator('.result-figure')).toHaveText('$11,000.00');
      await expect(page.locator('input[name="premium"]')).toBeVisible();
    });
  });
}

for (const path of ['/no-tax-on-tips-calculator', '/es/calculadora-propinas-sin-impuestos']) {
  test(`${path} keeps the $25,000 cap on a joint return`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('.result-figure')).toHaveText('$8,000.00');
    await page.locator('input[name="tips"]').fill('30000');
    await page.locator('select[name="filing"]').selectOption('joint');
    await page.locator('input[name="magi"]').fill('305500');
    await expect(page.locator('.result-figure')).toHaveText('$24,500.00');
  });
}
