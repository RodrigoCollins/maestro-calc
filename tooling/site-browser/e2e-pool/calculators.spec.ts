import { expect, test } from '@playwright/test';
import { CALCULATORS } from './pages.ts';

for (const { path, out, initial, edit, edited } of CALCULATORS) {
  test(`${path} works the figure out again as the visitor types`, async ({ page }) => {
    await page.goto(path);
    const figure = page.locator(`[data-out="${out}"]`).first();
    await expect(figure).toHaveText(initial);
    await page.locator(`[name="${edit.field}"]`).fill(edit.value);
    await expect(figure).toHaveText(edited);
  });
}

test('warns that salt over the target only comes down by draining', async ({ page }) => {
  await page.goto('/pool-salt-calculator');
  const warning = page.locator('[data-warning="drainToLower"]');
  await expect(warning).toBeHidden();
  await page.locator('[name="current"]').fill('4000');
  await expect(warning).toBeVisible();
});

test('says lowering alkalinity takes acid when the reading is over the target', async ({
  page,
}) => {
  await page.goto('/pool-alkalinity-calculator');
  const warning = page.locator('[data-warning="acidToLower"]');
  await expect(warning).toBeHidden();
  await page.locator('[name="current"]').fill('150');
  await expect(warning).toBeVisible();
  await expect(page.locator('[data-out="pounds"]').first()).toHaveText('0.0');
});

test('notes a stabilizer target over the 90 ppm public-pool limit', async ({ page }) => {
  await page.goto('/pool-stabilizer-calculator');
  const limit = page.locator('[data-warning="overCodeLimit"]');
  const drain = page.locator('[data-warning="drainToLower"]');
  await expect(limit).toBeHidden();
  await page.locator('[name="target"]').fill('100');
  await expect(limit).toBeVisible();
  await page.locator('[name="current"]').fill('120');
  await expect(drain).toBeVisible();
});

test('splits a calcium dose over 3 lb per 10,000 gallons, and says dilution lowers it', async ({
  page,
}) => {
  await page.goto('/pool-calcium-hardness-calculator');
  const split = page.locator('[data-warning="splitDose"]');
  const dilute = page.locator('[data-warning="dilutionToLower"]');
  await expect(split).toBeHidden();
  await expect(dilute).toBeHidden();
  // 20,000 gal from 150 to 250 ppm: 25 lb, the first 2 x 3 lb = 6 lb
  await page.locator('[name="current"]').fill('150');
  await page.locator('[name="target"]').fill('250');
  await expect(page.locator('[data-out="pounds"]').first()).toHaveText('25.0');
  await expect(page.locator('[data-out="firstAddition"]').first()).toHaveText('6.0');
  await expect(split).toBeVisible();
  await page.locator('[name="current"]').fill('450');
  await expect(dilute).toBeVisible();
  await expect(split).toBeHidden();
  await expect(page.locator('[data-out="pounds"]').first()).toHaveText('0.0');
});

test('shows the dose of the chlorine product the visitor picks', async ({ page }) => {
  await page.goto('/pool-chlorine-calculator');
  await page.locator('[name="product"]').selectOption('cal-hypo-65');
  // 37.85 g per ppm per 10,000 gal x 2 ppm x 2 / 0.65, in ounces
  await expect(page.locator('[data-out="dry"]').first()).toHaveText('8.2');
});

test('shows the soda ash dose to raise pH, and notes a count past the 3-drop chart', async ({
  page,
}) => {
  await page.goto('/pool-ph-calculator');
  const acid = page.locator('[data-out="liquid"]').first();
  const soda = page.locator('[data-out="dry"]').first();
  const past = page.locator('[data-warning="pastChart"]');
  const days = page.locator('[data-warning="splitDays"]');
  const additions = page.locator('[data-warning="splitAdditions"]');
  await expect(acid).toBeVisible();
  await expect(soda).toBeHidden();
  await expect(past).toBeHidden();
  // HASA: one quart per 20,000 gal a day, so 36.64 fl oz takes 2 days
  await expect(page.locator('[data-out="liquidPerDay"]')).toHaveText('32.0');
  await expect(page.locator('[data-out="days"]')).toHaveText('2');
  await expect(days).toBeVisible();
  await expect(page.locator('[data-forms="soda-ash"] [data-out="additions"]')).toBeHidden();
  await page.locator('[name="product"]').selectOption('soda-ash');
  // Taylor: 5.13 oz a drop of base demand per 10,000 gal, x 2 drops x 2 (20,000 gal)
  await expect(soda).toHaveText('20.5');
  await expect(acid).toBeHidden();
  await expect(page.locator('[data-out="days"]')).toBeHidden();
  await expect(days).toBeHidden();
  // pH Up: at most 1 lb per 10,000 gal at a time, 32 oz here: one addition
  await expect(page.locator('[data-out="dryPerAddition"]')).toHaveText('32.0');
  await expect(page.locator('[data-forms="soda-ash"] [data-out="additions"]')).toHaveText('1');
  await expect(additions).toBeHidden();
  await page.locator('[name="drops"]').fill('4');
  await expect(soda).toHaveText('41.0');
  await expect(page.locator('[data-forms="soda-ash"] [data-out="additions"]')).toHaveText('2');
  await expect(past).toBeVisible();
  await expect(additions).toBeVisible();
});

