import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DECIMAL_HOURS_PATHS, HOURS_PATHS } from '../hours/texts.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { PTO_PATHS } from '../pto/texts.ts';
import { SHIFT_PATHS } from '../shift/texts.ts';
import { TIPPED_PATHS } from '../tipped/texts.ts';
import { HOME_TEXTS } from './texts.ts';

const pageFile = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1) || 'index'}.astro`);

describe('home texts', () => {
  it('lists the same tools in the same order in both languages', () => {
    expect(HOME_TEXTS.es.tools.map(({ id }) => id)).toEqual(
      HOME_TEXTS.en.tools.map(({ id }) => id),
    );
  });

  it('links a tool only when its page is built, in its own language', () => {
    for (const [lang, texts] of Object.entries(HOME_TEXTS)) {
      for (const tool of texts.tools) {
        if (tool.href === null) continue;
        expect(existsSync(pageFile(tool.href)), tool.href).toBe(true);
        expect(tool.href.startsWith('/es/'), tool.href).toBe(lang === 'es');
      }
    }
  });

  it('links the overtime card to the overtime calculator of its language', () => {
    for (const [lang, texts] of Object.entries(HOME_TEXTS)) {
      const card = texts.tools.find(({ id }) => id === 'overtime');
      expect(card?.href).toBe(OVERTIME_PATHS[lang as keyof typeof OVERTIME_PATHS]);
    }
  });

  it('links the hours and decimal hours cards to their calculators, after the overtime card', () => {
    for (const lang of ['en', 'es'] as const) {
      const ids = HOME_TEXTS[lang].tools.map(({ id }) => id);
      expect(ids.slice(1, 4)).toEqual(['overtime', 'hours', 'decimal-hours']);
      const href = (id: string) => HOME_TEXTS[lang].tools.find((tool) => tool.id === id)?.href;
      expect(href('hours')).toBe(HOURS_PATHS[lang]);
      expect(href('decimal-hours')).toBe(DECIMAL_HOURS_PATHS[lang]);
    }
  });

  it('links the PTO card to the PTO accrual calculator, after the pay converters', () => {
    for (const lang of ['en', 'es'] as const) {
      const ids = HOME_TEXTS[lang].tools.map(({ id }) => id);
      expect(ids.indexOf('pto-accrual')).toBe(ids.indexOf('salary-to-hourly') + 1);
      const card = HOME_TEXTS[lang].tools.find(({ id }) => id === 'pto-accrual');
      expect(card?.href).toBe(PTO_PATHS[lang]);
    }
  });

  it('links the shift differential card to its calculator, after the PTO card', () => {
    for (const lang of ['en', 'es'] as const) {
      const ids = HOME_TEXTS[lang].tools.map(({ id }) => id);
      expect(ids.indexOf('shift-differential')).toBe(ids.indexOf('pto-accrual') + 1);
      const card = HOME_TEXTS[lang].tools.find(({ id }) => id === 'shift-differential');
      expect(card?.href).toBe(SHIFT_PATHS[lang]);
    }
  });

  it('links the tipped wage card to its calculator, after the shift differential card', () => {
    for (const lang of ['en', 'es'] as const) {
      const ids = HOME_TEXTS[lang].tools.map(({ id }) => id);
      expect(ids.indexOf('tipped-wage')).toBe(ids.indexOf('shift-differential') + 1);
      const card = HOME_TEXTS[lang].tools.find(({ id }) => id === 'tipped-wage');
      expect(card?.href).toBe(TIPPED_PATHS[lang]);
    }
  });

  it('points the main button at the time card of its language', () => {
    expect(HOME_TEXTS.en.cta.href).toBe('/time-card-calculator');
    expect(HOME_TEXTS.es.cta.href).toBe('/es/calculadora-de-horas-trabajadas');
  });

  it('keeps titles under 70 characters and descriptions under 160', () => {
    for (const texts of Object.values(HOME_TEXTS)) {
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });
});
