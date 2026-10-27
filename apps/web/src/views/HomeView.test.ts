import { readFileSync } from 'node:fs';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import type { HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { fromRoot } from '../contract/root.ts';
import { directoryOrder, homeCards } from '../lib/home-directory.ts';
import { pathOf, ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES, isCalculatorPage, PAGELESS } from '../routing/templates.ts';
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

  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('has one h1, inside main, with the %s page heading', async (locale, catalog) => {
    const document = await render(locale);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    expect(document.querySelector('main h1')?.text).toBe(catalog['page.home.heading']);
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

describe('HomeView hero (trust-pages › [TP29])', () => {
  // proposal D8 copy: the heading says what the site does and makes no claim
  it('words the heading as the owner chose it, in both locales', () => {
    expect(enSite['page.home.heading']).toBe('From measurements to a shopping list');
    expect(esSite['page.home.heading']).toBe('De tus medidas a la lista de compras');
  });

  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)(
    'opens the %s home with the heading, then the intro that starts with the tagline',
    async (locale, catalog) => {
      const main = (await render(locale)).querySelector('main');
      const hero = main?.querySelector('.home-hero');
      expect(hero?.querySelector('h1')?.nextElementSibling?.text.trim()).toBe(
        catalog['page.home.intro'],
      );
      expect(catalog['page.home.intro'].startsWith(catalog['site.tagline'])).toBe(true);
      expect(hero?.querySelectorAll('a, h2, h3')).toHaveLength(0);
    },
  );
});

describe('HomeView directory (trust-pages › [TP7], [TP21], [TP31], [TP33])', () => {
  const cardLinks = (document: HTMLElement) =>
    document.querySelectorAll('main ul.home-cards li a[href]');

  // spec: trust-pages › [TP21] one item per routed calculator, in route table order, one link each
  it.each([['en'], ['es']] as const)(
    'lists the routed calculators of the %s home in route table order, one titled link each',
    async (locale) => {
      const items = (await render(locale)).querySelectorAll('main ul.home-cards li');
      const ids = directoryOrder(ROUTES, CALCULATOR_PAGES).filter(isCalculatorPage);
      expect(ids).toEqual(['concrete']);
      expect(items).toHaveLength(ids.length);
      ids.forEach((id, index) => {
        const links = items[index]?.querySelectorAll('a[href]') ?? [];
        expect(links).toHaveLength(1);
        expect(links[0]?.getAttribute('href')).toBe(pathOf(id, locale));
        expect(links[0]?.text.trim()).toBe(homeCards(locale)[index]?.title);
      });
    },
  );

  // spec: trust-pages › [TP7], [TP33] the methodology and about links follow every card link
  it.each([
    ['en', ['/methodology', '/about'], ['How we calculate', 'About Maestro Calc']],
    ['es', ['/es/metodologia', '/es/sobre-nosotros'], ['Cómo calculamos', 'Sobre Maestro Calc']],
  ] as const)(
    'links the methodology and about pages after the cards of the %s home',
    async (locale, hrefs, labels) => {
      const document = await render(locale);
      const links = document.querySelectorAll('main .home-links a[href]');
      expect(links.map((link) => link.getAttribute('href'))).toEqual(hrefs);
      expect(links.map((link) => link.text.trim())).toEqual(labels);
      const all = document
        .querySelectorAll('main a[href]')
        .map((link) => link.getAttribute('href'));
      expect(all).toEqual([
        ...cardLinks(document).map((link) => link.getAttribute('href')),
        ...hrefs,
      ]);
    },
  );

  // spec: trust-pages › [TP31] no calculator without a route is named, in either locale
  it.each(['en', 'es'] as const)('names no pageless calculator on the %s home', async (locale) => {
    const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
    const pageless = PAGELESS.flatMap((id) => [
      enRectangleArea[`calc.${id}.title` as keyof typeof enRectangleArea],
      esRectangleArea[`calc.${id}.title` as keyof typeof esRectangleArea],
    ]);
    expect(pageless.length).toBeGreaterThan(1);
    const words = [
      'rectangle',
      'rectángulo',
      'square footage',
      'pies cuadrados',
      'roofing',
      'techado',
      'paint',
      'pintura',
    ];
    for (const other of [...pageless, ...words])
      expect(text, other).not.toContain(other.toLowerCase());
  });
});

describe('HomeView promises and glyphs (trust-pages › Home page, [TP8]; site-shell › [SS26])', () => {
  it.each(['en', 'es'] as const)(
    'says nothing is still being built on the %s home',
    async (locale) => {
      const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
      for (const stale of ['still being built', 'estamos preparando', 'primeras calculadoras']) {
        expect(text, stale).not.toContain(stale);
      }
    },
  );

  it.each(['en', 'es'] as const)(
    'makes no promise or claim and uses no arrow glyph on the %s home',
    async (locale) => {
      const text = ((await render(locale)).querySelector('main')?.text ?? '').toLowerCase();
      expect(text).toContain('maestro');
      for (const term of FORBIDDEN) expect(text, term).not.toContain(term);
      expect(text).not.toMatch(/[→›»]/);
    },
  );

  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('keeps the claims out of every page.home value in %s', (locale, catalog) => {
    const values = Object.entries(catalog).filter(([key]) => key.startsWith('page.home.'));
    expect(values.length, locale).toBeGreaterThanOrEqual(6);
    for (const [key, value] of values) {
      for (const term of FORBIDDEN)
        expect(value.toLowerCase(), `${key} ${term}`).not.toContain(term);
    }
  });

  // spec: site-shell › [SS26] the view style is square, flat and still
  it('declares no text-transform, border-radius, transition or animation in its style', () => {
    const source = readFileSync(fromRoot('apps/web/src/views/HomeView.astro'), 'utf8');
    const style = source.slice(source.indexOf('<style>'));
    expect(style.length).toBeGreaterThan('<style></style>'.length);
    for (const property of ['text-transform', 'border-radius', 'transition', 'animation']) {
      expect(style, property).not.toContain(property);
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
