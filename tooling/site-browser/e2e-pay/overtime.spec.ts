import { expect, test, type Page } from '@playwright/test';
import { DEFAULT_PAY, OVERTIME } from './pages.ts';

// The default week is the time card's: Mon-Fri 9 h, Sat 4.5 h at $22, $1,193.50 federal.
// Four 10 h days: $880.00 federal (40 h, no overtime), $968.00 in California (8 h a day past 8).
const fourTens = async (page: Page): Promise<void> => {
  for (const day of ['mon', 'tue', 'wed', 'thu']) {
    await page.locator(`input[name="${day}"]`).fill('10');
  }
  for (const day of ['fri', 'sat', 'sun']) await page.locator(`input[name="${day}"]`).fill('0');
};

for (const { path } of OVERTIME) {
  test.describe(path, () => {
    test('starts at the default week with a clean URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText(DEFAULT_PAY);
      expect(new URL(page.url()).search).toBe('');
    });

    test('pays four 10 h days by the week federally and by the day in California', async ({
      page,
    }) => {
      await page.goto(path);
      await fourTens(page);
      await expect(page.locator('.result-figure')).toHaveText('$880.00');
      await expect(page.locator('[data-out="overtimeHours"]')).toHaveText('0');
      await page.locator('select[name="rule"]').selectOption('california');
      await expect(page.locator('.result-figure')).toHaveText('$968.00');
      await expect(page.locator('[data-out="overtimeHours"]')).toHaveText('8');
      await page.goto(page.url());
      await expect(page.locator('select[name="rule"]')).toHaveValue('california');
      await expect(page.locator('input[name="mon"]')).toHaveValue('10');
      await expect(page.locator('.result-figure')).toHaveText('$968.00');
    });

    test('takes cents and quarter hours: $18.50 for five 8.25 h days is $774.69', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="rate"]').fill('18.50');
      for (const day of ['mon', 'tue', 'wed', 'thu', 'fri']) {
        await page.locator(`input[name="${day}"]`).fill('8.25');
      }
      await page.locator('input[name="sat"]').fill('0');
      await expect(page.locator('[data-out="overtimeRate"]')).toHaveText('$27.75');
      await expect(page.locator('.result-figure')).toHaveText('$774.69');
    });

    test('marks a day longer than 24 hours', async ({ page }) => {
      await page.goto(path);
      const monday = page.locator('input[name="mon"]');
      await monday.fill('25');
      await expect(monday).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('.result-figure')).toHaveText(DEFAULT_PAY);
    });
  });
}
