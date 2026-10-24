import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from './axe-report.ts';
import { notFoundSamples, routable } from './urls.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('axe (site-quality › [SQ1], [SQ2])', () => {
  for (const path of [...routable, ...notFoundSamples]) {
    test(`has no WCAG A or AA violation on ${path}`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });
  }

  test('reports a seeded violation and names the page and the rule', async ({ page }) => {
    await page.setContent('<html lang="en"><title>t</title><img src="x.png">');
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.map(({ id }) => id)).toContain('image-alt');
    const message = formatViolations('seeded page', violations);
    expect(message).toContain('seeded page');
    expect(message).toContain('image-alt');
  });
});
