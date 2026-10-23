import { describe, expect, it } from 'vitest';
import { siteText } from './site-text.ts';

describe('siteText (i18n-catalog › Site scope)', () => {
  it('resolves a key in the locale asked for', () => {
    expect(siteText('en')('site.skipLink')).toBe('Skip to main content');
    expect(siteText('es')('site.skipLink')).toBe('Saltar al contenido principal');
    expect(siteText('es')('page.notFound.title')).toBe('Página no encontrada | Maestro Calc');
  });

  it('throws on a key the catalog lacks instead of falling back', () => {
    // @ts-expect-error not a key of the site catalog
    expect(() => siteText('en')('site.missing')).toThrow('MISSING_MESSAGE');
  });
});
