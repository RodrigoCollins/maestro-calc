import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Cuánto Le Cobro site constants', () => {
  it('names the site and its canonical origin, Spanish first, with its Google Analytics property', () => {
    expect(SITE).toEqual({
      name: 'Cuánto Le Cobro',
      origin: 'https://cuantolecobro.com',
      locales: ['es', 'en'],
      indexable: false,
      gaId: 'G-32Y9JPXP7Q',
      indexNowKey: 'c2f2efa5e91639c7b2ff3d985576590b',
    });
  });
});
