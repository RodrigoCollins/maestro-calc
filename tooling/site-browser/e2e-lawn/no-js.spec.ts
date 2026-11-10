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

test('the seed calculator reads in US units without JavaScript and leaves the units field out', async ({
  page,
}) => {
  await page.goto('/grass-seed-calculator');
  await expect(page.locator('[name="units"]')).toBeHidden();
  await expect(page.locator('label [data-v="areaUnit"]').first()).toHaveText('sq ft');
});

test('lists the states without JavaScript and leaves the ZIP lookup out', async ({ page }) => {
  await page.goto('/frost-dates');
  await expect(page.locator('form[data-zip]')).toBeHidden();
  await expect(page.locator('.lawn-states a')).toHaveCount(50);
  await expect(page.locator('.lawn-cities a')).toHaveCount(22);
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

test('answers the last frost of a city from its nearest station without JavaScript', async ({
  page,
}) => {
  // CHICAGO NORTHERLY IS (USC00111550), 4.1 miles from the 2020 Census point of Chicago:
  // last spring freeze Apr 25, Apr 10, Mar 29; first fall freeze Oct 24, Nov 5, Nov 20
  await page.goto('/last-frost-date/chicago-il');
  await expect(page.locator('h1')).toHaveText('When is the last frost in Chicago?');
  await expect(page.locator('.lawn-hero p').last()).toContainText('around Apr 10');
  await expect(page.locator('#dates ~ ul li').first()).toContainText('Apr 25 at 10%');
  await page.locator('a[href="/frost-dates/illinois#USC00111550"]').click();
  await expect(page.locator('tr#USC00111550 td')).toHaveText([
    'Apr 25',
    'Apr 10',
    'Mar 29',
    'Oct 24',
    'Nov 5',
    'Nov 20',
  ]);
  await expect(page.locator('a[href="/last-frost-date/chicago-il"]')).toBeVisible();
});
