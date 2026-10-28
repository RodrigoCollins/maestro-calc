import { expect, test } from '@playwright/test';
import { calculatorPages } from './calculator-pages.ts';
import type { E2eLanguage } from './calculator-pages.ts';
import { answer, figureAt, notRunning, shareLink } from './locators.ts';

/** A catalog string the record must hold: a missing key fails with its name, never as an empty match. */
const textOf = (catalog: Readonly<Record<string, string>>, key: string): string => {
  const text = catalog[key];
  if (text === undefined) throw new Error(`the catalog has no key "${key}"`);
  return text;
};

/**
 * The short answer and the large figure a reader whose browser runs no script sees (calculator-page
 * › [CP40], [CP74]): the default state of each page, as the server wrote it, read from its record.
 */
test.describe('calculator pages with JavaScript off (site-quality › [SQ18], calculator-page › [CP40])', () => {
  for (const calculator of calculatorPages) {
    const { id, locale, path, spec, site, catalog } = calculator;
    test.describe(path, () => {
      test('answers 200 and shows the default result', async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        if (spec.answer !== undefined)
          await expect(answer(page)).toHaveText(spec.answer.default[locale]);
        await expect(page.locator('.calc-primary')).toHaveText(spec.primary[locale]);
        expect(spec.defaults).toHaveLength(spec.figures.length);
        for (const [index, key] of spec.figures.entries())
          await expect(figureAt(page, key), key).toHaveText(String(spec.defaults[index]));
      });

      test('says in the "not running" note that the page needs JavaScript', async ({ page }) => {
        await page.goto(path);
        await expect(notRunning(page)).toBeVisible();
        await expect(notRunning(page)).toHaveText(
          `${textOf(site, 'site.calculator.noscript')} ${textOf(catalog, `calc.${id}.page.example`)}`,
        );
      });

      test('hides "Copy link" and disables every control of the form', async ({ page }) => {
        await page.goto(path);
        await expect(
          page.getByRole('button', { name: textOf(site, 'site.calculator.copyLink') }),
        ).toBeHidden();
        const controls = page.locator('form input, form button');
        expect(await controls.count()).toBe(spec.controls);
        for (const control of await controls.all()) await expect(control).toBeDisabled();
      });

      // spec: calculator-page › [CP80], site-quality › [SQ43] the share link waits for the script
      if (spec.share !== undefined) {
        test('hides the share link and gives it no href, only the inert base', async ({ page }) => {
          await page.goto(path);
          await expect(shareLink(page)).toHaveCount(1);
          await expect(shareLink(page)).toBeHidden();
          await expect(shareLink(page)).not.toHaveAttribute('href');
          await expect(shareLink(page)).toHaveAttribute('data-share', 'https://wa.me/');
        });
      }

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
