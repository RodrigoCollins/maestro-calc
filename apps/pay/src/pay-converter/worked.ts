import type { Money } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { moneyText } from '../format.ts';
import type { Lang } from '../time-card/receipt.ts';
import { PAY_CONVERTER_TEXTS, type Variant } from './texts.ts';

/*
 * How a pay converter page works its starting figures out: the engine run at the page's own
 * amount, then at the hours or weeks a reader most often changes, so each figure of the text is
 * one the calculator gives for those inputs.
 */

export interface WorkedSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

type Outputs = (key: string) => string;

const run = (
  amount: string,
  per: 'hour' | 'year',
  hoursPerWeek = '40',
  weeksPerYear = '52',
): Outputs => {
  const ran = payConverter.run({ amount, per, hoursPerWeek, weeksPerYear });
  if (!ran.ok) throw new Error(`the converter must run ${amount} per ${per}`);
  const outputs = new Map<string, Money>(ran.value.outputs.map(({ key, value }) => [key, value]));
  return (key) => {
    const value = outputs.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return moneyText(value);
  };
};

const HEADING: Readonly<Record<Lang, string>> = {
  en: 'How the figures are worked out',
  es: 'Cómo se calculan las cifras',
};

const hourlyOf = (lang: Lang): readonly string[] => {
  const amount = PAY_CONVERTER_TEXTS[lang].variants.hourly.amount;
  const full = run(amount, 'hour');
  const fifty = run(amount, 'hour', '40', '50');
  const part = run(amount, 'hour', '30');
  const rate = full('hourly');
  return lang === 'en'
    ? [
        `The calculator starts at ${rate} an hour, 40 hours a week and 52 paid weeks: ${rate} × 40 = ${full('weekly')} a week, and ${full('weekly')} × 52 = ${full('annual')} a year, the same as ${rate} × 2,080 hours. A month is the year divided by 12, ${full('monthly')}; twice a month divides it by 24, ${full('semimonthly')}; every two weeks is two weekly checks, ${full('biweekly')}.`,
        `Unpaid time off lowers the year, not the rate: with 50 paid weeks, ${rate} × 40 × 50 = ${fifty('annual')} a year, ${fifty('monthly')} a month. Part time changes the week: 30 hours at ${rate} pay ${part('weekly')} a week and ${part('annual')} over 52 weeks.`,
      ]
    : [
        `La calculadora empieza en ${rate} la hora, 40 horas a la semana y 52 semanas pagadas: ${rate} × 40 = ${full('weekly')} a la semana, y ${full('weekly')} × 52 = ${full('annual')} al año, lo mismo que ${rate} × 2,080 horas. El mes es el año entre 12, ${full('monthly')}; dos veces al mes lo divide entre 24, ${full('semimonthly')}; cada dos semanas son dos cheques semanales, ${full('biweekly')}.`,
        `Los días libres sin pago bajan el año, no la tarifa: con 50 semanas pagadas, ${rate} × 40 × 50 = ${fifty('annual')} al año, ${fifty('monthly')} al mes. El medio tiempo cambia la semana: 30 horas a ${rate} pagan ${part('weekly')} a la semana y ${part('annual')} en 52 semanas.`,
      ];
};

const salaryOf = (lang: Lang): readonly string[] => {
  const amount = PAY_CONVERTER_TEXTS[lang].variants.salary.amount;
  const full = run(amount, 'year');
  const long = run(amount, 'year', '45');
  const longer = run(amount, 'year', '50');
  const salary = full('annual');
  return lang === 'en'
    ? [
        `The calculator starts at ${salary} a year for 40 hours a week and 52 weeks: ${salary} ÷ 2,080 hours = ${full('hourly')} an hour. The year divided by 52 is ${full('weekly')} a week, by 26 ${full('biweekly')} every two weeks, by 24 ${full('semimonthly')} twice a month and by 12 ${full('monthly')} a month.`,
        `The same salary pays less an hour when the job asks for more hours: at 45 hours a week it is ${salary} ÷ 2,340 = ${long('hourly')} an hour, and at 50 hours ${salary} ÷ 2,600 = ${longer('hourly')}.`,
      ]
    : [
        `La calculadora empieza en ${salary} al año por 40 horas a la semana y 52 semanas: ${salary} ÷ 2,080 horas = ${full('hourly')} la hora. El año entre 52 da ${full('weekly')} a la semana, entre 26 ${full('biweekly')} cada dos semanas, entre 24 ${full('semimonthly')} dos veces al mes y entre 12 ${full('monthly')} al mes.`,
        `El mismo sueldo paga menos por hora si el trabajo pide más horas: con 45 horas a la semana son ${salary} ÷ 2,340 = ${long('hourly')} la hora, y con 50 horas ${salary} ÷ 2,600 = ${longer('hourly')}.`,
      ];
};

/** The worked section of one pay converter page. */
export const workedOf = (variant: Variant, lang: Lang): WorkedSection => ({
  heading: HEADING[lang],
  paragraphs: variant === 'hourly' ? hourlyOf(lang) : salaryOf(lang),
});
