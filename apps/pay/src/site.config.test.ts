import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Cuenta Horas site constants', () => {
  it('names the site and its canonical origin, English first', () => {
    expect(SITE).toEqual({
      name: 'Cuenta Horas',
      origin: 'https://cuentahoras.com',
      locales: ['en', 'es'],
    });
  });
});
