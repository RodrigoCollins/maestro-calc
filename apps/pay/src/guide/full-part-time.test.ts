import { describe, expect, it } from 'vitest';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { pathOf, SHIFTS } from '../long-tail/routes.ts';
import { ROUTES } from '../routes.ts';
import { TITLE_MAX } from '../seo/meta.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import {
  FULL_TIME_GUIDE,
  FULL_TIME_GUIDE_LINKS,
  FULL_TIME_GUIDE_PATHS,
  PART_TIME_GUIDE,
  PART_TIME_GUIDE_LINKS,
  PART_TIME_GUIDE_PATHS,
  WORK_WEEK_EXAMPLES,
} from './full-part-time.ts';

// The weeks the guides work out, verified by hand: a day is the end less the start less the
// unpaid break, a week is the day times the days worked.
const HAND = {
  // 9:00 to 17:00 is 8 h; less 30 minutes, 7 h 30 min; five days, 7.5 × 5 = 37.5 h
  'day-shift': { day: '7 h 30 min', week: '37.5' },
  // 8:00 to 17:00 is 9 h; less a 60-minute lunch, 8 h 0 min; five days, 8 × 5 = 40 h
  'long-days': { day: '8 h 0 min', week: '40' },
  // 9:00 to 15:00 with no break is 6 h 0 min; five days, 6 × 5 = 30 h
  'short-days': { day: '6 h 0 min', week: '30' },
  // 9:00 to 17:00 less 30 minutes is 7 h 30 min; three days, 7.5 × 3 = 22.5 h
  'three-days': { day: '7 h 30 min', week: '22.5' },
} as const;

/** The line each source draws, as the guides print it: hours a week, and a month for the IRS. */
const LINES = { irsWeek: '30', irsMonth: '130', bls: '35', federal: '40', opm: '16 to 32' };

const GUIDES = { full: FULL_TIME_GUIDE, part: PART_TIME_GUIDE } as const;
const PATHS = { full: FULL_TIME_GUIDE_PATHS, part: PART_TIME_GUIDE_PATHS } as const;
const LINKS = { full: FULL_TIME_GUIDE_LINKS, part: PART_TIME_GUIDE_LINKS } as const;
const IDS = { full: 'full-time-guide', part: 'part-time-guide' } as const;
/** The worked weeks each guide prints. */
const USES = {
  full: ['day-shift', 'long-days', 'short-days'],
  part: ['short-days', 'three-days'],
} as const;
/** The shift pages each guide lists, as `start-end` on a 24-hour clock. */
const SHIFT_PAGES = {
  full: ['7:00-15:00', '8:00-16:00', '8:00-16:30', '8:00-17:00', '9:00-17:00'],
  part: ['9:00-15:00', '10:00-16:00', '9:00-16:00'],
} as const;

const SOURCES = {
  irs: 'https://www.irs.gov/affordable-care-act/employers/identifying-full-time-employees',
  bls: 'https://www.bls.gov/cps/definitions.htm',
  dol: 'https://www.dol.gov/general/topic/workhours/full-time',
};

const PRIMARY = /^https:\/\/(www\.irs\.gov|www\.bls\.gov|www\.dol\.gov|www\.ecfr\.gov)\//;
const LANGS = ['en', 'es'] as const;
const KINDS = ['full', 'part'] as const;

const paragraphsOf = (kind: keyof typeof GUIDES, lang: 'en' | 'es'): readonly string[] =>
  GUIDES[kind][lang].sections.flatMap(({ paragraphs }) => paragraphs);
const body = (kind: keyof typeof GUIDES, lang: 'en' | 'es'): string =>
  paragraphsOf(kind, lang).join(' ');
const clock = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;

