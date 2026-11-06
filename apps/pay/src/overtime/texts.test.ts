import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { describe, expect, it } from 'vitest';
import { OVERTIME_PATHS, OVERTIME_TEXTS } from './texts.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('overtime texts', () => {
  it('serves English at /overtime-calculator and Spanish under /es/', () => {
    expect(OVERTIME_PATHS).toEqual({
      en: '/overtime-calculator',
      es: '/es/calculadora-de-horas-extra',
    });
  });

  for (const [lang, texts] of Object.entries(OVERTIME_TEXTS)) {
    describe(lang, () => {
      it('labels every day input of the engine, in its order', () => {
        expect(texts.days.map(({ key }) => key)).toEqual(
          overtime.inputs.filter(({ kind }) => kind === 'decimal').map(({ key }) => key),
        );
      });

      it('labels every overtime rule of the engine', () => {
        const rule = overtime.inputs[1];
        expect(Object.keys(texts.rules)).toEqual(rule.options);
      });

      it('explains the state rules: Alaska past 8, Nevada below $18.00, Colorado past 12', () => {
        const notes = texts.notes.join(' ');
        for (const word of ['Alaska', 'Nevada', '$18.00', '$12.00', 'Colorado', '12']) {
          expect(notes, word).toContain(word);
        }
      });

      it('says what the Colorado rule leaves out: 12 consecutive hours across two days', () => {
        const colorado = texts.notes.find((note) => note.startsWith('Colorado')) ?? '';
        expect(colorado).toMatch(lang === 'en' ? /consecutive/ : /seguidas/);
      });

      it('links the time card of its own language', () => {
        expect(existsSync(pageOf(texts.timeCard.href)), texts.timeCard.href).toBe(true);
        expect(texts.timeCard.href.startsWith('/es/')).toBe(lang === 'es');
      });

      it('keeps the title under 70 characters and the description under 160', () => {
        expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
        expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      });
    });
  }
});
