import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
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
