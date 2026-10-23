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
