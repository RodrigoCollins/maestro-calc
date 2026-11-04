import { expect, test } from '@playwright/test';
import { CALCULATORS } from './pages.ts';

for (const { path, out, initial, edit, edited } of CALCULATORS) {
  test(`${path} works the figure out again as the visitor types`, async ({ page }) => {
    await page.goto(path);
    const figure = page.locator(`[data-out="${out}"]`).first();
    await expect(figure).toHaveText(initial);
    await page.locator(`[name="${edit.field}"]`).fill(edit.value);
    await expect(figure).toHaveText(edited);
  });
}

test('warns that salt over the target only comes down by draining', async ({ page }) => {
  await page.goto('/pool-salt-calculator');
  const warning = page.locator('[data-warning="drainToLower"]');
  await expect(warning).toBeHidden();
  await page.locator('[name="current"]').fill('4000');
  await expect(warning).toBeVisible();
});

test('shows the dose of the chlorine product the visitor picks', async ({ page }) => {
  await page.goto('/pool-chlorine-calculator');
  await page.locator('[name="product"]').selectOption('cal-hypo-65');
  // 37.85 g per ppm per 10,000 gal x 2 ppm x 2 / 0.65, in ounces
  await expect(page.locator('[data-out="dry"]').first()).toHaveText('8.2');
});
