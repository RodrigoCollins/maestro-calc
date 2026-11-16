import { PTU_CAP_DAYS, type Ptu } from '@maestro-calc/pay-core/mexico';
import { countOf, pesosOf } from '../dates/words.ts';

/*
 * The Spanish words of the PTU calculator, shared by the build and its script, so the figures the
 * script writes read exactly as the build wrote them.
 */

/** The name of the calculator: its `h1` and the label of the links to it. */
export const PTU_NAME = 'Calculadora de PTU (reparto de utilidades)';

/** What a company row reads when the PTU is estimated with the cap alone. */
export const NO_COMPANY = 'Sin las cifras de la empresa';

/** The keys of the rows of the result, in the order the page shows them. */
export type PtuKey =
  | 'salary'
  | 'pool'
  | 'half'
  | 'daysShare'
  | 'salaryShare'
  | 'beforeCap'
  | 'capMonths'
  | 'capAverage'
  | 'cap'
  | 'exempt'
  | 'taxable';

/** A PTU as the calculator shows it: the figure, each line, and the notes it needs. */
export const ptuTextOf = (
  result: Ptu,
): {
  readonly figure: string;
  readonly values: Readonly<Record<PtuKey, string>>;
  readonly belowMinimum: boolean;
  readonly capped: boolean;
  readonly estimate: boolean;
  readonly eventual: boolean;
} => {
  const { company } = result;
  const shareOf = (cents: number | undefined): string =>
    cents === undefined ? NO_COMPANY : pesosOf(cents);
  return {
    figure: pesosOf(result.ptuCents),
    values: {
      salary: pesosOf(result.salaryCents),
      pool: shareOf(company?.poolCents),
      half: shareOf(company?.halfCents),
      daysShare: shareOf(company?.daysShareCents),
      salaryShare: shareOf(company?.salaryShareCents),
      beforeCap: shareOf(company?.beforeCapCents),
      capMonths: `${pesosOf(result.capMonthsCents)} (${countOf(PTU_CAP_DAYS, 'día', 'días')})`,
      capAverage: pesosOf(result.capAverageCents),
      cap: pesosOf(result.capCents),
      exempt: pesosOf(result.exemptCents),
      taxable: pesosOf(result.taxableCents),
    },
    belowMinimum: false,
    capped: result.capped,
    estimate: company === null,
    eventual: result.underEventualDays,
  };
};
