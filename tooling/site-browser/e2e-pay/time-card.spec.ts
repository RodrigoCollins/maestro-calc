import { expect, test } from '@playwright/test';
import { DEFAULT_PAY, TIME_CARD } from './pages.ts';

for (const { path } of TIME_CARD) {
  test.describe(path, () => {
    test('reruns the week as the hours change and keeps it in the link', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
      // Monday out at 5:30 pm instead of 4:30 pm: one more overtime hour at $33.
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      await expect(page.locator('[data-out="totalHours"]')).toHaveText('50.5');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
      expect(new URL(page.url()).search).not.toBe('');
      await expect(page.locator('[data-whatsapp]')).toHaveAttribute('href', /1%2C226\.50/);

      // the link reopens the same week
      await page.goto(page.url());
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
    });

    test('marks a time it cannot read and keeps the last figures', async ({ page }) => {
      await page.goto(path);
      const field = page.locator('input[name="tue"]');
      await field.fill('banana');
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
    });

    test('switches to the California rule and shows daily overtime', async ({ page }) => {
      await page.goto(path);
      await page.locator('select[name="rule"]').selectOption('california');
      await expect(page.locator('[data-row="overtime"]')).toBeVisible();
    });
  });
}
