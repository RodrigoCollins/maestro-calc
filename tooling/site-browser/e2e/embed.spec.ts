import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { formatViolations } from './axe-report.ts';

/*
 * embed: a calculator embedded by another site works in its frame and links to the full page; the
 * site's own pages refuse to be framed.
 */
const EMBED = '/embed/concrete-calculator';

/**
 * Another site framing `src`: an https origin served by `page.route` (`frame-ancestors *` matches
 * network schemes only, not about:blank). Chrome's Local Network Access check blocks a public page
 * from framing the local `wrangler dev` (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`), so this spec
 * turns that check off; a real site framing maestrocalc.com is public to public and never meets it.
 */
const HOST = 'https://contractors.example/';

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

test.describe('embed (embed)', () => {
  test('works inside another site and shares the full page', async ({ page, baseURL }) => {
    await openHost(page, `${baseURL ?? ''}${EMBED}`);
    const frame = page.frameLocator('iframe');
    await expect(frame.locator('h1')).toHaveText('Concrete Calculator');
    await expect(frame.locator('#calc-length')).toBeEnabled();
    await frame.locator('#calc-length').fill('20');
    const share = frame.locator('[data-share]');
    await expect(share).toHaveAttribute('href', /concrete-calculator%3Fv%3D1%26l%3D240/);
    const href = (await share.getAttribute('href')) ?? '';
    // the shared link opens the full page, never the embed
    expect(decodeURIComponent(href)).toContain(
      `${new URL(baseURL ?? '').origin}/concrete-calculator?v=1&l=240`,
    );
    expect(decodeURIComponent(href)).not.toContain('/embed/');
  });

  test('switches language inside the frame', async ({ page, baseURL }) => {
    await openHost(page, `${baseURL ?? ''}${EMBED}`);
    const frame = page.frameLocator('iframe');
    await frame.locator('header a[hreflang]').click();
    await expect(frame.locator('html')).toHaveAttribute('lang', 'es-US');
    await expect(frame.locator('h1')).toHaveText('Calculadora de Concreto');
  });

  test('is kept out of search and opens its other links in a new tab', async ({ page }) => {
    await page.goto(EMBED);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://maestrocalc.com/concrete-calculator',
    );
    await expect(page.locator('base')).toHaveAttribute('target', '_blank');
  });

  test('has no WCAG A or AA violation', async ({ page }) => {
    await page.goto(EMBED);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, formatViolations(EMBED, results.violations)).toEqual([]);
  });

  test('a site page refuses to be framed', async ({ page, baseURL }) => {
    const blocked: string[] = [];
    page.on('console', (message) => {
      if (/frame-ancestors/.test(message.text())) blocked.push(message.text());
    });
    await openHost(page, `${baseURL ?? ''}/concrete-calculator`);
    await expect.poll(() => blocked.length).toBeGreaterThan(0);
    await expect(page.frameLocator('iframe').locator('h1')).toHaveCount(0);
  });
});
