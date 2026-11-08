import { describe, expect, it } from 'vitest';
import {
  DIFFERENTIALS,
  DOUBLES,
  longTailPageOf,
  MINUTES,
  PTOS,
  TIPPED,
  type LongTailJob,
} from './jobs.ts';
import type { LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const bySlug = (slug: string): LongTailJob => {
  const job = [...DOUBLES, ...MINUTES, ...PTOS, ...DIFFERENTIALS, ...TIPPED].find(
    (each) => each.slug.en === slug,
  );
  if (job === undefined) throw new Error(`no job ${slug}`);
  return job;
};
const sectionOf = (slug: string, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(bySlug(slug), lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} on ${slug}`);
  return section;
};
const textOf = (section: LongTailSection): string =>
  [
    ...section.paragraphs,
    ...(section.steps ?? []),
    ...(section.after ?? []),
    section.table?.caption ?? '',
    ...(section.table?.rows.flat() ?? []),
  ].join(' ');

describe('the sections of the double-time, minutes, PTO, differential and tipped pages', () => {
  it('give every page a worked example, a table of its own and sources', () => {
    for (const job of [...DOUBLES, ...MINUTES, ...PTOS, ...DIFFERENTIALS, ...TIPPED]) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.sections?.[0]?.heading).toBe(
          lang === 'en' ? 'How the figures are worked out' : 'Cómo se calcula',
        );
        expect(page.sections?.[1]?.table?.rows.length).toBeGreaterThanOrEqual(3);
        expect(page.sources?.length).toBeGreaterThan(0);
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|\$-/);
        }
      }
    }
  });

  it('work a 14-hour California day out hour by hour', () => {
    // $20: 40 x 20 + 4 x 30 + 2 x 40 = $1,000; federal 40 x 20 + 6 x 30 = $980
    const worked = textOf(sectionOf('double-time-for-20-an-hour', 'worked'));
    expect(worked).toContain('$20 × 2 = $40.00 an hour');
    expect(worked).toContain(
      '40 regular hours ($800.00), 4 hours at time and a half ($120.00) and 2 at double time ($80.00): $1,000.00',
    );
    expect(worked).toContain('same week pays $980.00');
    // two 16-hour days: 640 federal; 16 x 20 + 8 x 30 + 8 x 40 = $880 California
    expect(sectionOf('double-time-for-20-an-hour', 'rules').table?.rows).toEqual([
      ['Three 13-hour days (39 h)', '$780.00', '$960.00'],
      ['Two 16-hour days (32 h)', '$640.00', '$880.00'],
      ['Four 12-hour days (48 h)', '$1,040.00', '$1,120.00'],
    ]);
  });

  it('show what two-place rounding does to minutes, and price them', () => {
    // 20 / 60 = 0.3333...; 0.33 x 60 = 19.8; 5 x 8.3333 = 41.67, 1.67 over 40
    const worked = textOf(sectionOf('what-is-20-minutes-in-decimal-hours', 'worked'));
    expect(worked).toContain('20 ÷ 60 = 0.3333… hours');
    expect(worked).toContain('0.33 × 60 = 19.8 minutes');
    expect(worked).toContain('41.67 hours, so 1.67 of them are over 40');
    // 30 minutes is exact
    expect(textOf(sectionOf('what-is-30-minutes-in-decimal-hours', 'worked'))).toContain(
      '0.50 × 60 = 30 minutes again',
    );
    // $20 x 1/3 = $6.67; $20 x 0.33 = $6.60; a quarter-hour clock makes 20 minutes 15
    const pay = sectionOf('what-is-20-minutes-in-decimal-hours', 'pay');
    expect(pay.table?.rows[1]).toEqual(['$20.00', '$6.67', '$6.60']);
    expect(textOf(pay)).toContain('records 20 minutes as 15 minutes, 0.25 hours');
    expect(textOf(sectionOf('what-is-40-minutes-in-decimal-hours', 'pay'))).toContain(
      'records 40 minutes as 45 minutes',
    );
  });

  it('work PTO accrual out and value it', () => {
    // 12 x 8 = 96 h; / 26 = 3.69; / 2,080 = 0.0462; 52 / 12 = 4.33 weeks; 96 / 26 x $20 = $73.85
    const worked = textOf(sectionOf('pto-per-paycheck-with-12-days-a-year', 'worked'));
    expect(worked).toContain('12 days × 8 hours = 96 hours');
    expect(worked).toContain('96 ÷ 26 paychecks = 3.69 hours');
    expect(worked).toContain('= 0.0462, or 1 hour off for every 21.67 hours');
    expect(worked).toContain('every 4.33 weeks');
    expect(sectionOf('pto-per-paycheck-with-12-days-a-year', 'value').table?.rows[1]).toEqual([
      '$20.00',
      '$73.85',
      '$1,920.00',
    ]);
  });

  it('work a shift differential week out, overtime included', () => {
    // 10% of $20 = $2; 24 x 20 + 24 x 22 = $1,008; / 48 = $21; 8 x 10.50 = $84; $1,092
    const worked = textOf(sectionOf('10-percent-shift-differential-on-20-an-hour', 'worked'));
    expect(worked).toContain('$20 × 0.1 = $2.00 an hour');
    expect(worked).toContain('$1,008.00 ÷ 48 = $21.00');
    expect(worked).toContain('$84.00 in all, so the week pays $1,092.00');
    expect(textOf(sectionOf('20-an-hour-with-a-2-dollar-shift-differential', 'worked'))).toContain(
      'a flat $2.00 an hour on top of $20',
    );
  });

  it('work a tipped week out: the top-up, the overtime premium and the tips an hour', () => {
    // 2.13 x 40 = 85.20; + 100 = 185.20; 7.25 x 40 = 290; 290 - 185.20 = 104.80
    const owed = textOf(sectionOf('2-13-an-hour-plus-100-in-tips-for-40-hours', 'worked'));
    expect(owed).toContain('$85.20 + $100.00 = $185.20');
    expect(owed).toContain('$290.00 − $185.20 = $104.80');
    // 50 h: 2.13 x 50 = 106.50; 10 x 3.625 = 36.25; + 400 = 542.75
    const overtime = textOf(sectionOf('tipped-overtime-for-50-hours-at-2-13-an-hour', 'worked'));
    expect(overtime).toContain('$106.50 + $36.25 + $400.00 = $542.75');
    // with $200 in tips the 50-hour week is short: 290 + 108.75 - 342.75 = $56
    expect(
      sectionOf('tipped-overtime-for-50-hours-at-2-13-an-hour', 'tips').table?.rows[0],
    ).toEqual(['$200.00', '$56.00', '$7.98']);
    // 500 / 40 = 12.50
    expect(
      textOf(sectionOf('500-in-tips-over-40-hours-is-how-much-an-hour', 'worked', 'es')),
    ).toContain('$500.00 ÷ 40 = $12.50');
  });
});
