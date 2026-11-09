import { expect, test } from '@playwright/test';
import { DECIMAL_HOURS, HOURS } from './pages.ts';

// Hand-verified: 9:00 to 17:30 less 30 min is 8 h 0 min = 8.00; 22:00 to 6:15 with no break
// crosses midnight, 8 h 15 min = 8.25; 8 h 20 min = 8.33; 45 min = 0.75; 7.75 h = 7 h 45 min.
for (const { path } of HOURS) {
  test.describe(path, () => {
    test('starts at the default shift with a clean URL and no warning', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText('8 h 0 min');
      await expect(page.locator('[data-out="hours"][data-format="decimal"]')).toHaveText('8.00');
      await expect(page.locator('[data-warning]:visible')).toHaveCount(0);
      expect(new URL(page.url()).search).toBe('');
    });

    test('counts a night shift across midnight, says so and reopens it from the link', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="start"]').fill('10:00 pm');
      await page.locator('input[name="end"]').fill('6:15 am');
      await page.locator('input[name="unpaidBreak"]').fill('0');
      await expect(page.locator('.result-figure')).toHaveText('8 h 15 min');
      await expect(page.locator('[data-out="hours"][data-format="decimal"]')).toHaveText('8.25');
      await expect(page.locator('[data-warning="overnight"]')).toBeVisible();
      await page.goto(page.url());
      await expect(page.locator('input[name="start"]')).toHaveValue('10:00 pm');
      await expect(page.locator('.result-figure')).toHaveText('8 h 15 min');
    });

    test('marks a time it cannot read', async ({ page }) => {
      await page.goto(path);
      const end = page.locator('input[name="end"]');
      await end.fill('25:00');
      await expect(end).toHaveAttribute('aria-invalid', 'true');
    });

    // Hand-verified: 2:30 p. m. is 14:30, to 17:30 is 3 h 0 min with no break.
    test('reads the Spanish 12-hour style, 2:30 p. m.', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="start"]').fill('2:30 p. m.');
      await page.locator('input[name="end"]').fill('17:30');
      await page.locator('input[name="unpaidBreak"]').fill('0');
      await expect(page.locator('.result-figure')).toHaveText('3 h 0 min');
    });

    // Hand-verified: 7 h 45 min + 3 h 30 min = 11 h 15 min = 11.25 h, and the difference is
    // 4 h 15 min; 1 h 20 min − 2 h 45 min = −1 h 25 min, and their sum 4 h 5 min = 4.08 h.
    test('adds and subtracts hours and minutes, and marks a field it cannot read', async ({
      page,
    }) => {
      await page.goto(path);
      const sum = page.locator('[data-sum="sum"]');
      const decimal = page.locator('[data-sum="decimal"]');
      const difference = page.locator('[data-sum="difference"]');
      await expect(sum).toHaveText('11 h 15 min');
      await expect(decimal).toHaveText('11.25');
      await expect(difference).toHaveText('4 h 15 min');
      await page.locator('input[name="aHours"]').fill('1');
      await page.locator('input[name="aMinutes"]').fill('20');
      await page.locator('input[name="bHours"]').fill('2');
      await page.locator('input[name="bMinutes"]').fill('45');
      await expect(sum).toHaveText('4 h 5 min');
      await expect(decimal).toHaveText('4.08');
      await expect(difference).toHaveText('−1 h 25 min');
      const minutes = page.locator('input[name="bMinutes"]');
      await minutes.fill('4,5');
      await expect(minutes).toHaveAttribute('aria-invalid', 'true');
      expect(new URL(page.url()).search).toBe('');
    });
  });
}

for (const { path } of DECIMAL_HOURS) {
  test.describe(path, () => {
    test('starts at 8 h 20 min = 8.33 and 7.75 h = 7 h 45 min, with the chart', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('[data-out="decimalHours"]')).toHaveText('8.33');
      await expect(page.locator('[data-out="fromDecimal"]')).toHaveText('7 h 45 min');
      await expect(page.locator('.chart tbody tr')).toHaveCount(20);
      expect(new URL(page.url()).search).toBe('');
    });

    test('converts 45 minutes both ways and reopens them from the link', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="hours"]').fill('0');
      await page.locator('input[name="minutes"]').fill('45');
      await expect(page.locator('[data-out="decimalHours"]')).toHaveText('0.75');
      await page.locator('input[name="decimal"]').fill('0.75');
      await expect(page.locator('[data-out="fromDecimal"]')).toHaveText('0 h 45 min');
      await page.goto(page.url());
      await expect(page.locator('input[name="minutes"]')).toHaveValue('45');
      await expect(page.locator('[data-out="decimalHours"]')).toHaveText('0.75');
    });

    test('marks 60 minutes', async ({ page }) => {
      await page.goto(path);
      const minutes = page.locator('input[name="minutes"]');
      await minutes.fill('60');
      await expect(minutes).toHaveAttribute('aria-invalid', 'true');
    });
  });
}
