import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { CALCULATORS, EMBEDS, ORIGIN } from './pages.ts';

/*
 * The embeds of Cuánto Le Cobro (growth lever 2), as Maestro Calc's `e2e/embed.spec.ts`: a
 * calculator embedded by another site works in its frame; the site's own pages refuse to be framed.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Another site framing `src`: an https origin served by `page.route` (`frame-ancestors *` matches
 * network schemes only). Chrome's Local Network Access check blocks a public page from framing the
 * local `wrangler dev`, so this spec turns that check off.
 */
const HOST = 'https://ferreteria.example/';

const openHost = async (page: Page, src: string): Promise<void> => {
  await page.route(HOST, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><title>host</title><iframe src="${src}" title="calculator" width="390" height="900"></iframe>`,
    }),
  );
  await page.goto(HOST);
};

test.use({ launchOptions: { args: ['--disable-features=LocalNetworkAccessChecks'] } });

for (const { embed, page: full } of EMBEDS) {
  test.describe(embed, () => {
    test('is framable, kept out of search, and opens its other links in a new tab', async ({
      page,
    }) => {
      const response = await page.goto(embed);
      expect(response?.status()).toBe(200);
      const csp = response?.headers()['content-security-policy'] ?? '';
      expect(csp).toContain('frame-ancestors *');
      expect(csp).not.toContain('googletagmanager');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${ORIGIN}${full}`,
      );
      await expect(page.locator('base')).toHaveAttribute('target', '_blank');
      await expect(page.locator('script[src="/analytics.js"]')).toHaveCount(0);
    });

    test('has no WCAG A or AA violation and fits a phone', async ({ page }) => {
      await page.goto(embed);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(embed, violations)).toEqual([]);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(390);
    });
  });
}

for (const { path, edit, edited } of CALCULATORS) {
  test(`${path} works inside another site`, async ({ page, baseURL }) => {
    await openHost(page, `${baseURL ?? ''}/embed${path}`);
    const frame = page.frameLocator('iframe');
    for (const [name, value] of Object.entries(edit)) {
      const field = frame.locator(`[name="${name}"]`);
      if ((await field.evaluate((node) => node.tagName)) === 'SELECT')
        await field.selectOption(value);
      else await field.fill(value);
    }
    await expect(frame.locator('[data-out="total"]')).toHaveText(edited);
  });
}

test('a site page refuses to be framed', async ({ page, baseURL }) => {
  const blocked: string[] = [];
  page.on('console', (message) => {
    if (/frame-ancestors/.test(message.text())) blocked.push(message.text());
  });
  await openHost(page, `${baseURL ?? ''}${CALCULATORS[0]?.path ?? '/'}`);
  await expect.poll(() => blocked.length).toBeGreaterThan(0);
  await expect(page.frameLocator('iframe').locator('h1')).toHaveCount(0);
});

for (const [lang, index] of [
  ['es', '/calculadoras-para-tu-sitio'],
  ['en', '/en/embed-calculators'],
] as const) {
  test(`offers the code of every ${lang} embed, each one answering`, async ({ page }) => {
    await page.goto(index);
    const codes = (
      await page
        .locator('pre.code')
        .evaluateAll((blocks) => blocks.map((block) => block.textContent))
    ).join('\n');
    const own = EMBEDS.filter((embed) => embed.lang === lang);
    expect(own.length).toBeGreaterThan(0);
    for (const { embed, page: full } of own) {
      expect(codes).toContain(`<iframe src="${ORIGIN}${embed}"`);
      expect(codes).toContain(`<a href="${ORIGIN}${full}">`);
      expect((await page.request.get(embed)).status(), embed).toBe(200);
    }
  });
}

test('switches language inside the frame, from embed to embed', async ({ page }) => {
  const first = EMBEDS.find(({ lang }) => lang === 'es');
  if (first === undefined) throw new Error('no Spanish embed');
  await page.goto(first.embed);
  const toEnglish = page.locator('header a[hreflang="en"]');
  await expect(toEnglish).toHaveAttribute('target', '_self');
  await toEnglish.click();
  await expect(page).toHaveURL(/\/embed\/en\//);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('header a[hreflang="es"]').click();
  await expect(page).toHaveURL(new RegExp(`${first.embed}$`));
});
