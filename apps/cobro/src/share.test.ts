import { describe, expect, it } from 'vitest';
import { shareOf } from './share.ts';

describe('shareOf', () => {
  it('shares the name of the page and its canonical address on a line of its own', () => {
    const share = shareOf('es', 'Cuánto gana un pintor en Texas', '/cuanto-gana-un-pintor-en-texas');
    expect(decodeURIComponent(share.href)).toBe(
      'https://wa.me/?text=Cuánto gana un pintor en Texas, en Cuánto Le Cobro:\nhttps://cuantolecobro.com/cuanto-gana-un-pintor-en-texas',
    );
    expect(share.label).toBe('Compartir por WhatsApp');
    expect(share.ariaLabel).toBe('Compartir por WhatsApp: Cuánto gana un pintor en Texas');
  });

  it('speaks English on an English page', () => {
    const share = shareOf('en', 'Wages', '/en/trade-wages-by-state');
    expect(decodeURIComponent(share.href)).toContain('Wages, on Cuánto Le Cobro:');
    expect(share.label).toBe('Share on WhatsApp');
  });
});
