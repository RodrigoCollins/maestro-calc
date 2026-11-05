import { describe, expect, it } from 'vitest';
import { pathOf, TIPPED } from '../long-tail/routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { ROUTES } from '../routes.ts';
import { TIPPED_PATHS, TIPPED_TEXTS } from '../tipped/texts.ts';
import {
  TIP_CREDIT_GUIDE,
  TIP_CREDIT_GUIDE_CASH_WAGE_OVERTIME,
  TIP_CREDIT_GUIDE_EXAMPLES,
  TIP_CREDIT_GUIDE_LINKS,
  TIP_CREDIT_GUIDE_PATHS,
} from './tip-credit.ts';

// The weeks the guide works out, verified by hand at the $2.13 federal cash wage: the wages are
// the hours times $2.13, the tip credit is the smaller of the tips and the hours times $5.12, the
// top-up is what the tips leave of that gap, and each hour over 40 adds half of $7.25 (29 CFR
// 531.60, Fact Sheet #15).
const HAND = {
  // 40 × $2.13 = $85.20, 40 × $5.12 = $204.80 ≤ $250, $85.20 + $250 = $335.20, / 40 = $8.38
  covered: {
    wages: '$85.20',
    tipCredit: '$204.80',
    topUp: '$0.00',
    overtimeHours: '0',
    overtimePremium: '$0.00',
    totalPay: '$335.20',
    perHour: '$8.38',
  },
  // $150 < $204.80: the employer makes up $54.80, $85.20 + $54.80 + $150 = $290 = 40 × $7.25
  'top-up': {
    wages: '$85.20',
    tipCredit: '$150.00',
    topUp: '$54.80',
    overtimeHours: '0',
    overtimePremium: '$0.00',
    totalPay: '$290.00',
    perHour: '$7.25',
  },
  // 44 × $2.13 = $93.72, 44 × $5.12 = $225.28 ≤ $300, 4 × $3.625 = $14.50,
  // $93.72 + $14.50 + $300 = $408.22, / 44 = $9.2777… = $9.28
  overtime: {
    wages: '$93.72',
    tipCredit: '$225.28',
    topUp: '$0.00',
    overtimeHours: '4',
    overtimePremium: '$14.50',
    totalPay: '$408.22',
    perHour: '$9.28',
  },
} as const;

// The 44-hour week with the overtime figured on the $2.13 cash wage: 4 × $1.065 = $4.26,
// $10.24 less than the $14.50 the law requires.
const ON_CASH_WAGE = { overtimePremium: '$4.26', short: '$10.24' } as const;

const PRIMARY = /^https:\/\/(www\.ecfr\.gov|www\.dol\.gov)\//;
const paragraphsOf = (lang: 'en' | 'es'): readonly string[] =>
  TIP_CREDIT_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs);
const body = (lang: 'en' | 'es'): string => paragraphsOf(lang).join(' ');

describe('the tip credit guide', () => {
  it('works out exactly the hand-verified weeks, in order, with the engine', () => {
    expect(TIP_CREDIT_GUIDE_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
    for (const { id, figures } of TIP_CREDIT_GUIDE_EXAMPLES) expect(figures, id).toEqual(HAND[id]);
    expect(TIP_CREDIT_GUIDE_CASH_WAGE_OVERTIME).toEqual(ON_CASH_WAGE);
  });

  it.each(['en', 'es'] as const)(
    '%s: prints each worked week with all its figures in one paragraph',
    (lang) => {
      for (const figures of Object.values(HAND)) {
        const paragraph = paragraphsOf(lang).find(
          (each) => each.includes(figures.wages) && each.includes(figures.totalPay),
        );
        expect(paragraph, figures.totalPay).toBeDefined();
        for (const figure of Object.values(figures)) expect(paragraph).toContain(figure);
      }
    },
  );

  it.each(['en', 'es'] as const)(
    '%s: shows what overtime on the cash wage would cost, in one paragraph',
    (lang) => {
      const paragraph = paragraphsOf(lang).find((each) => each.includes(ON_CASH_WAGE.short));
      expect(paragraph).toBeDefined();
      for (const figure of Object.values(ON_CASH_WAGE)) expect(paragraph).toContain(figure);
    },
  );

  it.each(['en', 'es'] as const)('%s: states the federal figures and cites the rules', (lang) => {
    for (const cite of ['$2.13', '$7.25', '$5.12', '$30', '531.59', '531.60', 'Fact Sheet #15']) {
      expect(body(lang), cite).toContain(cite);
    }
  });

  it.each(['en', 'es'] as const)('%s: gives no tax-on-tips figures', (lang) => {
    expect(body(lang)).not.toMatch(/\$25,000|deduction|deducción|impuesto|\btax\b/i);
  });

  it('has the same sections in both languages, each with a primary source', () => {
    const { en, es } = TIP_CREDIT_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('sends you to the DOL table of the tipped minimum wage of each state', () => {
    const table = 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped';
    for (const lang of ['en', 'es'] as const) {
      const states = TIP_CREDIT_GUIDE[lang].sections.find(({ sources }) =>
        sources.some(({ href }) => href === table),
      );
      expect(states, lang).toBeDefined();
    }
  });

  it('keeps titles short, says it is not legal advice and sends you to your state', () => {
    for (const [lang, texts] of Object.entries(TIP_CREDIT_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      expect(texts.disclaimer).toMatch(
        /your state’s labor department|departamento de trabajo de tu estado/,
      );
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('opens the tipped wage calculator first, and the calculator links back to it', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(TIP_CREDIT_GUIDE[lang].ctas[0]?.href).toBe(TIPPED_PATHS[lang]);
      expect(TIPPED_TEXTS[lang].links.map(({ href }) => href)).toContain(
        TIP_CREDIT_GUIDE_PATHS[lang],
      );
    }
  });

  it('lists every tipped wage page in its own language', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(TIP_CREDIT_GUIDE_LINKS[lang].links.map(({ href }) => href)).toEqual(
        TIPPED.map((job) => pathOf(job, lang)),
      );
    }
  });

  it('is an article of the route table that explains the tipped wage calculator', () => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({
        id: 'tip-credit-guide',
        kind: 'article',
        ...TIP_CREDIT_GUIDE_PATHS,
      }),
    );
    expect(GUIDE_CALCULATORS['tip-credit-guide']).toEqual(['tipped-wage']);
  });
});
