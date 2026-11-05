import { decode, Rational, usd, type Money } from '@maestro-calc/core';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { TIPPED_PATHS, TIPPED_TEXTS } from '../tipped/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { TIPPED, type Tipped } from './routes.ts';
import { CASH_WAGE, tippedWeekOf } from './tipped.ts';

const LANGS = ['en', 'es'] as const;

const ROW_KEYS = [
  'perHour',
  'totalPay',
  'wages',
  'tipsPerHour',
  'tipCredit',
  'topUp',
  'overtimePremium',
] as const;

/** A job by its name: `owed:150`, `overtime:45`, `perHour:500/40`. */
const nameOf = (job: Tipped): string => {
  if (job.question === 'owed') return `owed:${job.tips}`;
  if (job.question === 'overtime') return `overtime:${job.hours}`;
  return `perHour:${job.tips}/${job.hours}`;
};

const tippedOf = (name: string): Tipped => {
  const job = TIPPED.find((candidate) => nameOf(candidate) === name);
  if (job === undefined) throw new Error(`no tipped job ${name}`);
  return job;
};

/** The calculator's money outputs for the job's week, with the job's tips or with `tips`. */
const engine = (job: Tipped, tips = job.tips): ((key: string) => string) => {
  const ran = tippedWage.run({ cashWage: '2.13', tips, hours: job.hours });
  if (!ran.ok) throw new Error(`${nameOf(job)} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money ${key}`);
    return moneyText(value);
  };
};

const FIGURE = { owed: 'topUp', overtime: 'overtimePremium', perHour: 'tipsPerHour' } as const;

