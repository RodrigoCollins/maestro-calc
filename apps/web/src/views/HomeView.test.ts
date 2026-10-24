import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import HomeView from './HomeView.astro';

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

describe('HomeView introduction (trust-pages › Home page, [TP8])', () => {
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('opens the %s home with the site tagline verbatim', async (locale, catalog) => {
    const main = (await render(locale)).querySelector('main');
    expect(main?.querySelector('p')?.text).toContain(catalog['site.tagline']);
    expect(main?.querySelector('p')?.text).toBe(catalog['page.home.intro']);
  });

  it.each(['en', 'es'] as const)('lists no upcoming calculators on the %s home', async (locale) => {
    const main = (await render(locale)).querySelector('main');
    expect(main?.querySelectorAll('p')).toHaveLength(1);
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
