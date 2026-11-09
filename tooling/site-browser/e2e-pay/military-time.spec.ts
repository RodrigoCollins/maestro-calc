import { expect, test } from '@playwright/test';
import { MILITARY } from './pages.ts';

// Hand-verified: 1500 is 15 − 12 = 3:00 PM; 7:45 pm is 7 + 12 = 1945, said nineteen forty-five;
// 2400 is the midnight that ends a day, 12:00 AM; 25:00 is no time of day.
for (const { path, lang } of MILITARY) {
  test.describe(path, () => {
    test('starts at 1500, worked out, with no warning', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('[data-mil="figure"]')).toHaveText(
        lang === 'en' ? '1500 = 3:00 PM' : '1500 = 3:00 p. m.',
      );
      await expect(page.locator('[data-military-invalid]')).toBeHidden();
    });

    test('converts a 12-hour time to military time and says it', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="time"]').fill(lang === 'en' ? '7:45 pm' : '7:45 p. m.');
      await expect(page.locator('[data-mil="figure"]')).toHaveText(
        lang === 'en' ? '1945 = 7:45 PM' : '1945 = 7:45 p. m.',
      );
      await expect(page.locator('[data-mil="colon"]')).toHaveText('19:45');
      await expect(page.locator('[data-mil="spoken"]')).toHaveText(
        lang === 'en' ? 'nineteen forty-five' : 'las diecinueve horas y cuarenta y cinco minutos',
      );
    });

    test('reads 2400 as the midnight that ends a day', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="time"]').fill('2400');
      await expect(page.locator('[data-mil="twelve"]')).toHaveText(
        lang === 'en' ? '12:00 AM' : '12:00 a. m.',
      );
    });

    test('marks a time it cannot read and keeps the last figures', async ({ page }) => {
      await page.goto(path);
      const field = page.locator('input[name="time"]');
      await field.fill('25:00');
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('[data-military-invalid]')).toBeVisible();
      await field.fill('0930');
      await expect(field).not.toHaveAttribute('aria-invalid');
      await expect(page.locator('[data-mil="twelve"]')).toHaveText(
        lang === 'en' ? '9:30 AM' : '9:30 a. m.',
      );
    });
  });
}
