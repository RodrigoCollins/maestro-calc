import { monthDayOfDay } from '@maestro-calc/lawn-data/frost/calendar';
import { shiftDay } from './frost-stats.ts';
import type { GuideSource } from './guide.ts';
import { READ } from './seed-sources.ts';

/*
 * The frost-timed rules the zone and state pages work their dates from. Each is a number of days,
 * weeks or months before or after a frost date that an extension publication prints, applied to
 * the 50% NOAA freeze dates of the stations; none is our own.
 */

const read = (name: string, url: string): GuideSource => ({
  name: `${name}, accessed ${READ}`,
  url,
});

export const RULE_SOURCES = {
  illinois: read(
    'Illinois Extension, “Choose the right grass seed for a thriving lawn” (2020)',
    'https://extension.illinois.edu/news-releases/choose-right-grass-seed-thriving-lawn',
  ),
  uga: read(
    'UGA Cooperative Extension Circular 802, “Professional Grounds Management Calendar”',
    'https://fieldreport.caes.uga.edu/wp-content/uploads/2022/08/C802-Reviewed-2026.pdf',
  ),
  ugaEstablish: read(
    'UGA Cooperative Extension Bulletin 1533-2, “Lawns in Georgia: Establishment” (2021)',
    'https://fieldreport.caes.uga.edu/publications/B1533-2/lawns-in-georgia-establishment/',
  ),
  oklahoma: read(
    'Oklahoma Cooperative Extension Service HLA-6419, “Establishing a Lawn”',
    'https://pods.okstate.edu/fact-sheets/HLA-6419pod.pdf',
  ),
  turffiles: read(
    'NC State TurfFiles, “Time for Fall Seeding of Tall Fescue” (2025)',
    'https://www.turffiles.ncsu.edu/2025/09/time-for-fall-seeding-of-tall-fescue/',
  ),
  texas: read(
    'Texas A&M AgriLife Extension E-436, “Fertilizing Texas Lawns: 10-Point Checklist for Warm-Season Grasses”',
    'https://agrilifeextension.tamu.edu/wp-content/uploads/2025/06/Fertilizing-Texas-Lawns.pdf',
  ),
  ncBermuda: read(
    'NC State Extension AG-431, “Bermudagrass Lawn Maintenance Calendar” (2021)',
    'https://content.ces.ncsu.edu/bermudagrass-lawn-maintenance-calendar',
  ),
  purdue: read(
    'Purdue Extension AY-22-W, “Fertilizing Established Cool-season Lawns” (2013)',
    'https://www.extension.purdue.edu/extmedia/ay/ay-22-w.pdf',
  ),
  unh: read(
    'UNH Extension, “Growing Vegetables: When to Plant Your Vegetable Garden”',
    'https://extension.unh.edu/resource/growing-vegetables-when-plant-your-vegetable-garden-fact-sheet',
  ),
} as const;

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** A day of the 365-day calendar `months` whole months earlier, at most the last day of that month. */
export const monthsBefore = (day: number, months: number): number => {
  const { month, day: date } = monthDayOfDay(day);
  const target = (((month - 1 - months) % 12) + 12) % 12;
  const kept = Math.min(date, DAYS_PER_MONTH[target] ?? 31);
  return DAYS_PER_MONTH.slice(0, target).reduce((sum, length) => sum + length, kept);
};

/**
 * Cool-season seed before the first fall freeze: at least 45 days (Illinois Extension), or at
 * least four to six weeks (UGA Circular 802).
 */
export const coolSeedBy = (fall: number) => ({
  days45: shiftDay(fall, -45),
  weeks6: shiftDay(fall, -42),
  weeks4: shiftDay(fall, -28),
});

/** Warm-season sprigs and plugs at least two months before the first fall frost (Oklahoma HLA-6419). */
export const warmPlugBy = (fall: number): number => monthsBefore(fall, 2);

/** The first warm-season feeding, usually about 6 weeks after the average last spring frost (E-436). */
export const warmFeedFirst = (spring: number): number => shiftDay(spring, 42);

/**
 * The last warm-season nitrogen: no later than 6 weeks before the expected autumn frost (Texas
 * E-436), or four weeks before the first expected frost (NC State AG-431).
 */
export const warmFeedLast = (fall: number) => ({
  weeks6: shiftDay(fall, -42),
  weeks4: shiftDay(fall, -28),
});

/**
 * The UNH Extension planting table, in days from the last spring frost: a negative number is
 * before it. A crop with one figure has `from` equal to `to`.
 */
const UNH: readonly (readonly [crop: string, from: number, to: number])[] = [
  ['Cabbage transplants', -28, -28],
  ['Lettuce transplants', -28, -21],
  ['Radish seed', -28, -14],
  ['Seed potatoes', -14, -7],
  ['Bean seed', 0, 0],
  ['Tomato transplants', 7, 14],
  ['Pepper transplants', 14, 14],
  ['Summer squash transplants', 14, 14],
];

/** When each crop of the UNH table goes in, around the last spring freeze `spring`. */
export const vegetablesOf = (
  spring: number,
): readonly { readonly crop: string; readonly from: number; readonly to: number }[] =>
  UNH.map(([crop, from, to]) => ({
    crop,
    from: shiftDay(spring, from),
    to: shiftDay(spring, to),
  }));
