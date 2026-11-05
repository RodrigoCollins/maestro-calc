import { describe, expect, it } from 'vitest';
import {
  DECIMAL_HOURS_PATHS,
  DECIMAL_HOURS_TEXTS,
  HOURS_PATHS,
  HOURS_TEXTS,
} from '../hours/texts.ts';
import { MINUTES, pathOf, SHIFTS } from '../long-tail/routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { ROUTES } from '../routes.ts';
import {
  HOURS_WORKED_GUIDE,
  HOURS_WORKED_GUIDE_LINKS,
  HOURS_WORKED_GUIDE_MINUTES,
  HOURS_WORKED_GUIDE_MISREAD,
  HOURS_WORKED_GUIDE_PATHS,
  HOURS_WORKED_GUIDE_SHIFTS,
} from './hours-worked.ts';

// The shifts the guide works out, verified by hand: the hours are the end less the start (an end
// before the start is the next day), less the unpaid meal period; decimal hours are the minutes
// over 60, rounded to two places.
const HAND_SHIFTS = {
  // 8:00 to 4:30 pm is 8 h 30 min (8.50); less a 30-minute lunch, 8 h 0 min (8.00)
  lunch: { shift: '8.50', hours: '8 h 0 min', decimal: '8.00' },
  // 8:10 to 5:05 pm is 8 h 55 min (8.9166… = 8.92); less 30 minutes, 8 h 25 min (8.4166… = 8.42)
  minutes: { shift: '8.92', hours: '8 h 25 min', decimal: '8.42' },
  // 10:00 pm to 6:15 am crosses midnight: 8 h 15 min (8.25); less 30 minutes, 7 h 45 min (7.75)
  overnight: { shift: '8.25', hours: '7 h 45 min', decimal: '7.75' },
} as const;

// Minutes to decimal hours: 6 / 60 = 0.10, 15 / 60 = 0.25, 25 / 60 = 0.4166… = 0.42,
// 45 / 60 = 0.75, and 8 h 25 min = 8.4166… = 8.42, the same as the hours calculator.
const HAND_MINUTES = { '6': '0.10', '15': '0.25', '25': '0.42', '45': '0.75', '8:25': '8.42' };

// 8.25 decimal hours are 8 h 15 min (0.25 × 60 = 15), not 8 h 25 min: 10 minutes short.
const HAND_MISREAD = { decimal: '8.25', reads: '8 h 15 min' } as const;

const PRIMARY = /^https:\/\/(www\.ecfr\.gov|www\.dol\.gov)\//;
const paragraphsOf = (lang: 'en' | 'es'): readonly string[] =>
  HOURS_WORKED_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs);
const body = (lang: 'en' | 'es'): string => paragraphsOf(lang).join(' ');

describe('the hours worked guide', () => {
  it('works out exactly the hand-verified shifts and minutes, in order, with the engines', () => {
    expect(HOURS_WORKED_GUIDE_SHIFTS.map(({ id }) => id)).toEqual(Object.keys(HAND_SHIFTS));
    for (const { id, figures } of HOURS_WORKED_GUIDE_SHIFTS) {
      expect(figures, id).toEqual(HAND_SHIFTS[id]);
    }
    expect(HOURS_WORKED_GUIDE_MINUTES).toEqual(HAND_MINUTES);
    expect(HOURS_WORKED_GUIDE_MISREAD).toEqual(HAND_MISREAD);
  });

  it.each(['en', 'es'] as const)(
    '%s: prints each worked shift with all its figures in one paragraph',
    (lang) => {
      for (const figures of Object.values(HAND_SHIFTS)) {
        const paragraph = paragraphsOf(lang).find(
          (each) => each.includes(figures.hours) && each.includes(figures.decimal),
        );
        expect(paragraph, figures.hours).toBeDefined();
        for (const figure of Object.values(figures)) expect(paragraph).toContain(figure);
      }
    },
  );

  it.each(['en', 'es'] as const)(
    '%s: prints every minutes figure and the misread decimal',
    (lang) => {
      for (const figure of Object.values(HAND_MINUTES))
        expect(body(lang), figure).toContain(figure);
      const paragraph = paragraphsOf(lang).find((each) => each.includes(HAND_MISREAD.reads));
      expect(paragraph).toBeDefined();
      expect(paragraph).toContain(HAND_MISREAD.decimal);
    },
  );

  it.each(['en', 'es'] as const)('%s: states the break rules and cites them', (lang) => {
    for (const cite of ['20', '30', '785.18', '785.19', '785.48', 'Fact Sheet #22']) {
      expect(body(lang), cite).toContain(cite);
    }
  });

  it('has the same sections in both languages, each with a primary source', () => {
    const { en, es } = HOURS_WORKED_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('sends you to the DOL table of the meal periods of each state', () => {
    const table = 'https://www.dol.gov/agencies/whd/state/meal-breaks';
    for (const lang of ['en', 'es'] as const) {
      const states = HOURS_WORKED_GUIDE[lang].sections.find(({ sources }) =>
        sources.some(({ href }) => href === table),
      );
      expect(states, lang).toBeDefined();
    }
  });

  it('keeps titles short, says it is not legal advice and sends you to your state', () => {
    for (const [lang, texts] of Object.entries(HOURS_WORKED_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      expect(texts.disclaimer).toMatch(
        /your state’s labor department|departamento de trabajo de tu estado/,
      );
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('opens the hours calculator and the converter first, and both link back to it', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(HOURS_WORKED_GUIDE[lang].ctas.slice(0, 2).map(({ href }) => href)).toEqual([
        HOURS_PATHS[lang],
        DECIMAL_HOURS_PATHS[lang],
      ]);
      for (const texts of [HOURS_TEXTS[lang], DECIMAL_HOURS_TEXTS[lang]]) {
        expect(texts.links.map(({ href }) => href)).toContain(HOURS_WORKED_GUIDE_PATHS[lang]);
      }
    }
  });

  it('lists every shift page and every minutes page in its own language', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(HOURS_WORKED_GUIDE_LINKS[lang].links.map(({ href }) => href)).toEqual(
        [...SHIFTS, ...MINUTES].map((job) => pathOf(job, lang)),
      );
    }
  });

  it('is an article of the route table that explains both calculators', () => {
    expect(HOURS_WORKED_GUIDE_PATHS).toEqual({
      en: '/guides/how-to-calculate-hours-worked',
      es: '/es/guias/como-calcular-las-horas-trabajadas',
    });
    expect(ROUTES).toContainEqual(
      expect.objectContaining({
        id: 'hours-worked-guide',
        kind: 'article',
        ...HOURS_WORKED_GUIDE_PATHS,
      }),
    );
    expect(GUIDE_CALCULATORS['hours-worked-guide']).toEqual(['hours', 'decimal-hours']);
  });
});
