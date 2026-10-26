import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { FOOTER_PAGES, HEADER_PAGES, linksFor } from '../../../apps/web/src/routing/links.ts';
import { localeOfPath } from '../../../apps/web/src/routing/routes.ts';
import {
  calculatorPaths,
  langOf,
  notFoundSamples,
  routable,
  staticPaths,
  unknown,
} from './urls.ts';

const headersFile = readFileSync(
  new URL('../../../apps/web/public/_headers', import.meta.url),
  'utf8',
);
/** The value of a header line of `_headers`, which the server must send unchanged. */
const declared = (name: string): string =>
  new RegExp(`^\\s+${name}:\\s*(.+)$`, 'im').exec(headersFile)?.[1]?.trim() ?? '';

const ORANGE = 'rgb(240, 106, 29)';
const TARGET = 44;
// A calculator page has about twenty controls between the header and the footer.
const MAX_TABS = 40;

const CLEAN = { foreign: [], scripts: [], violations: [] };

/** Visits `path` and reports every request to another origin, every script and every CSP message. */
const loadedFromElsewhere = async (page: Page, baseURL: string | undefined, path: string) => {
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
  return { foreign, scripts, violations };
};

/** Presses Tab until `target` has focus, failing after a bounded number of presses. */
const tabTo = async (page: Page, target: Locator): Promise<void> => {
  for (let press = 0; press < MAX_TABS; press += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(target).toBeFocused();
};

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

      if (calculatorPaths.includes(path)) {
        // spec: site-quality › [SQ5], site-shell › [SS21] one module script from /_astro/, nothing foreign
        test('loads only same-origin files, its own module script and no CSP violation', async ({
          page,
          baseURL,
        }) => {
          const { foreign, scripts, violations } = await loadedFromElsewhere(page, baseURL, path);
          expect({ foreign, violations }).toEqual({ foreign: [], violations: [] });
          expect(scripts.length).toBeGreaterThanOrEqual(1);
          for (const script of scripts) {
            expect(new URL(script).pathname, script).toMatch(/^\/_astro\/.+\.js$/);
          }
        });

        // spec: site-routing-i18n › [SR16] a state in the query answers 200 with the page of the clean path
        test('answers a link with a state in its query with the body of the clean path', async ({
          request,
        }) => {
          const clean = await request.get(path);
          const withState = await request.get(`${path}?v=1&l=240`);
          expect(clean.status()).toBe(200);
          expect(withState.status()).toBe(200);
          expect(await withState.text()).toBe(await clean.text());
        });
      } else {
        test('loads nothing from another origin, no script and no CSP violation', async ({
          page,
          baseURL,
        }) => {
          expect(await loadedFromElsewhere(page, baseURL, path)).toEqual(CLEAN);
        });
      }

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
        const locale = localeOfPath(path);
        const hrefs = await shellLinks(page).evaluateAll((links) =>
          links.map((link) => link.getAttribute('href')),
        );
        for (const { href } of linksFor([...HEADER_PAGES, ...FOOTER_PAGES], locale)) {
          expect(hrefs).toContain(href);
        }
        for (let index = 0; index < count; index += 1) {
          // The keyboard reaches each shell link in document order; page content may sit between them.
          await tabTo(page, shellLinks(page).nth(index));
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

      test('switches language and back to the same page, each hop answering 200', async ({
        page,
      }) => {
        await page.goto(path);
        const pathOf = (): string => new URL(page.url()).pathname;
        const hop = async (): Promise<number> => {
          const [response] = await Promise.all([
            page.waitForResponse((candidate) => candidate.request().isNavigationRequest()),
            page.locator('header a[hreflang]').click(),
          ]);
          await page.waitForLoadState('load');
          return response.status();
        };
        expect(await hop()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute(
          'lang',
          langOf(path) === 'en-US' ? 'es-US' : 'en-US',
        );
        expect(await hop()).toBe(200);
        expect(pathOf()).toBe(path);
      });
    });
  }
});

// spec: site-quality › [SQ28]: Cloudflare features that inject scripts stay off. The same test runs as
// the post-deploy smoke of tasks F.4 with BASE_URL set to the production site.
test.describe('pages without a script (site-quality › [SQ28], site-shell › [SS19])', () => {
  for (const path of [...staticPaths, ...notFoundSamples]) {
    test(`${path} requests no script and references no /cdn-cgi/ file`, async ({
      page,
      baseURL,
    }) => {
      const { scripts } = await loadedFromElsewhere(page, baseURL, path);
      expect(scripts).toEqual([]);
      expect(await page.content()).not.toContain('/cdn-cgi/');
      expect(
        await (await page.request.get(path, { failOnStatusCode: false })).text(),
      ).not.toContain('/cdn-cgi/');
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

test.describe('the 404 responses load nothing foreign (site-quality › [SQ5], [SQ14], site-shell › [SS19])', () => {
  for (const path of notFoundSamples) {
    test(`${path} loads nothing from another origin, no script and no CSP violation`, async ({
      page,
      baseURL,
    }) => {
      expect(await loadedFromElsewhere(page, baseURL, path)).toEqual(CLEAN);
    });
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
