import { expect, test } from '@playwright/test';
import {
  AGUINALDO,
  ANTIGUEDAD,
  FINIQUITO,
  ISR_MX,
  SDI_MX,
  SUELDO_NETO,
  VACACIONES_MX,
} from './pages.ts';

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

// Hand-verified (LFT arts. 162, 485 and 486; LSS arts. 27 and 28):
// - 1 July 2011 to 30 June 2026 at 315.04: 15 years, 12 × 15 = 180 days, 315.04 × 180 = 56,707.20.
// - The same dates on leaving by choice at 10 years (from 1 July 2016): no prima owed, $0.00.
// - $20,000 a month (666.67 a day) over twice the minimum: 630.08; dismissal from 1 January 2022 to
//   30 June 2026, 4 years and 181 days: 630.08 × 12 × 1,641 / 365 = 33,993.25.
// - SDI: 315.04 × 383 / 365 = 330.58 (factor 1.0493); 5 whole years from 15 January 2021 to
//   31 December 2026: the sixth year, 22 days, 315.04 × 385.5 / 365 = 332.73 (1.0562);
//   $100,000 a month: 3,497.72, capped for the IMSS at 25 × 117.31 = 2,932.75.

test.describe(ANTIGUEDAD, () => {
  test('starts at 15 years at the minimum wage, owed on leaving by choice', async ({ page }) => {
    await page.goto(ANTIGUEDAD);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$56,707.20');
    await expect(page.locator('[data-mx="service"]')).toHaveText('15 años');
    await expect(page.locator('[data-mx-not-owed]')).toBeHidden();
  });

  test('owes nothing on leaving by choice before 15 years', async ({ page }) => {
    await page.goto(ANTIGUEDAD);
    await page.locator('input[name="start"]').fill('2016-07-01');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$0.00');
    await expect(page.locator('[data-mx-not-owed]')).toBeVisible();
    await page.locator('select[name="reason"]').selectOption('dismissal');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$37,804.80');
  });

  test('caps a monthly salary at twice the minimum after a dismissal', async ({ page }) => {
    await page.goto(ANTIGUEDAD);
    await page.locator('select[name="reason"]').selectOption('dismissal');
    await page.locator('select[name="period"]').selectOption('month');
    await page.locator('input[name="wage"]').fill('20000');
    await page.locator('input[name="start"]').fill('2022-01-01');
    await expect(page.locator('[data-mx="base"]')).toHaveText('$630.08');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$33,993.25');
    await expect(page.locator('[data-mx-capped]')).toBeVisible();
  });
});

test.describe(SDI_MX, () => {
  test('starts at the first year at the minimum wage', async ({ page }) => {
    await page.goto(SDI_MX);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$330.58');
    await expect(page.locator('[data-mx="factor"]')).toHaveText('1.0493');
    await expect(page.locator('[data-mx-capped]')).toBeHidden();
  });

  test('takes the vacation days of the sixth year', async ({ page }) => {
    await page.goto(SDI_MX);
    await page.locator('input[name="start"]').fill('2021-01-15');
    await expect(page.locator('[data-mx="year"]')).toHaveText('Año 6 · 22 días de vacaciones');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$332.73');
  });

  test('caps the IMSS base at 25 UMA and warns under the legal aguinaldo', async ({ page }) => {
    await page.goto(SDI_MX);
    await page.locator('select[name="period"]').selectOption('month');
    await page.locator('input[name="wage"]').fill('100000');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$3,497.72');
    await expect(page.locator('[data-mx="sbc"]')).toHaveText('$2,932.75');
    await expect(page.locator('[data-mx-capped]')).toBeVisible();
    await page.locator('input[name="aguinaldo"]').fill('10');
    await expect(page.locator('[data-mx-below]')).toBeVisible();
  });
});

// Hand-verified from Anexo 8 RMF 2026 (DOF 28-12-2025) and the subsidy decree (DOF 31-12-2025):
// - $12,000 a month: 420.95 + 4,831.48 × 10.88% = 946.62, no subsidy (over 11,492.66).
// - $11,492.66: 891.42 − 535.65 = 355.77; a centavo more loses the subsidy: 891.42.
// - $9,451.20 (315.04 × 30): the tariff gives 669.31, nothing withheld (LISR art. 96).
// - A fortnight of $5,000: 207.75 + 1,462.84 × 10.88% = 366.91 − 264.30 = 102.61.
// - $20,000 net: 20,000 − 2,383.65 − 540.13 = 17,076.22; $40,000: 40,000 − 6,755.82 − 1,122.51.
test.describe(ISR_MX, () => {
  test('starts at $12,000 a month', async ({ page }) => {
    await page.goto(ISR_MX);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$946.62');
    await expect(page.locator('[data-mx="subsidy"]')).toHaveText('$0.00');
  });

  test('drops the subsidy a centavo over $11,492.66', async ({ page }) => {
    await page.goto(ISR_MX);
    await page.locator('input[name="wage"]').fill('11492.66');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$355.77');
    await expect(page.locator('[data-mx="subsidy"]')).toHaveText('$535.65');
    await page.locator('input[name="wage"]').fill('11492.67');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$891.42');
  });

  test('withholds nothing from the minimum wage and works a fortnight', async ({ page }) => {
    await page.goto(ISR_MX);
    await page.locator('input[name="wage"]').fill('9451.20');
    await expect(page.locator('[data-mx="tariff"]')).toHaveText('$669.31');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$0.00');
    await expect(page.locator('[data-mx-below]')).toBeVisible();
    await page.locator('select[name="period"]').selectOption('fortnight');
    await page.locator('input[name="wage"]').fill('5000');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$102.61');
    await expect(page.locator('[data-mx-below]')).toBeHidden();
  });

  test('marks a salary it cannot read', async ({ page }) => {
    await page.goto(ISR_MX);
    await page.locator('input[name="wage"]').fill('doce mil');
    await expect(page.locator('[data-mx-invalid]')).toBeVisible();
  });
});

