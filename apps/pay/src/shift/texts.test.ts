import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { describe, expect, it } from 'vitest';
import { SHIFT_PATHS, SHIFT_TEXTS } from './texts.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('shift differential paths', () => {
  it('serves English at the root and Spanish under /es/', () => {
    expect(SHIFT_PATHS).toEqual({
      en: '/shift-differential-calculator',
      es: '/es/calculadora-de-diferencial-de-turno',
    });
  });
});

for (const lang of ['en', 'es'] as const) {
  describe(`shift differential texts (${lang})`, () => {
    const t = SHIFT_TEXTS[lang];

    it('labels every input of the engine, in its order, and each option of the select', () => {
      expect(t.fields.map(({ key }) => key)).toEqual(
        shiftDifferential.inputs.map(({ key }) => key),
      );
      const source = t.fields.find(({ key }) => key === 'source');
      expect(Object.keys(source?.options ?? {})).toEqual(['percent', 'amount']);
      expect(t.fields.find(({ key }) => key === 'percent')?.when).toBe('percent');
      expect(t.fields.find(({ key }) => key === 'amount')?.when).toBe('amount');
    });

    it('words every warning of the engine', () => {
      expect(Object.keys(t.warnings)).toEqual(shiftDifferential.warnings);
    });

    it('labels every secondary output of the engine, in its order', () => {
      expect(Object.keys(t.outputs)).toEqual(
        shiftDifferential.outputs.filter(({ role }) => role === 'secondary').map(({ key }) => key),
      );
    });

    it('states the hand-verified cases: $832 for 40 hours, $1,092 for 48', () => {
      const notes = t.notes.join(' ');
      for (const figure of ['$22', '$832', '$1,008', '$21.00', '$84', '$1,092']) {
        expect(notes, figure).toContain(figure);
      }
    });

    it('says the FLSA does not require a differential but counts it in the regular rate', () => {
      const notes = t.notes.join(' ');
      expect(notes).toContain('FLSA');
      expect(notes).toContain('778.207');
      expect(notes).toContain('778.115');
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