test('shows the dry acid dose in ounces and pounds, split by its label', async ({ page }) => {
  await page.goto('/pool-ph-calculator');
  await page.locator('[name="product"]').selectOption('dry-acid');
  // Taylor: 12.32 oz of dry acid a drop per 10,000 gal, x 2 drops x 2 (20,000 gal) = 49.28 oz
  await expect(page.locator('[data-forms="dry-acid"] [data-out="dry"]')).toHaveText('49.3');
  await expect(page.locator('[data-out="dry"][data-as="large"]')).toHaveText('3.08');
  // pH Down: at most 1.5 lb per 10,000 gal at any one time, 48 oz here: 2 additions
  await expect(page.locator('[data-out="dryPerAddition"]')).toHaveText('48.0');
  await expect(page.locator('[data-forms="dry-acid"] [data-out="additions"]')).toHaveText('2');
  await expect(page.locator('[data-warning="splitAdditions"]')).toBeVisible();
  await expect(page.locator('[data-out="liquid"]').first()).toBeHidden();
});

test('shows what dichlor adds besides chlorine, and the dose in pounds', async ({ page }) => {
  await page.goto('/pool-chlorine-calculator');
  await page.locator('[name="product"]').selectOption('dichlor-56');
  // 129.07 / 141.80 ppm of CYA a ppm, x 2 ppm = 1.82
  await expect(page.locator('[data-out="cya"]')).toHaveText('1.8');
  // 75.708 g x 2 ppm / 0.56 = 270.4 g = 0.60 lb
  await expect(page.locator('[data-out="dry"][data-as="large"]')).toHaveText('0.60');
  await expect(page.locator('[data-out="hardness"]')).toBeHidden();
});

test('redraws the side view of the pool as the visitor types', async ({ page }) => {
  await page.goto('/pool-volume-calculator');
  const drawing = page.locator('svg[data-side]');
  const water = drawing.locator('[data-side="water"]');
  await expect(drawing.locator('[data-side="mark0"]')).toHaveText('3½ FT');
  await expect(drawing.locator('[data-side="mark1"]')).toHaveText('8 FT');
  await expect(water).toHaveAttribute('d', 'M8 34V84.8H190L250 150H322V34Z');
  await page.locator('[name="deep"]').fill('10 ft');
  // the deep end is the full 116 under the waterline; 42 / 120 x 116 = 40.6, the floor at 74.6
  await expect(drawing.locator('[data-side="mark1"]')).toHaveText('10 FT');
  await expect(water).toHaveAttribute('d', 'M8 34V74.6H190L250 150H322V34Z');
  await expect(drawing).toHaveAttribute('aria-label', /3½ ft deep at the shallow end and 10 ft/);
  // an edit it cannot read keeps the last pool it could draw
  await page.locator('[name="deep"]').fill('deep');
  await expect(drawing.locator('[data-side="mark1"]')).toHaveText('10 FT');
});

test('names the redrawn side view in Spanish on the Spanish page', async ({ page }) => {
  await page.goto('/es/calculadora-de-volumen-de-piscina');
  const drawing = page.locator('svg[data-side]');
  await expect(drawing).toHaveAttribute('aria-label', /^Vista lateral de la piscina/);
  await page.locator('[name="deep"]').fill('10 ft');
  await expect(drawing.locator('[data-side="mark1"]')).toHaveText('10 FT');
  await expect(drawing).toHaveAttribute(
    'aria-label',
    /3½ ft de profundidad en la parte baja y 10 ft en la parte honda$/,
  );
});

test('sets the chlorine reading from a tapped test strip pad', async ({ page }) => {
  await page.goto('/pool-chlorine-calculator');
  const field = page.locator('[name="current"]');
  const strip = page.locator('.pool-strip');
  const pad = (ppm: string) => strip.getByRole('button', { name: ppm, exact: true });
  await expect(pad('1')).toHaveAttribute('aria-pressed', 'true');
  await pad('0').click();
  await expect(field).toHaveValue('0');
  await expect(pad('0')).toHaveAttribute('aria-pressed', 'true');
  await expect(pad('1')).toHaveAttribute('aria-pressed', 'false');
  // 10.24 fl oz x 3 ppm x 2 (20,000 gal)
  await expect(page.locator('[data-out="liquid"]').first()).toHaveText('61.4');
  // the keyboard reaches the pads
  await pad('5').focus();
  await page.keyboard.press('Space');
  await expect(field).toHaveValue('5');
  await expect(page.locator('[data-out="liquid"]').first()).toHaveText('0.0');
  // a reading typed between two pads marks none
  await field.fill('2');
  await expect(strip.locator('[aria-pressed="true"]')).toHaveCount(0);
});

for (const path of ['/pool-volume-calculator', '/pool-chlorine-calculator']) {
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
