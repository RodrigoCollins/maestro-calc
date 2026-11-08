import { describe, expect, it } from 'vitest';
import { MINIMUM_WAGE_STATES } from '../guide/minimum-wage-states.ts';
import { JOBS, longTailPageOf, type Job } from './jobs.ts';
import { SOURCES, type LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const jobOf = (kind: Job['kind'], per: Job['per'], amount: string): Job => {
  const job = JOBS.find((each) => each.kind === kind && each.per === per && each.amount === amount);
  if (job === undefined) throw new Error(`no job ${amount}`);
  return job;
};
const hourly = (amount: string): Job => jobOf('convert', 'hour', amount);
const salary = (amount: string): Job => jobOf('convert', 'year', amount);
const overtime = (amount: string): Job => jobOf('overtime', 'hour', amount);

const sectionOf = (job: Job, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(job, lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id}`);
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

describe('the sections of the pay converter and overtime pages', () => {
  it('give every page its worked figures, its own tables and its sources', () => {
    for (const job of JOBS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        const ids = page.sections?.map(({ id }) => id);
        expect(ids).toEqual(
          job.kind === 'overtime'
            ? ['worked', 'california']
            : job.per === 'hour'
              ? ['worked', 'hours', 'minimum']
              : ['worked', 'hours', 'exempt'],
        );
        expect(page.sections?.[0]?.heading).toMatch(
          lang === 'en' ? /^How the figures are worked out$/ : /^Cómo se calcula$/,
        );
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|\$-/);
        }
        expect(page.sources?.map(({ href }) => href)).toContain(SOURCES.factSheet23.href);
      }
    }
  });

  it('work an hourly rate out period by period, by hand', () => {
    // $22 x 40 = $880; x 2 = $1,760; x 52 = $45,760; / 12 = $3,813.33; / 24 = $1,906.67
    expect(sectionOf(hourly('22'), 'worked').steps).toEqual([
      'A week: $22 × 40 hours = $880.00.',
      'Every two weeks: $880.00 × 2 = $1,760.00.',
      'A year: $880.00 × 52 weeks = $45,760.00, the same as $22 × 2,080 hours.',
      'A month: $45,760.00 ÷ 12 = $3,813.33; twice a month: $45,760.00 ÷ 24 = $1,906.67.',
    ]);
    // 37.5 h: $825 a week, x 52 / 12 = $3,575, x 52 = $42,900; 20 h: $440, $1,906.67, $22,880
    const hours = sectionOf(hourly('22'), 'hours');
    expect(hours.table?.rows).toContainEqual(['37.5', '$825.00', '$3,575.00', '$42,900.00']);
    expect(hours.table?.rows[0]).toEqual(['20', '$440.00', '$1,906.67', '$22,880.00']);
    // time and a half $33: 45 h = $880 + 5 x $33 = $1,045; 50 h = $1,210; x 52 = $54,340
    const text = textOf(hours);
    expect(text).toContain('$33.00 an hour');
    expect(text).toContain('45-hour week at $1,045.00 and a 50-hour week at $1,210.00');
    expect(text).toContain('$54,340.00');
    // 50 paid weeks: $880 x 50 = $44,000
    expect(text).toContain('$44,000.00 a year instead of $45,760.00');
    expect(textOf(sectionOf(hourly('17.50'), 'worked'))).toContain('$17.50 × 40 hours = $700.00');
  });

  it('set an hourly rate against the state minimum wages of the table', () => {
    const above = MINIMUM_WAGE_STATES.filter(({ wage }) => wage > 1300);
    expect(above.length).toBeGreaterThan(0);
    const thirteen = textOf(sectionOf(hourly('13'), 'minimum'));
    expect(MINIMUM_WAGE_STATES).toHaveLength(51);
    expect(thirteen).toContain(`in ${String(above.length)} of the 50 states and DC`);
    for (const state of above) expect(thirteen).toContain(state.name.en);
    const top = MINIMUM_WAGE_STATES.toSorted((a, b) => b.wage - a.wage)[0];
    expect(textOf(sectionOf(hourly('100'), 'minimum'))).toContain(`highest`);
    expect(textOf(sectionOf(hourly('100'), 'minimum'))).toContain(String(top?.name.en));
  });

  it('work a salary out, by hours a week, and with paid or unpaid overtime', () => {
    // $60,000 / 52 = $1,153.85; / 40 = $28.85; / 26 = $2,307.69; / 24 = $2,500; / 12 = $5,000
    expect(sectionOf(salary('60000'), 'worked').steps).toEqual([
      'A week: $60,000 ÷ 52 = $1,153.85.',
      'An hour: $1,153.85 ÷ 40 = $28.85, the same as $60,000 ÷ 2,080 hours.',
      'Every two weeks: $60,000 ÷ 26 = $2,307.69; twice a month: $60,000 ÷ 24 = $2,500.00.',
      'A month: $60,000 ÷ 12 = $5,000.00.',
    ]);
    // 45 h: 60,000 / 2,340 = $25.64; 50 h: 60,000 / 2,600 = $23.08
    const hours = sectionOf(salary('60000'), 'hours');
    expect(hours.table?.rows).toContainEqual(['45', '$25.64']);
    expect(hours.table?.rows).toContainEqual(['50', '$23.08']);
    // paid: 1.5 x 28.846 = $43.27; 45 h = 1,153.846 + 216.346 = $1,370.19; 50 h = $1,586.54
    const exempt = textOf(sectionOf(salary('60000'), 'exempt'));
    expect(exempt).toContain('over the $684 a week');
    expect(exempt).toContain('$43.27');
    expect(exempt).toContain('$1,370.19');
    expect(exempt).toContain('$1,586.54');
    expect(exempt).toContain(
      'at 45 hours a week $60,000 is $25.64 an hour, and at 50 hours $23.08',
    );
    // $25,000 / 52 = $480.77, under $684
    expect(textOf(sectionOf(salary('25000'), 'exempt'))).toContain(
      '$480.77 a week, under the $684',
    );
    expect(textOf(sectionOf(salary('25000'), 'exempt', 'es'))).toContain('$480.77 a la semana');
  });

  it('work time and a half out, and price California daily overtime with the time card', () => {
    // $20 x 1.5 = $30; 10 h = $300; 50 h = $800 + $300 = $1,100; x 52 = $57,200, $15,600 overtime
    const worked = textOf(sectionOf(overtime('20'), 'worked'));
    expect(worked).toContain('$20 × 1.5 = $30.00 an hour');
    expect(worked).toContain('10 × $30.00 = $300.00');
    expect(worked).toContain('40 × $20 = $800.00');
    expect(worked).toContain('$1,100.00 before taxes');
    expect(worked).toContain('$57,200.00, of which $15,600.00 is overtime');
    // four 10 h days: $800 federal, 32 x 20 + 8 x 30 = $880 California; three 13 h days:
    // $780 federal, 24 x 20 + 12 x 30 + 3 x 40 = $960 California
    expect(sectionOf(overtime('20'), 'california').table?.rows).toEqual([
      ['Four 10-hour days (40 h)', '$800.00', '$880.00'],
      ['Five 10-hour days (50 h)', '$1,100.00', '$1,100.00'],
      ['Three 13-hour days (39 h)', '$780.00', '$960.00'],
    ]);
  });
});
