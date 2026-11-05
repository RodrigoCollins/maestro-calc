import { expect, test } from '@playwright/test';
import { SHIFT } from './pages.ts';

// Hand-verified at $20 an hour: 10% is $22, 24 h x $20 + 16 h x $22 = $832 over 40 h;
// 24 + 24 h = $1,008 over 48 h, regular rate $21.00, + 8 x $10.50 = $84: $1,092;
// $1.50 an hour is $21.50: $480 + $344 = $824 (29 CFR 778.115, 778.207(b)).
for (const { path } of SHIFT) {
  test.describe(path, () => {
    test('starts at 10% for 16 of 40 hours with a clean URL and no warning', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText('$832.00');
      await expect(page.locator('[data-out="differentialPay"]')).toHaveText('$32.00');
      await expect(page.locator('[data-warning]:visible')).toHaveCount(0);
      expect(new URL(page.url()).search).toBe('');
    });

    test('counts the differential in the overtime and reopens the week from the link', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="shiftHours"]').fill('24');
      await expect(page.locator('[data-out="regularRate"]')).toHaveText('$21.00');
      await expect(page.locator('[data-out="overtimePremium"]')).toHaveText('$84.00');
      await expect(page.locator('.result-figure')).toHaveText('$1,092.00');
      await page.goto(page.url());
      await expect(page.locator('input[name="shiftHours"]')).toHaveValue('24');
      await expect(page.locator('.result-figure')).toHaveText('$1,092.00');
    });

    test('switches to dollars an hour, showing the amount and hiding the percent', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('select[name="source"]').selectOption('amount');
      await expect(page.locator('input[name="percent"]')).toBeHidden();
      await page.locator('input[name="amount"]').fill('1.50');
      await expect(page.locator('[data-out="shiftRate"]')).toHaveText('$21.50');
      await expect(page.locator('.result-figure')).toHaveText('$824.00');
    });

    test('warns about more than a week of hours, and marks a percent over 100', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="baseHours"]').fill('160');
      await expect(page.locator('[data-warning="moreThanAWeek"]')).toBeVisible();
      const percent = page.locator('input[name="percent"]');
      await percent.fill('101');
      await expect(percent).toHaveAttribute('aria-invalid', 'true');
    });
  });
}
