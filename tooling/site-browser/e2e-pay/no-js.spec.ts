import { expect, test } from '@playwright/test';
import {
  DECIMAL_HOURS,
  DEFAULT_PAY,
  HOURS,
  OVERTIME,
  PAGES,
  PTO,
  SHIFT,
  TIPPED,
  TIME_CARD,
} from './pages.ts';

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
    await expect(page.locator('[data-sum="sum"]')).toHaveText('11 h 15 min');
    await expect(page.locator('[data-sum="difference"]')).toHaveText('4 h 15 min');
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

for (const { path } of SHIFT) {
  test(`${path} shows the default week without JavaScript`, async ({ page }) => {
    await page.goto(path);
    // $20 + 10% = $22: 24 h x $20 + 16 h x $22 = $832 over 40 h, a regular rate of $20.80
    await expect(page.locator('.result-figure')).toHaveText('$832.00');
    await expect(page.locator('[data-out="shiftRate"]')).toHaveText('$22.00');
    await expect(page.locator('[data-out="regularRate"]')).toHaveText('$20.80');
    await expect(page.locator('input[name="amount"]')).toBeHidden();
  });
}

for (const { path } of TIPPED) {
  test(`${path} shows the default week without JavaScript`, async ({ page }) => {
    await page.goto(path);
    // 40 h x $2.13 = $85.20 + $250 in tips = $335.20, $8.38 an hour, no top-up
    await expect(page.locator('.result-figure')).toHaveText('$8.38');
    await expect(page.locator('[data-out="totalPay"]')).toHaveText('$335.20');
    await expect(page.locator('[data-out="topUp"]')).toHaveText('$0.00');
    await expect(page.locator('[data-warning="topUpOwed"]')).toBeHidden();
  });
}

test('the pay converter shows its starting figures without JavaScript', async ({ page }) => {
  await page.goto('/hourly-to-salary-calculator');
  await expect(page.locator('.result-figure')).toHaveText('$45,760.00');
  await page.goto('/es/de-sueldo-anual-a-pago-por-hora');
  await expect(page.locator('.result-figure')).toHaveText('$28.85');
});

// with no script, the share link is the page's canonical address in a WhatsApp message
for (const path of ['/states/texas', '/es/estados/texas', '/overtime-calculator']) {
  test(`${path} links WhatsApp with its own address without JavaScript`, async ({ page }) => {
    await page.goto(path);
    const link = page.locator('a[data-share]');
    await expect(link).toHaveCount(1);
    const href = (await link.getAttribute('href')) ?? '';
    expect(href.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(href)).toMatch(new RegExp(`\\nhttps://cuentahoras\\.com${path}$`));
  });
}
