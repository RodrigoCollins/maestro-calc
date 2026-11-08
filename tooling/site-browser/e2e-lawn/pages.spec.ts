import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { PAGES, SCRIPTED } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of PAGES) {
  test.describe(path, () => {
    test('serves the page in English with one heading and no console error', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toHaveCount(1);
      expect(errors).toEqual([]);
    });

    test('fits a phone with no horizontal scroll', async ({ page }) => {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(390);
    });

    test('has no WCAG A or AA violation', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });

    // open since 2026-11-08 (`indexable` in src/site.config.ts); no analytics until `gaId` is set
    test('is open to search engines, with its canonical URL, its JSON-LD and no analytics', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://lawnfigures.com${path}`,
      );
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
      await expect(page.locator('script[src="/analytics.js"]')).toHaveCount(0);
    });

    test('loads one module script on a page with a tool and none on any other', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('script[type="module"][src]')).toHaveCount(
        SCRIPTED.includes(path) ? 1 : 0,
      );
    });
  });
}

test('answers an unknown path with the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
});

test('serves the security headers and the site policy', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
  const csp = headers['content-security-policy'] ?? '';
  expect(csp).toContain("script-src 'self' https://www.googletagmanager.com");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
});

test('serves the IndexNow key, robots.txt, llms.txt and the link preview image', async ({
  request,
}) => {
  const key = await request.get('/5d1c7e0b9a3f4c28b6e1a7d4f09c3b52.txt');
  expect(await key.text()).toBe('5d1c7e0b9a3f4c28b6e1a7d4f09c3b52');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://lawnfigures.com/sitemap.xml');
  const llms = await request.get('/llms.txt');
  expect(await llms.text()).toContain('# Lawn Figures');
  const image = await request.get('/og.png');
  expect(image.headers()['content-type']).toBe('image/png');
});

test('caches the hashed assets for a year', async ({ page }) => {
  await page.goto('/sod-calculator');
  const src = await page.locator('script[type="module"][src]').getAttribute('src');
  const response = await page.request.get(src ?? '');
  expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('has contrast on the home hero in the dark scheme too', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations, formatViolations('/ (dark)', violations)).toEqual([]);
});
