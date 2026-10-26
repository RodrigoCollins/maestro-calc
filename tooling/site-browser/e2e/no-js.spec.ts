import { expect, test } from '@playwright/test';
import { calculatorPaths, langOf } from './urls.ts';

/** What the page promises a reader whose browser runs no script (calculator-page › [CP40]). */
const EXPECTED = {
  'en-US': {
    answer: 'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    primary: '1.63 cubic yards',
    note: 'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. Example: a 12 ft by 10 ft slab, 4 in thick.',
    copy: 'Copy link',
  },
  'es-US': {
    answer:
      'Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.',
    primary: '1.63 yardas cúbicas',
    note: 'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
    copy: 'Copiar enlace',
  },
} as const;

test.describe('calculator pages with JavaScript off (site-quality › [SQ18], calculator-page › [CP40])', () => {
  for (const path of calculatorPaths) {
    const expected = EXPECTED[langOf(path)];
    test.describe(path, () => {
      test('answers 200 and shows the default result', async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('[data-answer]')).toHaveText(expected.answer);
        await expect(page.locator('.calc-primary')).toHaveText(expected.primary);
        await expect(page.locator('[data-shopping="bag-80"]')).toHaveText('74');
        await expect(page.locator('[data-output="volumeFt3"]')).toHaveText('44.00');
      });

      test('says in the "not running" note that the page needs JavaScript', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('[data-not-running]')).toBeVisible();
        await expect(page.locator('[data-not-running]')).toHaveText(expected.note);
      });

      test('hides "Copy link" and disables every control of the form', async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole('button', { name: expected.copy })).toBeHidden();
        const controls = page.locator('form input, form button');
        expect(await controls.count()).toBeGreaterThan(20);
        for (const control of await controls.all()) await expect(control).toBeDisabled();
      });

      test('requests no script', async ({ page }) => {
        const scripts: string[] = [];
        page.on('request', (request) => {
          if (request.resourceType() === 'script') scripts.push(request.url());
        });
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        expect(scripts).toEqual([]);
      });
    });
  }
});
