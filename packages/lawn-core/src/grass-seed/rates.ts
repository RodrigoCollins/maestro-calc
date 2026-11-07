import { Rational } from '@maestro-calc/core';

/** The extension publications whose seeding rates the calculator reads. */
export const SEED_SOURCES = ['virginia-tech', 'tennessee'] as const;
export type SeedSource = (typeof SEED_SOURCES)[number];

export const SEED_SPECIES = [
  'kentucky-bluegrass',
  'tall-fescue',
  'fine-fescue',
  'perennial-ryegrass',
  'bermudagrass-hulled',
  'bermudagrass-unhulled',
  'zoysiagrass',
] as const;
export type SeedSpecies = (typeof SEED_SPECIES)[number];

/** A seeding rate, pounds of seed per 1,000 sq ft of a new lawn: low to high. */
export type SeedRate = readonly [low: Rational, high: Rational];

const R = (low: [number, number?], high: [number, number?]): SeedRate => [
  Rational.of(...low),
  Rational.of(...high),
];

/**
 * New-lawn seeding rates, pounds of seed per 1,000 sq ft, as each publication prints them
 * (checked 2026-11-07):
 * - Virginia Cooperative Extension 426-718, "Establishing Lawns", Table of seeding rates.
 * - University of Tennessee W160-B, "Turfgrass Establishment: Seeding" (Samples and Sorochan,
 *   2007), "Recommended Seeding Rate"; its fine fescues (chewings, red, sheep) are all 3 to 5, and
 *   it doubles the rate for unhulled bermudagrass seed ("The seeding rate should be doubled when
 *   using unhulled seed"), so 1/2 to 1 hulled is 1 to 2 unhulled.
 * The publications disagree by up to 50 percent for bluegrass and bermudagrass, so the calculator
 * shows the range of the one the user picks.
 */
export const SEED_RATES: Readonly<
  Record<Exclude<SeedSpecies, 'zoysiagrass'>, Readonly<Record<SeedSource, SeedRate>>>
> = {
  'kentucky-bluegrass': { 'virginia-tech': R([2], [3]), tennessee: R([3, 2], [2]) },
  'tall-fescue': { 'virginia-tech': R([4], [6]), tennessee: R([5], [8]) },
  'fine-fescue': { 'virginia-tech': R([3], [5]), tennessee: R([3], [5]) },
  'perennial-ryegrass': { 'virginia-tech': R([3], [5]), tennessee: R([4], [6]) },
  'bermudagrass-hulled': { 'virginia-tech': R([1], [3, 2]), tennessee: R([1, 2], [1]) },
  'bermudagrass-unhulled': { 'virginia-tech': R([5], [10]), tennessee: R([1], [2]) },
};

/**
 * Zoysiagrass (Zoysia japonica) seed: 1.0 to 2.0 lb pure live seed per 1,000 sq ft for rapid
 * establishment (University of Arkansas MP476, "Establishing Seeded Zoysiagrass on Lawns and Golf
 * Courses", Aaron Patton). It has one source, so the source choice does not apply to it.
 */
export const ZOYSIA_RATE: SeedRate = R([1], [2]);

/** The rate of `species` in `source`; zoysiagrass has its one rate whichever source is picked. */
export const seedRateOf = (species: SeedSpecies, source: SeedSource): SeedRate =>
  species === 'zoysiagrass' ? ZOYSIA_RATE : SEED_RATES[species][source];
