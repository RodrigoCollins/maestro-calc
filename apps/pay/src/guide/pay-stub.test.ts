import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import { ROUTES } from '../routes.ts';
import { PAY_STUB_EXAMPLE, PAY_STUB_GUIDE, PAY_STUB_GUIDE_PATHS } from './pay-stub.ts';

// The sample stub, worked by hand: the time card's default week at $22 (40 h regular, 9.5 h at
// $33), a $40 cafeteria plan premium (out of both taxes' wages) and a 5% pre-tax 401(k) deferral
// (out of income tax wages only). Social Security 6.2% and Medicare 1.45%, half up to the cent.
const HAND = [
  { id: 'regular', kind: 'earning', amount: '$880.00', detail: '40 h × $22.00' },
  { id: 'overtime', kind: 'earning', amount: '$313.50', detail: '9.5 h × $33.00' },
  { id: 'gross', kind: 'total', amount: '$1,193.50' },
  { id: 'health', kind: 'deduction', amount: '-$40.00' },
  // 5% of $1,193.50 is $59.675
  { id: 'retirement', kind: 'deduction', amount: '-$59.68', detail: '5% × $1,193.50' },
  // 6.2% of $1,153.50 is $71.517
  { id: 'social-security', kind: 'deduction', amount: '-$71.52', detail: '6.2% × $1,153.50' },
  // 1.45% of $1,153.50 is $16.72575
  { id: 'medicare', kind: 'deduction', amount: '-$16.73', detail: '1.45% × $1,153.50' },
  // 1,193.50 - 40 - 59.68 - 71.52 - 16.73
  { id: 'net', kind: 'total', amount: '$1,005.57' },
  // 1,193.50 - 40 - 59.68
  { id: 'income-tax-wages', kind: 'info', amount: '$1,093.82' },
];

const PRIMARY = /^https:\/\/www\.(irs\.gov|dol\.gov|dir\.ca\.gov)\//;
const body = (lang: 'en' | 'es'): string =>
  PAY_STUB_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs).join(' ');

describe('the pay stub guide', () => {
  it('works the sample stub to the hand-verified amounts', () => {
    expect(
      PAY_STUB_EXAMPLE.map(({ id, kind, amount, detail }) => ({
        id,
        kind,
        amount: moneyText(amount),
        ...(detail === undefined ? {} : { detail }),
      })),
    ).toEqual(HAND);
  });

  it('labels every line of the sample stub in both languages, and only those', () => {
    const ids = PAY_STUB_EXAMPLE.map(({ id }) => id).sort();
    for (const texts of Object.values(PAY_STUB_GUIDE)) {
      expect(Object.keys(texts.ledger?.labels ?? {}).sort()).toEqual(ids);
      expect(texts.ledger?.lead).toMatch(/example|ejemplo/);
    }
  });

  it.each(['en', 'es'] as const)('%s: prints the 2026 FICA figures of IRS Topic 751', (lang) => {
    for (const figure of ['6.2%', '1.45%', '$184,500', '0.9%', '$200,000'])
      expect(body(lang)).toContain(figure);
  });

  it('has the same sections in both languages, each with a primary source', () => {
    const { en, es } = PAY_STUB_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(PRIMARY);
    }
  });

  it('keeps titles short, says it is not advice and links pages of its own language', () => {
    for (const [lang, texts] of Object.entries(PAY_STUB_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal or tax advice|no asesoría legal ni fiscal/);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
    expect(PAY_STUB_GUIDE.en.ctas[0]?.href).toBe(TIME_CARD_PATHS.en);
    expect(PAY_STUB_GUIDE.es.ctas[0]?.href).toBe(TIME_CARD_PATHS.es);
  });

  it('is an article of the route table', () => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({ kind: 'article', ...PAY_STUB_GUIDE_PATHS }),
    );
  });
});
