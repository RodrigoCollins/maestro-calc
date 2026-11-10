import {
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
export const DAYS_BETWEEN_NAME = 'Calculadora de días entre fechas';

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
