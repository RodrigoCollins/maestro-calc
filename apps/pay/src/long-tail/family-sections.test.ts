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

  it('price a California seventh day at the rate, against the federal rule', () => {
    // $20: Mon-Fri 40 h regular $800; Saturday is past 40 in the week, 8 h at $30 = $240;
    // Sunday, the seventh day, 8 h at $30 = $240 and 2 h at $40 = $80: $1,360.
    // Federal: 58 h, 40 at $20 = $800 and 18 at $30 = $540: $1,340
    const seventh = sectionOf('double-time-for-20-an-hour', 'seventh-day');
    expect(seventh.heading).toBe('A California seventh day at $20 an hour');
    expect(seventh.table?.rows).toEqual([
      ['Regular', '40', '$800.00', '40', '$800.00'],
      ['Time and a half', '16', '$480.00', '18', '$540.00'],
      ['Double time', '2', '$80.00', '0', '$0.00'],
      ['Week', '58', '$1,360.00', '58', '$1,340.00'],
    ]);
    expect(textOf(seventh)).toContain(
      'At $20 an hour the California week pays $1,360.00, $20.00 more than the $1,340.00 of the federal rule: the 2 hours past 8 on Sunday earn $40.00 an hour instead of $30.00.',
    );
    // $15: 600 + 16 x 22.50 = 360 + 2 x 30 = 60: $1,020; federal 600 + 18 x 22.50 = 405: $1,005
    expect(sectionOf('double-time-for-15-an-hour', 'seventh-day').table?.rows[3]).toEqual([
      'Week',
      '58',
      '$1,020.00',
      '58',
      '$1,005.00',
    ]);
    expect(sectionOf('double-time-for-20-an-hour', 'seventh-day', 'es').heading).toBe(
      'Un séptimo día en California a $20 la hora',
    );
  });

  it('hold the rate against the 2026 state minimum wages', () => {
    // California $16.90 is above $15: double time there is at least 2 x 16.90 = $33.80
    const fifteen = textOf(sectionOf('double-time-for-15-an-hour', 'minimums'));
    expect(fifteen).toContain(
      'California, the one state whose law requires double time, has a minimum wage of $16.90 in 2026 ($17.40 from January 1, 2027), above $15: a worker there earns at least $16.90 an hour, so double time is at least $33.80.',
    );
    // 11 states and DC above $15.00: Arizona $15.15 ... Washington $17.13
    expect(fifteen).toContain('11 states and DC have a 2026 minimum wage above $15:');
    expect(fifteen).toContain('Arizona ($15.15)');
    expect(fifteen).toContain('District of Columbia ($18.40)');
    expect(fifteen).toContain('Maine ($15.10)');
    // $18 is $1.10 above California's $16.90; only DC, at $18.40, is above $18
    const eighteen = textOf(sectionOf('double-time-for-18-an-hour', 'minimums'));
    expect(eighteen).toContain('so $18 is $1.10 an hour above it');
    expect(eighteen).toContain(
      'Only the District of Columbia has a 2026 minimum wage above $18, at $18.40.',
    );
    // no minimum reaches $20: the highest is DC's $18.40
    expect(textOf(sectionOf('double-time-for-20-an-hour', 'minimums'))).toContain(
      "No state and not DC has a 2026 minimum wage above $20; the highest is the District of Columbia's $18.40, $1.60 below it, so double time at $20 is $3.20 an hour over twice the highest minimum.",
    );
    expect(textOf(sectionOf('double-time-for-20-an-hour', 'minimums', 'es'))).toContain(
      'así que $20 está $3.10 la hora por encima',
    );
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

  it('show what a raise does to a percent differential and to a flat one', () => {
    // 10% follows the rate: 21 x 0.1 = 2.10, 25 x 0.1 = 2.50
    const percent = sectionOf('10-percent-shift-differential-on-20-an-hour', 'raises');
    expect(percent.heading).toBe('A 10% differential after a raise');
    expect(percent.table?.rows).toEqual([
      ['$20.00', '$2.00', '$22.00', '10%'],
      ['$21.00', '$2.10', '$23.10', '10%'],
      ['$22.00', '$2.20', '$24.20', '10%'],
      ['$23.00', '$2.30', '$25.30', '10%'],
      ['$25.00', '$2.50', '$27.50', '10%'],
    ]);
    // a flat $2 stays $2: 2 / 21 = 9.52%, 2 / 22 = 9.09%, 2 / 23 = 8.70%, 2 / 25 = 8%
    const flat = sectionOf('20-an-hour-with-a-2-dollar-shift-differential', 'raises');
    expect(flat.heading).toBe('A $2.00 differential after a raise');
    expect(flat.table?.rows).toEqual([
      ['$20.00', '$2.00', '$22.00', '10%'],
      ['$21.00', '$2.00', '$23.00', '9.52%'],
      ['$22.00', '$2.00', '$24.00', '9.09%'],
      ['$23.00', '$2.00', '$25.00', '8.7%'],
      ['$25.00', '$2.00', '$27.00', '8%'],
    ]);
    // the two pages meet at $20 and say so, each linking the other
    expect(textOf(flat)).toContain(
      'At $20 a flat $2.00 is the same $2.00 an hour as a 10% differential; after a $5 raise to $25 it is $0.50 an hour less than 10% would pay.',
    );
    expect(flat.links?.[0]?.href).toBe('/pay/10-percent-shift-differential-on-20-an-hour');
    expect(textOf(percent)).toContain(
      'At $20 a 10% differential is the same $2.00 an hour as a flat $2.00; after a $5 raise to $25 it pays $0.50 an hour more.',
    );
    expect(percent.links?.[0]?.href).toBe('/pay/20-an-hour-with-a-2-dollar-shift-differential');
    // a flat page prices a 40-hour week with part of it on the shift: 40 x 20 + 8 x 2 = $816
    const week = sectionOf('20-an-hour-with-a-2-dollar-shift-differential', 'hours');
    expect(week.heading).toBe('A 40-hour week with some of it on the shift');
    expect(week.table?.rows).toEqual([
      ['8', '$816.00', '$16.00'],
      ['16', '$832.00', '$32.00'],
      ['24', '$848.00', '$48.00'],
      ['32', '$864.00', '$64.00'],
      ['40', '$880.00', '$80.00'],
    ]);
    // the percent page keeps the weeks of shift hours only: 8 x 22 = $176
    expect(
      sectionOf('10-percent-shift-differential-on-20-an-hour', 'hours').table?.rows[0],
    ).toEqual(['8', '$176.00', '$16.00']);
    // 15% on $18 has no flat twin: no link, no comparison
    const alone = sectionOf('10-percent-shift-differential-on-18-an-hour', 'raises');
    expect(alone.links).toBeUndefined();
    expect(sectionOf('10-percent-shift-differential-on-20-an-hour', 'raises', 'es').heading).toBe(
      'Un diferencial del 10% después de un aumento',
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
