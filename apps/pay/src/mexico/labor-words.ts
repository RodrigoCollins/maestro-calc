import type { PrimaAntiguedad, Sdi } from '@maestro-calc/pay-core/mexico';
import { countOf, pesosOf } from '../dates/words.ts';
import { hundredthsDaysText } from './words.ts';

/*
 * The Spanish words of the prima de antigüedad and salario diario integrado calculators, shared by
 * the build and their scripts, so the figures a script writes read exactly as the build wrote them.
 */

/** The name of the prima de antigüedad calculator: its `h1` and the label of the links to it. */
export const ANTIGUEDAD_NAME = 'Calculadora de prima de antigüedad';
/** The name of the salario diario integrado calculator. */
export const SDI_NAME = 'Calculadora de salario diario integrado';

/** The time of service: `4 años y 181 días`, `15 años`, `184 días`. */
export const serviceText = (years: number, days: number): string =>
  years === 0
    ? countOf(days, 'día', 'días')
    : days === 0
      ? countOf(years, 'año', 'años')
      : `${countOf(years, 'año', 'años')} y ${countOf(days, 'día', 'días')}`;

/** A factor given in ten-thousandths, to four decimals: `1.0493`. */
export const factorText = (tenThousandths: number): string => (tenThousandths / 10000).toFixed(4);

/** The keys of the rows of the prima de antigüedad result. */
export type AntiguedadKey = 'service' | 'base' | 'earned' | 'whole';

/** A prima de antigüedad as the calculator shows it: nothing owed shows $0.00. */
export const antiguedadTextOf = (
  result: PrimaAntiguedad,
): {
  readonly figure: string;
  readonly values: Readonly<Record<AntiguedadKey, string>>;
  readonly belowMinimum: boolean;
  readonly capped: boolean;
  readonly eligible: boolean;
} => ({
  figure: pesosOf(result.eligible ? result.amountCents : 0),
  values: {
    service: serviceText(result.years, result.extraDays),
    base: pesosOf(result.baseCents),
    earned: hundredthsDaysText(result.earnedHundredths),
    whole: pesosOf(result.wholeYearsCents),
  },
  belowMinimum: result.floored,
  capped: result.capped,
  eligible: result.eligible,
});

/** The keys of the rows of the salario diario integrado result. */
export type SdiKey = 'daily' | 'year' | 'factor' | 'aguinaldo' | 'prima' | 'sbc';

/** A salario diario integrado as the calculator shows it. */
export const sdiTextOf = (
  result: Sdi,
  belowMinimum: boolean,
): {
  readonly figure: string;
  readonly values: Readonly<Record<SdiKey, string>>;
  readonly belowMinimum: boolean;
  readonly capped: boolean;
} => ({
  figure: pesosOf(result.sdiCents),
  values: {
    daily: pesosOf(result.dailyCents),
    year: `Año ${String(result.serviceYear)} · ${countOf(result.vacationDays, 'día', 'días')} de vacaciones`,
    factor: factorText(result.factorTenThousandths),
    aguinaldo: pesosOf(result.aguinaldoDailyCents),
    prima: pesosOf(result.primaDailyCents),
    sbc: pesosOf(result.sbcCents),
  },
  belowMinimum,
  capped: result.capped,
});
