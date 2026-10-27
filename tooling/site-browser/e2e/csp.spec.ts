import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { calculatorPages } from './calculator-pages.ts';
import {
  choiceButton,
  copyButton,
  figureAt,
  input,
  languageSwitch,
  notRunning,
  open,
} from './locators.ts';
import { representativePaths } from './representative.ts';
import { notFoundSamples, routable } from './urls.ts';

/** Collects the console messages that report a Content-Security-Policy violation. */
const watchCsp = (page: Page): string[] => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (/content security policy/i.test(message.text())) violations.push(message.text());
  });
  return violations;
};

test.describe('CSP does not break the pages (site-quality › [SQ14])', () => {
  for (const path of [...routable, ...notFoundSamples]) {
    test(`reports no CSP violation while ${path} loads`, async ({ page }) => {
      const violations = watchCsp(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(violations).toEqual([]);
    });
  }

  for (const calculator of calculatorPages) {
    test(`reports no CSP violation while ${calculator.path} is used`, async ({ page, context }) => {
      const { ready, typed, figures, choices } = calculator.spec;
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const violations = watchCsp(page);
      await open(page, calculator);
      await input(page, typed.key).fill(typed.text);
      // The first shopping figure is the one both the typed value and a choice press change, so
      // waiting on it proves each handler ran (and tripped no policy) before the next step.
      const shopping = figures.findIndex((key) => key.startsWith('shopping:'));
      const shoppingKey = figures[shopping] ?? '';
      const shoppingText = typed.figures[shopping] ?? '';
      if (shopping >= 0) await expect(figureAt(page, shoppingKey)).toHaveText(shoppingText);
      const [choice] = choices ?? [];
      const option = choice?.options.find((candidate) => candidate.value !== choice.initial);
      if (choice !== undefined && option !== undefined) {
        await choiceButton(page, choice.key, option.value).click();
        if (shopping >= 0) await expect(figureAt(page, shoppingKey)).not.toHaveText(shoppingText);
      }
      await copyButton(page).click();
      await expect(page.locator('[data-copy-status]')).not.toHaveText('');
      await languageSwitch(page).click();
      await expect(page).toHaveURL(new RegExp(`${calculator.other}\\?`));
      await expect(input(page, ready)).toBeEnabled();
      await expect(notRunning(page)).toBeHidden();
      await page.waitForLoadState('networkidle');
      expect(violations).toEqual([]);
    });
  }

  // spec: site-quality › [SQ26] an inline script added to a calculator page does not run
  test('blocks an inline script added to the calculator page and reports the violation', async ({
    page,
  }) => {
    const violations = watchCsp(page);
    const [path] = representativePaths;
    const calculator = calculatorPages.find((candidate) => candidate.path === path);
    if (path === undefined || calculator === undefined) {
      throw new Error('the Lighthouse representative is not a page of the record');
    }
    await page.route(`**${path}`, async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        '</body>',
        '<script>window.__injected = true</script></body>',
      );
      await route.fulfill({ response, body });
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => 'injected' in window || '__injected' in window)).toBe(false);
    expect(violations.length).toBeGreaterThan(0);
    // the calculator itself still works
    await expect(input(page, calculator.spec.ready)).toBeEnabled();
  });
});
