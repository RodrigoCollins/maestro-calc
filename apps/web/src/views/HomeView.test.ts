import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { homeJsonLd, serializeJsonLd } from '../seo/json-ld.ts';
import HomeView from './HomeView.astro';
import NotFoundView from './NotFoundView.astro';

const render = (locale: 'en' | 'es') => renderComponent(HomeView, { locale }, { partial: false });

describe('HomeView (trust-pages › Home page; site-routing-i18n › [SR4])', () => {
  it.each([
    ['en', 'en-US', 'Maestro Calc: jobsite calculators', 'https://maestrocalc.com/'],
    ['es', 'es-US', 'Maestro Calc: calculadoras para tu obra', 'https://maestrocalc.com/es'],
  ] as const)('renders the %s home page as a whole document', async (locale, tag, title, url) => {
    const document = await render(locale);
    expect(document.querySelector('html')?.getAttribute('lang')).toBe(tag);
    expect(document.querySelector('title')?.text).toBe(title);
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(url);
  });

  it('has one h1 inside main with the page heading', async () => {
    for (const locale of ['en', 'es'] as const) {
      const document = await render(locale);
      expect(document.querySelectorAll('h1')).toHaveLength(1);
      expect(document.querySelectorAll('main h1')).toHaveLength(1);
      expect(document.querySelector('main h1')?.text).toBe('Maestro Calc');
    }
  });

  it('points the language switch at the other home page', async () => {
    expect((await render('en')).querySelector('a.lang-switch')?.getAttribute('href')).toBe('/es');
    expect((await render('es')).querySelector('a.lang-switch')?.getAttribute('href')).toBe('/');
  });
});

const FORBIDDEN = [
  'coming soon',
  'próximamente',
  'pronto',
  'trusted by',
  'miles de',
  'stars',
  'estrellas',
];

describe('HomeView links (trust-pages › [TP7], [TP21])', () => {
  // spec: trust-pages › [TP7] the methodology and about pages are still linked
  it.each([
    ['en', ['/methodology', '/about'], ['How we calculate', 'About Maestro Calc']],
    ['es', ['/es/metodologia', '/es/sobre-nosotros'], ['Cómo calculamos', 'Sobre Maestro Calc']],
  ] as const)(
    'links the methodology and about pages from the %s home',
    async (locale, hrefs, labels) => {
      const links = (await render(locale)).querySelectorAll('main a[href]').slice(1);
      expect(links.map((link) => link.getAttribute('href'))).toEqual(hrefs);
      expect(links.map((link) => link.text.trim())).toEqual(labels);
    },
  );

  // spec: trust-pages › [TP21] the calculator link, with text from the catalog, inside the introduction
  it.each([
    ['en', enSite, '/concrete-calculator'],
    ['es', esSite, '/es/calculadora-de-concreto'],
  ] as const)(
    'links the concrete calculator from the %s introduction',
    async (locale, catalog, href) => {
      const main = (await render(locale)).querySelector('main');
      const links = main?.querySelectorAll('a[href]') ?? [];
      expect(links[0]?.getAttribute('href')).toBe(href);
      expect(links[0]?.text.trim()).toBe(catalog['page.home.links.concrete']);
      expect(links[0]?.closest('p')).toBe(main?.querySelector('p'));
      expect(links.filter((link) => link.getAttribute('href') === href)).toHaveLength(1);
    },
  );

  // spec: trust-pages › [TP21] no other calculator is named on the home page
  it.each(['en', 'es'] as const)(
    'names no calculator but the concrete one on the %s home',
    async (locale) => {
      const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
      for (const other of ['rectangle', 'rectángulo', 'roofing', 'techado', 'paint', 'pintura']) {
        expect(text, other).not.toContain(other);
      }
    },
  );
});

describe('HomeView introduction (trust-pages › Home page, [TP8])', () => {
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('opens the %s home with the site tagline verbatim', async (locale, catalog) => {
    const main = (await render(locale)).querySelector('main');
    expect(main?.querySelector('p')?.text).toContain(catalog['site.tagline']);
    // the introduction, then the calculator link in the same paragraph
    expect(main?.querySelector('p')?.text.replaceAll(/\s+/g, ' ').trim()).toBe(
      `${catalog['page.home.intro']} ${catalog['page.home.links.concrete']}`,
    );
  });

  it.each(['en', 'es'] as const)(
    'says nothing is still being built on the %s home',
    async (locale) => {
      const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
      for (const stale of ['still being built', 'estamos preparando', 'primeras calculadoras']) {
        expect(text, stale).not.toContain(stale);
      }
    },
  );

  it.each(['en', 'es'] as const)('lists no upcoming calculators on the %s home', async (locale) => {
    const main = (await render(locale)).querySelector('main');
    // the introduction, then one line with the two trust-page links
    expect(main?.querySelectorAll('p')).toHaveLength(2);
    expect(main?.querySelectorAll('ul, ol')).toHaveLength(0);
  });

  it.each(['en', 'es'] as const)('makes no promise or claim on the %s home', async (locale) => {
    const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
    expect(text).toContain('maestro');
    for (const term of FORBIDDEN) expect(text, term).not.toContain(term);
  });

  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('keeps the claims out of every page.home value in %s', (locale, catalog) => {
    const values = Object.entries(catalog).filter(([key]) => key.startsWith('page.home.'));
    expect(values.length, locale).toBeGreaterThanOrEqual(4);
    for (const [key, value] of values) {
      for (const term of FORBIDDEN)
        expect(value.toLowerCase(), `${key} ${term}`).not.toContain(term);
    }
  });
});

describe('HomeView JSON-LD (site-seo › [SE6, SE7] render side)', () => {
  it.each([
    ['en', 'https://maestrocalc.com/', 'en-US'],
    ['es', 'https://maestrocalc.com/es', 'es-US'],
  ] as const)(
    'embeds the Organization and WebSite graph on the %s home',
    async (locale, url, tag) => {
      const document = await render(locale);
      const blocks = document.querySelectorAll('script[type="application/ld+json"]');
      expect(blocks).toHaveLength(1);
      expect(document.querySelectorAll('script')).toHaveLength(1);
      expect(blocks[0]?.text).toBe(serializeJsonLd(homeJsonLd(locale)));
      const graph = (JSON.parse(blocks[0]?.text ?? '') as { '@graph': Record<string, unknown>[] })[
        '@graph'
      ];
      expect(graph.map((node) => node['@type'])).toEqual(['Organization', 'WebSite']);
      expect(graph[1]).toMatchObject({ url, inLanguage: tag });
      expect(graph.some((node) => 'logo' in node)).toBe(false);
    },
  );

  it('is the only view that passes JSON-LD', async () => {
    const notFound = await renderComponent(NotFoundView, { locale: 'en' }, { partial: false });
    expect(notFound.querySelectorAll('script')).toHaveLength(0);
  });
});
