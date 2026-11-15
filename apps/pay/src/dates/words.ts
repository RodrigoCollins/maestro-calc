import {
  parseIsoDate,
  shiftDate,
  weekdayOf,
  weeksAndDaysOf,
  type CivilDate,
  type DaysBetween,
} from '@maestro-calc/pay-core/calendar';

/*
 * The Spanish words of the date pages, shared by the build and the two scripts, so the figures a
 * script writes read exactly as the ones the build wrote.
 */

/** The name of the days-between calculator: its `h1` and the label of the links to it. */
export const DAYS_BETWEEN_NAME = 'Calculadora de fechas: contador de días entre dos fechas';

const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
export const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export const weekdayName = (date: CivilDate): string => WEEKDAYS[weekdayOf(date)] ?? '';
export const monthName = (m: number): string => MONTHS[m - 1] ?? '';

/** `viernes 25 de diciembre de 2026`. */
export const longDateOf = (date: CivilDate): string =>
  `${weekdayName(date)} ${String(date.d)} de ${monthName(date.m)} de ${String(date.y)}`;

/** `25 de diciembre`. */
export const shortDateOf = ({ m, d }: CivilDate): string => `${String(d)} de ${monthName(m)}`;

/** `1 día`, `46 días`. */
export const countOf = (n: number, one: string, many: string): string =>
  `${String(n)} ${n === 1 ? one : many}`;

/** `6 semanas y 4 días`, `2 semanas`, `3 días`. */
export const weeksTextOf = (total: number): string => {
  const { weeks, days } = weeksAndDaysOf(total);
  const daysText = countOf(days, 'día', 'días');
  if (weeks === 0) return daysText;
  const weeksText = countOf(weeks, 'semana', 'semanas');
  return days === 0 ? weeksText : `${weeksText} y ${daysText}`;
};

const PESOS = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Cents as Mexican pesos: `$2,400.00`. */
export const pesosOf = (cents: number): string => `$${PESOS.format(cents / 100)}`;

/** The keys of the rows of the days-between result. */
export type BetweenKey = 'weeks' | 'business';

/** The days between two dates as the calculator shows them. */
export const betweenOf = (
  between: DaysBetween,
): {
  readonly figure: string;
  readonly values: Readonly<Record<BetweenKey, string>>;
  readonly reversed: boolean;
} => ({
  figure: countOf(between.days, 'día', 'días'),
  values: {
    weeks: weeksTextOf(between.days),
    business: countOf(between.businessDays, 'día', 'días'),
  },
  reversed: between.reversed,
});

/** The keys of the rows of the add-or-subtract result. */
export type ShiftKey = 'calendar' | 'weeks' | 'business';

/** The most days the add-or-subtract form takes: five digits. */
export const SHIFT_MAX = 99_999;

/**
 * The date some days after (or, `back`, before) the date of a form, as the calculator shows it:
 * the date with its weekday, the calendar days, weeks and weekdays on the way. `null` when the
 * date is missing, the amount is not a whole number from 0 to `SHIFT_MAX`, or the date lands
 * past the calendar the engine reads.
 */
export const shiftTextOf = (form: {
  readonly from: string;
  readonly amount: string;
  readonly back: boolean;
  readonly business: boolean;
}): {
  readonly figure: string;
  readonly values: Readonly<Record<ShiftKey, string>>;
} | null => {
  const from = parseIsoDate(form.from);
  const amount = form.amount.trim();
  if (from === null || !/^\d{1,5}$/.test(amount)) return null;
  const shifted = shiftDate(from, (form.back ? -1 : 1) * Number(amount), form.business);
  if (shifted === null) return null;
  return {
    figure: longDateOf(shifted.date),
    values: {
      calendar: countOf(shifted.days, 'día', 'días'),
      weeks: weeksTextOf(shifted.days),
      business: countOf(shifted.businessDays, 'día', 'días'),
    },
  };
};
