import { describe, expect, it } from 'vitest';
import { PTO_PATHS, PTO_TEXTS } from '../pto/texts.ts';
import { ROUTES } from '../routes.ts';
import { PTO_GUIDE, PTO_GUIDE_EXAMPLES, PTO_GUIDE_PATHS } from './pto.ts';

// The policies the guide works out, verified by hand: the days off a year times the hours of a
// day off are the PTO hours a year, over 52 weeks, 26 two-week paychecks, 24 half months and 12
// months, and over the hours worked a year (the hours a week times 52). Periods to two places,
// the rate per hour worked to four, the hours worked for 1 hour off to two at most.
const HAND = {
  // 80 h: 80/26 = 3.0769, 80/52 = 1.5385, 80/24 = 3.3333, 80/12 = 6.6667, 80/2,080 = 0.03846
  'ten-days': {
    annualHours: '80',
    biweekly: '3.08',
    weekly: '1.54',
    semimonthly: '3.33',
    monthly: '6.67',
    perHourWorked: '0.0385',
    hoursPerPtoHour: '26',
  },
  // 120 h: 120/26 = 4.6154, 120/52 = 2.3077, 120/24 = 5, 120/12 = 10, 120/2,080 = 0.05769,
  // 2,080/120 = 17.333
  'fifteen-days': {
    annualHours: '120',
    biweekly: '4.62',
    weekly: '2.31',
    semimonthly: '5.00',
    monthly: '10.00',
    perHourWorked: '0.0577',
    hoursPerPtoHour: '17.33',
  },
  // part time, 10 days of 5 hours at 25 hours a week: 50 h: 50/26 = 1.9231, 50/52 = 0.9615,
  // 50/24 = 2.0833, 50/12 = 4.1667, 50/1,300 = 0.03846, 1,300/50 = 26
  'part-time': {
    annualHours: '50',
    biweekly: '1.92',
    weekly: '0.96',
    semimonthly: '2.08',
    monthly: '4.17',
    perHourWorked: '0.0385',
    hoursPerPtoHour: '26',
  },
} as const;

const PRIMARY =
  /^https:\/\/(www\.dol\.gov|www\.dir\.ca\.gov|cdle\.colorado\.gov|www\.lni\.wa\.gov)\//;
const paragraphsOf = (lang: 'en' | 'es'): readonly string[] =>
  PTO_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs);
const body = (lang: 'en' | 'es'): string => paragraphsOf(lang).join(' ');

describe('the PTO guide', () => {
  it('works out exactly the hand-verified policies, in order, with the engine', () => {
    expect(PTO_GUIDE_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
    for (const { id, figures } of PTO_GUIDE_EXAMPLES) expect(figures, id).toEqual(HAND[id]);
  });

  it.each(['en', 'es'] as const)(
    '%s: prints each worked policy with all its figures in one paragraph',
    (lang) => {
      for (const figures of Object.values(HAND)) {
        const paragraph = paragraphsOf(lang).find(
          (each) =>
            each.includes(`${figures.annualHours} `) && each.includes(figures.perHourWorked),
        );
        expect(paragraph, figures.annualHours).toBeDefined();
        for (const figure of Object.values(figures)) expect(paragraph).toContain(figure);
      }
    },
  );

  it.each(['en', 'es'] as const)(
    '%s: repeats the Labor Commissioner’s own worked figures as its FAQ prints them',
    (lang) => {
      // 80 h ÷ 52 = 1.538 h a week; 219 ÷ 365 = 60% of 120 h = 72 h × $13.00 = $936.00
      for (const figure of ['1.538', '219', '60%', '72', '$13.00', '$936.00', '227.3'])
        expect(body(lang), figure).toContain(figure);
    },
  );

  it('has the same sections in both languages, each with a primary source', () => {
    const { en, es } = PTO_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('keeps titles short, says it is not legal advice and sends you to your state', () => {
    for (const [lang, texts] of Object.entries(PTO_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      expect(texts.disclaimer).toMatch(
        /your state’s labor department|departamento de trabajo de tu estado/,
      );
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('opens the PTO calculator first, and the calculator links back to it', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(PTO_GUIDE[lang].ctas[0]?.href).toBe(PTO_PATHS[lang]);
      expect(PTO_TEXTS[lang].links.map(({ href }) => href)).toContain(PTO_GUIDE_PATHS[lang]);
    }
  });

  it('is an article of the route table', () => {
    expect(ROUTES).toContainEqual(expect.objectContaining({ kind: 'article', ...PTO_GUIDE_PATHS }));
  });
});
