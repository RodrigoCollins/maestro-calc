import { expect, test } from '@playwright/test';
import { AGUINALDO, VACACIONES_MX } from './pages.ts';

// Hand-verified:
// - 2026 at the general minimum wage: 315.04 × 15 = 4,725.60; 30 UMA = 30 × 117.31 = 3,519.30
//   exempt; 4,725.60 − 3,519.30 = 1,206.30 taxable.
// - Hired 1 July 2026: 31 + 31 + 30 + 31 + 30 + 31 = 184 days to 31 December;
//   4,725.60 × 184 / 365 = 2,382.22, all exempt; 15 × 184 / 365 = 7.56 days.
// - $12,000 a month: 12,000 / 30 = 400.00 a day; × 15 = 6,000.00.
// - Hired 15 January 2021, counted on 31 December 2026: 5 years, 20 days; 315.04 × 20 = 6,300.80;
//   prima 25% = 1,575.20; the sixth year, 22 days, from Friday 15 January 2027.
// - Hired 1 June 2015 on $15,000 a month: 11 years, 24 days; 500 × 24 = 12,000.00; prima 3,000.00,
//   of which 15 UMA = 1,759.65 exempt and 1,240.35 taxable.

test.describe(AGUINALDO, () => {
  test('starts at a whole 2026 at the minimum wage', async ({ page }) => {
    await page.goto(AGUINALDO);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$4,725.60');
    await expect(page.locator('[data-mx="taxable"]')).toHaveText('$1,206.30');
    await expect(page.locator('[data-mx-invalid]')).toBeHidden();
  });

  test('pays the share of a year from 1 July', async ({ page }) => {
    await page.goto(AGUINALDO);
    await page.locator('input[name="start"]').fill('2026-07-01');
    await expect(page.locator('[data-mx="worked"]')).toHaveText('184 días');
    await expect(page.locator('[data-mx="earned"]')).toHaveText('7.56 días');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$2,382.22');
    await expect(page.locator('[data-mx="taxable"]')).toHaveText('$0.00');
  });

  test('divides a monthly salary by 30', async ({ page }) => {
    await page.goto(AGUINALDO);
    await page.locator('select[name="period"]').selectOption('month');
    await page.locator('input[name="wage"]').fill('12000');
    await expect(page.locator('[data-mx="daily"]')).toHaveText('$400.00');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$6,000.00');
  });

  test('warns under 15 days and marks a salary it cannot read', async ({ page }) => {
    await page.goto(AGUINALDO);
    await page.locator('input[name="days"]').fill('10');
    await expect(page.locator('[data-mx-below]')).toBeVisible();
    await page.locator('input[name="wage"]').fill('abc');
    await expect(page.locator('[data-mx-invalid]')).toBeVisible();
  });
});

test.describe(VACACIONES_MX, () => {
  test('starts at five years of service', async ({ page }) => {
    await page.goto(VACACIONES_MX);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('20 días');
    await expect(page.locator('[data-mx="pay"]')).toHaveText('$6,300.80');
    await expect(page.locator('[data-mx="prima"]')).toHaveText('$1,575.20');
    await expect(page.locator('[data-mx="next"]')).toHaveText(
      '22 días desde el viernes 15 de enero de 2027',
    );
  });

  test('works 11 years on a monthly salary, with the taxable prima', async ({ page }) => {
    await page.goto(VACACIONES_MX);
    await page.locator('input[name="start"]').fill('2015-06-01');
    await page.locator('select[name="period"]').selectOption('month');
    await page.locator('input[name="wage"]').fill('15000');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('24 días');
    await expect(page.locator('[data-mx="pay"]')).toHaveText('$12,000.00');
    await expect(page.locator('[data-mx="exempt"]')).toHaveText('$1,759.65');
    await expect(page.locator('[data-mx="taxable"]')).toHaveText('$1,240.35');
  });

  test('says the first year is not complete yet', async ({ page }) => {
    await page.goto(VACACIONES_MX);
    await page.locator('input[name="start"]').fill('2026-03-01');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('12 días');
    await expect(page.locator('[data-mx-not-earned]')).toBeVisible();
  });
});
