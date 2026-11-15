import type { CalendarStateCode } from './calendar-paths.ts';
import { RULE_SOURCES } from './calendar-rules.ts';
import type { GuideSource } from './guide.ts';
import {
  AL_FESCUE,
  AL_SCHEDULE,
  AR_BERMUDA,
  AR_CENTIPEDE,
  AR_FESCUE,
  AR_ZOYSIA,
  ARIZONA,
  CORNELL_FEED,
  CSU_FEED,
  FL_FEED,
  IL_FALL,
  KS_GUIDE,
  KS_RATES,
  KY_FEED,
  MIZZOU,
  MS_LAWN,
  SC_BERMUDA,
  SC_FESCUE,
  NC_HANDBOOK,
  PURDUE_FEED,
  RUTGERS_FEED,
  TX_FEED,
  UGA_CALENDAR,
  UGA_SPRING,
  UT_FEED,
  UW_FEED,
  VA_FEED,
  WSU,
} from './state-calendars.ts';

/*
 * How much nitrogen the extension service of each calendar state gives a home lawn: the pounds of
 * N per 1,000 sq ft of one feeding and of a year, by grass, as each publication prints them. Every
 * item restates a passage or a table of the sources it names; nothing here is worked out. The
 * one feeding a page works through the fertilizer calculator is the published figure `feeding`.
 */

/** The day the rate publications below were read. */
export const RATES_READ = '2026-11-10';

const read = (name: string, url: string): GuideSource => ({
  name: `${name}, accessed ${RATES_READ}`,
  url,
});

/** The nitrogen rates of one state. */
export interface StateRates {
  /** Pounds of N per 1,000 sq ft of the one feeding worked out, a figure the source prints. */
  readonly feeding: number;
  /** What `feeding` is the rate of, as the worked example names it. */
  readonly of: string;
  /** One line per grass or level of care, in the words of the source. */
  readonly items: readonly string[];
  readonly sources: readonly GuideSource[];
}

const UC_RATES = read(
  'UC IPM, UC Guide to Healthy Lawns, “Recommended fertilizer rates for established lawns”',
  'https://ipm.ucanr.edu/TOOLS/TURF/MAINTAIN/fertrate.html',
);
const UC_AMOUNT = read(
  'UC IPM, UC Guide to Healthy Lawns, “Fertilization: amount of material to use and frequency of application”',
  'https://ipm.ucanr.edu/TOOLS/TURF/MAINTAIN/fertamt.html',
);
const PSU_LAB = read(
  'Penn State Agricultural Analytical Services Laboratory, “Home Lawn to Maintain”, turf recommendation 2001 (2017)',
  'https://agsci.psu.edu/aasl/soil-testing/fertility/handbooks/turf/recommendations/2001-home-lawn-maintain',
);
const OHIO_RATES = read(
  'Ohio State University Extension HYG-4031, “Natural Organic Lawn Care” (2017)',
  'https://cfaes.osu.edu/fact-sheet/natural-organic-lawn-care',
);
const NC_FESCUE = read(
  'NC State Extension AG-367, “Tall Fescue Lawn Maintenance Calendar” (2021)',
  'https://content.ces.ncsu.edu/tall-fescue-lawn-maintenance-calendar',
);
const MSU_RATES = read(
  'Michigan State University Extension E-0021, “Phosphorus and Home Lawns” (2005, archive copy)',
  'https://sanweb.lib.msu.edu/DMC/extension_publications/E0021TURF/E0021TURF.pdf',
);
const UMD_RATES = read(
  'University of Maryland Extension, “Lawn Care Best Management Practices” (slides)',
  'https://extension.umd.edu/sites/extension.umd.edu/files/2021-02/Lawn%20Basics.pdf',
);
const UMD_BAY = read(
  'University of Maryland Extension, “You and the Chesapeake Bay: Your Lawn” (2021)',
  'https://extension.umd.edu/resource/you-and-chesapeake-bay-your-lawn',
);
const UW_RATES = read(
  'University of Wisconsin-Extension A2303, “Lawn Fertilization” (2011)',
  'https://barron.extension.wisc.edu/files/2023/02/Lawn-Fertilization.pdf',
);

