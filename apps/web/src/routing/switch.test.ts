import { describe, expect, it } from 'vitest';
import { switchFor } from './switch.ts';

const fixture = {
  home: { en: '/', es: '/es' },
  about: { en: '/about', es: '/es/sobre-nosotros' },
} as const;

describe('language switch (site-routing-i18n › [SR5, SR6])', () => {
  // spec: site-routing-i18n › [SR5]
  it('points the home page at its counterpart in the other locale', () => {
    expect(switchFor('home', 'en')).toEqual({ href: '/es', lang: 'es', hreflang: 'es-US' });
    expect(switchFor('home', 'es')).toEqual({ href: '/', lang: 'en', hreflang: 'en-US' });
  });

  it('points an inner page at its translated path', () => {
    expect(switchFor('about', 'en', fixture)).toEqual({
      href: '/es/sobre-nosotros',
      lang: 'es',
      hreflang: 'es-US',
    });
    expect(switchFor('about', 'es', fixture)).toEqual({
      href: '/about',
      lang: 'en',
      hreflang: 'en-US',
    });
  });

  // spec: site-routing-i18n › [SR6]
  it('sends the not-found page to the other locale home', () => {
    expect(switchFor('notFound', 'en').href).toBe('/es');
    expect(switchFor('notFound', 'es').href).toBe('/');
  });

  it('never carries a query string or a fragment', () => {
    for (const locale of ['en', 'es'] as const) {
      expect(switchFor('about', locale, fixture).href).not.toMatch(/[?#]/);
    }
  });
});
