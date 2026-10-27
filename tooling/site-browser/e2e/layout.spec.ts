import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { calculatorPages, typedQuery } from './calculator-pages.ts';

/** Sums the layout-shift entries that no input caused, from the start of the load. */
const shiftOf = (page: Page): Promise<number> =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const entries = performance.getEntriesByType('layout-shift') as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[];
        resolve(
          entries.filter((entry) => !entry.hadRecentInput).reduce((sum, e) => sum + e.value, 0),
        );
      }),
  );

for (const calculator of calculatorPages) {
  test.describe(`${calculator.path} layout (calculator-page › Layout stability, ${calculator.locale})`, () => {
    // spec: calculator-page › [CP44], site-quality › [SQ19] the load shifts nothing, with and without a state
    for (const query of ['', calculator.spec.restored?.query ?? typedQuery(calculator.spec)]) {
      test(`shifts the layout by at most 0.01 on load${query === '' ? '' : ' with a state in the link'}`, async ({
        page,
      }) => {
        await page.addInitScript(() => {
          new PerformanceObserver(() => undefined).observe({
            type: 'layout-shift',
            buffered: true,
          });
        });
        await page.goto(`${calculator.path}${query}`);
        await expect(page.locator('[data-not-running]')).toBeHidden();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        expect(await shiftOf(page)).toBeLessThanOrEqual(0.01);
      });
    }

    // spec: calculator-page › [CP44], DR-13 the short answer keeps its reserved block for the longest sentences
    for (const width of [320, 390]) {
      test(`keeps the answer block at its reserved size at ${String(width)} px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(calculator.path);
        await expect(page.locator('[data-not-running]')).toBeHidden();
        const reserved = await page
          .locator('[data-answer]')
          .evaluate((element) => Number.parseFloat(getComputedStyle(element).minHeight));
        const heights: Record<string, number> = {};
        for (const query of calculator.spec.layoutQueries) {
          await page.goto(`${calculator.path}${query}`);
          await expect(page.locator('[data-not-running]')).toBeHidden();
          const box = await page.locator('[data-answer]').boundingBox();
          heights[query] = Math.round(box?.height ?? 0);
        }
        for (const [query, height] of Object.entries(heights)) {
          expect(height, query).toBeLessThanOrEqual(reserved);
        }
      });

      test(`keeps the notice, shape and copy areas at their reserved size at ${String(width)} px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(calculator.path);
        await expect(page.locator('[data-not-running]')).toBeHidden();
        const before = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.goto(`${calculator.path}?v=2&${calculator.spec.typed.param}`);
        await expect(page.locator('#calc-notice')).toBeVisible();
        const withNotice = await page.evaluate(() => document.documentElement.scrollHeight);
        expect(withNotice).toBe(before);
      });
    }
  });
}
