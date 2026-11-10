import { nextOccurrence, type CivilDate, type DateRule } from '@maestro-calc/pay-core/calendar';
import { countOf, longDateOf, weeksTextOf } from './words.ts';

/*
 * The live countdown of a date page, with today given: the page's script (`client/countdown.ts`)
 * passes the visitor's local date, the tests a fixed one. The rule travels in `data-*` attributes.
 */

export interface CountdownText {
  /** `46 días`, or `¡Es hoy!` on the day. */
  readonly days: string;
  readonly weeks: string;
  /** The next date with its weekday: `viernes 25 de diciembre de 2026`. */
  readonly date: string;
  readonly today: boolean;
}

export const countdownOf = (rule: DateRule, today: CivilDate): CountdownText => {
  const { date, days } = nextOccurrence(rule, today);
  const isToday = days === 0;
  return {
    days: isToday ? '¡Es hoy!' : countOf(days, 'día', 'días'),
    weeks: isToday ? 'Hoy mismo' : weeksTextOf(days),
    date: longDateOf(date),
    today: isToday,
  };
};

/** The `data-*` values of a rule, keys without the `data-` prefix. */
export const dataOfRule = (rule: DateRule): Readonly<Record<string, string>> => {
  if (rule.kind === 'fixed') return { rule: rule.kind, m: String(rule.m), d: String(rule.d) };
  if (rule.kind === 'easter') return { rule: rule.kind, offset: String(rule.offset) };
  return {
    rule: rule.kind,
    m: String(rule.m),
    weekday: String(rule.weekday),
    n: String(rule.n),
  };
};

const intOf = (text: string | undefined): number | null =>
  text !== undefined && /^-?\d+$/.test(text) ? Number(text) : null;

/** The rule of an element's `dataset`, or `null` when a value is missing or not a whole number. */
export const ruleOfData = (data: Readonly<Record<string, string | undefined>>): DateRule | null => {
  const m = intOf(data['m']);
  if (data['rule'] === 'easter') {
    const offset = intOf(data['offset']);
    return offset === null ? null : { kind: 'easter', offset };
  }
  if (m === null) return null;
  if (data['rule'] === 'fixed') {
    const d = intOf(data['d']);
    return d === null ? null : { kind: 'fixed', m, d };
  }
  if (data['rule'] === 'nth-weekday') {
    const weekday = intOf(data['weekday']);
    const n = intOf(data['n']);
    return weekday === null || n === null ? null : { kind: 'nth-weekday', m, weekday, n };
  }
  return null;
};
