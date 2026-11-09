import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { describe, expect, it } from 'vitest';
import { MILITARY_CHART_PATHS, MILITARY_CONVERTER_PATHS } from '../military/routes.ts';
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

describe('the Spanish hours calculator, for Spain and Mexico alike', () => {
  const t = HOURS_TEXTS.es;
  const copy = [t.title, t.description, t.lead, t.timeHint, ...t.notes].join(' ');

  it('is about time, not about a job: no clock-in, clock-out or unpaid break', () => {
    expect(t.h1).toBe('Calculadora de horas y minutos');
    expect(copy).not.toMatch(/entrada|salida|sin pago|empleador/);
  });

  it('writes and reads both clocks: 17:30 and 5:30 p. m.', () => {
    expect(t.timeHint).toContain('17:30');
    expect(t.timeHint).toContain('5:30 p. m.');
    expect(t.notes.join(' ')).toContain('22:00 (10:00 p. m.)');
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

    it('links the military time converter and chart of its language', () => {
      const hrefs = t.links.map(({ href }) => href);
      expect(hrefs).toContain(MILITARY_CONVERTER_PATHS[lang]);
      expect(hrefs).toContain(MILITARY_CHART_PATHS[lang]);
    });

    it('links pages of its own language that exist', () => {
      for (const { href } of [...t.links, ...t.usLinks]) {
        expect(existsSync(pageOf(href)), href).toBe(true);
        expect(href.startsWith('/es/'), href).toBe(lang === 'es');
      }
    });

    it('keeps the pay and labour-law pages apart, under a heading that says they are US rules', () => {
      expect(t.usHeading).toContain(lang === 'en' ? 'US law' : 'EE. UU.');
      const links = [...t.links, ...t.usLinks].map(({ href }) => href);
      expect(new Set(links).size).toBe(links.length);
      if (lang === 'es') {
        for (const { label } of t.usLinks) expect(label, label).toContain('EE. UU.');
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
