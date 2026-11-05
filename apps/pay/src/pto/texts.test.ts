import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { describe, expect, it } from 'vitest';
import { PTO_PATHS, PTO_TEXTS } from './texts.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('PTO accrual paths', () => {
  it('serves English at the root and Spanish under /es/', () => {
    expect(PTO_PATHS).toEqual({
      en: '/pto-accrual-calculator',
      es: '/es/calculadora-de-vacaciones-pagadas',
    });
  });
});

for (const lang of ['en', 'es'] as const) {
  describe(`PTO accrual texts (${lang})`, () => {
    const t = PTO_TEXTS[lang];

    it('words every warning of the engine', () => {
      expect(Object.keys(t.warnings)).toEqual(ptoAccrual.warnings);
    });

    it('labels every secondary output of the engine, in its order', () => {
      expect(Object.keys(t.outputs)).toEqual(
        ptoAccrual.outputs.filter(({ role }) => role === 'secondary').map(({ key }) => key),
      );
    });

    it('states the hand-verified default: 80 hours a year, 3.08 every two weeks, 1 per 26', () => {
      const notes = t.notes.join(' ');
      for (const figure of ['80', '3.08', '0.0385', '26']) expect(notes, figure).toContain(figure);
    });

    it('says that federal law does not require PTO and that California counts it as wages', () => {
      const notes = t.notes.join(' ');
      expect(notes).toContain('FLSA');
      expect(notes).toContain('California');
    });

    it('links pages of its own language that exist', () => {
      for (const { href } of t.links) {
        expect(existsSync(pageOf(href)), href).toBe(true);
        expect(href.startsWith('/es/'), href).toBe(lang === 'es');
      }
    });

    it('keeps the title under 70 characters and the description under 160', () => {
      expect(t.title.length, t.title).toBeLessThanOrEqual(70);
      expect(t.description.length, t.description).toBeLessThanOrEqual(160);
    });
  });
}
