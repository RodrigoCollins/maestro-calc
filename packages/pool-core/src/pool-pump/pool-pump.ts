import { defineCalculator, gal, quantity, Rational } from '@maestro-calc/core';

/** Minutes in the 6-hour turnover of ANSI/APSP/ICC-15 and in the gentler 8-hour run. */
const SIX_HOURS = Rational.of(360);
const EIGHT_HOURS = Rational.of(480);
/** The standard's floor: 36 gpm, whichever is greater. */
const FLOOR = Rational.of(36);

/**
 * Pool pump: the filtration flow that ANSI/APSP/ICC-15 (referenced by the 2021 ISPSC) requires of
 * a residential pool, the 6-hour turnover or 36 gpm, whichever is greater, and the flow of the
 * gentler 8-hour turnover. Each output is the volume to move in one minute (gallons per minute).
 */
export const poolPump = defineCalculator({
  id: 'pool-pump',
  inputs: [
    {
      kind: 'decimal',
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    },
  ],
  outputs: [
    {
      key: 'flow',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'gal', format: 'decimal', places: 1 },
    },
    {
      key: 'eightHour',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'gal', format: 'decimal', places: 1 },
    },
  ],
  warnings: [],
  compute: ({ gallons }) => {
    const turnover = gallons.div(SIX_HOURS);
    return {
      outputs: {
        flow: quantity(turnover.sub(FLOOR).sign() === -1 ? FLOOR : turnover, gal),
        eightHour: quantity(gallons.div(EIGHT_HOURS), gal),
      },
      shopping: [],
      warnings: [],
    };
  },
});
