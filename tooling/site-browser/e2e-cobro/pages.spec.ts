import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { OEWS } from '../../../apps/cobro/src/wages/oews-2025.ts';
import { ROUTES, TRADE_PATHS, wagePathOf } from '../../../apps/cobro/src/routes.ts';
import { OCCUPATIONS } from '../../../apps/cobro/src/wages/occupations.ts';
import { ORIGIN, PAGES } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const { path, lang } of PAGES) {
  test.describe(path, () => {
    test('serves the page in its language with one heading and no console error', async ({
      page,
    }) => {
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

    // open since 2026-11-08 (`SITE.indexable`): no robots meta, the canonical and the pair
    test('is open to search engines, and names its canonical and its twin', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${ORIGIN}${path}`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('header a[hreflang]')).toHaveCount(1);
    });

    // the measurement id is empty until the owner creates the property: no loader at all
    test('loads no analytics while the measurement id is empty', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('script[src="/analytics.js"]')).toHaveCount(0);
    });
  });
}

test('answers an unknown path with the 404 page, which links both homes and stays noindex', async ({
  page,
}) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/en"]')).toHaveCount(1);
});

// every page with its twin: the header switch and the hreflang pair agree, both ways
for (const [spanish, english] of [
  ['/', '/en'],
  ['/acerca', '/en/about'],
  ['/privacidad', '/en/privacy'],
  [TRADE_PATHS.painting.es, TRADE_PATHS.painting.en],
  [wagePathOf('painting', '48', 'es'), wagePathOf('painting', '48', 'en')],
] as const) {
  test(`switches between ${spanish} and ${english}, each naming the other`, async ({ page }) => {
    await page.goto(spanish);
    await page.locator('header a[hreflang="en"]').click();
    await expect(page).toHaveURL(new RegExp(`${english}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="alternate"][hreflang="es-US"]')).toHaveAttribute(
      'href',
      `${ORIGIN}${spanish}`,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${ORIGIN}${spanish}`,
    );
    await page.locator('header a[hreflang="es"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${ORIGIN}${spanish}`,
    );
  });
}

test('lists the five trades as chips on a calculator page, the current one marked', async ({
  page,
}) => {
  await page.goto(TRADE_PATHS.drywall.es);
  const chips = page.locator('.chips a');
  await expect(chips).toHaveCount(OCCUPATIONS.length);
  await expect(page.locator('.chips a[aria-current="page"]')).toHaveText('Drywall');
  for (const href of await chips.evaluateAll((links) =>
    links.map((a) => a.getAttribute('href') ?? ''),
  ))
    expect((await page.request.get(href)).status(), href).toBe(200);
});

test('shows the wage of a state exactly as the BLS data holds it, and links back', async ({
  page,
}) => {
  const [mean, median] = OEWS['painting']?.['48'] ?? [0, 0];
  await page.goto(wagePathOf('painting', '48', 'en'));
  await expect(page.locator('h1')).toHaveText('How much does a painter make in Texas?');
  const stats = page.locator('.stats .big');
  await expect(stats.nth(0)).toHaveText(`$${mean.toFixed(2)}`);
  await expect(stats.nth(1)).toHaveText(`$${median.toFixed(2)}`);
  await expect(
    page.locator('main a[href="/en/how-much-does-a-painter-make"]').first(),
  ).toBeVisible();
  await expect(page.locator(`main a[href="${TRADE_PATHS.painting.en}"]`)).toBeVisible();
  await expect(page.locator('a[data-share]')).toHaveCount(1);
});

test('lists every state of a trade in its index, each page answering', async ({
  page,
  request,
}) => {
  await page.goto('/cuanto-gana-un-pintor');
  const links = await page
    .locator('tbody a')
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href') ?? ''));
  expect(links.length).toBeGreaterThan(48);
  for (const href of links.slice(0, 5)) expect((await request.get(href)).status(), href).toBe(200);
});

test('sends the security headers with every page', async ({ request }) => {
  for (const { path } of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("script-src 'self'");
    expect(response.headers()['content-security-policy'], path).toContain("frame-ancestors 'none'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

test('serves a sitemap with every page in both languages, and robots that point to it', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml.match(/<url>/g)).toHaveLength(ROUTES.length * 2);
  for (const { path } of PAGES) expect(xml, path).toContain(`<loc>${ORIGIN}${path}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain('# Cuánto Le Cobro');
});

test('serves the IndexNow key file', async ({ request }) => {
  const response = await request.get('/c2f2efa5e91639c7b2ff3d985576590b.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe('c2f2efa5e91639c7b2ff3d985576590b');
});

test('shows the hand-verified cases of the methodology, one row each', async ({ page }) => {
  await page.goto('/metodologia');
  await expect(page.locator('#casos ~ .table-scroll tbody tr').first()).toBeVisible();
  const rows = page.locator('.table-scroll tbody tr');
  await expect(rows).toHaveCount(10);
  await expect(rows.first()).toContainText('$278.30');
});

test('prints the receipt alone: the page chrome is hidden in print', async ({ page }) => {
  await page.goto(TRADE_PATHS.cleaning.es);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.receipt')).toBeVisible();
  await expect(page.locator('.quote-form')).toBeHidden();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.actions')).toBeHidden();
});
