import { expect, test } from '@playwright/test';
import { DECIMAL_HOURS, DEFAULT_PAY, HOURS, OVERTIME, PAGES, PTO, TIME_CARD } from './pages.ts';

for (const { path } of PAGES) {
  test(`${path} reads without JavaScript`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
}

for (const { path } of TIME_CARD) {
  test(`${path} shows the default week and its pay without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="totalHours"]')).toHaveText('49.5');
    await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
  });
}

for (const { path } of OVERTIME) {
  test(`${path} shows the default week, its overtime and its pay without JavaScript`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="totalHours"]')).toHaveText('49.5');
    await expect(page.locator('[data-out="overtimeHours"]')).toHaveText('9.5');
    await expect(page.locator('[data-out="overtimeRate"]')).toHaveText('$33.00');
    await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
  });
}

for (const { path } of HOURS) {
  test(`${path} shows the default shift in both forms without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('.result-figure')).toHaveText('8 h 0 min');
    await expect(page.locator('[data-out="hours"][data-format="decimal"]')).toHaveText('8.00');
  });
}

for (const { path } of DECIMAL_HOURS) {
  test(`${path} shows both conversions and the chart without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="decimalHours"]')).toHaveText('8.33');
    await expect(page.locator('[data-out="fromDecimal"]')).toHaveText('7 h 45 min');
    // 45 minutes is the first row's third column: 0, 20 and 40 minutes, then 5 rows down
    await expect(page.locator('.chart tbody tr').nth(5).locator('td').nth(2)).toHaveText('0.75');
  });
}

for (const { path } of PTO) {
  test(`${path} shows the default accrual without JavaScript`, async ({ page }) => {
    await page.goto(path);
    // 10 days of 8 h = 80 h: 80/26 = 3.08 every two weeks, 80/2,080 = 0.0385 per hour worked
    await expect(page.locator('.result-figure')).toHaveText('3.08');
    await expect(page.locator('[data-out="perHourWorked"]')).toHaveText('0.0385');
    await expect(page.locator('[data-out="hoursPerPtoHour"]')).toHaveText('26');
  });
}

test('the pay converter shows its starting figures without JavaScript', async ({ page }) => {
  await page.goto('/hourly-to-salary-calculator');
  await expect(page.locator('.result-figure')).toHaveText('$45,760.00');
  await page.goto('/es/de-sueldo-anual-a-pago-por-hora');
  await expect(page.locator('.result-figure')).toHaveText('$28.85');
});
