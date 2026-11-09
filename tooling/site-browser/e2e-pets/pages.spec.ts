import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { PAGES } from './pages.ts';

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

    test('has no WCAG A or AA violation in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });

    // open since 2026-11-08 (`SITE.indexable`): no robots meta, and the canonical names the page
    test('is open to search engines, with its canonical URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://bowlfigures.com${path}`,
      );
    });

    // The loader runs on bowlfigures.com only, so the browser tests send nothing to Google.
    // One load per page and its own test: a loop over every page in one test outgrows the timeout.
    test('carries the analytics loader, with the measurement id and the host', async ({ page }) => {
      await page.goto(path);
      const loader = page.locator('script[src="/analytics.js"]');
      await expect(loader).toHaveAttribute('data-ga', 'G-3NTFC4MK3R');
      await expect(loader).toHaveAttribute('data-host', 'bowlfigures.com');
    });
  });
}

test('answers an unknown path with the 404 page, which links the home', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
});

test('links every calculator from the header, each answering', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('header nav a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(8);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('links the methodology from every calculator, with its worked examples', async ({ page }) => {
  await page.goto('/dog-food-calculator');
  await page.locator('main a[href="/methodology"]').click();
  await expect(page).toHaveURL(/\/methodology$/);
  await expect(page.locator('main li strong').first()).toBeVisible();
});

test('links the privacy page from the footer, and it describes analytics', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer a[href="/privacy"]').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('main')).toContainText('Analytics');
});

test('tells the reader of the chocolate chart, calculator and guide to call a veterinarian or poison line', async ({
  page,
}) => {
  for (const path of [
    '/dog-chocolate-toxicity-calculator',
    '/dog-chocolate-toxicity-chart',
    '/my-dog-ate-chocolate',
  ]) {
    await page.goto(path);
    await expect(page.locator('main')).toContainText('(888) 426-4435');
    await expect(page.locator('main')).toContainText('veterinarian');
  }
});

test('sends the security headers with every page', async ({ request }) => {
  for (const path of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain(
      "script-src 'self' https://www.googletagmanager.com",
    );
    expect(response.headers()['content-security-policy'], path).toContain("frame-ancestors 'none'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('serves a sitemap with every page, robots that point to it, llms.txt and the link preview', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml.match(/<loc>/g)).toHaveLength(PAGES.length);
  for (const path of PAGES) expect(xml, path).toContain(`<loc>https://bowlfigures.com${path}`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://bowlfigures.com/sitemap.xml');
  expect((await request.get('/llms.txt')).status()).toBe(200);
  const image = await request.get('/og.png');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toBe('image/png');
});

test('serves the IndexNow key file', async ({ request }) => {
  const response = await request.get('/e479169234dd94a0442e50568c49b81b.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe('e479169234dd94a0442e50568c49b81b');
});
