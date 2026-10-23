import { describe, expect, it } from 'vitest';
import LanguageSwitch from './LanguageSwitch.astro';
import { renderComponent } from '../__testing__/render-component.ts';

describe('LanguageSwitch (site-routing-i18n › Language switch)', () => {
  it('links to the other locale with lang and hreflang on the link', async () => {
    const link = (
      await renderComponent(LanguageSwitch, {
        href: '/es',
        lang: 'es',
        hreflang: 'es-US',
        label: 'Español',
      })
    ).querySelector('a');
    expect(link?.getAttribute('href')).toBe('/es');
    expect(link?.getAttribute('lang')).toBe('es');
    expect(link?.getAttribute('hreflang')).toBe('es-US');
    expect(link?.text).toBe('Español');
    expect(link?.classList.contains('lang-switch')).toBe(true);
  });

  it('renders the English counterpart for a Spanish page', async () => {
    const link = (
      await renderComponent(LanguageSwitch, {
        href: '/',
        lang: 'en',
        hreflang: 'en-US',
        label: 'English',
      })
    ).querySelector('a');
    expect([link?.getAttribute('href'), link?.getAttribute('lang'), link?.text]).toEqual([
      '/',
      'en',
      'English',
    ]);
  });
});
