import type { Money, Rational } from '@maestro-calc/core';
import type { timeCard } from '@maestro-calc/pay-core/time-card';
import { hoursText, moneyText } from '../format.ts';

type Result = Extract<ReturnType<typeof timeCard.run>, { ok: true }>['value'];
export type Lang = 'en' | 'es';

/** The value type of each output, by key. */
type Outputs = { [O in Result['outputs'][number] as O['key']]: O['value'] };

/** The value of one output of a run, by key. */
export const outputOf = <K extends keyof Outputs>(result: Result, key: K): Outputs[K] => {
  const found = result.outputs.find((output) => output.key === key);
  if (found === undefined) throw new TypeError(`no output ${key}`);
  return found.value as Outputs[K];
};

const WORDS = {
  en: {
    lead: 'My hours this week',
    overtime: 'overtime',
    double: 'double time',
    pay: 'Gross pay',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  es: {
    lead: 'Mis horas de la semana',
    overtime: 'extra',
    double: 'doble',
    pay: 'Pago bruto',
    days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  },
} as const;

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const hours = (value: Rational): string => `${hoursText(value)} h`;

/** The overtime and double time of the week, ` (9.5 h overtime)`, or nothing when there is none. */
const extraOf = (result: Result, lang: Lang): string => {
  const words = WORDS[lang];
  const extra = [
    [outputOf(result, 'overtimeHours'), words.overtime],
    [outputOf(result, 'doubleHours'), words.double],
  ] as const;
  const parts = extra
    .filter(([value]) => !value.isZero())
    .map(([value, word]) => `${hours(value)} ${word}`);
  return parts.length === 0 ? '' : ` (${parts.join(', ')})`;
};

/** The message the receipt button sends: hours, pay, the extra hours, then the link. */
export const receiptMessage = (result: Result, lang: Lang, url: string): string => {
  const pay: Money = outputOf(result, 'pay');
  return `${WORDS[lang].lead}: ${hours(outputOf(result, 'totalHours'))}, ${moneyText(pay)}${extraOf(result, lang)}.\n${url}`;
};

/**
 * The plain text the copy and share button gives: a line per day worked, the total with its
 * overtime, the gross pay, then the link that reopens the week.
 */
export const weekSummary = (result: Result, lang: Lang, url: string): string => {
  const words = WORDS[lang];
  const days = DAYS.flatMap((day, index) => {
    const value = outputOf(result, `${day}Hours`);
    return value.isZero() ? [] : [`${words.days[index] ?? day} ${hours(value)}`];
  });
  return [
    words.lead,
    ...days,
    `Total: ${hours(outputOf(result, 'totalHours'))}${extraOf(result, lang)}`,
    `${words.pay}: ${moneyText(outputOf(result, 'pay'))}`,
    url,
  ].join('\n');
};

export { sharedUrlOf, whatsappHref } from '../share/href.ts';