test.describe(SUELDO_NETO, () => {
  test('starts at $20,000 a month', async ({ page }) => {
    await page.goto(SUELDO_NETO);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$17,076.22');
    await expect(page.locator('[data-mx="sbc"]')).toHaveText('$699.54');
    await expect(page.locator('[data-mx="cesantia"]')).toHaveText('$236.09');
  });

  test('nets $40,000 and keeps the whole minimum wage', async ({ page }) => {
    await page.goto(SUELDO_NETO);
    await page.locator('input[name="wage"]').fill('40000');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$32,121.67');
    await expect(page.locator('[data-mx="imss"]')).toHaveText('$1,122.51');
    await page.locator('input[name="wage"]').fill('9451.20');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$9,451.20');
    await expect(page.locator('[data-mx-below]')).toBeVisible();
  });

  test('integrates more vacation days after 11 years', async ({ page }) => {
    await page.goto(SUELDO_NETO);
    await page.locator('input[name="years"]').fill('11');
    await expect(page.locator('[data-mx="sbc"]')).toHaveText('$705.02');
    await expect(page.locator('[data-mx="imss"]')).toHaveText('$544.69');
    await page.locator('input[name="years"]').fill('x');
    await expect(page.locator('[data-mx-invalid]')).toBeVisible();
  });
});

// Hand-verified (LFT arts. 48, 50, 76, 79, 80, 87, 89 and 162; LISR art. 93 fr. XIII and XIV):
// $15,000 a month (500.00 a day) from 1 March 2019 to 15 November 2026, 7 years and 260 days,
// 4 vacation days taken and 15 unpaid:
// - finiquito: 7,500.00 + 6,554.79 (500 × 15 × 319 / 365) + 16,835.62 (33.67 days) + 4,208.90
//   (25%) + 46,273.97 (500 × 12 × 2,815 / 365) = 81,373.28;
// - unjustified dismissal: 90 × 528.08 (500 × 385.5 / 365) = 47,527.20, in all 128,900.48;
//   with the 20 days, 528.08 × 20 × 2,815 / 365 = 81,454.53, in all 210,355.01;
// - resignation at 7 years: no prima de antigüedad, 81,373.28 − 46,273.97 = 35,099.31.

test.describe(FINIQUITO, () => {
  test('starts at an unjustified dismissal, without the 20 days', async ({ page }) => {
    await page.goto(FINIQUITO);
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$128,900.48');
    await expect(page.locator('[data-mx="finiquito"]')).toHaveText('$81,373.28');
    await expect(page.locator('[data-mx="veinte"]')).toHaveText('$0.00');
    await expect(page.locator('[data-mx-not-owed]')).toBeHidden();
  });

  test('adds the 20 days a year when the employer refuses reinstatement', async ({ page }) => {
    await page.goto(FINIQUITO);
    await page.locator('input[name="refused"]').check();
    await expect(page.locator('[data-mx="veinte"]')).toHaveText('$81,454.53');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$210,355.01');
  });

  test('owes no indemnización and no prima de antigüedad on a resignation at 7 years', async ({
    page,
  }) => {
    await page.goto(FINIQUITO);
    await page.locator('select[name="exit"]').selectOption('resignation');
    await expect(page.locator('[data-mx="figure"]')).toHaveText('$35,099.31');
    await expect(page.locator('[data-mx="antiguedad"]')).toHaveText('$0.00');
    await expect(page.locator('[data-mx="liquidacion"]')).toHaveText('$0.00');
    await expect(page.locator('[data-mx-not-owed]')).toBeVisible();
  });

  test('shows the notice for a field it cannot read', async ({ page }) => {
    await page.goto(FINIQUITO);
    await page.locator('input[name="taken"]').fill('x');
    await expect(page.locator('[data-mx-invalid]')).toBeVisible();
  });
});
