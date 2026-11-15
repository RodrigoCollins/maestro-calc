import type { Aguinaldo, Vacaciones } from '@maestro-calc/pay-core/mexico';
import { countOf, longDateOf, pesosOf } from '../dates/words.ts';

/*
 * The Spanish words of the Mexico labor pages, shared by the build and the two scripts, so the
 * figures a script writes read exactly as the ones the build wrote.
 */

/** The name of the aguinaldo calculator: its `h1` and the label of the links to it. */
export const AGUINALDO_NAME = 'Calculadora de aguinaldo';
/** The name of the vacation calculator: its `h1` and the label of the links to it. */
export const VACACIONES_NAME = 'Calculadora de vacaciones y prima vacacional';

/** Days given in hundredths: `15 días`, `1 día`, `7.56 días`. */
export const hundredthsDaysText = (hundredths: number): string =>
  hundredths % 100 === 0
    ? countOf(hundredths / 100, 'día', 'días')
    : `${(hundredths / 100).toFixed(2)} días`;

/** The keys of the rows of the aguinaldo result. */
export type AguinaldoKey = 'daily' | 'worked' | 'earned' | 'exempt' | 'taxable';

/** An aguinaldo as the calculator shows it. */
export const aguinaldoTextOf = (
  result: Aguinaldo,
): {
  readonly figure: string;
  readonly values: Readonly<Record<AguinaldoKey, string>>;
  readonly belowMinimum: boolean;
} => ({
  figure: pesosOf(result.amountCents),
  values: {
    daily: pesosOf(result.dailyCents),
    worked: countOf(result.daysWorked, 'día', 'días'),
    earned: hundredthsDaysText(result.earnedHundredths),
    exempt: pesosOf(result.exemptCents),
    taxable: pesosOf(result.taxableCents),
  },
  belowMinimum: result.belowMinimum,
});

/** The keys of the rows of the vacation result. */
export type VacacionesKey = 'years' | 'pay' | 'prima' | 'exempt' | 'taxable' | 'next';

/** The vacation days of a count as the calculator shows them. */
export const vacacionesTextOf = (
  result: Vacaciones,
): {
  readonly figure: string;
  readonly values: Readonly<Record<VacacionesKey, string>>;
  readonly earned: boolean;
  readonly belowMinimum: boolean;
} => ({
  figure: countOf(result.days, 'día', 'días'),
  values: {
    years: countOf(result.years, 'año', 'años'),
    pay: pesosOf(result.payCents),
    prima: pesosOf(result.primaCents),
    exempt: pesosOf(result.primaExemptCents),
    taxable: pesosOf(result.primaTaxableCents),
    next: `${countOf(result.next.days, 'día', 'días')} desde el ${longDateOf(result.next.date)}`,
  },
  earned: result.earned,
  belowMinimum: result.belowMinimum,
});
