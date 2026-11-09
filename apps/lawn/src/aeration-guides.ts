import type { StateEntry } from '@maestro-calc/lawn-data/frost/states';
import {
  CALENDAR_STATES,
  type CalendarStateCode,
  feedStatePathOf,
  seedStatePathOf,
} from './calendar-paths.ts';
import { coolSeedBy, RULE_SOURCES, warmFeedFirst } from './calendar-rules.ts';
import { STATIONS_OF } from './frost-stations.ts';
import { frostStatsOf, shiftDay } from './frost-stats.ts';
import { dateText } from './frost-text.ts';
import type { Guide } from './guide.ts';
import {
  AERATION_LINK,
  BEST_SEED_LINK,
  NOAA,
  PLANTING_LINK,
  PRE_EMERGENT_LINK,
  SEED_CALCULATOR,
} from './seed-sources.ts';
import { type GrassKind, STATE_CALENDARS } from './state-calendars.ts';

/*
 * When to aerate a lawn and when to put down a pre-emergent: what the extension publications
 * below say, read on `READ_AP`, and a date per calendar state worked from the middle 50% NOAA
 * freeze dates of its own stations with the rules those publications print. Nothing here is a
 * rule of our own.
 */

/** The day the aeration and pre-emergent sources below were read. */
const READ_AP = '2026-11-09';
const read = (name: string, url: string) => ({ name: `${name}, accessed ${READ_AP}`, url });

const CLEMSON_AERATE = read(
  'Clemson Cooperative Extension HGIC 1200, “Aerating Lawns” (revised 2020)',
  'https://hgic.clemson.edu/factsheet/aerating-lawns/',
);
const NCSU_FESCUE = read(
  'NC State Extension, “Tall Fescue Lawn Maintenance Calendar” (2021)',
  'https://content.ces.ncsu.edu/tall-fescue-lawn-maintenance-calendar',
);
const NCSU_BERMUDA = read(
  'NC State Extension AG-431, “Bermudagrass Lawn Maintenance Calendar” (2021)',
  'https://content.ces.ncsu.edu/bermudagrass-lawn-maintenance-calendar',
);
const NCSU_ZOYSIA = read(
  'NC State Extension, “Zoysiagrass Lawn Maintenance Calendar” (2025)',
  'https://content.ces.ncsu.edu/zoysiagrass-lawn-maintenance-calendar',
);
const UMD_CRABGRASS = read(
  'University of Maryland Extension, “Crabgrass” (updated 2023)',
  'https://extension.umd.edu/resource/crabgrass',
);
const PURDUE_CRABGRASS = read(
  'Purdue University and University of Illinois AY-10-W, “Control of Crabgrass in Home Lawns”',
  'https://www.extension.purdue.edu/extmedia/AY/AY-10.pdf',
);
const CLEMSON_WARM_WEEDS = read(
  'Clemson Cooperative Extension HGIC 2310, “Managing Weeds in Warm Season Lawns” (2022)',
  'https://hgic.clemson.edu/factsheet/managing-weeds-in-warm-season-lawns/',
);
const CLEMSON_FESCUE_WEEDS = read(
  'Clemson Cooperative Extension HGIC 2309, “Managing Weeds in Fescue Lawns” (2022)',
  'https://hgic.clemson.edu/factsheet/managing-weeds-in-fescue-lawns/',
);
const CLEMSON_PRE = read(
  'Clemson Cooperative Extension, “Preemergence Herbicides: A Proactive Approach to Weed Control” (2025)',
  'https://hgic.clemson.edu/preemergence-herbicides-a-proactive-approach-to-weed-control/',
);

/** Clemson HGIC 1200: allow the holes about a month to heal before seeding. */
const HEAL_DAYS = 30;
/** Clemson HGIC 2310: wait at least nine weeks after a pre-emergent before seeding. */
const SEED_WAIT_DAYS = 63;

/** The middle 50% NOAA freeze dates of a group of stations, as days of the 365-day calendar. */
export interface FreezeDays {
  readonly spring: number;
  readonly fall: number;
}

export interface AerationWindow {
  /** Cool-season: aerate by `aerateBy` to overseed by `seedBy`, 45 days before the `freeze`. */
  readonly cool?: { readonly aerateBy: number; readonly seedBy: number; readonly freeze: number };
  /** Warm-season: from about six weeks after the last spring freeze, once the grass grows. */
  readonly warm?: { readonly from: number };
}

