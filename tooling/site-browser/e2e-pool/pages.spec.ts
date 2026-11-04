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

    test('is open to search engines, with its canonical URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://poolfigures.com${path}`,
      );
    });
  });
}

test('answers an unknown path with the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('links every calculator from the home and the header to a page that answers', async ({
  page,
}) => {
  await page.goto('/');
  for (const selector of ['.pool-tools a', 'header nav a']) {
    const hrefs = await page
      .locator(selector)
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs, selector).toHaveLength(4);
    for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
  }
});

test('links the methodology from the footer, and it shows the worked examples', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('footer a[href="/methodology"]').click();
  await expect(page).toHaveURL(/\/methodology$/);
  await expect(page.locator('.pool-method li strong')).toHaveCount(5);
  await expect(page.locator('.pool-method li strong').first()).toHaveText('22,023 gallons');
});

test('links the privacy page from the footer, and it describes Google Analytics', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('footer a[href="/privacy"]').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('#analytics')).toHaveText('Analytics and cookies');
});

// The loader runs on poolfigures.com only, so the browser tests send nothing to Google.
test('carries the analytics loader on every page, with the measurement id and the host', async ({
  page,
}) => {
  for (const path of PAGES) {
    await page.goto(path);
    const loader = page.locator('script[src="/analytics.js"]');
    await expect(loader, path).toHaveAttribute('data-ga', 'G-VE973PXMS4');
    await expect(loader, path).toHaveAttribute('data-host', 'poolfigures.com');
  }
});

test('sends the security headers with every page', async ({ request }) => {
  for (const path of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("script-src 'self'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('serves a sitemap with every page and robots that point to it', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml.match(/<loc>/g)).toHaveLength(PAGES.length);
  for (const path of PAGES)
    expect(xml, path).toContain(`<loc>https://poolfigures.com${path}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://poolfigures.com/sitemap.xml');
});

test('leads from the home to the spring guide, whose calculator links all answer', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.pool-band a').click();
  await expect(page).toHaveURL(/\/opening-your-pool$/);
  await expect(page.locator('.pool-steps > li')).toHaveCount(10);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(3);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});
