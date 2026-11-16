import { expect, test } from '@playwright/test';
import {
  AGUINALDO,
  ANTIGUEDAD,
  COUNTDOWN_PATHS,
  DAYS_BETWEEN,
  DECIMAL_HOURS,
  DEFAULT_PAY,
  HOURS,
  ISR_MX,
  MILITARY,
  OVERTIME,
  PAGES,
  PTO,
  SHIFT,
  SDI_MX,
  SUELDO_NETO,
  VACACIONES_MX,
  SHIFT_TOOL,
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
    // the saved week and the copy and share button need the script: no dead control without it
    await expect(page.locator('[data-saved]')).toBeHidden();
    await expect(page.locator('[data-send]')).toBeHidden();
    await expect(page.locator('[data-whatsapp]')).toBeVisible();
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

// the answer, the rows and the tool's figures for its own fields are in the page as built
test(`${SHIFT_TOOL.day} shows the answer, the tool and the rows without JavaScript`, async ({
  page,
}) => {
  await page.goto(SHIFT_TOOL.day);
  await expect(page.locator('.result-figure')).toHaveText('8 hours');
  await expect(page.locator('[data-out="hours"][data-format="hours-minutes"]')).toHaveText(
    '7 h 30 min',
  );
  await expect(page.locator('[data-out="dayPay"]')).toHaveText('$150.00');
  await expect(page.locator('[data-out="weekPay"]')).toHaveText('$750.00');
  await expect(page.locator('.breakdown li').filter({ hasText: '7 h 30 min (7.50)' })).toHaveCount(
    1,
  );
});

test(`${SHIFT_TOOL.night} shows its overnight notice and its week without JavaScript`, async ({
  page,
}) => {
  await page.goto(SHIFT_TOOL.night);
  await expect(page.locator('.result-figure')).toHaveText('12 horas');
  await expect(page.locator('form [data-warning="overnight"]')).toBeVisible();
  await expect(page.locator('[data-out="weekPay"]')).toHaveText('$1,325.00');
});

for (const { path } of DECIMAL_HOURS) {
  test(`${path} shows both conversions and the chart without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-out="decimalHours"]')).toHaveText('8.33');
    await expect(page.locator('[data-out="fromDecimal"]')).toHaveText('7 h 45 min');
    // 45 minutes is the first row's third column: 0, 20 and 40 minutes, then 5 rows down
    await expect(page.locator('.chart tbody tr').nth(5).locator('td').nth(2)).toHaveText('0.75');
  });
}

test(`${DAYS_BETWEEN} shows the days of 2026 without JavaScript`, async ({ page }) => {
  await page.goto(DAYS_BETWEEN);
  await expect(page.locator('[data-days="figure"]')).toHaveText('364 días');
  await expect(page.locator('[data-days="business"]')).toHaveText('260 días');
  // the date 90 days after 1 January 2026, and no «Hoy» button: the build writes no today
  await expect(page.locator('[data-shift="figure"]')).toHaveText('miércoles 1 de abril de 2026');
  await expect(page.locator('button[data-today]')).toHaveCount(3);
  await expect(page.locator('button[data-today]').first()).toBeHidden();
  await expect(page.getByRole('button', { name: /^Hoy/ })).toHaveCount(0);
});

// The defaults, worked by the build: 315.04 × 15 = 4,725.60 for 2026; 5 years of service give
// 20 days, 315.04 × 20 = 6,300.80 and a prima of 25%, 1,575.20.
test(`${AGUINALDO} shows the aguinaldo of 2026 without JavaScript`, async ({ page }) => {
  await page.goto(AGUINALDO);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('$4,725.60');
  await expect(page.locator('[data-mx="exempt"]')).toHaveText('$3,519.30');
});

test(`${VACACIONES_MX} shows five years of vacation without JavaScript`, async ({ page }) => {
  await page.goto(VACACIONES_MX);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('20 días');
  await expect(page.locator('[data-mx="prima"]')).toHaveText('$1,575.20');
});

// $12,000 a month: 420.95 + (12,000 − 7,168.52) × 10.88% = 946.62, over the subsidy limit;
// $20,000: 2,383.65 of ISR and 540.13 of IMSS worker quotas, 17,076.22 net.
test(`${ISR_MX} shows the ISR of $12,000 without JavaScript`, async ({ page }) => {
  await page.goto(ISR_MX);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('$946.62');
  await expect(page.locator('[data-mx="rate"]')).toHaveText('10.88%');
});

test(`${SUELDO_NETO} shows the net pay of $20,000 without JavaScript`, async ({ page }) => {
  await page.goto(SUELDO_NETO);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('$17,076.22');
  await expect(page.locator('[data-mx="imss"]')).toHaveText('$540.13');
});

for (const path of COUNTDOWN_PATHS) {
  test(`${path} shows its date, not a count, without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-countdown="days"]')).toHaveText(/^El /);
    await expect(page.locator('[data-countdown="date"]')).toHaveText(/de cada año$/);
  });
}

for (const { path, lang } of MILITARY) {
  test(`${path} shows 1500 on both clocks without JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('[data-mil="figure"]')).toHaveText(
      lang === 'en' ? '1500 = 3:00 PM' : '1500 = 3:00 p. m.',
    );
    await expect(page.locator('[data-mil="colon"]')).toHaveText('15:00');
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

// The defaults, worked by the build: 15 years at the minimum wage, 315.04 × 180 = 56,707.20; the
// first year of service, 315.04 × 383 / 365 = 330.58 with the factor 1.0493.
test(`${ANTIGUEDAD} shows 15 years of prima without JavaScript`, async ({ page }) => {
  await page.goto(ANTIGUEDAD);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('$56,707.20');
  await expect(page.locator('[data-mx="earned"]')).toHaveText('180 días');
});

test(`${SDI_MX} shows the first year SDI without JavaScript`, async ({ page }) => {
  await page.goto(SDI_MX);
  await expect(page.locator('[data-mx="figure"]')).toHaveText('$330.58');
  await expect(page.locator('[data-mx="factor"]')).toHaveText('1.0493');
});
