import { expect, test } from '@playwright/test';
import { PTO } from './pages.ts';

// Hand-verified: 10 days x 8 h = 80 h a year over 40 x 52 = 2,080 h worked: 80/26 = 3.08 every two
// weeks, 0.0385 per hour worked; 15 days = 120 h: 120/26 = 4.62, 120/12 = 10 a month, 0.0577.
for (const { path } of PTO) {
  test.describe(path, () => {
    test('starts at 10 days of 8 hours with a clean URL and no warning', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText('3.08');
      await expect(page.locator('[data-out="annualHours"]')).toHaveText('80');
      await expect(page.locator('[data-warning]:visible')).toHaveCount(0);
      expect(new URL(page.url()).search).toBe('');
    });

    test('accrues 15 days and reopens them from the link', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="ptoDays"]').fill('15');
      await expect(page.locator('.result-figure')).toHaveText('4.62');
      await expect(page.locator('[data-out="monthly"]')).toHaveText('10.00');
      await expect(page.locator('[data-out="perHourWorked"]')).toHaveText('0.0577');
      await page.goto(page.url());
      await expect(page.locator('input[name="ptoDays"]')).toHaveValue('15');
      await expect(page.locator('.result-figure')).toHaveText('4.62');
    });

    test('warns about more time off than hours worked, and marks a day over 24 hours', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="hoursPerWeek"]').fill('1');
      await expect(page.locator('[data-warning="moreThanWorked"]')).toBeVisible();
      const day = page.locator('input[name="hoursPerDay"]');
      await day.fill('25');
      await expect(day).toHaveAttribute('aria-invalid', 'true');
    });
  });
}
