import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { describe, expect, it } from 'vitest';
import { TIPPED_PATHS, TIPPED_TEXTS } from './texts.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('tipped wage paths', () => {
  it('serves English at the root and Spanish under /es/', () => {
    expect(TIPPED_PATHS).toEqual({
      en: '/tipped-wage-calculator',
      es: '/es/calculadora-de-propinas-por-hora',
    });
  });
});

for (const lang of ['en', 'es'] as const) {
  describe(`tipped wage texts (${lang})`, () => {
    const t = TIPPED_TEXTS[lang];

    it('labels every input of the engine, in its order', () => {
      expect(t.fields.map(({ key }) => key)).toEqual(tippedWage.inputs.map(({ key }) => key));
    });

    it('words every warning of the engine', () => {
      expect(Object.keys(t.warnings)).toEqual(tippedWage.warnings);
    });

    it('labels every secondary output of the engine, in its order', () => {
      expect(Object.keys(t.outputs)).toEqual(
        tippedWage.outputs.filter(({ role }) => role === 'secondary').map(({ key }) => key),
      );
    });

    it('states the hand-verified cases: $8.38 an hour, a $54.80 top-up, $408.22 for 44 hours', () => {
      const notes = t.notes.join(' ');
      for (const figure of ['$85.20', '$335.20', '$8.38', '$290', '$54.80', '$14.50', '$408.22']) {
        expect(notes, figure).toContain(figure);
      }
    });

    it('names the federal figures and sends the reader to the rules of the state', () => {
      const notes = t.notes.join(' ');
      for (const figure of ['$2.13', '$5.12', '$7.25', 'Fact Sheet #15', 'California']) {
        expect(notes, figure).toContain(figure);
      }
      expect(new URL(t.stateLink.href).hostname).toBe('www.dol.gov');
    });

    it('states the hand-verified state case: Arizona, $15.15 with a $3.00 tip credit, $20 owed', () => {
      const notes = t.notes.join(' ');
      for (const figure of [
        'Arizona',
        '$12.15',
        '$3.00',
        '$15.15',
        '$486',
        '$100',
        '$20',
        '$606',
      ]) {
        expect(notes, figure).toContain(figure);
      }
    });

    it('labels the minimum wage and the tip credit with their federal figures', () => {
      const label = (key: string): string =>
        t.fields.find((field) => field.key === key)?.label ?? '';
      expect(label('minimumWage')).toContain('$7.25');
      expect(label('maxTipCredit')).toContain('$5.12');
    });

    it('warns of a top-up against the minimum the form holds, not the federal $7.25 alone', () => {
      expect(t.warnings.topUpOwed).not.toContain('$7.25');
    });

    it('says nothing about the tax deduction for tips', () => {
      expect(JSON.stringify(t)).not.toMatch(/IRS|deduction|deducci|impuesto|\btax/i);
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
