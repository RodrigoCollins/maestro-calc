import { describe, expect, it } from 'vitest';
import { hrefOf, type Lang } from '../routes.ts';
import { HOME_TEXTS, TRUST_PAGES } from './home.ts';

describe('the home trust section', () => {
  it('links about, editorial policy, privacy and embed pages in each language', () => {
    expect(TRUST_PAGES).toEqual(['about', 'editorial', 'privacy', 'embed']);
    expect(TRUST_PAGES.map((id) => hrefOf(id, 'es'))).toEqual([
      '/acerca',
      '/politica-editorial',
      '/privacidad',
      '/calculadoras-para-tu-sitio',
    ]);
    expect(TRUST_PAGES.map((id) => hrefOf(id, 'en'))).toEqual([
      '/en/about',
      '/en/editorial-policy',
      '/en/privacy',
      '/en/embed-calculators',
    ]);
    for (const lang of ['es', 'en'] as const satisfies readonly Lang[]) {
      expect(HOME_TEXTS[lang].trustH2).not.toBe('');
      expect(HOME_TEXTS[lang].trustBody).not.toBe('');
    }
  });
});
