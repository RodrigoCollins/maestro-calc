import { describe, expect, it } from 'vitest';
import { GLOSSARY, glossaryProblems } from './glossary.ts';

describe('construction glossary (i18n-catalog › Construction glossary)', () => {
  it('holds one entry per English term', () => {
    const terms = GLOSSARY.map(({ en }) => en.toLowerCase());
    expect(terms.length).toBeGreaterThan(0);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it('never avoids a Spanish term the site uses, in any entry', () => {
    const used = GLOSSARY.map(({ es }) => es.toLowerCase());
    for (const { en, avoid } of GLOSSARY) {
      for (const variant of avoid) {
        expect(used, `${en}: ${variant}`).not.toContain(variant.toLowerCase());
        expect(glossaryProblems(used.join('. ')), `${en}: ${variant}`).toEqual([]);
      }
    }
  });

  // spec: i18n-catalog › [ICW23]
  it('names the variant and the term to use', () => {
    expect(glossaryProblems('Elige la forma del vaciado.')).toEqual([
      { variant: 'vaciado', use: 'colado' },
    ]);
  });

  it('matches whole words, ignores case and catches the plural', () => {
    expect(glossaryProblems('El HORMIGÓN y los tejados.')).toEqual([
      { variant: 'HORMIGÓN', use: 'concreto' },
      { variant: 'tejados', use: 'techo' },
    ]);
    // a variant inside a longer word is not the variant
    expect(glossaryProblems('desencofrado, vaciadora, cubetazo')).toEqual([]);
  });

  it('avoids "saco" only as a bag, never as the verb', () => {
    expect(glossaryProblems('¿Cómo saco el área? Compra sacos de concreto.')).toEqual([
      { variant: 'sacos de', use: 'bolsa' },
    ]);
  });
});
