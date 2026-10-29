import { expect, test } from '@playwright/test';
import { isAnalyticsLoader } from './analytics.ts';
import type { Page } from '@playwright/test';

const HOMES = ['/', '/es'];
const INK = 'rgb(14, 34, 64)';
const ORANGE = 'rgb(240, 106, 29)';

/** Opens a home at a width; the height is a phone's, so a wide layout is not clipped by it. */
const openAt = async (page: Page, path: string, width: number): Promise<void> => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path);
};

/** A token read as pixels: a probe element takes the token as its width. */
const pixels = (page: Page, token: string): Promise<number> =>
  page.evaluate((name) => {
    const probe = document.body.appendChild(document.createElement('div'));
    probe.style.width = `var(${name})`;
    const width = Number.parseFloat(getComputedStyle(probe).width);
    probe.remove();
    return width;
  }, token);

for (const path of HOMES) {
  test.describe(`${path} hero (site-shell › [SS24], [SS27]; trust-pages › [TP34])`, () => {
    // spec: site-shell › [SS27] the hero carries the grid on the ink and the tick under the H1
    for (const width of [390, 1280]) {
      test(`draws the grid and the dimension tick at ${String(width)} px`, async ({ page }) => {
        await openAt(page, path, width);
        const grid = await pixels(page, '--grid-size');
        const hero = await page.locator('main .home-hero').evaluate((element) => {
          const style = getComputedStyle(element);
          const tick = getComputedStyle(element.querySelector('h1') ?? element, '::after');
          return {
            layers: style.backgroundImage.split('linear-gradient(').length - 1,
            size: style.backgroundSize,
            color: style.backgroundColor,
            tick: {
              height: tick.height,
              left: `${tick.borderLeftWidth} ${tick.borderLeftColor}`,
              right: `${tick.borderRightWidth} ${tick.borderRightColor}`,
            },
          };
        });
        const weight = `${String(await pixels(page, '--tick-weight'))}px ${ORANGE}`;
        expect(hero.layers).toBe(2);
        // one size per gradient layer, the grid cell in both axes
        const cell = `${String(grid)}px ${String(grid)}px`;
        expect(hero.size).toBe(`${cell}, ${cell}`);
        expect(hero.color).toBe(INK);
        expect(hero.tick).toEqual({ height: `${String(grid)}px`, left: weight, right: weight });
      });
    }

    // spec: site-shell › [SS24] the H1 is larger than the page H1 size, and larger still when wide
    test('sets the H1 in the display size and fits the viewport at 320 px', async ({ page }) => {
      const sizes: number[] = [];
      for (const width of [320, 1280]) {
        await openAt(page, path, width);
        const h1 = await page.locator('main h1').evaluate((element) => ({
          size: Number.parseFloat(getComputedStyle(element).fontSize),
          scroll: document.documentElement.scrollWidth,
          hero: element.closest('.home-hero')?.scrollWidth ?? Infinity,
        }));
        expect(h1.size).toBeGreaterThan(await pixels(page, '--text-h1'));
        expect(h1.scroll).toBeLessThanOrEqual(width);
        expect(h1.hero).toBeLessThanOrEqual(width);
        sizes.push(h1.size);
      }
      expect(sizes[1]).toBeGreaterThan(sizes[0] ?? Infinity);
    });

    // spec: trust-pages › [TP34] the home requests no script of its own (the analytics loader of every
    // page aside, analytics-gtm)
    test('requests no script', async ({ page }) => {
      const scripts: string[] = [];
      page.on('request', (request) => {
        if (request.resourceType() === 'script' && !isAnalyticsLoader(request.url())) {
          scripts.push(request.url());
        }
      });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(scripts).toEqual([]);
    });
  });
}

for (const path of HOMES) {
  // spec: trust-pages › [TP37] cards fit a phone and each link is a 44 px target
  test(`${path} fits 320, 390 and 1280 px with 44 px card links`, async ({ page }) => {
    for (const width of [320, 390, 1280]) {
      await openAt(page, path, width);
      const links = page.locator('main .home-card a');
      expect(await links.count(), `${String(width)} px has a card link`).toBeGreaterThan(0);
      // against the width we set: on a phone profile `innerWidth` itself grows to fit wide content
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scroll, `${String(width)} px overflow`).toBeLessThanOrEqual(width);
      for (const box of await links.evaluateAll((all) =>
        all.map((link) => link.getBoundingClientRect()),
      )) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
}