/**
 * The aeration dates of a lawn of grass `kinds` at freeze dates `days`. Cool-season: seed at
 * least 45 days before the first fall freeze (Illinois Extension) and aerate about a month before
 * that (Clemson HGIC 1200). Warm-season: about six weeks after the last spring freeze, when Texas
 * E-436 first feeds the growing grass, which Clemson aerates in late spring and summer.
 */
export const aerationWindowOf = (kinds: readonly GrassKind[], days: FreezeDays): AerationWindow => {
  const seedBy = coolSeedBy(days.fall).days45;
  return {
    ...(kinds.includes('cool')
      ? { cool: { aerateBy: shiftDay(seedBy, -HEAL_DAYS), seedBy, freeze: days.fall } }
      : {}),
    ...(kinds.includes('warm') ? { warm: { from: warmFeedFirst(days.spring) } } : {}),
  };
};

export interface PreEmergentDays {
  readonly springFreeze: number;
  /** Nine weeks after a pre-emergent put down at the middle last spring freeze. */
  readonly seedAfter: number;
  /** Cool-season: the fall seed date (45 days before the first fall freeze). */
  readonly fallSeedBy?: number;
}

/** The pre-emergent dates of a lawn of grass `kinds` at freeze dates `days`. */
export const preEmergentOf = (kinds: readonly GrassKind[], days: FreezeDays): PreEmergentDays => ({
  springFreeze: days.spring,
  seedAfter: shiftDay(days.spring, SEED_WAIT_DAYS),
  ...(kinds.includes('cool') ? { fallSeedBy: coolSeedBy(days.fall).days45 } : {}),
});

export interface StateWindows {
  readonly state: StateEntry;
  readonly kinds: readonly GrassKind[];
  readonly aeration: AerationWindow;
  readonly preEmergent: PreEmergentDays;
}

/** Both sets of dates for each calendar state, from the middle freeze dates of its stations. */
export const stateWindowsOf = (): readonly StateWindows[] =>
  CALENDAR_STATES.map((state) => {
    const stats = frostStatsOf(STATIONS_OF[state.slug] ?? []);
    if (stats === undefined) throw new Error(`${state.name} has no dated station`);
    const { kinds } = STATE_CALENDARS[state.code as CalendarStateCode];
    const days = { spring: stats.spring.middle, fall: stats.fall.middle };
    return {
      state,
      kinds,
      aeration: aerationWindowOf(kinds, days),
      preEmergent: preEmergentOf(kinds, days),
    };
  });

const kindLabel = (kinds: readonly GrassKind[]): string =>
  kinds.length === 2 ? 'cool- and warm-season' : `${kinds[0] ?? 'cool'}-season`;

const aerationItem = ({ state, kinds, aeration }: StateWindows): string => {
  const cool =
    aeration.cool === undefined
      ? undefined
      : `aerate by about ${dateText(aeration.cool.aerateBy)} to seed by ${dateText(aeration.cool.seedBy)}, 45 days before the middle first fall freeze of ${dateText(aeration.cool.freeze)}`;
  const warm =
    aeration.warm === undefined ? undefined : `from about ${dateText(aeration.warm.from)}`;
  const body =
    cool !== undefined && warm !== undefined
      ? `cool-season lawns ${cool}; warm-season lawns ${warm}`
      : (cool ?? warm ?? '');
  return `${state.name} (${kindLabel(kinds)}): ${body}.`;
};

const preEmergentItem = ({ state, kinds, preEmergent }: StateWindows): string => {
  const parts = [
    `middle last spring freeze ${dateText(preEmergent.springFreeze)}`,
    `seed nine weeks after a pre-emergent put down then: ${dateText(preEmergent.seedAfter)}`,
    ...(preEmergent.fallSeedBy === undefined
      ? []
      : [
          `fall seed by ${dateText(preEmergent.fallSeedBy)}, so no fall pre-emergent where you will overseed`,
        ]),
    ...(kinds.includes('warm') ? ['fall pre-emergent when night lows reach 55 to 60°F'] : []),
  ];
  return `${state.name} (${kindLabel(kinds)}): ${parts.join('; ')}.`;
};

const ROWS = stateWindowsOf();

