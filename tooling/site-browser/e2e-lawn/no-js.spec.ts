import { expect, test } from '@playwright/test';
import { CALCULATORS, PAGES } from './pages.ts';

for (const path of PAGES) {
  test(`${path} reads without JavaScript`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
}

for (const { path, out, initial } of CALCULATORS) {
  test(`${path} shows its default figure without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`[data-v="${out}"]`).first()).toHaveText(initial);
    // the area field is the way in: the measuring helper needs the script and is left out
    await expect(page.locator('[name="area"]')).toBeEditable();
    await expect(page.locator('.lawn-measure')).toBeHidden();
  });
}

test('lists the states without JavaScript and leaves the ZIP lookup out', async ({ page }) => {
  await page.goto('/frost-dates');
  await expect(page.locator('form[data-zip]')).toBeHidden();
  await expect(page.locator('.lawn-states a')).toHaveCount(50);
  await page.goto('/frost-dates/indiana');
  await expect(page.locator('tr#USW00014835 th')).toHaveText('Lafayette Purdue Univ AP');
  await expect(page.locator('tr#USW00014835 td')).toHaveText([
    'May 14',
    'Apr 26',
    'Apr 11',
    'Oct 4',
    'Oct 18',
    'Oct 31',
  ]);
});
