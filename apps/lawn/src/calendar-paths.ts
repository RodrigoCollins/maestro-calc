import { STATES, type StateEntry } from '@maestro-calc/lawn-data/frost/states';
import { PAGE_ZONES } from './zoned.ts';

/** The planting zone index and the address of the page of half zone `label` (`7b`). */
export const ZONE_INDEX_PATH = '/planting-zones';
export const zonePathOf = (label: string): string => `${ZONE_INDEX_PATH}/zone-${label}`;

/** The address of the grass seed calendar of state `slug`, below the planting guide. */
export const seedStatePathOf = (slug: string): string => `/when-to-plant-grass-seed/${slug}`;

/** The address of the fertilizer calendar of state `slug`. */
export const feedStatePathOf = (slug: string): string => `/when-to-fertilize-lawn/${slug}`;

/**
 * The states with a seed and a fertilizer calendar: the 21 most populous in the 2020 Census
 * resident population, in that order, but Massachusetts (15th), whose extension pages could not
 * be read to cite; Colorado (21st) takes its place.
 */
export const CALENDAR_STATE_CODES = [
  'CA',
  'TX',
  'FL',
  'NY',
  'PA',
  'IL',
  'OH',
  'GA',
  'NC',
  'MI',
  'NJ',
  'VA',
  'WA',
  'AZ',
  'TN',
  'IN',
  'MD',
  'MO',
  'WI',
  'CO',
] as const;

export type CalendarStateCode = (typeof CALENDAR_STATE_CODES)[number];

/** The states of `CALENDAR_STATE_CODES`, as frost data entries, in population order. */
export const CALENDAR_STATES: readonly StateEntry[] = CALENDAR_STATE_CODES.map((code) => {
  const state = STATES.find((candidate) => candidate.code === code);
  if (state === undefined) throw new Error(`no state ${code}`);
  return state;
});

/** The zone labels with a page, coldest first. */
export const ZONE_LABELS: readonly string[] = PAGE_ZONES.map(({ label }) => label);
