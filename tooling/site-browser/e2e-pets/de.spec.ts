import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { DE_PAGES } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of DE_PAGES) {
  test.describe(path, () => {
    test('serves the page in German with one heading and no console error', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'de');
      await expect(page.locator('h1')).toHaveCount(1);
      expect(errors).toEqual([]);
    });

    test('fits a phone with no horizontal scroll', async ({ page }) => {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(390);
    });

    test('has no WCAG A or AA violation, in light and dark mode', async ({ page }) => {
      await page.goto(path);
      const light = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(light.violations, formatViolations(path, light.violations)).toEqual([]);
      await page.emulateMedia({ colorScheme: 'dark' });
      const dark = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(dark.violations, formatViolations(path, dark.violations)).toEqual([]);
    });

    // closed until the owner gives the Impressum details (`SITE.deIndexable`)
    test('stays out of the index: noindex, no canonical, no hreflang pair', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    });

    test('leads to its English twin from the header', async ({ page }) => {
      await page.goto(path);
      const twin = page.locator('header a[hreflang="en"]');
      await expect(twin).toHaveText('English');
      const href = (await twin.getAttribute('href')) ?? '';
      expect((await page.request.get(href)).status(), href).toBe(200);
    });
  });
}

test('sends the security headers with every German page', async ({ request }) => {
  for (const path of DE_PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("frame-ancestors 'none'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('keeps the German pages out of the sitemap while German is closed', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).not.toContain('/de');
});

test('tells the reader of a toxic food to call the veterinarian, with the Swiss line', async ({
  page,
}) => {
  for (const path of ['/de/duerfen-hunde-weintrauben-essen', '/de/hund-hat-schokolade-gefressen']) {
    await page.goto(path);
    await expect(page.locator('main .bf-call').first()).toContainText('Tierarztpraxis');
    await expect(page.locator('main .bf-call').first()).toContainText('145');
  }
});
