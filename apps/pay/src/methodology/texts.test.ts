import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXAMPLES } from './examples.ts';
import { METHODOLOGY_TEXTS } from './texts.ts';

const OFFICIAL = new Set(['www.dol.gov', 'www.dir.ca.gov']);

describe('methodology texts', () => {
  it('has the same sections in the same order in both languages', () => {
    expect(METHODOLOGY_TEXTS.es.sections.map(({ id }) => id)).toEqual(
      METHODOLOGY_TEXTS.en.sections.map(({ id }) => id),
    );
  });

  it('cites only official sources, over https', () => {
    for (const texts of Object.values(METHODOLOGY_TEXTS)) {
      for (const { href } of texts.sections.flatMap(({ sources }) => sources)) {
        const url = new URL(href);
        expect(url.protocol, href).toBe('https:');
        expect(OFFICIAL.has(url.hostname), href).toBe(true);
      }
    }
  });

  it('cites the federal rule and both California sources in each language', () => {
    for (const texts of Object.values(METHODOLOGY_TEXTS)) {
      const cited = (id: string) =>
        texts.sections.find((section) => section.id === id)?.sources.length ?? 0;
      expect(cited('federal')).toBe(1);
      expect(cited('california')).toBe(2);
    }
  });

  it('labels every worked example in both languages', () => {
    for (const texts of Object.values(METHODOLOGY_TEXTS)) {
      expect(Object.keys(texts.examples)).toEqual(EXAMPLES.map(({ id }) => id));
    }
  });

  it('points the button at the time card page of its language', () => {
    for (const [lang, texts] of Object.entries(METHODOLOGY_TEXTS)) {
      const page = resolve(import.meta.dirname, '../pages', `${texts.cta.href.slice(1)}.astro`);
      expect(existsSync(page), page).toBe(true);
      expect(texts.cta.href.startsWith('/es/')).toBe(lang === 'es');
    }
  });

  it('keeps titles under 70 characters and descriptions under 160', () => {
    for (const texts of Object.values(METHODOLOGY_TEXTS)) {
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });
});
