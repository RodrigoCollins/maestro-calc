import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Cuenta Horas site constants', () => {
  it('names the site and its canonical origin, English first', () => {
    expect(SITE).toEqual({
      name: 'Cuenta Horas',
      origin: 'https://cuentahoras.com',
      locales: ['en', 'es'],
      indexable: true,
      gaId: 'G-NNB8KG2TXZ',
      indexNowKey: 'dd860e1e00fb82df0feac833e84e8677',
    });
  });
});
