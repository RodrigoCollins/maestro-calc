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

    // the launch switch (SITE.indexable) is off until March 2027
    test('stays out of search engines until launch', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    });
  });
}

test('answers an unknown path with the 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
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

test('sends the security headers with every page', async ({ request }) => {
  for (const path of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("script-src 'self'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
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
