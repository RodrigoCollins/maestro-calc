import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// the WCAG contrast formula the token tests use (a module with no imports)
import { contrast } from '../../../apps/web/src/contract/contrast.ts';
import { formatViolations } from './axe-report.ts';
import { calculatorPages, pressSelector } from './calculator-pages.ts';
import { copyButton, input, open, shareLink } from './locators.ts';

/*
 * The WhatsApp share link of the copy area (calculator-page › Share on WhatsApp), on every
 * calculator page: the script writes its href from the base the markup carries, the share text and
 * the current link; it opens a new tab without an opener, spans the copy area 56 px tall in legible green with
 * the orange ring, and comes right after "Copy link". Only the change that moves the link comes
 * from the record's optional `share` group, so a page without it still runs every other case. The reserve of
 * the copy block and the load shift are proven by `layout.spec.ts` with the link shown; Linux CI is
 * the final word on them. The hidden link of a page with no script is proven by `no-js.spec.ts`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The widths of calculator-page › [CP82]. */
const WIDTHS = [320, 390, 1280] as const;

/** The base the markup carries in `data-share`; no script holds it (site-quality › [SQ41]). */
const BASE = 'https://wa.me/';

/** Safety orange, the focus ring of site-shell. */
const ORANGE = 'rgb(240, 106, 29)';

/** `#rrggbb` of a computed `rgb(r, g, b)` colour. */
const hexOf = (rgb: string): string =>
  `#${(rgb.match(/\d+/g) ?? [])
    .slice(0, 3)
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`;

/** The href of the share link, split into its base and its decoded `text` parameter. */
const linkOf = async (page: Page): Promise<{ base: string; text: string | null }> => {
  const href = await shareLink(page).getAttribute('href');
  expect(href, 'the share link has an href').not.toBeNull();
  const url = new URL(href ?? '');
  return { base: `${url.origin}${url.pathname}`, text: url.searchParams.get('text') };
};

for (const calculator of calculatorPages) {
  const { path, locale, site, spec } = calculator;
  const group = spec.share;
  const sentence = site['site.calculator.shareText'] ?? '';
  const label = site['site.calculator.shareWhatsApp'] ?? '';

  test.describe(`${path} share link (calculator-page › Share on WhatsApp, ${locale})`, () => {
    // spec: calculator-page › [CP78] the share text and the current link, on every page
    test('carries the share text and the current link once mounted', async ({ page }) => {
      await open(page, calculator);
      expect(sentence).not.toBe('');
      expect(await linkOf(page)).toEqual({
        base: BASE,
        text: `${sentence} ${new URL(page.url()).origin}${path}`,
      });
    });

    // spec: calculator-page › [CP78], [CP79] the encoded current link, kept while a field is invalid
    if (group !== undefined) {
      test('follows a change and keeps the link on an invalid one', async ({ page }) => {
        await open(page, calculator);
        const message = (query: string): string =>
          `${sentence} ${new URL(page.url()).origin}${path}${query}`;
        expect(sentence).not.toBe('');
        expect(await linkOf(page)).toEqual({ base: BASE, text: message('') });
        if ('hook' in group.change) await page.locator(pressSelector(group.change)).click();
        else await input(page, group.change.key).fill(group.change.text);
        await expect(shareLink(page)).toHaveAttribute(
          'href',
          `${BASE}?text=${encodeURIComponent(message(group.query))}`,
        );
        expect((await linkOf(page)).text).toBe(message(group.query));
        const kept = (await shareLink(page).getAttribute('href')) ?? '';
        await input(page, spec.typed.key).fill('abc');
        await expect(input(page, spec.typed.key)).toHaveAttribute('aria-invalid', 'true');
        await expect(shareLink(page)).toHaveAttribute('href', kept);
      });
    }

    // spec: calculator-page › [CP80], [CP81] shown once mounted, a new tab with no opener, named by its label
    test('shows a link to a new tab with no opener, named by its visible label', async ({
      page,
    }) => {
      await open(page, calculator);
      await expect(shareLink(page)).toBeVisible();
      await expect(shareLink(page)).toHaveAttribute('target', '_blank');
      await expect(shareLink(page)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(shareLink(page)).toHaveText(label);
      await expect(shareLink(page)).toHaveAccessibleName(label);
      await expect(page.getByRole('link', { name: label })).toHaveCount(1);
    });

    // spec: calculator-page › [CP83] Copy link, then the share link, then the next control
    test('comes right after Copy link in the tab order, and the next Tab leaves it forward', async ({
      page,
    }) => {
      await open(page, calculator);
      await copyButton(page).focus();
      await page.keyboard.press('Tab');
      await expect(shareLink(page)).toBeFocused();
      await page.keyboard.press('Tab');
      const forward = await shareLink(page).evaluate((link) => {
        const next = document.activeElement;
        return (
          next !== null &&
          next !== document.body &&
          (link.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
        );
      });
      expect(forward).toBe(true);
    });

    // spec: calculator-page › [CP82] full width, 56 px, near-black on WhatsApp green, the orange focus ring
    for (const width of WIDTHS) {
      test(`spans the copy area, 56 px tall, in legible green with the orange ring at ${String(width)} px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await open(page, calculator);
        const box = await shareLink(page).boundingBox();
        const area = await page.locator('[data-reserved="copy"]').boundingBox();
        expect(box?.width ?? 0).toBeCloseTo(area?.width ?? -1, 0);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(56);
        const colours = await shareLink(page).evaluate((link) => {
          const style = getComputedStyle(link);
          return { text: style.color, ground: style.backgroundColor };
        });
        expect({ text: hexOf(colours.text), ground: hexOf(colours.ground) }).toEqual({
          text: '#06210f',
          ground: '#1faf5a',
        });
        expect(contrast(hexOf(colours.text), hexOf(colours.ground))).toBeGreaterThanOrEqual(4.5);
        await copyButton(page).focus();
        await page.keyboard.press('Tab');
        await expect(shareLink(page)).toBeFocused();
        const ring = await shareLink(page).evaluate((link) => {
          const style = getComputedStyle(link);
          return { color: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
        });
        expect(ring.color).toBe(ORANGE);
        expect(ring.width).toBeGreaterThanOrEqual(2);
      });
    }

    // spec: calculator-page › [CP82], site-quality › [SQ1] axe finds nothing in the copy area
    test('passes axe in the copy area with the link shown', async ({ page }) => {
      await open(page, calculator);
      await expect(shareLink(page)).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .include('[data-reserved="copy"]')
        .withTags(TAGS)
        .analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });
  });
}
