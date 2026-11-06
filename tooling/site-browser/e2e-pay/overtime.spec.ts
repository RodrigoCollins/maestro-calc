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

    test('pays the state daily rules: Alaska past 8, Nevada under $18, Colorado past 12', async ({
      page,
    }) => {
      // four 10 h days at $22: $968.00 in Alaska; Nevada at $22 is over the $18.00 line, $880.00,
      // and at $15 pays 32 x 15 + 8 x 22.50 = $660.00; three 14 h days in Colorado are $990.00
      await page.goto(path);
      await fourTens(page);
      const rule = page.locator('select[name="rule"]');
      await rule.selectOption('alaska');
      await expect(page.locator('.result-figure')).toHaveText('$968.00');
      await expect(page.locator('[data-out="doubleHours"]')).toHaveText('0');
      await rule.selectOption('nevada');
      await expect(page.locator('.result-figure')).toHaveText('$880.00');
      await page.locator('input[name="rate"]').fill('15');
      await expect(page.locator('.result-figure')).toHaveText('$660.00');
      await page.locator('input[name="rate"]').fill('22');
      await rule.selectOption('colorado');
      for (const day of ['mon', 'tue', 'wed']) {
        await page.locator(`input[name="${day}"]`).fill('14');
      }
      await page.locator('input[name="thu"]').fill('0');
      await expect(page.locator('.result-figure')).toHaveText('$990.00');
      await page.goto(page.url());
      await expect(rule).toHaveValue('colorado');
    });
  });
}

// A state page with a daily rule opens the calculator on it: Nevada's 40 hours at its $12.00
// minimum, under the $18.00 line.
for (const [state, calculator] of [
  ['/states/nevada', '/overtime-calculator'],
  ['/es/estados/nevada', '/es/calculadora-de-horas-extra'],
] as const) {
  test(`${state} opens the overtime calculator on the Nevada rule`, async ({ page }) => {
    await page.goto(state);
    await page.locator(`a[href^="${calculator}?"]`).first().click();
    await expect(page.locator('select[name="rule"]')).toHaveValue('nevada');
    await expect(page.locator('input[name="rate"]')).toHaveValue('12.00');
    await expect(page.locator('.result-figure')).toHaveText('$480.00');
  });
}