/** The nitrogen rates of every calendar state, by its postal code. */
export const STATE_RATES: Readonly<Record<CalendarStateCode, StateRates>> = {
  CA: {
    feeding: 1,
    of: 'the most UC IPM puts down in one application',
    items: [
      'Any lawn: no more than 1 lb of N per 1,000 sq ft in one application; UC IPM’s example program is four applications of 0.5 to 1 lb.',
      'Tall fescue: 3 to 6 lb of N per 1,000 sq ft a year; Kentucky bluegrass and perennial ryegrass 4 to 6 lb.',
      'Bermudagrass: 2 to 4 lb a year for seeded types, 4 to 6 lb for the hybrids; St. Augustinegrass 4 lb; zoysiagrass 2 to 4 lb.',
      'Buffalograss and the fine fescues (red and hard fescue): 1 to 2 lb a year.',
    ],
    sources: [UC_RATES, UC_AMOUNT],
  },
  TX: {
    feeding: 1,
    of: 'the most E-436 puts down in one application',
    items: [
      'Any warm-season lawn: split the year’s nitrogen into applications of ½ to 1 lb of N per 1,000 sq ft, at least 45 to 60 days apart.',
      'Bermudagrass at moderate maintenance: 2 to 3 lb of N per 1,000 sq ft a year for common types, 3 to 4 lb for the hybrids; up to 4 to 5 and 5 to 6 lb at high maintenance.',
      'St. Augustinegrass at moderate maintenance: 2 to 3 lb a year in sun, 1 to 2 lb in shade.',
      'Zoysiagrass 2 to 3 lb a year, centipedegrass 1 to 2 lb and buffalograss 2 lb, at moderate maintenance.',
    ],
    sources: [TX_FEED],
  },
  FL: {
    feeding: 1,
    of: 'a complete fertilizer application in UF/IFAS’s calendar',
    items: [
      'A complete fertilizer application: 1.0 lb of N per 1,000 sq ft, of which no more than 0.7 lb is water-soluble.',
      'Water-soluble nitrogen alone: no more than 0.7 lb of N per 1,000 sq ft at a time.',
      'Slow-release nitrogen: up to 2.0 lb of N per 1,000 sq ft in spring and summer, no more than 1.0 lb in fall and winter.',
      'UF/IFAS’s fertilizer calendar does not give a yearly total; it sets one to several applications a year by grass, region and level of maintenance.',
    ],
    sources: [FL_FEED],
  },
  NY: {
    feeding: 1,
    of: 'the most Cornell puts down at once',
    items: [
      'Any lawn: never more than 1 lb of N per 1,000 sq ft in one feeding.',
      'Good lawns: 0 to 1 feeding a year, in September.',
      'Better lawns: 1 to 2 feedings a year, in September and, as needed, in May.',
      'Highest-quality lawns: 3 to 4 feedings a year, in September and, as needed, in May, June or October.',
      'Leaving the clippings on the lawn cuts the nitrogen it needs by 25 to 50%.',
    ],
    sources: [CORNELL_FEED],
  },
  PA: {
    feeding: 1,
    of: 'the top of Penn State’s range for one application',
    items: [
      'Any lawn: 0.75 to 1.0 lb of N per 1,000 sq ft per application, never more than 1 lb.',
      'Kentucky bluegrass and perennial ryegrass: 1 to 2 lb of N per 1,000 sq ft a year at low to medium maintenance, 2 to 4 lb at high.',
      'Tall fescue: 1 to 2 lb a year at low to medium maintenance, 2 to 3 lb at high; fine fescues 1 lb and 2 lb.',
      'A 2 lb program goes on in two applications, in spring and in late summer or fall.',
    ],
    sources: [PSU_LAB],
  },
  IL: {
    feeding: 1,
    of: 'the fall feeding of Illinois Extension',
    items: [
      'A cool-season lawn: 1 lb of N per 1,000 sq ft for the fall feeding.',
      'Illinois Extension’s fall tips give no yearly total.',
    ],
    sources: [IL_FALL],
  },
  OH: {
    feeding: 1,
    of: 'Ohio State’s rule of thumb for one application',
    items: [
      'Any lawn: as a rule of thumb, 1 lb of actual N per 1,000 sq ft per application.',
      'Turf-type tall fescue and fine fescue: 1 to 2 lb of N per 1,000 sq ft a year at low maintenance, 2.5 to 4 lb at high.',
      'Kentucky bluegrass and perennial ryegrass: 2 to 3 lb of N per 1,000 sq ft a year at low maintenance, 3.5 to 5 lb at high.',
      'For home lawns, a late summer or fall (September) and a late fall (November) feeding work best.',
    ],
    sources: [OHIO_RATES],
  },
  GA: {
    feeding: 1,
    of: 'UGA’s monthly rate in the growing season',
    items: [
      'Any turfgrass: generally 1 lb of water-soluble N per 1,000 sq ft per month while it grows; better four feedings of 1 lb on bermudagrass than one of 4 lb.',
      'Bermudagrass: 4 to 6 lb of N per 1,000 sq ft a year in UGA’s grounds calendar, 2 to 4 lb in its advice to homeowners.',
      'Tall fescue and St. Augustinegrass: 2 to 5 lb a year in the calendar, 2 to 4 lb for homeowners.',
      'Zoysiagrass: 2 to 4 lb a year in the calendar, 2 to 3 lb for homeowners; centipedegrass 1 to 2 lb in both.',
      'Where the clippings are taken away, UGA raises the rate by 30%.',
    ],
    sources: [UGA_CALENDAR, UGA_SPRING],
  },
  NC: {
    feeding: 1,
    of: 'the September feeding of NC State’s tall fescue calendar',
    items: [
      'Tall fescue: 1 lb of N per 1,000 sq ft in mid-September, again in November and in February; only 1/5 to ½ lb in spring and summer.',
      'Tall fescue: 2.5 to 3.5 lb of N per 1,000 sq ft a year; Kentucky bluegrass 1.5 to 2.5 lb.',
      'Bermudagrass: ½ to 1 lb a few weeks after full green-up, then 1 lb every four to six weeks in summer, and no more than ½ lb in September or four weeks before the first expected frost.',
      'Centipedegrass: 1 to 1.5 lb a year; St. Augustinegrass 2.5 to 4 lb.',
    ],
    sources: [NC_FESCUE, RULE_SOURCES.ncBermuda, NC_HANDBOOK],
  },
  MI: {
    feeding: 1,
    of: 'Michigan State’s rate for one application',
    items: [
      'Any lawn: about 1 lb of actual N per 1,000 sq ft per application.',
      'Michigan State’s bulletin gives the rate of one application, not a yearly total.',
    ],
    sources: [MSU_RATES],
  },
  NJ: {
    feeding: 1,
    of: 'the late summer feeding of a lawn in full sun',
    items: [
      'A lawn in full sun: about 1 lb of N per 1,000 sq ft in late summer to early fall, and again in late fall if the soil test calls for it.',
      'Low maintenance: 0 to 2 feedings a season, 0 to 2 lb of N per 1,000 sq ft a year.',
      'Moderate maintenance: 2 to 3 feedings, 2 to 4 lb a year; higher maintenance 3 to 6 feedings, 3 to 5 lb a year.',
      'A shaded lawn: no more than 2 lb a year in all.',
    ],
    sources: [RUTGERS_FEED],
  },
  VA: {
    feeding: 0.7,
    of: 'Virginia’s monthly limit of available N for cool-season grass',
    items: [
      'Tall fescue, Kentucky bluegrass and perennial ryegrass: 0.7 lb of N per 1,000 sq ft in September and in October, an optional 0.5 lb in November, 0.5 to 0.7 lb across April and May, none from June through August; 2 to 3.5 lb a year.',
      'Fine fescue: 0.7 lb in September and 0.7 lb in April; 1 to 2 lb a year.',
      'Bermudagrass and St. Augustinegrass: 0.5 lb in April, 0.7 lb a month from May through July and 0.5 lb in August; 2 to 4 lb a year.',
      'Zoysiagrass and centipedegrass: 0.7 lb in May and 0.7 lb in July; 1 to 2 lb a year.',
      'Those are mostly water-soluble programs; with more slow-release nitrogen, 15 to 49%, a feeding can be 0.9 lb on cool-season grass and 1.0 lb on warm-season grass.',
    ],
    sources: [VA_FEED],
  },
  WA: {
    feeding: 1,
    of: 'one of WSU’s four equal applications',
    items: [
      'Any Washington lawn: 4 lb of N per 1,000 sq ft a year, in four equal applications of 1 lb.',
      'With a quick-release fertilizer on sandy soil, split each 1 lb application into two of ½ lb.',
      'The fall application is the one for the best lawns: in eastern Washington after the last mowing and before the soil freezes, in western Washington between mid-November and December 7.',
    ],
    sources: [WSU],
  },
  AZ: {
    feeding: 0.5,
    of: 'the monthly feeding of a low-desert bermudagrass lawn',
    items: [
      'Bermudagrass in the low desert: ½ lb of N per 1,000 sq ft each month from April, once it grows again, through October.',
      'Ryegrass overseeded for winter: ½ lb of N per 1,000 sq ft per feeding, with a fertilizer higher in phosphate the month after overseeding.',
      'The University of Arizona’s guide gives monthly feedings, not a yearly total.',
    ],
    sources: [ARIZONA],
  },
  TN: {
    feeding: 1,
    of: 'a fall feeding of UT’s tall fescue plan',
    items: [
      'Per growing month: bermudagrass and Kentucky bluegrass ½ to 1½ lb of N per 1,000 sq ft, tall fescue, zoysiagrass and perennial ryegrass 2/5 to 1 lb, fine fescues 1/5 to 3/5 lb and centipedegrass 1/10 to 4/10 lb.',
      'UT’s tall fescue plan: ½ lb in early March and in early April, then 1 lb in early September, mid-October and mid-November, 4 lb in the year.',
      'UT’s hybrid bermudagrass plan: 1 lb in mid-April, early June, mid-July and early September, 4 lb in the year.',
    ],
    sources: [UT_FEED],
  },
  IN: {
    feeding: 1,
    of: 'Purdue’s limit for one application of water-soluble N',
    items: [
      'Any single application: no more than 1.0 lb of water-soluble N per 1,000 sq ft, or 2.0 lb when more than half of the N is slow-release.',
      'Late August through early November: up to 1 lb of N per 1,000 sq ft each month; early October to early December, 0.5 to 0.75 lb about every three weeks.',
      'A mature cool-season lawn: 1 to 5 lb of N per 1,000 sq ft a year, from 1 to 3 lb at the lowest maintenance to 3 to 5 lb at the highest; a shaded lawn no more than 2 lb.',
    ],
    sources: [PURDUE_FEED],
  },
  MD: {
    feeding: 0.9,
    of: 'the University of Maryland’s rate for one application',
    items: [
      'Any application: 0.9 lb of N per 1,000 sq ft.',
      'Tall fescue: 0.9 lb in May or early June, in September and in October.',
      'Fine fescue: 0.5 lb in May or early June and 0.9 lb in October; zoysiagrass 0.9 lb in June, and optionally in July or August.',
      'In spring, no more than ½ lb of N per 1,000 sq ft before the end of May; unless the lawn is zoysia or bermuda, spring is not the best time to feed.',
    ],
    sources: [UMD_RATES, UMD_BAY],
  },
  MO: {
    feeding: 1,
    of: 'each of the University of Missouri’s fall feedings of tall fescue',
    items: [
      'Tall fescue and other cool-season lawns: 0.5 to 1 lb of N per 1,000 sq ft in early to mid-April, preferably slow-release; then 1 lb in mid-September and 1 lb in mid-October.',
      'Zoysiagrass and bermudagrass: 2 to 3 lb of N per 1,000 sq ft in all, in two or three equal feedings from late May or early June to mid-August.',
    ],
    sources: [MIZZOU],
  },
  WI: {
    feeding: 1,
    of: 'one feeding of Wisconsin’s three-date program',
    items: [
      'Any feeding: about 1 lb of actual N per 1,000 sq ft.',
      'The standard program: Memorial Day, Independence Day and Labor Day, about 3 lb of N per 1,000 sq ft a year; more than 3 lb a season where the clippings are taken away.',
      'Fine fescues: no more than 2 lb a year; a lawn 10 to 15 years old needs only half, for example in May and September only.',
    ],
    sources: [UW_RATES, UW_FEED],
  },
  CO: {
    feeding: 1,
    of: 'Colorado State’s late summer feeding of bluegrass',
    items: [
      'High-maintenance bluegrass and ryegrass: ½ to 1 lb of N per 1,000 sq ft mid-March to April, 1 lb in May to mid-June, none required in July and early August, 1 lb mid-August to mid-September and 1 to 2 lb early October to early November, the second pound optional.',
      'Low-maintenance bluegrass and turf-type tall fescue: ½ lb in spring, ½ to 1 lb in May to mid-June, 1 lb mid-August to mid-September and an optional 1 lb in October.',
      'Fine fescue: ½ lb in spring, ½ to 1 lb in May to mid-June and ½ to 1 lb in late summer, nothing in fall.',
      'Buffalograss, blue grama and bermudagrass: ½ to 1 lb in May to mid-June and ½ to 1 lb in July to early August, and no nitrogen otherwise.',
      'Colorado State gives the rate of each feeding, not a yearly total.',
    ],
    sources: [CSU_FEED],
  },
  SC: {
    feeding: 1,
    of: 'Clemson’s September feeding of tall fescue',
    items: [
      'Bermudagrass: ½ to 1 lb of N per 1,000 sq ft in early May, in June or July and before August 15, by the soil; 2 to 4 lb a growing season.',
      'Tall fescue: 1 lb of N per 1,000 sq ft in September, optionally 1 lb in November, and 1 lb in February.',
    ],
    sources: [SC_BERMUDA, SC_FESCUE],
  },
  AL: {
    feeding: 1,
    of: 'each feeding of Alabama Extension’s schedule',
    items: [
      'Each feeding: 1 lb of N per 1,000 sq ft, in the months the schedule names.',
      'Bermudagrass: 3 lb of N per 1,000 sq ft a year on the standard schedule, up to 5 lb (May through September) at the maximum.',
      'St. Augustinegrass: 2 lb a year standard, up to 4 lb (April, May, July and August); zoysiagrass 2 lb, up to 3 lb.',
      'Centipedegrass: 1 lb a year standard, in two half feedings, up to 2 lb in half feedings from May through August.',
      'Tall fescue: 3 lb a year standard (February, April, September), up to 4 lb (February, March, September, November); its tall fescue guide says it looks best with 2 to 4 lb a year.',
    ],
    sources: [AL_SCHEDULE, AL_FESCUE],
  },
  KY: {
    feeding: 1,
    of: 'the University of Kentucky’s rate for any application',
    items: [
      'Any application: 1 lb of actual N per 1,000 sq ft.',
      'Kentucky bluegrass, perennial ryegrass and tall fescue: 2 to 4 lb of N per 1,000 sq ft a year, fed in autumn; fine fescues 1 to 2 lb.',
      'Bermudagrass: 3 to 4 lb a year and zoysiagrass 1 to 2 lb, fed in summer.',
      'By maintenance on cool-season lawns: low 1 lb (October), medium 2 lb (October and November), high 3 lb (October through December) and up to 0.5 lb more in late May or early June.',
    ],
    sources: [KY_FEED],
  },
  AR: {
    feeding: 1,
    of: 'the spring feeding of tall fescue in the University of Arkansas calendar',
    items: [
      'Bermudagrass: 0.5 to 1.0 lb of N per 1,000 sq ft about three weeks after it turns green in late May; no more than 0.5 lb in September.',
      'Tall fescue: 1.0 lb in March or early April, no more than 1 lb in spring; 1.0 to 1.5 lb in mid-September and again in November.',
      'Zoysiagrass: 0.5 to 0.75 lb in late June or early July and again in mid-August; no more than 2 lb a year.',
      'Centipedegrass: 0.5 lb about three weeks after it turns green in June; no more than 2 lb a year.',
    ],
    sources: [AR_BERMUDA, AR_FESCUE, AR_ZOYSIA, AR_CENTIPEDE],
  },
  MS: {
    feeding: 1,
    of: 'each feeding of Mississippi State’s programs',
    items: [
      'Hybrid bermudagrass: 3 lb of N per 1,000 sq ft a season in zone 7a (May 15, June 15, August 15), 6 lb in zone 8b (the first of each month, April through September).',
      'Zoysiagrass: 3 lb a season in zone 7a, 4 lb in zones 7b and 8a, 6 lb in zone 8b.',
      'St. Augustinegrass: 2 lb a season in zones 7b and 8a, 3 lb in zone 8b; centipedegrass 1 lb in zones 7b and 8a, 2 lb in zone 8b.',
      'Tall fescue: 3 lb a season in zone 7a (September 15, March 1, April 1), 2 lb in zone 7b; Kentucky bluegrass 4 lb in zone 7a.',
      'Each season’s pounds are split into as many feedings as the program lists, which comes to 1 lb a feeding.',
    ],
    sources: [MS_LAWN],
  },
  KS: {
    feeding: 1,
    of: 'the most common application in K-State’s guide',
    items: [
      'The most common application: 1 lb of actual N per 1,000 sq ft; never more than 1½ lb in one application.',
      'Kentucky bluegrass: 1½ lb of N per 1,000 sq ft a year at low quality, 3 lb at medium, 4 to 5 lb at high; perennial ryegrass 2, 3 and 4 to 5 lb.',
      'Tall fescue: 1, 2 and 3 to 4 lb a year at low, medium and high quality.',
      'Bermudagrass: 2, 3 and 4 lb a year; zoysiagrass 1, 1 to 1½ and 2 lb; buffalograss 0 to 1 lb at low quality and 2 lb at medium.',
    ],
    sources: [KS_GUIDE, KS_RATES],
  },
};
