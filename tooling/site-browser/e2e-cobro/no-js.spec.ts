import { expect, test } from '@playwright/test';
import { CALCULATORS, PAGES } from './pages.ts';

for (const { path } of PAGES) {
  test(`${path} reads without JavaScript`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
}

for (const { path, initial } of CALCULATORS) {
  test(`${path} shows its receipt and total without JavaScript, and a share link that works`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="total"]')).toHaveText(initial);
    await expect(page.locator('.receipt')).toBeVisible();
    // the print button needs the script: with none, it is not offered
    await expect(page.locator('button[data-print]')).toBeHidden();
    const href = (await page.locator('a[data-share]').getAttribute('href')) ?? '';
    const message = decodeURIComponent(href.slice('https://wa.me/?text='.length));
    expect(message).toContain(`TOTAL: ${initial}`);
    expect(message.split('\n').at(-1)).toBe(`https://cuantolecobro.com${path}`);
  });
}
