import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Pool Figures site constants', () => {
  it('names the site and its canonical origin, in English and Spanish, open to search engines', () => {
    expect(SITE).toEqual({
      name: 'Pool Figures',
      origin: 'https://poolfigures.com',
      locales: ['en', 'es'],
      indexable: true,
      gaId: 'G-VE973PXMS4',
      indexNowKey: 'af8fd289898ace62cd0e8bd5094b3195',
    });
  });
});
