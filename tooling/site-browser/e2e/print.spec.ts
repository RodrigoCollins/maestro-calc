import { expect, test } from '@playwright/test';
import { calculatorPages } from './calculator-pages.ts';
import { open } from './locators.ts';

/*
 * The printed calculator page (calculator-page › Print): a sheet a contractor takes to the store.
 * It keeps the title, the answer, the form with its values, the result, the shopping list and the
 * sources, on white with no page chrome; the site header and footer, the copy and share tools, the
 * notice, the stepper buttons and the long article are left out, and the reserved heights collapse
 * so no blank band is printed. The width is a Letter or A4 sheet at the default margins (about
 * 7 in, 672 CSS px); nothing may run past it.
 */

/** About 7 in of printable width at 96 CSS px per inch. */
const SHEET = { width: 672, height: 1000 } as const;

const LEFT_OUT = [
  '.skip-link',
  '.site-header',
  '.site-footer',
  '.calc-copy',
  '.calc-notice',
  '.calc-steppers',
  '.calc-content .prose',
];

/** What the screen shows that the sheet keeps: the answer and the shopping card only on the pages
 * that have them. */
const KEPT = ['h1', '[data-answer]', '.calc-form', '.calc-result', '.calc-list', '.calc-sources'];

for (const calculator of calculatorPages) {
  const { path, locale } = calculator;

  test.describe(`${path} printed (calculator-page › Print, ${locale})`, () => {
    test.use({ viewport: SHEET });

    test.beforeEach(async ({ page }) => {
      await open(page, calculator);
    });

    // spec: calculator-page › [CP87] the sheet keeps the figures and leaves the page chrome out
    test('keeps the figures and leaves the chrome out', async ({ page }) => {
      const shown: string[] = [];
      for (const selector of KEPT) {
        if (await page.locator(selector).first().isVisible()) shown.push(selector);
      }
      expect(shown, 'the screen shows the title, the form and the result').toEqual(
        expect.arrayContaining(['h1', '.calc-form', '.calc-result']),
      );
      await page.emulateMedia({ media: 'print' });
      for (const selector of LEFT_OUT) {
        for (const element of await page.locator(selector).all()) {
          await expect(element, `${selector} is not printed`).toBeHidden();
        }
      }
      for (const selector of shown) {
        await expect(page.locator(selector).first(), `${selector} is printed`).toBeVisible();
      }
    });

    // spec: calculator-page › [CP88] white paper, no reserved band, nothing past the sheet
    test('prints on white with no reserved band and nothing past the sheet', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      const sheet = await page.evaluate(() => {
        const height = (selector: string): string | null => {
          const element = document.querySelector(selector);
          return element === null ? null : getComputedStyle(element).minHeight;
        };
        const exact = [...document.querySelectorAll('.calc-result, [aria-pressed="true"]')].map(
          (element) => getComputedStyle(element).printColorAdjust,
        );
        return {
          exact,
          ground: getComputedStyle(document.body).backgroundColor,
          answer: height('.calc-answer'),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(sheet.ground).toBe('rgb(255, 255, 255)');
      // white on ink: the result and a pressed choice keep their ground, or they print blank
      expect(sheet.exact.length).toBeGreaterThan(0);
      expect(sheet.exact.every((value) => value === 'exact')).toBe(true);
      if (sheet.answer !== null) expect(sheet.answer).toMatch(/^(0px|auto)$/);
      expect(sheet.overflow).toBeLessThanOrEqual(0);
    });
  });
}
