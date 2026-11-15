import type { Isr, NetPay, PayPeriod, QuotaKey } from '@maestro-calc/pay-core/mexico-salary';
import { pesosOf } from '../dates/words.ts';

/*
 * The Spanish words of the ISR and take-home pay calculators of Mexico, shared by the build and
 * the two scripts, so the figures a script writes read exactly as the ones the build wrote.
 */

/** The name of the ISR calculator: its `h1` and the label of the links to it. */
export const ISR_NAME = 'Calculadora de ISR por sueldo 2026';
/** The name of the take-home pay calculator: its `h1` and the label of the links to it. */
export const SUELDO_NETO_NAME = 'Calculadora de sueldo neto 2026';

/** A rate in hundredths of a percent: `10.88%`. */
export const percentOf = (bp: number): string => `${(bp / 100).toFixed(2)}%`;

/** The names of the pay periods, as the select shows them. */
export const PERIOD_NAMES: Readonly<Record<PayPeriod, string>> = {
  month: 'Mensual',
  fortnight: 'Quincenal (15 días)',
  week: 'Semanal (7 días)',
};

/** The keys of the rows of the ISR result. */
export type IsrKey = 'lower' | 'excess' | 'rate' | 'marginal' | 'fixed' | 'tariff' | 'subsidy';

/** An ISR withholding as the calculator shows it. */
export const isrTextOf = (
  isr: Isr,
): {
  readonly figure: string;
  readonly values: Readonly<Record<IsrKey, string>>;
  readonly belowMinimum: boolean;
} => ({
  figure: pesosOf(isr.withheldCents),
  values: {
    lower: pesosOf(isr.row.lowerCents),
    excess: pesosOf(isr.excessCents),
    rate: percentOf(isr.row.rateBp),
    marginal: pesosOf(isr.marginalCents),
    fixed: pesosOf(isr.row.fixedCents),
    tariff: pesosOf(isr.tariffCents),
    subsidy: pesosOf(isr.subsidyAppliedCents),
  },
  // the notice of the minimum wage, from which nothing is withheld
  belowMinimum: isr.minimumWage,
});

/** The keys of the rows of the take-home pay result. */
export type NetKey = 'gross' | 'isr' | 'sbc' | QuotaKey | 'imss';

/** A take-home pay as the calculator shows it. */
export const netTextOf = (
  net: NetPay,
): {
  readonly figure: string;
  readonly values: Readonly<Record<NetKey, string>>;
  readonly belowMinimum: boolean;
} => ({
  figure: pesosOf(net.netCents),
  values: {
    gross: pesosOf(net.monthlyCents),
    isr: pesosOf(net.isr.withheldCents),
    sbc: pesosOf(net.sbcCents),
    excedente: pesosOf(net.quotas.excedente),
    dinero: pesosOf(net.quotas.dinero),
    pensionados: pesosOf(net.quotas.pensionados),
    invalidez: pesosOf(net.quotas.invalidez),
    cesantia: pesosOf(net.quotas.cesantia),
    imss: pesosOf(net.imssCents),
  },
  belowMinimum: net.minimumWage,
});
