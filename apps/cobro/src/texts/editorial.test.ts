import { describe, expect, it } from 'vitest';
import { ARTICLES } from './articles.ts';

const affiliateOf = (lang: 'es' | 'en') =>
  ARTICLES[lang].editorial.blocks
    .filter(({ id }) => id === 'affiliate')
    .flatMap(({ paragraphs = [] }) => paragraphs)
    .join('\n');

// Paid links are disclosed on the editorial policy, the page every byline links to.
describe('the affiliate disclosure of the editorial policy', () => {
  it('is the last section in both languages, under the same id', () => {
    for (const lang of ['es', 'en'] as const)
      expect(ARTICLES[lang].editorial.blocks.at(-1)?.id, lang).toBe('affiliate');
  });

  it('gives the label, the commission, the promise and the Amazon statement in Spanish', () => {
    const text = affiliateOf('es');
    expect(text).toContain('"Enlace pagado"');
    expect(text).toContain('comisión sin costo extra para ti');
    expect(text).toContain('nunca cambia el resultado de una calculadora');
    expect(text).toContain(
      'Como Asociado de Amazon, ganamos con las compras que cumplen los requisitos',
    );
  });

  it('gives the label, the commission, the promise and the Amazon statement in English', () => {
    const text = affiliateOf('en');
    expect(text).toContain('"Paid link"');
    expect(text).toContain('commission at no extra cost to you');
    expect(text).toContain('never changes a calculator result');
    expect(text).toContain('As an Amazon Associate we earn from qualifying purchases');
  });
});
