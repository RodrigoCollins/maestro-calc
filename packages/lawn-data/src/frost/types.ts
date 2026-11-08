/**
 * Day-of-year numbers of a 365-day calendar (1 = January 1, 365 = December 31; there is no
 * February 29 in the source), in the order the NOAA fields give them: the 10, 50 and 90 percent
 * probability columns (`...T32FP10`, `...T32FP50`, `...T32FP90`). `null` is a missing value.
 *
 * NOAA computes the dates over August 1 to July 30: in warm climates a spring date can lie in the
 * previous calendar year (day number 213 or more) and a fall date in the next (below 213). Show the
 * month and day; never attach a year to a day number without that in mind.
 */
export type Triple = readonly [p10: number | null, p50: number | null, p90: number | null];

export interface Station {
  /** GHCN-Daily station id, e.g. `USC00053005`. */
  readonly id: string;
  /** NOAA station name as given, upper case, without the `, ST US` suffix. */
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  /** Meters above mean sea level; `null` when NOAA gives none. */
  readonly elevation: number | null;
  /** Last 32 F freeze of spring (`ANN-TMIN-PRBLST-T32FP10/50/90`). */
  readonly spring: Triple;
  /** First 32 F freeze of fall (`ANN-TMIN-PRBFST-T32FP10/50/90`). */
  readonly fall: Triple;
  /**
   * Present only for NOAA's measurement flag `V` ("Year-round risk of frost-freeze; too cold to
   * compute"): both triples are then all `null`.
   */
  readonly year?: 'always-freezing';
}
