import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { FOOTER_PAGES, HEADER_PAGES, linksFor } from '../../../apps/web/src/routing/links.ts';
import { LOCALES } from '../../../apps/web/src/routing/routes.ts';
import { langOf, routable, unknown } from './urls.ts';

const headersFile = readFileSync(
  new URL('../../../apps/web/public/_headers', import.meta.url),
  'utf8',
);
/** The value of a header line of `_headers`, which the server must send unchanged. */
const declared = (name: string): string =>
  new RegExp(`^\\s+${name}:\\s*(.+)$`, 'im').exec(headersFile)?.[1]?.trim() ?? '';

const ORANGE = 'rgb(240, 106, 29)';
const TARGET = 44;

/** Everything the keyboard can reach in the shell: skip link, header, footer. */
const shellLinks = (page: Page) => page.locator('a.skip-link, header a, footer a');

test.describe('every routable page (site-quality › [SQ3], [SQ4], site-routing-i18n › [SR3])', () => {
  for (const path of routable) {
    test.describe(path, () => {
      test('answers 200 without a redirect, in its language, with one visible h1', async ({
        page,
      }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        expect(response?.request().redirectedFrom()).toBeNull();
        await expect(page.locator('html')).toHaveAttribute('lang', langOf(path));
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('h1')).toBeVisible();
      });

      test('fits the phone width and sets text at 17 px or more', async ({ page }) => {
        await page.goto(path);
        const { scroll, inner, font } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          inner: window.innerWidth,
          font: Number.parseFloat(getComputedStyle(document.body).fontSize),
        }));
        expect(scroll).toBeLessThanOrEqual(inner);
        expect(font).toBeGreaterThanOrEqual(17);
      });

      test('loads nothing from another origin, no script and no CSP violation', async ({
        page,
        baseURL,
      }) => {
        const origin = new URL(baseURL ?? '').origin;
        const foreign: string[] = [];
        const scripts: string[] = [];
        const violations: string[] = [];
        page.on('request', (request) => {
          if (new URL(request.url()).origin !== origin) foreign.push(request.url());
          if (request.resourceType() === 'script') scripts.push(request.url());
        });
        page.on('console', (message) => {
          if (/content security policy/i.test(message.text())) violations.push(message.text());
        });
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        expect({ foreign, scripts, violations }).toEqual({
          foreign: [],
          scripts: [],
          violations: [],
        });
      });

      test('shows a skip link on the first Tab and Enter jumps to main', async ({ page }) => {
        await page.goto(path);
        await page.keyboard.press('Tab');
        const skip = page.locator('a.skip-link');
        await expect(skip).toBeFocused();
        const box = await skip.boundingBox();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
        expect(box?.y).toBeGreaterThanOrEqual(0);
        await page.keyboard.press('Enter');
        expect(await page.evaluate(() => location.hash)).toBe('#main');
      });

      test('outlines every shell link in safety orange when the keyboard focuses it', async ({
        page,
      }) => {
        await page.goto(path);
        const count = await shellLinks(page).count();
        expect(count).toBeGreaterThanOrEqual(3);
        const locale = LOCALES.find((candidate) => langOf(path).startsWith(candidate)) ?? 'en';
        const hrefs = await shellLinks(page).evaluateAll((links) =>
          links.map((link) => link.getAttribute('href')),
        );
        for (const { href } of linksFor([...HEADER_PAGES, ...FOOTER_PAGES], locale)) {
          expect(hrefs).toContain(href);
        }
        for (let index = 0; index < count; index += 1) {
          await page.keyboard.press('Tab');
          // The outline belongs to the shell link the keyboard is meant to reach, in document order.
          await expect(shellLinks(page).nth(index)).toBeFocused();
          const { color, width } = await page.evaluate(() => {
            const style = getComputedStyle(document.activeElement ?? document.body);
            return { color: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
          });
          expect({ index, color }).toEqual({ index, color: ORANGE });
          expect(width).toBeGreaterThanOrEqual(2);
        }
      });

      test('gives every shell link a 44 by 44 target', async ({ page }) => {
        await page.goto(path);
        const links = await shellLinks(page).all();
        expect(links.length).toBeGreaterThanOrEqual(3);
        for (const link of links) {
          const box = await link.boundingBox();
          expect(box?.width, await link.innerText()).toBeGreaterThanOrEqual(TARGET);
          expect(box?.height, await link.innerText()).toBeGreaterThanOrEqual(TARGET);
        }
      });

      test('switches language and back to the same page', async ({ page }) => {
        await page.goto(path);
        const pathOf = (): string => new URL(page.url()).pathname;
        await page.locator('header a[hreflang]').click();
        await expect(page.locator('html')).toHaveAttribute(
          'lang',
          langOf(path) === 'en-US' ? 'es-US' : 'en-US',
        );
        await page.locator('header a[hreflang]').click();
        expect(pathOf()).toBe(path);
      });
    });
  }
});

test.describe('unknown paths (site-routing-i18n › [SR11], [SR12])', () => {
  for (const [group, paths] of Object.entries(unknown)) {
    for (const path of paths) {
      test(`${path} answers 404 in the ${group} language with one visible h1`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(404);
        await expect(page.locator('html')).toHaveAttribute('lang', langOf(path));
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('header a[hreflang]')).toBeVisible();
        await expect(page.locator('main a')).toBeVisible();
      });
    }
  }
});

test.describe('Workers asset rules (design: Cloudflare Workers Assets Behaviour)', () => {
  test('reaches /es from /es/ in at most one redirect (307) and ends on a 200', async ({
    page,
  }) => {
    const response = await page.goto('/es/');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/es');
    const hop = response?.request().redirectedFrom() ?? null;
    if (hop !== null) {
      expect(hop.redirectedFrom()).toBeNull();
      expect((await hop.response())?.status()).toBe(307);
    }
  });

  for (const [path, status] of [
    ['/', 200],
    ['/does-not-exist', 404],
  ] as const) {
    test(`sends the security headers of _headers on ${path} (${String(status)})`, async ({
      request,
    }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(status);
      const headers = response.headers();
      expect(headers['x-content-type-options']).toBe(declared('X-Content-Type-Options'));
      expect(headers['referrer-policy']).toBe(declared('Referrer-Policy'));
      expect(headers['permissions-policy']).toBe(declared('Permissions-Policy'));
      expect(headers['content-security-policy']).toBe(declared('Content-Security-Policy'));
      expect(headers['set-cookie']).toBeUndefined();
    });
  }

  test('caches hashed assets as immutable and pages not at all', async ({ page, request }) => {
    await page.goto('/');
    const font = await page.locator('link[rel=preload][as=font]').first().getAttribute('href');
    expect(font).toMatch(/^\/_astro\//);
    const asset = await request.get(font ?? '');
    expect(asset.status()).toBe(200);
    expect(asset.headers()['cache-control']).toBe(declared('Cache-Control'));
    expect(asset.headers()['cache-control']).toContain('immutable');
    expect((await request.get('/')).headers()['cache-control'] ?? '').not.toContain('immutable');
  });

  test('does not serve _headers as a file', async ({ request }) => {
    expect((await request.get('/_headers')).status()).toBe(404);
  });
});
