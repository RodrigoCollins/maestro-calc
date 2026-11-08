import { expect, test, type Page } from '@playwright/test';
import { CALCULATORS } from './pages.ts';

const edit = async (page: Page, field: string, value: string): Promise<void> => {
  const control = page.locator(`[name="${field}"]`);
  if ((await control.evaluate((node) => node.tagName)) === 'SELECT')
    await control.selectOption(value);
  else await control.fill(value);
};

for (const { path, out, initial, edit: change, edited } of CALCULATORS) {
  test(`${path} works the figure out again as the visitor types`, async ({ page }) => {
    await page.goto(path);
    const figure = page.locator(`[data-text="${out}"]`).first();
    await expect(figure).toHaveText(initial);
    await edit(page, change.field, change.value);
    await expect(figure).toHaveText(edited);
  });
}

test('keeps the state in the link: a changed form is a shareable URL and the starting values are the clean one', async ({
  page,
}) => {
  await page.goto('/dog-food-calculator');
  await edit(page, 'weight', '80');
  await expect(page).toHaveURL(/\?.*/);
  const shared = page.url();
  await page.goto(shared);
  await expect(page.locator('[name="weight"]')).toHaveValue('80');
  await expect(page.locator('[data-text="figure"]').first()).toHaveText('4 ½');
  await edit(page, 'weight', '40');
  await expect(page).toHaveURL(/\/dog-food-calculator$/);
});

test('a puppy page opens at its preset and its clean URL is the preset', async ({ page }) => {
  await page.goto('/puppy-feeding-calculator');
  await expect(page.locator('[name="status"]')).toHaveValue('puppy-young');
  await edit(page, 'weight', '16');
  await expect(page).toHaveURL(/\?/);
  await edit(page, 'weight', '8');
  await expect(page).toHaveURL(/\/puppy-feeding-calculator$/);
});

test('feeds grams for a label in calories per kilogram and cans for a label per can', async ({
  page,
}) => {
  await page.goto('/dog-food-calculator');
  await edit(page, 'weight', '10');
  await edit(page, 'unit', 'kg');
  await edit(page, 'basis', 'kg');
  await edit(page, 'kcal', '3600');
  // 10 kg neutered: 629.8 kcal / 3,600 x 1,000 = 175 g
  await expect(page.locator('[data-text="figure"]').first()).toHaveText('175');
  await expect(page.locator('[data-text="unit"]').first()).toHaveText('grams a day');
  await edit(page, 'basis', 'can');
  await edit(page, 'kcal', '400');
  await expect(page.locator('[data-text="unit"]').first()).toHaveText('cans a day');
});

test('shows the wet food figure only when part of the calories come from cans', async ({
  page,
}) => {
  await page.goto('/cat-food-calculator');
  const wet = page.locator('[data-show="wet"]');
  await expect(wet).toBeHidden();
  await edit(page, 'wetShare', '50');
  await expect(wet).toBeVisible();
  await edit(page, 'wetShare', '100');
  await expect(page.locator('[data-show="dry"]')).toBeHidden();
});

test('places the chocolate dose on the ruler and in its band, and always says to call', async ({
  page,
}) => {
  await page.goto('/dog-chocolate-toxicity-calculator');
  const result = page.locator('[data-result]');
  await expect(result).toHaveAttribute('data-band', '0');
  await expect(page.locator('.bf-call').first()).toContainText('(888) 426-4435');
  await expect(page.locator('a[href="tel:+18884264435"]').first()).toBeVisible();
  // 20 lb dog on 4 oz of baking chocolate: 113.4 g x 15.5 = 1,758 mg, over 9.07 kg = 193.8 mg/kg
  await edit(page, 'type', 'baking');
  await edit(page, 'amount', '4');
  await expect(result).toHaveAttribute('data-band', '3');
  await expect(page.locator('[data-text="figure"]').first()).toHaveText('193.8');
  await expect(page.locator('[data-text="band"]')).toContainText('seizures');
  await expect(page.locator('.bf-call-result')).toContainText('Call your veterinarian');
});

test('shades the due date window on the strip and says when a day is past the month', async ({
  page,
}) => {
  await page.goto('/dog-pregnancy-calculator');
  await expect(page.locator('.bf-strip .day.window')).toHaveCount(15);
  await edit(page, 'method', 'lh');
  await expect(page.locator('.bf-strip .day.window')).toHaveCount(3);
  const note = page.locator('[data-show="dayMovedBack"]');
  await expect(note).toBeHidden();
  await edit(page, 'month', '2');
  await edit(page, 'day', '31');
  await expect(note).toBeVisible();
});

test('shares each calculator on WhatsApp with the state of the form', async ({ page }) => {
  await page.goto('/dog-food-calculator');
  await edit(page, 'weight', '80');
  const href = await page.locator('a[data-share]').getAttribute('href');
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(href ?? '')).toContain('weight=80');
});

for (const { path } of CALCULATORS) {
  test(`${path} does not move as its script starts`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('load');
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              total += (entry as unknown as { value: number }).value;
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            resolve(total);
          }, 500);
        }),
    );
    expect(shift).toBeLessThan(0.01);
  });
}
