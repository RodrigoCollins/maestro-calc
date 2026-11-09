import { expect, test, type Page } from '@playwright/test';
import { CALCULATORS } from './pages.ts';

/** Sets the fields of an edit by name; a select takes its option value. */
const edit = async (page: Page, edits: Readonly<Record<string, string>>): Promise<void> => {
  for (const [name, value] of Object.entries(edits)) {
    const field = page.locator(`[name="${name}"]`);
    if ((await field.evaluate((node) => node.tagName)) === 'SELECT')
      await field.selectOption(value);
    else await field.fill(value);
  }
};

for (const { path, out, initial, edits, edited, bags } of CALCULATORS) {
  test.describe(path, () => {
    test('shows its default figure and bags, and the figure of a hand-worked edit', async ({
      page,
    }) => {
      await page.goto(path);
      const figure = page.locator(`[data-v="${out}"]`).first();
      await expect(figure).toHaveText(initial);
      await expect(page.locator('[data-v="bags"], [data-v="pallets"]').first()).toHaveText(
        bags.initial,
      );
      await edit(page, edits);
      await expect(figure).toHaveText(edited);
      await expect(page.locator('[data-v="bags"], [data-v="pallets"]').first()).toHaveText(
        bags.edited,
      );
    });

    test('keeps the numbers in the address and reopens them, the defaults being the clean URL', async ({
      page,
    }) => {
      await page.goto(path);
      await edit(page, edits);
      await expect(page).toHaveURL(/\?/);
      const url = page.url();
      await page.goto(url);
      await expect(page.locator(`[data-v="${out}"]`).first()).toHaveText(edited);
      // typing the defaults back clears the query
      await page.goto(path);
      await expect(page).not.toHaveURL(/\?/);
    });

    test('marks a field it cannot read and keeps the last figure', async ({ page }) => {
      await page.goto(path);
      await page.locator('[name="area"]').fill('abc');
      await expect(page.locator('[name="area"]')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`[data-v="${out}"]`).first()).toHaveText(initial);
      await page.locator('[name="area"]').fill('5000');
      await expect(page.locator('[name="area"]')).not.toHaveAttribute('aria-invalid', 'true');
    });

    test('fills the area from the length and the width', async ({ page }) => {
      await page.goto(path);
      await page.locator('.lawn-measure summary').click();
      await page.locator('[data-measure="length"]').fill('50');
      await page.locator('[data-measure="width"]').fill('24');
      await expect(page.locator('[data-measure-out]')).toHaveText('1,200');
      await page.locator('[data-measure-use]').click();
      await expect(page.locator('[name="area"]')).toHaveValue('1200');
    });

    test('shares the page on WhatsApp with its state in the address', async ({ page }) => {
      await page.goto(path);
      const share = page.locator('a[data-share]');
      await expect(share).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/);
      await edit(page, edits);
      const href = (await share.getAttribute('href')) ?? '';
      expect(decodeURIComponent(href)).toContain(`${path}?`);
    });

    test('links the methodology and Maestro Calc for the rest of the yard', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main a[href="/methodology"]')).toHaveCount(1);
      await expect(
        page.locator(
          'section[aria-labelledby="rest"] a[href="https://maestrocalc.com/square-footage-calculator"]',
        ),
      ).toBeVisible();
    });
  });
}

test('the fertilizer page warns above the limit of one application, and not at it', async ({
  page,
}) => {
  await page.goto('/lawn-fertilizer-calculator');
  await expect(page.locator('[data-warning="overLimit"]')).toBeHidden();
  await page.locator('[name="target"]').fill('1.5');
  await expect(page.locator('[data-warning="overLimit"]')).toBeVisible();
  await page.locator('[name="target"]').fill('1');
  await expect(page.locator('[data-warning="overLimit"]')).toBeHidden();
});

test('the seed page draws the two crosswise passes and names the pounds each way', async ({
  page,
}) => {
  await page.goto('/grass-seed-calculator');
  await expect(page.locator('.lawn-spreader svg')).toBeVisible();
  // half of 10.0 to 15.0 lb
  await expect(page.locator('.lawn-spreader [data-v="perPass"]')).toHaveText('5.0–7.5');
  await page.locator('[name="species"]').selectOption('zoysiagrass');
  await expect(page.locator('[data-warning="zoysiaSource"]')).toBeVisible();
});