describe('the full-time and part-time guides', () => {
  it('work out exactly the hand-verified weeks with the hours calculator', () => {
    expect(WORK_WEEK_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
    for (const { id, figures } of WORK_WEEK_EXAMPLES) expect(figures, id).toEqual(HAND[id]);
  });

  for (const kind of KINDS) {
    it.each(LANGS)(`${kind} time (%s): prints each of its weeks in one paragraph`, (lang) => {
      for (const id of USES[kind]) {
        const { day, week } = HAND[id];
        const paragraph = paragraphsOf(kind, lang).find(
          (each) => each.includes(day) && each.includes(`${week} h`),
        );
        expect(paragraph, `${id} ${week}`).toBeDefined();
      }
    });

    it.each(LANGS)(`${kind} time (%s): answers first, in the title and the description`, (lang) => {
      const texts = GUIDES[kind][lang];
      const answer = texts.title.replace(/ \| Cuenta Horas$/, '').replace(/: what counts$/, '');
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(TITLE_MAX);
      expect(texts.title, texts.title).toMatch(/\| Cuenta Horas$/);
      expect(answer, answer).toMatch(kind === 'full' ? /30 .*40/ : /30 .*35/);
      expect(texts.description.startsWith(answer), texts.description).toBe(true);
      expect(texts.description.length, texts.description).toBeGreaterThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.h1).toBe(
        {
          full: { en: 'How many hours is full time?', es: '¿Cuántas horas son tiempo completo?' },
          part: { en: 'How many hours is part time?', es: '¿Cuántas horas son medio tiempo?' },
        }[kind][lang],
      );
    });

    it.each(LANGS)(`${kind} time (%s): names every line with its source`, (lang) => {
      const text = body(kind, lang);
      for (const line of [LINES.irsWeek, LINES.irsMonth, LINES.bls, LINES.federal]) {
        expect(text, line).toContain(line);
      }
      const hrefs = GUIDES[kind][lang].sections.flatMap(({ sources }) =>
        sources.map(({ href }) => href),
      );
      for (const href of Object.values(SOURCES)) expect(hrefs, href).toContain(href);
      // the FLSA defines neither: the guide says so in the DOL's words
      expect(text).toMatch(
        /does not define full-time employment or part-time employment|no define el empleo de tiempo completo ni el de medio tiempo/,
      );
    });

    it(`${kind} time: has the same sections in both languages, each with a primary source`, () => {
      const { en, es } = GUIDES[kind];
      expect(es.sections.map(({ sources }) => sources)).toEqual(
        en.sections.map(({ sources }) => sources),
      );
      for (const { sources } of en.sections) {
        expect(sources.length).toBeGreaterThan(0);
        for (const { href } of sources) expect(href).toMatch(PRIMARY);
      }
      expect(en.checked).toBe('2026-11-08');
      expect(es.checked).toBe(en.checked);
    });

    it(`${kind} time: opens the hours calculator, which links back to it`, () => {
      for (const lang of LANGS) {
        const texts = GUIDES[kind][lang];
        expect(texts.ctas[0]?.href).toBe(HOURS_PATHS[lang]);
        for (const { href } of texts.ctas)
          expect(href.startsWith('/es/'), href).toBe(lang === 'es');
        expect(HOURS_TEXTS[lang].usLinks.map(({ href }) => href)).toContain(PATHS[kind][lang]);
        expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      }
    });

    it(`${kind} time: lists its shift pages in its own language`, () => {
      for (const lang of LANGS) {
        const wanted = SHIFT_PAGES[kind].map((name) => {
          const shift = SHIFTS.find((each) => `${clock(each.start)}-${clock(each.end)}` === name);
          if (shift === undefined) throw new Error(`no shift page ${name}`);
          return pathOf(shift, lang);
        });
        expect(LINKS[kind][lang].links.map(({ href }) => href)).toEqual(wanted);
      }
    });

    it(`${kind} time: is an article of the route table that explains the hours calculator`, () => {
      expect(ROUTES).toContainEqual(
        expect.objectContaining({ id: IDS[kind], kind: 'article', ...PATHS[kind] }),
      );
      expect(GUIDE_CALCULATORS[IDS[kind]]).toEqual(['hours']);
    });
  }

  it('lives at the addresses people search, and each guide links the other', () => {
    expect(FULL_TIME_GUIDE_PATHS).toEqual({
      en: '/guides/how-many-hours-is-full-time',
      es: '/es/guias/cuantas-horas-son-tiempo-completo',
    });
    expect(PART_TIME_GUIDE_PATHS).toEqual({
      en: '/guides/how-many-hours-is-part-time',
      es: '/es/guias/cuantas-horas-son-medio-tiempo',
    });
    for (const lang of LANGS) {
      expect(FULL_TIME_GUIDE[lang].ctas.map(({ href }) => href)).toContain(
        PART_TIME_GUIDE_PATHS[lang],
      );
      expect(PART_TIME_GUIDE[lang].ctas.map(({ href }) => href)).toContain(
        FULL_TIME_GUIDE_PATHS[lang],
      );
    }
  });

  it('gives the federal part-time schedule of 5 CFR 340.202 in the part-time guide', () => {
    for (const lang of LANGS) {
      expect(body('part', lang)).toContain(LINES.opm.replace('to', lang === 'en' ? 'to' : 'a'));
      expect(body('part', lang)).toContain('340.202');
    }
  });
});
