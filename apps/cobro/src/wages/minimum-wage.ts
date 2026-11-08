/**
 * The minimum wage of each state and DC, in cents an hour: a copy of the table Cuenta Horas
 * publishes (`apps/pay/src/guide/minimum-wage-states.ts`, checked on `MINIMUM_WAGE_CHECKED`), which
 * `minimum-wage.test.ts` holds equal to it state by state. The rate is the one most employers pay:
 * the state's own, or the federal $7.25 where the state has no law or a lower rate. Florida's
 * $15.00 of September 30, 2026 comes from its constitution; every other rate from the U.S.
 * Department of Labor table "State Minimum Wage Laws" (updated July 1, 2026).
 */
export interface MinimumWage {
  readonly cents: number;
  readonly source: 'dol' | 'fl';
}

export const MINIMUM_WAGE_CHECKED = '2026-11-06';

export const MINIMUM_WAGE_SOURCES = {
  dol: {
    name: 'U.S. Department of Labor, State Minimum Wage Laws (updated July 1, 2026)',
    url: 'https://www.dol.gov/agencies/whd/minimum-wage/state',
  },
  fl: {
    name: 'Florida Constitution, Article X, Section 24 ($15.00 from September 30, 2026)',
    url: 'https://www.flsenate.gov/Laws/Constitution',
  },
} as const;

/** The federal minimum wage under the FLSA, in cents an hour. */
export const FEDERAL_MINIMUM = 725;

/** New York's rate is the one of New York City, Long Island and Westchester; the rest of the state pays this. */
export const NEW_YORK_UPSTATE = 1600;
export const NEW_YORK = '36';

const dol = (cents: number): MinimumWage => ({ cents, source: 'dol' });

/** By FIPS code. */
export const MINIMUM_WAGES: Readonly<Record<string, MinimumWage>> = {
  '01': dol(725),
  '02': dol(1400),
  '04': dol(1515),
  '05': dol(1100),
  '06': dol(1690),
  '08': dol(1516),
  '09': dol(1694),
  '10': dol(1500),
  '11': dol(1840),
  '12': { cents: 1500, source: 'fl' },
  '13': dol(725),
  '15': dol(1600),
  '16': dol(725),
  '17': dol(1500),
  '18': dol(725),
  '19': dol(725),
  '20': dol(725),
  '21': dol(725),
  '22': dol(725),
  '23': dol(1510),
  '24': dol(1500),
  '25': dol(1500),
  '26': dol(1373),
  '27': dol(1141),
  '28': dol(725),
  '29': dol(1500),
  '30': dol(1085),
  '31': dol(1500),
  '32': dol(1200),
  '33': dol(725),
  '34': dol(1592),
  '35': dol(1200),
  '36': dol(1700),
  '37': dol(725),
  '38': dol(725),
  '39': dol(1100),
  '40': dol(725),
  '41': dol(1555),
  '42': dol(725),
  '44': dol(1600),
  '45': dol(725),
  '46': dol(1185),
  '47': dol(725),
  '48': dol(725),
  '49': dol(725),
  '50': dol(1442),
  '51': dol(1277),
  '53': dol(1713),
  '54': dol(875),
  '55': dol(725),
  '56': dol(725),
};

/** The minimum wage of a state or DC. */
export const minimumWageOf = (fips: string): MinimumWage => {
  const found = MINIMUM_WAGES[fips];
  if (found === undefined) throw new Error(`no minimum wage for ${fips}`);
  return found;
};
