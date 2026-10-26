import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { CONCRETE_PAGES } from './concrete-pages.ts';
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

  for (const calculator of CONCRETE_PAGES) {
    test(`reports no CSP violation while ${calculator.path} is used`, async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const violations = watchCsp(page);
      await page.goto(calculator.path);
      await expect(page.locator('#calc-length')).toBeEnabled();
      await page.locator('#calc-length').fill('20');
      await expect(page.locator('[data-shopping]')).toHaveText('123');
      await page.locator('[data-shape-button="footing"]').click();
      await expect(page.locator('[data-shopping]')).not.toHaveText('123');
      await page.locator('[data-copy]').click();
      await expect(page.locator('[data-copy-status]')).not.toHaveText('');
      await page.locator('header a[hreflang]').click();
      await expect(page).toHaveURL(new RegExp(`${calculator.other}\\?`));
      await expect(page.locator('#calc-length')).toBeEnabled();
      await expect(page.locator('[data-not-running]')).toBeHidden();
      await page.waitForLoadState('networkidle');
      expect(violations).toEqual([]);
    });
  }

  // spec: site-quality › [SQ26] an inline script added to a calculator page does not run
  test('blocks an inline script added to the calculator page and reports the violation', async ({
    page,
  }) => {
    const violations = watchCsp(page);
    await page.route('**/concrete-calculator', async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        '</body>',
        '<script>window.__injected = true</script></body>',
      );
      await route.fulfill({ response, body });
    });
    await page.goto('/concrete-calculator');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => 'injected' in window || '__injected' in window)).toBe(false);
    expect(violations.length).toBeGreaterThan(0);
    // the calculator itself still works
    await expect(page.locator('#calc-length')).toBeEnabled();
  });
});
