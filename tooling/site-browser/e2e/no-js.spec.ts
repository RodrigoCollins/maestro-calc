import { expect, test } from '@playwright/test';
import type { CalculatorPageId } from '../../../apps/web/src/routing/templates.ts';
import { calculatorPages } from './calculator-pages.ts';
import type { E2eLanguage } from './calculator-pages.ts';
import { figureAt } from './locators.ts';

/**
 * The short answer and the large figure a reader whose browser runs no script sees (calculator-page
 * › [CP40], [CP74]): the default state of each page, as the server wrote it.
 */
const EXPECTED = {
  concrete: {
    en: {
      answer:
        'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
      primary: '1.63 cubic yards',
    },
    es: {
      answer:
        'Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.',
      primary: '1.63 yardas cúbicas',
    },
  },
} as const satisfies Record<
  CalculatorPageId,
  Record<E2eLanguage, { readonly answer: string; readonly primary: string }>
>;

test.describe('calculator pages with JavaScript off (site-quality › [SQ18], calculator-page › [CP40])', () => {
  for (const calculator of calculatorPages) {
    const { id, locale, path, spec, site, catalog } = calculator;
    const expected = EXPECTED[id][locale];
    test.describe(path, () => {
      test('answers 200 and shows the default result', async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('[data-answer]')).toHaveText(expected.answer);
        await expect(page.locator('.calc-primary')).toHaveText(expected.primary);
        for (const [index, key] of spec.figures.entries())
          await expect(figureAt(page, key), key).toHaveText(spec.defaults[index] ?? '');
      });

      test('says in the "not running" note that the page needs JavaScript', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('[data-not-running]')).toBeVisible();
        await expect(page.locator('[data-not-running]')).toHaveText(
          `${site['site.calculator.noscript'] ?? ''} ${catalog[`calc.${id}.page.example`] ?? ''}`,
        );
      });

      test('hides "Copy link" and disables every control of the form', async ({ page }) => {
        await page.goto(path);
        await expect(
          page.getByRole('button', { name: site['site.calculator.copyLink'] ?? '' }),
        ).toBeHidden();
        const controls = page.locator('form input, form button');
        expect(await controls.count()).toBeGreaterThanOrEqual(spec.inputs);
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
