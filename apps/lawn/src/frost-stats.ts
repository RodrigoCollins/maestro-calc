import type { Station } from '@maestro-calc/lawn-data/frost/types';

/*
 * Figures of a group of frost stations (a USDA zone, or the part of a state in one zone): the
 * middle and the middle half of their 50% last spring and first fall 32°F freeze dates. NOAA counts
 * the season from August 1 (`@maestro-calc/lawn-data/frost/types`), so a spring day of 213 or more
 * lies in the year before and a fall day under 213 in the year after; dates are ordered that way.
 */

const SEASON_START = 213;
const YEAR = 365;

/** A spring day on the season's line: a day from August on belongs to the year before. */
export const springOrder = (day: number): number => (day >= SEASON_START ? day - YEAR : day);
/** A fall day on the season's line: a day before August belongs to the year after. */
export const fallOrder = (day: number): number => (day < SEASON_START ? day + YEAR : day);

/** A day of the 365-day calendar moved by `days`, wrapped into 1..365. */
export const shiftDay = (day: number, days: number): number =>
  ((((day - 1 + days) % YEAR) + YEAR) % YEAR) + 1;

/** The value at share `at` (0..1) of a sorted list: the lower of two when it falls between. */
export const quantileOf = <T>(sorted: readonly T[], at: number): T | undefined =>
  sorted[Math.floor((sorted.length - 1) * at)];

/** The lower quarter, the middle and the upper quarter of a set of values. */
export interface Spread {
  readonly low: number;
  readonly middle: number;
  readonly high: number;
}

export interface FrostStats {
  /** Stations in the group, dated or not. */
  readonly stations: number;
  /** Stations with both 50% dates. */
  readonly dated: number;
  /** Day numbers of the 50% last spring freeze. */
  readonly spring: Spread;
  /** Day numbers of the 50% first fall freeze. */
  readonly fall: Spread;
  /** Days between the two 50% dates. */
  readonly season: Spread;
}

const spreadOf = (values: readonly number[], back: (order: number) => number): Spread => {
  const sorted = values.toSorted((a, b) => a - b);
  const at = (share: number): number => back(quantileOf(sorted, share) ?? Number.NaN);
  return { low: at(0.25), middle: at(0.5), high: at(0.75) };
};

/** A day back from the season's line to the 365-day calendar. */
const dayOf = (order: number): number => shiftDay(order, 0);

/** The figures of `stations`, or `undefined` when none has both 50% dates. */
export const frostStatsOf = (stations: readonly Station[]): FrostStats | undefined => {
  const dated = stations.flatMap(({ spring: [, spring], fall: [, fall], year }) =>
    year === 'always-freezing' || spring === null || fall === null
      ? []
      : [{ spring: springOrder(spring), fall: fallOrder(fall) }],
  );
  if (dated.length === 0) return undefined;
  return {
    stations: stations.length,
    dated: dated.length,
    spring: spreadOf(
      dated.map(({ spring }) => spring),
      dayOf,
    ),
    fall: spreadOf(
      dated.map(({ fall }) => fall),
      dayOf,
    ),
    season: spreadOf(
      dated.map(({ spring, fall }) => fall - spring),
      (days) => days,
    ),
  };
};
