import { describe, expect, it } from 'vitest';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { ROUTES } from '../routes.ts';
import { SHIFT_PATHS, SHIFT_TEXTS } from '../shift/texts.ts';
import {
  SHIFT_GUIDE,
  SHIFT_GUIDE_EXAMPLES,
  SHIFT_GUIDE_LEFT_OUT,
  SHIFT_GUIDE_PATHS,
} from './shift-differential.ts';

// The weeks the guide works out, verified by hand: the straight-time pay is the hours at each rate
// times the rate, the regular rate is that pay over all the hours (29 CFR 778.115), and each hour
// over 40 adds half of the regular rate.
const HAND = {
  // $20 + 10% = $22: 24 × $20 = $480, 16 × $22 = $352, $832 / 40 = $20.80, no overtime
  'forty-hours': {
    shiftRate: '$22.00',
    straightPay: '$832.00',
    totalHours: '40',
    regularRate: '$20.80',
    overtimeHours: '0',
    overtimePremium: '$0.00',
    pay: '$832.00',
  },
  // 24 × $20 = $480, 24 × $22 = $528, $1,008 / 48 = $21.00, 8 × $10.50 = $84, $1,092
  'forty-eight-hours': {
    shiftRate: '$22.00',
    straightPay: '$1,008.00',
    totalHours: '48',
    regularRate: '$21.00',
    overtimeHours: '8',
    overtimePremium: '$84.00',
    pay: '$1,092.00',
  },
  // $18 + $1.50 = $19.50: 30 × $18 = $540, 15 × $19.50 = $292.50, $832.50 / 45 = $18.50,
  // 5 × $9.25 = $46.25, $878.75
  'flat-amount': {
    shiftRate: '$19.50',
    straightPay: '$832.50',
    totalHours: '45',
    regularRate: '$18.50',
    overtimeHours: '5',
    overtimePremium: '$46.25',
    pay: '$878.75',
  },
} as const;

// The 48-hour week with the differential left out of the regular rate: 8 × $10 = $80, $4 short.
const LEFT_OUT = { regularRate: '$20.00', overtimePremium: '$80.00', short: '$4.00' } as const;

const PRIMARY = /^https:\/\/(www\.ecfr\.gov|www\.dol\.gov|www\.dir\.ca\.gov)\//;
const paragraphsOf = (lang: 'en' | 'es'): readonly string[] =>
  SHIFT_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs);
const body = (lang: 'en' | 'es'): string => paragraphsOf(lang).join(' ');

describe('the shift differential guide', () => {
  it('works out exactly the hand-verified weeks, in order, with the engine', () => {
    expect(SHIFT_GUIDE_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
    for (const { id, figures } of SHIFT_GUIDE_EXAMPLES) expect(figures, id).toEqual(HAND[id]);
    expect(SHIFT_GUIDE_LEFT_OUT).toEqual(LEFT_OUT);
  });

  it.each(['en', 'es'] as const)(
    '%s: prints each worked week with all its figures in one paragraph',
    (lang) => {
      for (const figures of Object.values(HAND)) {
        const paragraph = paragraphsOf(lang).find(
          (each) => each.includes(figures.straightPay) && each.includes(figures.pay),
        );
        expect(paragraph, figures.pay).toBeDefined();
        for (const figure of Object.values(figures)) expect(paragraph).toContain(figure);
      }
    },
  );

  it.each(['en', 'es'] as const)(
    '%s: shows what leaving the differential out of the regular rate costs, in one paragraph',
    (lang) => {
      const paragraph = paragraphsOf(lang).find((each) => each.includes(LEFT_OUT.short));
      expect(paragraph).toBeDefined();
      for (const figure of Object.values(LEFT_OUT)) expect(paragraph).toContain(figure);
    },
  );

  it.each(['en', 'es'] as const)(
    '%s: cites the rules it explains and the Labor Commissioner’s worked average',
    (lang) => {
      for (const cite of ['778.207', '778.115', '$10.52']) expect(body(lang), cite).toContain(cite);
    },
  );

  it('has the same sections in both languages, each with a primary source', () => {
    const { en, es } = SHIFT_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('keeps titles short, says it is not legal advice and sends you to your state', () => {
    for (const [lang, texts] of Object.entries(SHIFT_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      expect(texts.disclaimer).toMatch(
        /your state’s labor department|departamento de trabajo de tu estado/,
      );
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('opens the shift differential calculator first, and the calculator links back to it', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(SHIFT_GUIDE[lang].ctas[0]?.href).toBe(SHIFT_PATHS[lang]);
      expect(SHIFT_TEXTS[lang].links.map(({ href }) => href)).toContain(SHIFT_GUIDE_PATHS[lang]);
    }
  });

  it('is an article of the route table that explains the shift differential calculator', () => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({
        id: 'shift-differential-guide',
        kind: 'article',
        ...SHIFT_GUIDE_PATHS,
      }),
    );
    expect(GUIDE_CALCULATORS['shift-differential-guide']).toEqual(['shift-differential']);
  });
});