/** When to aerate a lawn: by grass type, how, how often, and a date per calendar state. */
export const AERATION_GUIDE: Guide = {
  id: 'aeration-guide',
  path: '/when-to-aerate-lawn',
  title: 'When to Aerate Your Lawn: Fall or Late Spring | Lawn Figures',
  description:
    'Aerate cool-season lawns in the fall and warm-season lawns in late spring and summer, by Clemson and NC State Extension, with dates for 20 states.',
  h1: 'When to aerate your lawn',
  lead: 'Aerate a cool-season lawn (Kentucky bluegrass, tall fescue) in the fall, and a warm-season lawn (bermudagrass, zoysiagrass, centipedegrass, St. Augustinegrass) in late spring and summer, while it is actively growing. That is the advice of Clemson Cooperative Extension; NC State Extension says to delay tall fescue aeration until fall. Below: how to do it, how to tell a lawn needs it, and a date for 20 states worked from their own frost dates.',
  checked: READ_AP,
  sections: [
    {
      id: 'by-grass',
      heading: 'The answer by grass type',
      paragraphs: [
        'Clemson Cooperative Extension says lawns of cool-season grasses such as Kentucky bluegrass and tall fescue are best aerified in the fall, when there is less heat stress and less danger of invasion by weedy annuals. NC State Extension’s tall fescue calendar says to delay aeration until fall through spring and summer, then, from September through November, to aerate lawns that get heavy traffic or grow on clay soils.',
        'Warm-season grasses such as zoysiagrass, centipedegrass, carpetgrass, St. Augustinegrass and bermudagrass are best aerified in late spring and summer, when they are actively growing (Clemson). NC State’s bermudagrass calendar adds that core aeration and removing excess thatch may help avoid spring dead spot.',
      ],
    },
    {
      id: 'core',
      heading: 'Core aeration, not just holes',
      paragraphs: [
        'A coring machine pulls plugs of soil out of the lawn instead of pushing the soil aside, as a garden fork does. Clemson says hollow tines and spoon tines work equally well, but the hollow tine makes a somewhat cleaner hole and brings up less soil.',
      ],
      items: [
        'Tines: one-fourth of an inch up to three-fourths of an inch wide, reaching 2 to 3 inches into the soil, by the machine (Clemson).',
        'Spacing: tines 2 to 3 inches apart (Clemson).',
        'The cores: leave them on the lawn to be broken up by rain and traffic, or rake them in if they bother you (Clemson). NC State says to break them up to put the soil back into the lawn.',
      ],
    },
    {
      id: 'how',
      heading: 'How to aerate',
      paragraphs: [
        'Choose a day when temperatures are mild and the soil is moderately moist, which makes it easier to penetrate. Clemson says to avoid aerifying a wet soil: it is messy and compacts the soil further.',
        'Test before you rent a machine: push a screwdriver into moist soil. If it goes in with little resistance, the lawn probably does not need aerifying; if it is hard to push in, it may. Check where the turf is thinning, and walk the lawn: if it feels like walking on concrete, compaction could be the problem.',
      ],
    },
    {
      id: 'how-often',
      heading: 'How often',
      paragraphs: [
        'As often as needed, Clemson says: by traffic, soil and use, from once every couple of years to 2 to 4 times in a growing season. Compacted soil starves earthworms and the other organisms that break thatch down of oxygen, so thatch builds up faster on compacted and heavy clay soils than on well-aerified ones.',
      ],
    },
    {
      id: 'by-state',
      heading: 'When to aerate in 20 states',
      paragraphs: [
        'These dates are worked from the middle 50% first fall and last spring freeze dates of each state’s NOAA weather stations (1991-2020 normals) and the grasses its extension service says its lawns are grown with. For a cool-season lawn you will overseed, the seed goes down at least 45 days before the first fall freeze (Illinois Extension), and the aeration about a month before the seed (Clemson). For a warm-season lawn, the start is about six weeks after the last spring freeze, when Texas A&M’s E-436 first feeds the grass; aeration then runs through summer.',
        'A middle date of a whole state is a rough guide: a station near you can be weeks apart. The state calendars give the dates zone by zone.',
      ],
      items: ROWS.map(aerationItem),
      links: CALENDAR_STATES.map(({ slug, name }) => ({
        href: seedStatePathOf(slug),
        label: `When to plant grass seed in ${name}`,
      })),
    },
    {
      id: 'overseed',
      heading: 'Overseeding after aeration',
      paragraphs: [
        'Clemson says to allow the holes about a month to heal before seeding: seed sown straight after coring grows much better in and near the holes than between them, which gives the lawn an uneven, speckled look. Fall is also the time to seed a cool-season lawn, so the two fit together: aerate first, seed a month later, and keep both well before the first fall freeze.',
        'Do not put a pre-emergent down on a lawn you are about to seed: the pre-emergent guide gives the waiting times. The grass seed calculator gives the pounds of seed for your lawn.',
      ],
      links: [SEED_CALCULATOR, PLANTING_LINK, PRE_EMERGENT_LINK, BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'What month should I aerate my lawn?',
      answer:
        'For a cool-season lawn, a fall month: NC State Extension aerates tall fescue from September through November. For a warm-season lawn, late spring and summer, while it actively grows (Clemson Cooperative Extension).',
    },
    {
      question: 'Should I aerate in the spring?',
      answer:
        'A warm-season lawn, yes, from late spring once it grows. For tall fescue, NC State Extension says to delay aeration until fall, and Clemson says cool-season grasses are best aerified in the fall, with less heat stress and fewer weedy annuals.',
    },
    {
      question: 'Should I seed right after aerating?',
      answer:
        'Clemson Cooperative Extension says to allow the holes about a month to heal before seeding, or the seed in and near the holes grows much better than the rest and the lawn looks speckled.',
    },
    {
      question: 'Should I pick up the plugs?',
      answer:
        'No. Clemson says to leave the soil cores on the lawn to be broken up by rain and traffic, or to rake them into the grass if their look bothers you.',
    },
  ],
  sources: {
    clemsonAerate: CLEMSON_AERATE,
    ncsuFescue: NCSU_FESCUE,
    ncsuBermuda: NCSU_BERMUDA,
    illinois: RULE_SOURCES.illinois,
    texas: RULE_SOURCES.texas,
    noaa: NOAA,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'When to aerate your lawn',
    summary: 'Fall for cool-season grass, late spring for warm-season, and how to core it.',
  },
};

/** When to put down a crabgrass pre-emergent: soil temperature, cues, fall, seeding, by state. */
export const PRE_EMERGENT_GUIDE: Guide = {
  id: 'pre-emergent-guide',
  path: '/when-to-apply-pre-emergent',
  title: 'When to Apply Pre-Emergent: Soil Temperature | Lawn Figures',
  description:
    'Put a crabgrass pre-emergent down before the soil holds at 53 to 55°F, by Maryland, Purdue, Clemson and NC State Extension, with seeding gaps for 20 states.',
  h1: 'When to apply pre-emergent',
  lead: 'Put a crabgrass pre-emergent down before crabgrass comes up: the University of Maryland Extension says that begins when soil temperatures hold at 53 to 55°F for 5 days. The soil, not the date, decides, so a soil thermometer beats a calendar. Purdue says to be at least two weeks ahead of emergence, and a pre-emergent stops seed you sow as well, so it does not mix with overseeding.',
  checked: READ_AP,
  sections: [
    {
      id: 'soil',
      heading: 'The soil temperature to beat',
      paragraphs: [
        'A pre-emergent works only before the weed seed germinates. Maryland Extension says crabgrass germination begins when soil temperatures are sustained at 53 to 55°F for 5 days. Purdue and the University of Illinois put it at approximately 60°F for 3 to 5 days at 1/4 inch deep, and say the herbicide must go down at least two weeks before that.',
        'Purdue gives the dates for its own region: crabgrass can emerge as early as April 1 in southern Indiana and Illinois, and three or more weeks later in the north of both states. Its research found these herbicides can go down as early as March 1 and still work all season.',
        'Clemson Cooperative Extension times it by the air: four days in a row of 65 to 70°F let the soil warm enough for weed seed to germinate. In South Carolina that is about March 1 on the coast and in the middle of the state, and March 15 to 30 in the piedmont and mountains. NC State Extension puts the spring pre-emergent on bermudagrass and zoysiagrass from mid-February to early March, and on tall fescue typically in early March, sooner in the piedmont and on the coast.',
      ],
    },
    {
      id: 'forsythia',
      heading: 'Forsythia as a cue',
      paragraphs: [
        'Maryland Extension says the time during and shortly after forsythia bloom is a rough, but not consistently reliable, guide to the timing. Use the bloom as a reminder to check the soil, not as the trigger.',
      ],
    },
    {
      id: 'second',
      heading: 'A second application',
      paragraphs: [
        'A pre-emergent does not last the whole season. Clemson says they are generally effective for 6 to 12 weeks by product, and Maryland that high temperatures and rain shorten the time. For season-long control, Clemson makes a second application 8 or 9 weeks after the first; Maryland says a second application may be possible, usually 6 to 8 weeks later, by the label.',
      ],
    },
    {
      id: 'fall',
      heading: 'The fall pre-emergent in the South',
      paragraphs: [
        'Winter annual weeds germinate in the fall. Clemson puts the fall pre-emergent down when night lows reach 55 to 60°F for four days in a row: about September 15 to October 1 on the South Carolina coast and in its middle, and September 1 to 15 in the piedmont and mountains. NC State’s zoysiagrass calendar applies one from September through November against winter annual and perennial broadleaf weeds such as chickweed and henbit.',
        'Clemson says not to put a pre-emergent down in the fall on a lawn that will be overseeded.',
      ],
    },
    {
      id: 'seeding',
      heading: 'Pre-emergent and grass seed',
      paragraphs: [
        'A pre-emergent stops grass seed just as it stops crabgrass. Purdue says not to use one on new seedlings or before seeding, and to read the label for use before and after seeding. Clemson says to wait at least nine weeks after applying before seeding, and to read the label for the exact wait; for bermudagrass overseeded with ryegrass it gives 6 to 16 weeks by rate and herbicide. Maryland also sends you to the label for the wait before overseeding.',
        'That is one reason a cool-season lawn is seeded in late summer and fall: a spring pre-emergent and spring seed get in each other’s way.',
      ],
      links: [AERATION_LINK, PLANTING_LINK, SEED_CALCULATOR],
    },
    {
      id: 'by-state',
      heading: 'Pre-emergent and seeding dates in 20 states',
      paragraphs: [
        'No source here ties the pre-emergent to a frost date, so this list does not give a date to spray. It gives, from the middle 50% freeze dates of each state’s NOAA stations (1991-2020 normals), the middle last spring freeze, the first day seed could go down if a pre-emergent went on that day (nine weeks later, Clemson), and for cool-season lawns the fall seed date, 45 days before the middle first fall freeze (Illinois Extension).',
        'Check the soil at your own lawn: the fertilizer calendar of each state lists its extension service’s months and its stations zone by zone.',
      ],
      items: ROWS.map(preEmergentItem),
      links: CALENDAR_STATES.map(({ slug, name }) => ({
        href: feedStatePathOf(slug),
        label: `When to fertilize your lawn in ${name}`,
      })),
    },
  ],
  questions: [
    {
      question: 'What soil temperature do I apply pre-emergent at?',
      answer:
        'Before crabgrass germinates: Maryland Extension says that begins when the soil holds at 53 to 55°F for 5 days, and Purdue gives about 60°F for 3 to 5 days at 1/4 inch deep, with the herbicide down at least two weeks before.',
    },
    {
      question: 'Is it too early to apply pre-emergent in March?',
      answer:
        'Not by Purdue’s research: in Indiana and Illinois it found these herbicides can go down as early as March 1 and still work all season. In the South, Clemson and NC State put them down from mid-February to March.',
    },
    {
      question: 'Can I seed after applying pre-emergent?',
      answer:
        'Not soon after. Clemson says to wait at least nine weeks and to read the label for the exact time; Purdue says not to use pre-emergents before seeding an area.',
    },
    {
      question: 'Do I need a second application?',
      answer:
        'Often. Clemson says pre-emergents last 6 to 12 weeks and makes a second application 8 or 9 weeks after the first; Maryland says usually 6 to 8 weeks later.',
    },
  ],
  sources: {
    umd: UMD_CRABGRASS,
    purdue: PURDUE_CRABGRASS,
    clemsonWarm: CLEMSON_WARM_WEEDS,
    clemsonFescue: CLEMSON_FESCUE_WEEDS,
    clemsonPre: CLEMSON_PRE,
    ncsuFescue: NCSU_FESCUE,
    ncsuBermuda: NCSU_BERMUDA,
    ncsuZoysia: NCSU_ZOYSIA,
    illinois: RULE_SOURCES.illinois,
    noaa: NOAA,
  },
  calculators: [],
  card: {
    title: 'When to apply pre-emergent',
    summary: 'The soil temperature that starts crabgrass, the second dose and the wait to seed.',
  },
};
