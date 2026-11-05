import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { describe, expect, it } from 'vitest';
import { DECIMAL_HOURS_PATHS, DECIMAL_HOURS_TEXTS, HOURS_PATHS, HOURS_TEXTS } from './texts.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('hours and decimal hours paths', () => {
  it('serves English at the root and Spanish under /es/', () => {
    expect(HOURS_PATHS).toEqual({ en: '/hours-calculator', es: '/es/calculadora-de-horas' });
    expect(DECIMAL_HOURS_PATHS).toEqual({
      en: '/minutes-to-decimal-hours',
      es: '/es/minutos-a-horas-decimales',
    });
  });
});

for (const lang of ['en', 'es'] as const) {
  describe(`hours calculator texts (${lang})`, () => {
    const t = HOURS_TEXTS[lang];

    it('words every warning of the engine', () => {
      expect(Object.keys(t.warnings)).toEqual(hoursBetween.warnings);
    });

    it('says that an end before the start crosses midnight, and how decimals are rounded', () => {
      expect(t.notes.join(' ')).toContain(lang === 'en' ? 'midnight' : 'medianoche');
      expect(t.notes.join(' ')).toContain('8.33');
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

  describe(`minutes to decimal hours texts (${lang})`, () => {
    const t = DECIMAL_HOURS_TEXTS[lang];

    it('states how decimals are rounded, with the hand-verified cases', () => {
      const notes = t.notes.join(' ');
      for (const figure of ['0.75', '8.33', '7.75']) expect(notes, figure).toContain(figure);
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
