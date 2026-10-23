import { describe, expect, it } from 'vitest';
import { linksFor } from './links.ts';

const fixture = {
  home: { en: '/', es: '/es' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
  about: { en: '/about', es: '/es/sobre-nosotros' },
  privacy: { en: '/privacy', es: '/es/privacidad' },
  terms: { en: '/terms', es: '/es/terminos' },
  contact: { en: '/contact', es: '/es/contacto' },
} as const;

const HEADER = ['methodology', 'about'];
const FOOTER = ['privacy', 'terms', 'contact'];

describe('link lists (site-routing-i18n › [SR2]; site-shell › [SS12, SS13])', () => {
  it('lists the header candidates present in the table, per locale', () => {
    expect(linksFor(HEADER, 'en', fixture)).toEqual([
      { id: 'methodology', href: '/methodology' },
      { id: 'about', href: '/about' },
    ]);
    expect(linksFor(HEADER, 'es', fixture)).toEqual([
      { id: 'methodology', href: '/es/metodologia' },
      { id: 'about', href: '/es/sobre-nosotros' },
    ]);
  });

  it('lists the footer candidates in the order given', () => {
    expect(linksFor(FOOTER, 'en', fixture).map(({ href }) => href)).toEqual([
      '/privacy',
      '/terms',
      '/contact',
    ]);
    expect(linksFor(FOOTER, 'es', fixture).map(({ href }) => href)).toEqual([
      '/es/privacidad',
      '/es/terminos',
      '/es/contacto',
    ]);
  });

  it('drops candidates that are not in the table, so production never links to a missing page', () => {
    expect(linksFor(HEADER, 'en', { home: fixture.home, about: fixture.about })).toEqual([
      { id: 'about', href: '/about' },
    ]);
  });

  it('is empty for the real table while only the home page exists', () => {
    expect(linksFor(HEADER, 'en')).toEqual([]);
    expect(linksFor(FOOTER, 'es')).toEqual([]);
  });
});
