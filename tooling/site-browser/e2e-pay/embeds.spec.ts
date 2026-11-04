import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { EMBEDS } from './pages.ts';

/*
 * The embeds of Cuenta Horas (growth lever 2), as Maestro Calc's `e2e/embed.spec.ts`: a calculator
 * embedded by another site works in its frame and shares the full page; the site's own pages refuse
 * to be framed.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Another site framing `src`: an https origin served by `page.route` (`frame-ancestors *` matches
 * network schemes only). Chrome's Local Network Access check blocks a public page from framing the
 * local `wrangler dev`, so this spec turns that check off; a real site framing cuentahoras.com is
 * public to public and never meets it.
 */
const HOST = 'https://payroll.example/';

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

for (const { embed, page: full, lang } of EMBEDS) {
  test.describe(embed, () => {
    test('is framable, kept out of search, and opens its other links in a new tab', async ({
      page,
    }) => {
      const response = await page.goto(embed);
      expect(response?.status()).toBe(200);
      const csp = response?.headers()['content-security-policy'] ?? '';
      expect(csp).toContain('frame-ancestors *');
      expect(csp).not.toContain('googletagmanager');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://cuentahoras.com${full}`,
      );
      await expect(page.locator('base')).toHaveAttribute('target', '_blank');
      await expect(page.locator('script[src="/analytics.js"]')).toHaveCount(0);
      await expect(page.locator('footer')).toHaveCount(0);
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

test('works inside another site, switches language in the frame and shares the full page', async ({
  page,
  baseURL,
}) => {
  await openHost(page, `${baseURL ?? ''}/embed/time-card-calculator`);
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('h1')).toHaveText('Time card calculator');
  await frame.locator('input[name="monOut"]').fill('5:30 pm');
  await expect(frame.locator('[data-out="pay"]')).toHaveText('$1,226.50');
  const href = decodeURIComponent(
    (await frame.locator('[data-whatsapp]').getAttribute('href')) ?? '',
  );
  // the receipt opens the full page, never the embed
  expect(href).toContain(`${new URL(baseURL ?? '').origin}/time-card-calculator?`);
  expect(href).not.toContain('/embed/');
  await frame.locator('header a.lang').click();
  await expect(frame.locator('html')).toHaveAttribute('lang', 'es');
  await expect(frame.locator('h1')).toHaveText('Calculadora de horas trabajadas');
});

test('a site page refuses to be framed', async ({ page, baseURL }) => {
  const blocked: string[] = [];
  page.on('console', (message) => {
    if (/frame-ancestors/.test(message.text())) blocked.push(message.text());
  });
  await openHost(page, `${baseURL ?? ''}/time-card-calculator`);
  await expect.poll(() => blocked.length).toBeGreaterThan(0);
  await expect(page.frameLocator('iframe').locator('h1')).toHaveCount(0);
});

test('offers the code of every embed of its language, each one answering', async ({ page }) => {
  for (const [path, lang] of [
    ['/embed-calculators', 'en'],
    ['/es/calculadoras-para-tu-sitio', 'es'],
  ] as const) {
    await page.goto(path);
    const codes = await page
      .locator('pre.embed-code')
      .evaluateAll((blocks) => blocks.map((block) => block.textContent));
    const ours = EMBEDS.filter((embed) => embed.lang === lang);
    expect(codes, path).toHaveLength(ours.length);
    for (const [index, { embed, page: full }] of ours.entries()) {
      expect(codes[index]).toContain(`<iframe src="https://cuentahoras.com${embed}"`);
      expect(codes[index]).toContain(`<a href="https://cuentahoras.com${full}">`);
      expect((await page.request.get(embed)).status(), embed).toBe(200);
    }
  }
});
