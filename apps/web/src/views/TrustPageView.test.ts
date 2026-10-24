import { getEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { LOCALE_TAGS, LOCALES, ROUTES, urlOf, pathOf } from '../routing/routes.ts';
import type { PageId } from '../routing/routes.ts';
import { OWNER_REVIEW_MARKERS } from '../site-check/content.ts';
import { hasWord, visibleText } from '../site-check/dom.ts';
import TrustPageView from './TrustPageView.astro';

const trustIds = Object.keys(ROUTES).filter((id): id is PageId => id !== 'home');
const pages = trustIds.flatMap((id) => LOCALES.map((locale) => ({ id, locale })));
const render = ({ id, locale }: { id: PageId; locale: 'en' | 'es' }) =>
  renderComponent(TrustPageView, { id, locale }, { partial: false });

// A page of the shell: the entry heading, date and prose sit inside main.
describe('TrustPageView (trust-pages › Visible update date, Owner-review marking)', () => {
  it('renders every trust page of the table', () => {
    expect(trustIds.length).toBeGreaterThan(0);
    expect(pages).toHaveLength(2 * trustIds.length);
  });

  it.each(pages)('renders $id in $locale with one h1 inside main', async (page) => {
    const document = await render(page);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    expect(document.querySelector('main h1')?.text.trim()).not.toBe('');
    expect(document.querySelector('html')?.getAttribute('lang')).toBe(LOCALE_TAGS[page.locale]);
  });

  // spec: trust-pages › [TP6]
  it.each(pages)('shows the update date of $id in $locale as a time element', async (page) => {
    const document = await render(page);
    const updated = (await getEntry('pages', `${page.locale}/${page.id}`))?.data.updated ?? '';
    expect(updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const times = document.querySelectorAll('main time');
    expect(times).toHaveLength(1);
    expect(times[0]?.getAttribute('datetime')).toBe(updated);
    expect(times[0]?.text.trim()).toBe(
      new Intl.DateTimeFormat(LOCALE_TAGS[page.locale], {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${updated}T00:00:00Z`)),
    );
  });

  // spec: trust-pages › [TP5]
  it.each(pages)('does not render the review state of $id in $locale', async (page) => {
    // the same words and the same reading (visible text plus comments) as check:site
    const text = visibleText(await render(page));
    for (const marker of OWNER_REVIEW_MARKERS) {
      expect(hasWord(text, marker), marker).toBe(false);
    }
  });

  it.each(pages)('self-canonicalises $id in $locale', async (page) => {
    const document = await render(page);
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(
      urlOf(pathOf(page.id, page.locale)),
    );
    expect(document.querySelectorAll('link[rel=alternate][hreflang]')).toHaveLength(3);
  });

  // spec: site-routing-i18n › [SR2]
  it.each(pages)(
    'links only to table paths, anchors and the contact address in $id/$locale',
    async (page) => {
      const document = await render(page);
      const known = new Set<string>(Object.values(ROUTES).flatMap((paths) => [paths.en, paths.es]));
      const hrefs = document
        .querySelectorAll('main a[href]')
        .map((link) => link.getAttribute('href') ?? '');
      for (const href of hrefs) {
        const [path = '', fragment] = href.split('#');
        const ok =
          href.startsWith('mailto:contacto@maestrocalc.com') ||
          (path === '' && fragment !== undefined) ||
          known.has(path);
        expect({ href, ok }).toEqual({ href, ok: true });
      }
    },
  );
});
