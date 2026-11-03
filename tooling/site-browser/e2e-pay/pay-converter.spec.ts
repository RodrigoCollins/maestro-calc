import { expect, test } from '@playwright/test';

// Each page starts at its own point: $22 an hour is $45,760 a year; $60,000 a year is $28.85 an hour.
const PAGES = [
  { path: '/hourly-to-salary-calculator', figure: 'annual', start: '$45,760.00' },
  { path: '/es/de-pago-por-hora-a-sueldo-anual', figure: 'annual', start: '$45,760.00' },
  { path: '/salary-to-hourly-calculator', figure: 'hourly', start: '$28.85' },
  { path: '/es/de-sueldo-anual-a-pago-por-hora', figure: 'hourly', start: '$28.85' },
] as const;

for (const { path, figure, start } of PAGES) {
  test.describe(path, () => {
    test('starts at its own figure with a clean URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(`.result-figure[data-out="${figure}"]`)).toHaveText(start);
      expect(new URL(page.url()).search).toBe('');
    });

    test('reruns as the hours change and reopens the same state from the link', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="weeksPerYear"]').fill('50');
      expect(new URL(page.url()).search).not.toBe('');
      const figureText = await page.locator(`[data-out="${figure}"]`).first().textContent();
      expect(figureText).not.toBe(start);
      await page.goto(page.url());
      await expect(page.locator(`[data-out="${figure}"]`).first()).toHaveText(figureText ?? '');
    });

    test('marks hours it cannot use', async ({ page }) => {
      await page.goto(path);
      const hours = page.locator('input[name="hoursPerWeek"]');
      await hours.fill('0');
      await expect(hours).toHaveAttribute('aria-invalid', 'true');
    });
  });
}

test('a $22 hourly rate at 50 weeks is $44,000 a year', async ({ page }) => {
  await page.goto('/hourly-to-salary-calculator');
  await page.locator('input[name="weeksPerYear"]').fill('50');
  await expect(page.locator('.result-figure')).toHaveText('$44,000.00');
});