describe('tipped wage long-tail pages', () => {
  it('cover top-ups at 40 hours, overtime weeks and tips per hour, in order', () => {
    expect(TIPPED.map(nameOf)).toEqual([
      'owed:100',
      'owed:150',
      'owed:200',
      'owed:250',
      'owed:300',
      'overtime:45',
      'overtime:50',
      'overtime:55',
      'overtime:60',
      'perHour:200/20',
      'perHour:300/25',
      'perHour:500/40',
      'perHour:800/40',
    ]);
  });

  it('use the federal cash wage the calculator starts from', () => {
    const cash = tippedWage.inputs.find(({ key }) => key === 'cashWage');
    expect(cash?.default).toEqual(usd(Rational.of(213, 100)));
    expect(CASH_WAGE).toBe('2.13');
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(tippedOf('owed:150'), 'en').paths).toEqual({
      en: '/pay/2-13-an-hour-plus-150-in-tips-for-40-hours',
      es: '/es/pago/2-13-la-hora-mas-150-de-propinas-en-40-horas',
    });
    expect(longTailPageOf(tippedOf('overtime:45'), 'es').paths).toEqual({
      en: '/pay/tipped-overtime-for-45-hours-at-2-13-an-hour',
      es: '/es/pago/horas-extra-con-propinas-45-horas-a-2-13-la-hora',
    });
    expect(longTailPageOf(tippedOf('perHour:500/40'), 'en').paths).toEqual({
      en: '/pay/500-in-tips-over-40-hours-is-how-much-an-hour',
      es: '/es/pago/500-de-propinas-en-40-horas-cuanto-es-por-hora',
    });
    for (const job of TIPPED) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('take the figure and the week from the calculator, never from the text', () => {
    for (const job of TIPPED) {
      const week = engine(job);
      const figureKey = FIGURE[job.question];
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.figure).toBe(week(figureKey));
        expect(page.figureLabel).toBe(TIPPED_TEXTS[lang].outputs[figureKey]);
        const keys = ROW_KEYS.filter((key) => key !== figureKey);
        expect(page.rows.map(({ key }) => key)).toEqual(keys);
        expect(page.rows.map(({ value }) => value)).toEqual(keys.map(week));
        expect(page.rows[0]?.label).toBe(TIPPED_TEXTS[lang].figureLabel);
        expect(page.note).toBe(TIPPED_TEXTS[lang].notes[job.question === 'overtime' ? 3 : 2]);
        expect(page.kicker).toBe(TIPPED_TEXTS[lang].kicker);
      }
    }
  });

  it('owe no top-up and no overtime where the page says so', () => {
    for (const job of TIPPED) {
      const week = engine(job);
      if (job.question !== 'owed') expect(week('topUp')).toBe('$0.00');
      if (job.question !== 'overtime') expect(week('overtimePremium')).toBe('$0.00');
    }
  });

  it('answer the hand-verified cases', () => {
    // 40 x 2.13 = 85.20; + 150 = 235.20; 40 x 7.25 = 290; 290 - 235.20 = 54.80
    const owed = longTailPageOf(tippedOf('owed:150'), 'en');
    expect(owed.h1).toBe('$2.13 an hour plus $150 in tips for 40 hours: does my employer owe me?');
    expect(owed.figure).toBe('$54.80');
    expect(owed.title).toBe('$2.13 an hour plus $150 in tips, 40 hours: am I owed? $54.80');
    expect(owed.lead).toBe(
      '$2.13 an hour plus $150 in tips for 40 hours falls short of the $290 that 40 hours at the $7.25 federal minimum pay. Your $85.20 in cash wages and $150 in tips leave a $54.80 difference your employer owes you, so you earn $7.25 an hour before taxes.',
    );
    expect(owed.rows.find(({ key }) => key === 'tipCredit')?.value).toBe('$150.00');
    // 85.20 + 250 = 335.20 > 290; 335.20 / 40 = 8.38
    expect(longTailPageOf(tippedOf('owed:250'), 'es').lead).toBe(
      '$2.13 la hora más $250 de propinas en 40 horas suman $335.20, más que los $290 que pagan 40 horas al mínimo federal de $7.25. Tu empleador no te debe nada más: ganas $8.38 la hora antes de impuestos.',
    );
    // 100 tips: 40 x 5.12 = 204.80 of credit room, 100 taken, 104.80 owed
    expect(longTailPageOf(tippedOf('owed:100'), 'en').figure).toBe('$104.80');
    // 45 x 2.13 = 95.85; 5 x 7.25 / 2 = 18.125; 95.85 + 18.125 + 400 = 513.975; / 45 = 11.42
    const overtime = longTailPageOf(tippedOf('overtime:45'), 'en');
    expect(overtime.h1).toBe('What is tipped overtime for 45 hours at $2.13 an hour?');
    expect(overtime.figure).toBe('$18.13');
    expect(overtime.lead).toBe(
      'At $2.13 an hour, the 5 hours over 40 of a 45-hour week add $18.13: half of the full $7.25 minimum for each, not of $2.13. With $400 in tips, the week pays $95.85 in cash wages, the $18.13 premium and the tips: $513.98 before taxes, or $11.42 an hour.',
    );
    // 60 x 2.13 = 127.80; 20 x 3.625 = 72.50; 600.30; / 60 = 10.005
    const sesenta = longTailPageOf(tippedOf('overtime:60'), 'es');
    expect(sesenta.h1).toBe(
      '¿Cuánto pagan las horas extra con propinas en 60 horas a $2.13 la hora?',
    );
    expect(sesenta.lead).toBe(
      'Con $2.13 la hora, las 20 horas después de 40 de una semana de 60 horas suman $72.50: la mitad del mínimo completo de $7.25 por cada una, no de $2.13. Con $400 de propinas, la semana paga $127.80 de salario en efectivo, la prima de $72.50 y las propinas: $600.30 antes de impuestos, o $10.01 la hora.',
    );
    // 500 / 40 = 12.50; 85.20 + 500 = 585.20; / 40 = 14.63
    const perHour = longTailPageOf(tippedOf('perHour:500/40'), 'en');
    expect(perHour.h1).toBe('$500 in tips over 40 hours is how much an hour?');
    expect(perHour.figure).toBe('$12.50');
    expect(perHour.lead).toBe(
      '$500 in tips over 40 hours is $12.50 an hour in tips. With the $2.13 cash wage, the 40 hours pay $85.20 more, so the week comes to $585.20 before taxes, or $14.63 an hour, above the $7.25 federal minimum.',
    );
    // 300 / 25 = 12; 25 x 2.13 = 53.25; 353.25 / 25 = 14.13
    expect(longTailPageOf(tippedOf('perHour:300/25'), 'es').lead).toBe(
      '$300 de propinas en 25 horas son $12 la hora en propinas. Con el salario en efectivo de $2.13, las 25 horas pagan $53.25 más, así que la semana suma $353.25 antes de impuestos, o $14.13 la hora, más que el mínimo federal de $7.25.',
    );
  });

  it('fit a search result: titles and descriptions within bounds', () => {
    for (const job of TIPPED) {
      for (const lang of LANGS) {
        const { title, description } = longTailPageOf(job, lang);
        expect(title.length, title).toBeLessThanOrEqual(TITLE_MAX);
        expect(description.length, description).toBeLessThanOrEqual(DESCRIPTION.max);
        expect(description.length, description).toBeGreaterThanOrEqual(DESCRIPTION.min);
      }
    }
  });

  it('link the tipped wage calculator, prefilled with the week of the page', () => {
    for (const job of TIPPED) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(TIPPED_PATHS[lang]);
        expect(calculator.title).toBe(TIPPED_TEXTS[lang].title);
        const { state, issues } = decode(tippedWage, query);
        expect(issues).toEqual([]);
        const validated = tippedWage.validate(tippedWeekOf(job));
        if (!validated.ok) throw new Error('the week must validate');
        expect(state).toEqual(validated.value);
        expect(state.hours).toEqual(Rational.of(Number(job.hours)));
      }
    }
  });

  it('link the nearest other tipped pages', () => {
    const others = longTailPageOf(tippedOf('owed:150'), 'en').others.links.map(({ href }) => href);
    expect(others).toEqual([
      '/pay/2-13-an-hour-plus-100-in-tips-for-40-hours',
      '/pay/2-13-an-hour-plus-200-in-tips-for-40-hours',
      '/pay/2-13-an-hour-plus-250-in-tips-for-40-hours',
      '/pay/2-13-an-hour-plus-300-in-tips-for-40-hours',
      '/pay/tipped-overtime-for-45-hours-at-2-13-an-hour',
      '/pay/tipped-overtime-for-50-hours-at-2-13-an-hour',
    ]);
    for (const job of TIPPED) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the tipped wage calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('tipped', lang).links.map(({ href }) => href)).toEqual(
        TIPPED.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = TIPPED.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
