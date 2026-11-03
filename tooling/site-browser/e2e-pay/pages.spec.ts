import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { PAGES } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const { path, lang } of PAGES) {
  test.describe(path, () => {
    test('serves the page in its language with no console error', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
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

    test('links to the same page in the other language', async ({ page }) => {
      await page.goto(path);
      const other = page.locator('header a.lang');
      const href = await other.getAttribute('href');
      expect(href).not.toBeNull();
      const response = await page.goto(href ?? '');
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang === 'en' ? 'es' : 'en');
    });
  });
}

test('answers an unknown path with the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
});

test('links every live calculator card of the home to a page that answers', async ({ page }) => {
  for (const home of ['/', '/es']) {
    await page.goto(home);
    const hrefs = await page
      .locator('.tools a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
  }
});

test('links every page to the methodology of its language, and it shows the worked examples', async ({
  page,
}) => {
  for (const [path, method] of [
    ['/', '/methodology'],
    ['/es', '/es/metodologia'],
  ] as const) {
    await page.goto(path);
    await page.locator(`footer a[href="${method}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${method}$`));
    await expect(page.locator('.examples li')).toHaveCount(4);
    await expect(page.locator('.examples li').first()).toContainText('$1,193.50');
  }
});

test('serves a sitemap with every page and robots that point to it', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const { path } of PAGES) {
    expect(xml, path).toContain(`<loc>https://cuentahoras.com${path === '/' ? '/' : path}</loc>`);
  }
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://cuentahoras.com/sitemap.xml');
});

test('sends the security headers with every page', async ({ request }) => {
  for (const { path } of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("script-src 'self'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('gives every page a link preview: its title, description and the shared image', async ({
  page,
  request,
}) => {
  expect((await request.get('/og.png')).headers()['content-type']).toBe('image/png');
  for (const { path } of PAGES) {
    await page.goto(path);
    const meta = (property: string) =>
      page.locator(`meta[property="${property}"]`).getAttribute('content');
    expect(await meta('og:title'), path).toBe(await page.title());
    expect(await meta('og:description'), path).toBe(
      await page.locator('meta[name="description"]').getAttribute('content'),
    );
    expect(await meta('og:image'), path).toBe('https://cuentahoras.com/og.png');
  }
});

test('describes every page with structured data whose url is its canonical', async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    const data = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    ) as { '@type'?: string; url?: string };
    expect(['WebSite', 'WebApplication', 'Article'], path).toContain(data['@type']);
    expect(data.url, path).toBe(await page.locator('link[rel="canonical"]').getAttribute('href'));
  }
});

test('lets search engines index every page but the 404', async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]'), path).toHaveCount(0);
  }
  await page.goto('/no-such-page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});
