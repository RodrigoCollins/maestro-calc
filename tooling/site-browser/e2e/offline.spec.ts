import { expect, test } from '@playwright/test';
import { input } from './locators.ts';

/*
 * site-pwa: a calculator used once with signal opens and computes again without it, the home and
 * trust pages register no worker, and each language links its own manifest.
 */
const CALCULATOR = '/concrete-calculator';
const CACHE = 'maestro-v1';

test.describe('offline and install (site-pwa)', () => {
  // the other suites block service workers (playwright.config.ts); this one is about them
  test.use({ serviceWorkers: 'allow' });

  test('a calculator used once opens and computes with the network off', async ({
    page,
    context,
  }) => {
    await page.goto(CALCULATOR);
    await expect(input(page, 'length')).toBeEnabled();
    // the page registers the worker and puts itself and its hashed files in the cache
    await expect
      .poll(() =>
        page.evaluate(async (name) => {
          const keys = await (await caches.open(name)).keys();
          return keys.map((request) => new URL(request.url).pathname);
        }, CACHE),
      )
      .toEqual(expect.arrayContaining([CALCULATOR, expect.stringMatching(/^\/_astro\/.+\.js$/)]));
    await context.setOffline(true);
    await page.goto(`${CALCULATOR}?v=1&l=240`);
    await expect(page.locator('h1')).toBeVisible();
    // enabled means the script ran from the cache and read the query
    await expect(input(page, 'length')).toBeEnabled();
    await expect(input(page, 'length')).toHaveValue('20 ft');
    await context.setOffline(false);
  });

  test('the home and trust pages register no worker', async ({ page }) => {
    for (const path of ['/', '/es', '/about']) {
      await page.goto(path);
      expect(
        await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
        path,
      ).toBe(0);
    }
  });

  test('each language links its own manifest, served as a web app manifest', async ({
    page,
    request,
  }) => {
    for (const [path, manifest, start] of [
      ['/', '/manifest.webmanifest', '/'],
      ['/es', '/es/manifest.webmanifest', '/es'],
    ] as const) {
      await page.goto(path);
      await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', manifest);
      const response = await request.get(manifest);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/manifest+json');
      expect(((await response.json()) as { start_url: string }).start_url).toBe(start);
    }
  });
});
