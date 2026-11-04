import { describe, expect, it } from 'vitest';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { ROUTES } from '../routes.ts';
import { OVERTIME_GUIDES } from './overtime.ts';
import {
  DLSE_RETALIATION_PHONE,
  UNPAID_WAGES_GUIDE,
  UNPAID_WAGES_GUIDE_PATHS,
  WHD_PHONE,
} from './unpaid-wages.ts';

const PRIMARY = /^https:\/\/www\.(dol\.gov|dir\.ca\.gov)\//;
const body = (lang: 'en' | 'es'): string =>
  UNPAID_WAGES_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs).join(' ');

describe('the unpaid wages guide', () => {
  it.each(['en', 'es'] as const)(
    '%s: gives the agencies’ numbers as their pages print them',
    (lang) => {
      expect(WHD_PHONE).toBe('1-866-487-9243');
      expect(DLSE_RETALIATION_PHONE).toBe('833-526-4636');
      expect(body(lang)).toContain(WHD_PHONE);
      expect(body(lang)).toContain(DLSE_RETALIATION_PHONE);
    },
  );

  it('has the same sections in both languages, each with a DOL or DLSE source', () => {
    const { en, es } = UNPAID_WAGES_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('keeps titles short, says it is not legal advice and links pages of its own language', () => {
    for (const [lang, texts] of Object.entries(UNPAID_WAGES_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
    expect(UNPAID_WAGES_GUIDE.en.ctas[0]?.href).toBe(OVERTIME_PATHS.en);
    expect(UNPAID_WAGES_GUIDE.es.ctas[0]?.href).toBe(OVERTIME_PATHS.es);
  });

  it('is linked from both overtime guides in each language', () => {
    for (const guide of Object.values(OVERTIME_GUIDES)) {
      for (const lang of ['en', 'es'] as const)
        expect(guide[lang].ctas.map(({ href }) => href)).toContain(UNPAID_WAGES_GUIDE_PATHS[lang]);
    }
  });

  it('is an article of the route table', () => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({ kind: 'article', ...UNPAID_WAGES_GUIDE_PATHS }),
    );
  });
});
