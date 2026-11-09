import { expect, test } from '@playwright/test';
import { COUNTDOWN_PATHS, DAYS_BETWEEN } from './pages.ts';

// Hand-verified on a printed calendar:
// - 1 Jan to 31 Dec 2026 is 364 days, 52 whole weeks, so 52 × 5 = 260 weekdays.
// - 15 Mar to 10 Jun 2026: 16 days left of March, then 30 (April) + 31 (May) + 10 = 87 days,
//   12 weeks and 3 days; counting 15 March too, 88 days, 12 weeks and 4 days. 15 Mar 2026 is a
//   Sunday, so the 87 days after it start on a Monday: 12 × 5 = 60 weekdays, then Mon to Wed, 63.
// - 10 Jun back to 15 Mar is the same span, counted and said to be swapped.
// - 9 Nov 2026 to 25 Dec 2026: 21 days of November left plus 25, 46 days, 6 weeks and 4 days.

test.describe(DAYS_BETWEEN, () => {
  test('starts at the whole of 2026, worked out', async ({ page }) => {
    await page.goto(DAYS_BETWEEN);
    await expect(page.locator('[data-days="figure"]')).toHaveText('364 días');
    await expect(page.locator('[data-days="weeks"]')).toHaveText('52 semanas');
    await expect(page.locator('[data-days="business"]')).toHaveText('260 días');
    await expect(page.locator('[data-days-reversed]')).toBeHidden();
  });

  test('counts two other dates, then the first day too', async ({ page }) => {
    await page.goto(DAYS_BETWEEN);
    await page.locator('input[name="start"]').fill('2026-03-15');
    await page.locator('input[name="end"]').fill('2026-06-10');
    await expect(page.locator('[data-days="figure"]')).toHaveText('87 días');
    await expect(page.locator('[data-days="weeks"]')).toHaveText('12 semanas y 3 días');
    await expect(page.locator('[data-days="business"]')).toHaveText('63 días');
    await page.locator('input[name="inclusive"]').check();
    await expect(page.locator('[data-days="figure"]')).toHaveText('88 días');
    await expect(page.locator('[data-days="weeks"]')).toHaveText('12 semanas y 4 días');
  });

  test('counts swapped dates and says so', async ({ page }) => {
    await page.goto(DAYS_BETWEEN);
    await page.locator('input[name="start"]').fill('2026-06-10');
    await page.locator('input[name="end"]').fill('2026-03-15');
    await expect(page.locator('[data-days="figure"]')).toHaveText('87 días');
    await expect(page.locator('[data-days-reversed]')).toBeVisible();
  });
});

test.describe('the countdowns', () => {
  test('counts to Christmas from the local date', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 9, 12, 0));
    await page.goto('/es/fechas/cuantos-dias-faltan-para-navidad');
    await expect(page.locator('[data-countdown="days"]')).toHaveText('46 días');
    await expect(page.locator('[data-countdown="weeks"]')).toHaveText('6 semanas y 4 días');
    await expect(page.locator('[data-countdown="date"]')).toHaveText(
      'viernes 25 de diciembre de 2026',
    );
  });

  test('says it is today on the day', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 25, 9, 0));
    await page.goto('/es/fechas/cuantos-dias-faltan-para-navidad');
    await expect(page.locator('[data-countdown="days"]')).toHaveText('¡Es hoy!');
  });

  for (const path of COUNTDOWN_PATHS)
    test(`${path} counts to a date`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('[data-countdown="days"]')).toHaveText(/^(\d+ días?|¡Es hoy!)$/);
    });
});
