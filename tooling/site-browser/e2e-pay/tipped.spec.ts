import { expect, test } from '@playwright/test';
import { TIPPED } from './pages.ts';

// Hand-verified on the FLSA (DOL Fact Sheet #15) at a $2.13 cash wage: 40 h = $85.20 + $250 in
// tips = $335.20, $8.38 an hour; $150 in tips: $290 - $235.20 = $54.80 owed, $7.25 an hour;
// 44 h with $300 in tips: $93.72 + 4 x $3.625 = $14.50 + $300 = $408.22.
for (const { path } of TIPPED) {
  test.describe(path, () => {
    test('starts at $2.13 with $250 in tips, a clean URL and no warning', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.result-figure')).toHaveText('$8.38');
      await expect(page.locator('[data-out="tipCredit"]')).toHaveText('$204.80');
      await expect(page.locator('[data-warning]:visible')).toHaveCount(0);
      expect(new URL(page.url()).search).toBe('');
    });

    test('shows the top-up when the tips fall short and reopens the week from the link', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('input[name="tips"]').fill('150');
      await expect(page.locator('[data-out="topUp"]')).toHaveText('$54.80');
      await expect(page.locator('.result-figure')).toHaveText('$7.25');
      await expect(page.locator('[data-warning="topUpOwed"]')).toBeVisible();
      await page.goto(page.url());
      await expect(page.locator('input[name="tips"]')).toHaveValue('150.00');
      await expect(page.locator('[data-out="topUp"]')).toHaveText('$54.80');
    });

    test('figures the overtime on $7.25 and marks a cash wage under $2.13', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="hours"]').fill('44');
      await page.locator('input[name="tips"]').fill('300');
      await expect(page.locator('[data-out="overtimePremium"]')).toHaveText('$14.50');
      await expect(page.locator('[data-out="totalPay"]')).toHaveText('$408.22');
      const cash = page.locator('input[name="cashWage"]');
      await cash.fill('2');
      await expect(cash).toHaveAttribute('aria-invalid', 'true');
    });

    test('takes a state minimum and tip credit: Arizona, $100 in tips owe $20', async ({
      page,
    }) => {
      // $12.15 x 40 = $486; the $15.15 minimum is $606; $100 of the $120 credit, $20 owed
      await page.goto(path);
      await page.locator('input[name="cashWage"]').fill('12.15');
      await page.locator('input[name="minimumWage"]').fill('15.15');
      await page.locator('input[name="maxTipCredit"]').fill('3');
      await page.locator('input[name="tips"]').fill('100');
      await expect(page.locator('[data-out="topUp"]')).toHaveText('$20.00');
      await expect(page.locator('.result-figure')).toHaveText('$15.15');
      await expect(page.locator('[data-warning="topUpOwed"]')).toBeVisible();
    });
  });
}

// A state page opens the calculator on its row of the tipped table: Arizona's 30 hours with no
// tips are 30 x $15.15 = $454.50, of which $90 (30 x $3.00) the employer tops up.
for (const [state, lang] of [
  ['/states/arizona', 'en'],
  ['/es/estados/arizona', 'es'],
] as const) {
  test(`${state} opens the tipped wage calculator on Arizona's figures`, async ({ page }) => {
    await page.goto(state);
    await page
      .locator(
        `a[href^="${lang === 'en' ? '/tipped-wage-calculator' : '/es/calculadora-de-propinas-por-hora'}?"]`,
      )
      .click();
    await expect(page.locator('input[name="cashWage"]')).toHaveValue('12.15');
    await expect(page.locator('input[name="minimumWage"]')).toHaveValue('15.15');
    await expect(page.locator('input[name="maxTipCredit"]')).toHaveValue('3.00');
    await expect(page.locator('[data-out="totalPay"]')).toHaveText('$454.50');
    await expect(page.locator('[data-out="topUp"]')).toHaveText('$90.00');
  });
}