// metric: 1 m² = 1 / 0.09290304 sq ft and 1 lb = 0.45359237 kg, so 1 lb per 1,000 sq ft is
// 4.8824 g/m², and the Virginia bluegrass rate of 2 to 3 lb is 9.765 to 14.647 g/m²
test.describe('the seed calculator in metric', () => {
  test('converts the fields, counts kilograms and grams and keeps u=m in the address', async ({
    page,
  }) => {
    await page.goto('/grass-seed-calculator');
    await page.locator('[name="units"]').selectOption('metric');
    // 5,000 sq ft x 0.09290304 = 464.52 m²; 5 lb = 2.27 kg
    await expect(page.locator('[name="area"]')).toHaveValue('464.52');
    await expect(page.locator('[name="bag"]')).toHaveValue('2.27');
    await expect(page.locator('label [data-v="areaUnit"]').first()).toHaveText('m²');
    // 464.52 m² x 9.765 to 14.647 g/m² = 4.54 to 6.80 kg: 2 to 3 bags of 2.27 kg
    await expect(page.locator('[data-v="pounds"]')).toHaveText('4.54–6.80');
    await expect(page.locator('[data-v="massUnit"]')).toHaveText('kg');
    await expect(page.locator('[data-v="bags"]')).toHaveText('2–3');
    await expect(page.locator('[data-v="rate"]')).toHaveText('9.8–14.6');
    await expect(page.locator('[data-v="rateUnit"]')).toHaveText('g/m²');
    await page.locator('[name="area"]').fill('100');
    // 100 m²: 0.98 to 1.46 kg, half each way 488 to 732 g
    await expect(page.locator('[data-v="pounds"]')).toHaveText('0.98–1.46');
    await expect(page.locator('.lawn-spreader [data-v="perPass"]')).toHaveText('488–732');
    await expect(page.locator('.lawn-spreader [data-v="passUnit"]')).toHaveText('g');
    await expect(page).toHaveURL(/[?&]u=m(&|$)/);
    await page.goto(page.url());
    await expect(page.locator('[name="units"]')).toHaveValue('metric');
    await expect(page.locator('[data-v="pounds"]')).toHaveText('0.98–1.46');
  });

  test('switching back with no edit restores the US figures and the clean address', async ({
    page,
  }) => {
    await page.goto('/grass-seed-calculator');
    await page.locator('[name="units"]').selectOption('metric');
    await page.locator('[name="units"]').selectOption('imperial');
    await expect(page.locator('[name="area"]')).toHaveValue('5000');
    await expect(page.locator('[name="bag"]')).toHaveValue('5');
    await expect(page.locator('[data-v="pounds"]')).toHaveText('10.0–15.0');
    await expect(page.locator('[data-v="massUnit"]')).toHaveText('lb');
    await expect(page).not.toHaveURL(/\?/);
  });
});

// the frost dates ZIP lookup: NOAA 1991-2020 normals, the nearest station of the ZCTA point
test.describe('frost dates ZIP lookup', () => {
  test('finds the station nearest to West Lafayette, Indiana, with its dates', async ({ page }) => {
    await page.goto('/frost-dates');
    await page.locator('[name="zip"]').fill('47907');
    await page.getByRole('button', { name: 'Find my station' }).click();
    // station file: spring 05/14, 04/26, 04/11 and fall 10/04, 10/18, 10/31; about 1 mile away
    const result = page.locator('[data-zip-result]');
    await expect(result).toContainText('Lafayette Purdue Univ AP, Indiana, 1 mile away');
    await expect(result).toContainText('May 14, Apr 26, Apr 11');
    await expect(result).toContainText('Oct 4, Oct 18, Oct 31');
    await expect(result.locator('a')).toHaveAttribute('href', '/frost-dates/indiana#USW00014835');
  });

  test('works from a state page and sends a ZIP of another state to its own', async ({ page }) => {
    await page.goto('/frost-dates/indiana');
    await page.locator('[name="zip"]').fill('10001');
    await page.getByRole('button', { name: 'Find my station' }).click();
    await expect(page.locator('[data-zip-result]')).toContainText('New York');
    await expect(page.locator('[data-zip-result] a')).toHaveAttribute(
      'href',
      /^\/frost-dates\/new-york(\/\d)?#USW00094728$/,
    );
  });

  test('says so for a ZIP that is not 5 digits or not in the list', async ({ page }) => {
    await page.goto('/frost-dates');
    await page.locator('[name="zip"]').fill('123');
    await page.getByRole('button', { name: 'Find my station' }).click();
    await expect(page.locator('[data-zip-result]')).toHaveText('Type a 5-digit ZIP code.');
    await page.locator('[name="zip"]').fill('00000');
    await page.getByRole('button', { name: 'Find my station' }).click();
    await expect(page.locator('[data-zip-result]')).toContainText('not in the list');
  });

  test('highlights the row a ZIP result links', async ({ page }) => {
    await page.goto('/frost-dates/indiana#USW00014835');
    await expect(page.locator('tr#USW00014835 th')).toBeVisible();
    await expect(page.locator('tr#USW00014835 th')).toHaveCSS(
      'background-color',
      'rgb(242, 209, 75)',
    );
  });
});
