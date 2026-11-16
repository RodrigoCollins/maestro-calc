import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { ES_PAGES } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of ES_PAGES) {
  test.describe(path, () => {
    test('serves the page in Spanish with one heading and no console error', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
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

    // open from the start (`SITE.esIndexable`): its own canonical, and the pair with English
    test('is open to search engines, with its canonical and the en, es and x-default alternates', async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://bowlfigures.com${path}`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
        'href',
        `https://bowlfigures.com${path}`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
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

test('sends the security headers with every Spanish page', async ({ request }) => {
  for (const path of ES_PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("frame-ancestors 'none'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('leads an English page to its Spanish twin from the header', async ({ page }) => {
  await page.goto('/can-dogs-eat-strawberries');
  const twin = page.locator('header a[hreflang="es"]');
  await expect(twin).toHaveText('Español');
  await expect(twin).toHaveAttribute('href', '/es/los-perros-pueden-comer-fresas');
});

test('tells the reader of a toxic food to call the veterinarian at once', async ({ page }) => {
  for (const path of [
    '/es/los-perros-pueden-comer-uvas',
    '/es/que-pasa-si-un-perro-come-chocolate',
  ]) {
    await page.goto(path);
    await expect(page.locator('main .bf-call').first()).toContainText('Llama ya a tu veterinario');
  }
});

test('opens the Spanish dog food calculator at the weight of a row of the feeding table', async ({
  page,
}) => {
  await page.goto('/es/cuanto-debe-comer-un-perro-segun-su-peso');
  await page.locator('main table a', { hasText: '35 kg' }).click();
  await expect(page).toHaveURL(/\/es\/calculadora-de-comida-para-perros\?/);
  await expect(page.locator('[name="weight"]')).toHaveValue('35');
  // 35 kg neutered: 70 x 35^0.75 x 1.6 = 1,611.6 kcal, / 3,600 x 1,000 = 448 g
  await expect(page.locator('[data-text="figure"]').first()).toHaveText('448');
  await expect(page.locator('[data-text="unit"]').first()).toHaveText('gramos al día');
});

test('leads the English dog food calculator to its Spanish twin from the header', async ({
  page,
}) => {
  await page.goto('/dog-food-calculator');
  await expect(page.locator('header a[hreflang="es"]')).toHaveAttribute(
    'href',
    '/es/calculadora-de-comida-para-perros',
  );
});
