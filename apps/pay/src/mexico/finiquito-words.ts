import type { Finiquito } from '@maestro-calc/pay-core/mexico';
import { pesosOf } from '../dates/words.ts';
import { serviceText } from './labor-words.ts';
import { hundredthsDaysText } from './words.ts';

/*
 * The Spanish words of the finiquito and liquidación calculator, shared by the build and its
 * script, so the figures the script writes read exactly as the build wrote them.
 */

/** The name of the calculator: its `h1` and the label of the links to it. */
export const FINIQUITO_NAME = 'Calculadora de finiquito y liquidación';

/** The keys of the rows of the result, in the order the page shows them. */
export type FiniquitoKey =
  | 'service'
  | 'sdi'
  | 'unpaid'
  | 'aguinaldo'
  | 'vacaciones'
  | 'prima'
  | 'antiguedad'
  | 'finiquito'
  | 'indemnizacion'
  | 'veinte'
  | 'liquidacion'
  | 'exempt'
  | 'taxable';

/** A finiquito as the calculator shows it: the total, each line, and the notes it needs. */
export const finiquitoTextOf = (
  result: Finiquito,
): {
  readonly figure: string;
  readonly values: Readonly<Record<FiniquitoKey, string>>;
  readonly belowMinimum: boolean;
  readonly capped: boolean;
  readonly antiguedadOwed: boolean;
} => ({
  figure: pesosOf(result.totalCents),
  values: {
    service: serviceText(result.years, result.extraDays),
    sdi: pesosOf(result.sdi.sdiCents),
    unpaid: pesosOf(result.unpaidCents),
    aguinaldo: `${pesosOf(result.aguinaldo.amountCents)} (${hundredthsDaysText(result.aguinaldo.earnedHundredths)})`,
    vacaciones: `${pesosOf(result.vacationCents)} (${hundredthsDaysText(result.vacationHundredths)})`,
    prima: pesosOf(result.primaVacacionalCents),
    antiguedad: pesosOf(result.antiguedadCents),
    finiquito: pesosOf(result.finiquitoCents),
    indemnizacion: pesosOf(result.indemnizacionCents),
    veinte: pesosOf(result.veinteDiasCents),
    liquidacion: pesosOf(result.liquidacionCents),
    exempt: pesosOf(result.isr.exemptCents),
    taxable: pesosOf(result.isr.taxableCents),
  },
  belowMinimum: result.antiguedad.floored,
  capped: result.antiguedad.capped,
  antiguedadOwed: result.antiguedad.eligible,
});
