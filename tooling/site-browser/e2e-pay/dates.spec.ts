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

  // 1 Jan to 15 Nov 2026: 31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 = 304 days to 1 Nov,
  // then 14 more, 318. 15 Nov to 25 Dec 2026: 15 days left of November plus 25, 40.
  test('«Hoy» puts the local date in the end, then in the start', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 15, 23, 30));
    await page.goto(DAYS_BETWEEN);
    await page.getByRole('button', { name: 'Hoy en la fecha final' }).click();
    await expect(page.locator('input[name="end"]')).toHaveValue('2026-11-15');
    await expect(page.locator('[data-days="figure"]')).toHaveText('318 días');
    await page.locator('input[name="end"]').fill('2026-12-25');
    await page.getByRole('button', { name: 'Hoy en la fecha de inicio' }).click();
    await expect(page.locator('input[name="start"]')).toHaveValue('2026-11-15');
    await expect(page.locator('[data-days="figure"]')).toHaveText('40 días');
  });
});

// 1 Jan 2026 is a Thursday: 90 days later, 12 weeks and 6 days, is Wednesday 1 April
// (30 + 28 + 31 + 1). 30 days before Sunday 15 Nov 2026 is Friday 16 Oct. 10 weekdays after
// Friday 13 Nov 2026: Mon 16 to Fri 20, then Mon 23 to Fri 27.
test.describe(`${DAYS_BETWEEN} adds and subtracts days`, () => {
  test('starts at 90 days after 1 January 2026', async ({ page }) => {
    await page.goto(DAYS_BETWEEN);
    await expect(page.locator('[data-shift="figure"]')).toHaveText('miércoles 1 de abril de 2026');
    await expect(page.locator('[data-shift="business"]')).toHaveText('64 días');
  });

  test('goes back 30 days from today, then 10 weekdays forward', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 15, 9, 0));
    await page.goto(DAYS_BETWEEN);
    await page.getByRole('button', { name: 'Hoy en la fecha de partida' }).click();
    await page.locator('input[name="amount"]').fill('30');
    await page.locator('select[name="direction"]').selectOption('subtract');
    await expect(page.locator('[data-shift="figure"]')).toHaveText('viernes 16 de octubre de 2026');
    await page.locator('input[name="from"]').fill('2026-11-13');
    await page.locator('input[name="amount"]').fill('10');
    await page.locator('select[name="direction"]').selectOption('add');
    await page.locator('input[name="business"]').check();
    await expect(page.locator('[data-shift="figure"]')).toHaveText(
      'viernes 27 de noviembre de 2026',
    );
    await expect(page.locator('[data-shift="calendar"]')).toHaveText('14 días');
  });

  test('marks an amount that is not a whole number', async ({ page }) => {
    await page.goto(DAYS_BETWEEN);
    await page.locator('input[name="amount"]').fill('2.5');
    await expect(page.locator('[data-shift-invalid]')).toBeVisible();
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
