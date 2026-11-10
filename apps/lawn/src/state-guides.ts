import type { StateEntry } from '@maestro-calc/lawn-data/frost/states';
import {
  CALENDAR_STATES,
  type CalendarStateCode,
  feedStatePathOf,
  seedStatePathOf,
  zonePathOf,
} from './calendar-paths.ts';
import {
  coolSeedBy,
  RULE_SOURCES,
  warmFeedFirst,
  warmFeedLast,
  warmPlugBy,
} from './calendar-rules.ts';
import { cityStationsOf } from './city-stations.ts';
import { frostPathOf } from './frost.ts';
import { STATIONS_OF } from './frost-stations.ts';
import { frostStatsOf, type FrostStats } from './frost-stats.ts';
import { dateText } from './frost-text.ts';
import type { Guide, GuideSource } from './guide.ts';
import { AERATION_LINK, NOAA, PRE_EMERGENT_LINK, READ } from './seed-sources.ts';
import { STATE_CALENDARS, type Claim, type StateCalendar } from './state-calendars.ts';
import { USDA_SOURCES } from './zone-guides.ts';
import { ZONED, zonesOfState } from './zoned.ts';

/*
 * The grass seed and the fertilizer calendar of each calendar state: what its extension service
 * says, then the dates worked out zone by zone from its own NOAA stations with the frost rules of
 * `calendar-rules.ts`.
 */

const range = (from: number, to: number): string =>
  from === to ? dateText(from) : `${dateText(from)} to ${dateText(to)}`;
const count = (n: number, one: string, many = `${one}s`): string =>
  `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

interface ZoneRow {
  readonly label: string;
  readonly stations: number;
  readonly stats: FrostStats;
}

const zoneRowsOf = (slug: string): readonly ZoneRow[] =>
  zonesOfState(slug).flatMap(({ zone, stations }) => {
    const stats = frostStatsOf(stations.map(({ station }) => station));
    return stats === undefined ? [] : [{ label: zone.label, stations: stations.length, stats }];
  });

const citiesOf = (state: StateEntry) =>
  cityStationsOf(ZONED.filter((each) => each.state.slug === state.slug));

const calendarOf = (state: StateEntry): StateCalendar =>
  STATE_CALENDARS[state.code as CalendarStateCode];

const statsOfState = (state: StateEntry): FrostStats => {
  const stats = frostStatsOf(STATIONS_OF[state.slug] ?? []);
  if (stats === undefined) throw new Error(`${state.name} has no dated station`);
  return stats;
};

const sourcesOf = (claims: readonly Claim[]): Record<string, GuideSource> =>
  Object.fromEntries(claims.map(({ source }) => [source.url, source]));

/** The sources of a page, each address once: a claim and a rule can cite one publication. */
const uniqueSources = (sources: Record<string, GuideSource>): Record<string, GuideSource> => {
  const seen = new Set<string>();
  return Object.fromEntries(
    Object.entries(sources).filter(([, { url }]) => !seen.has(url) && Boolean(seen.add(url))),
  );
};

const zoneSpan = (rows: readonly ZoneRow[]): string => {
  const first = rows[0]?.label ?? '';
  const last = rows.at(-1)?.label ?? '';
  return first === last ? `zone ${first}` : `zones ${first} to ${last}`;
};

const zoneLinks = (rows: readonly ZoneRow[]) =>
  rows.map(({ label }) => ({ href: zonePathOf(label), label: `Zone ${label} planting schedule` }));

const kindsText = (calendar: StateCalendar): string =>
  calendar.kinds.length === 2
    ? 'both cool-season and warm-season grasses'
    : calendar.kinds[0] === 'cool'
      ? 'cool-season grasses'
      : 'warm-season grasses';

/** The grass seed calendar of one state. */
const seedGuideOf = (state: StateEntry): Guide => {
  const calendar = calendarOf(state);
  const stats = statsOfState(state);
  const rows = zoneRowsOf(state.slug);
  const cool = calendar.kinds.includes('cool');
  const warm = calendar.kinds.includes('warm');
  const middleCool = coolSeedBy(stats.fall.middle);
  const coolBys = rows.map(({ stats: each }) => coolSeedBy(each.fall.middle).days45);
  const firstSeed = calendar.seed[0];
  const stations = STATIONS_OF[state.slug]?.length ?? 0;
  return {
    id: `seed:${state.slug}`,
    path: seedStatePathOf(state.slug),
    parent: { name: 'When to plant grass seed', path: '/when-to-plant-grass-seed' },
    title: `When to Plant Grass Seed in ${state.name} | Lawn Figures`,
    description: `When to sow grass seed in ${state.name}, from its extension service, with dates worked out from the freeze dates of its ${count(stations, 'NOAA station')}.`,
    h1: `When to plant grass seed in ${state.name}`,
    lead: `${firstSeed?.text[0] ?? ''} ${cool ? `Timed from the frost, cool-season seed goes down by about ${dateText(middleCool.days45)} at the middle of ${state.name}’s ${count(stations, 'weather station')}, 45 days before its middle first fall freeze of ${dateText(stats.fall.middle)}.` : `At the middle of ${state.name}’s ${count(stations, 'weather station')}, the last spring freeze is ${dateText(stats.spring.middle)}, so warm-season seed waits for the warm soil after it.`}`,
    checked: READ,
    sections: [
      {
        id: 'grasses',
        heading: `The lawn grasses of ${state.name}`,
        paragraphs: [...calendar.grasses.text],
      },
      {
        id: 'extension',
        heading: 'What the extension service says',
        paragraphs: calendar.seed.flatMap(({ text }) => text),
      },
      {
        id: 'by-zone',
        heading: `Seeding dates by zone in ${state.name}`,
        paragraphs: [
          `${state.name}’s stations fall in USDA ${zoneSpan(rows)}. For each zone, the middle 50% freeze dates of its stations here and the latest dates the frost rules give:${cool ? ' cool-season seed at least 45 days before the first fall frost (Illinois Extension).' : ''}${warm ? ' Warm-season sprigs and plugs at least two months before it (Oklahoma State).' : ''}`,
        ],
        items: rows.map(({ label, stations: n, stats: each }) => {
          const parts = [
            `Zone ${label} (${count(n, 'station')}): last spring freeze ${dateText(each.spring.middle)}, first fall freeze ${dateText(each.fall.middle)}`,
            ...(cool
              ? [`cool-season seed by ${dateText(coolSeedBy(each.fall.middle).days45)}`]
              : []),
            ...(warm ? [`warm-season plugs by ${dateText(warmPlugBy(each.fall.middle))}`] : []),
          ];
          return `${parts.join('; ')}.`;
        }),
        links: zoneLinks(rows),
      },
      {
        id: 'cities',
        heading: `City stations in ${state.name}`,
        paragraphs: [
          `The same rules on the first-order NOAA stations of ${state.name}, mostly its airports:`,
        ],
        items: citiesOf(state).map(
          (city) =>
            [
              `${city.name} (zone ${city.zone}): first fall freeze ${dateText(city.fall)}`,
              ...(cool ? [`cool-season seed by ${dateText(coolSeedBy(city.fall).days45)}`] : []),
              ...(warm ? [`warm-season plugs by ${dateText(warmPlugBy(city.fall))}`] : []),
            ].join('; ') + '.',
        ),
      },
      {
        id: 'timing',
        heading: 'Reading the dates',
        paragraphs: [
          cool
            ? `UGA Extension gives a wider rule, at least four to six weeks before the normal first fall 32°F date: ${range(middleCool.weeks6, middleCool.weeks4)} at the middle station of ${state.name}. Seed sown earlier in the window has more of the fall to root.`
            : `UGA Extension seeds warm-season grass once the soil 4 inches down holds at 65°F and rising, and NC State says not in the fall, since there is too little time to mature before the first frost.`,
          `A station is not your yard: look up the one nearest you on the ${state.name} frost page, and move the dates with its first fall freeze.`,
        ],
        links: [
          { href: frostPathOf(state.slug), label: `${state.name} frost dates` },
          { href: feedStatePathOf(state.slug), label: `When to fertilize a lawn in ${state.name}` },
          { href: '/grass-seed-calculator', label: 'Grass seed calculator' },
          { href: '/best-grass-seed', label: 'Best grass seed by region' },
          AERATION_LINK,
          PRE_EMERGENT_LINK,
        ],
      },
    ],
    questions: [
      {
        question: `When should I plant grass seed in ${state.name}?`,
        answer: `${cool ? 'Cool-season seed in late summer to early fall' : 'Warm-season seed in late spring to early summer'}, by ${calendar.seed[0]?.source.name.split(',')[0] ?? 'its extension service'}. ${cool ? `Timed from the frost, by about ${dateText(middleCool.days45)} at the middle station of ${state.name}` : `Its middle station has its last spring freeze on ${dateText(stats.spring.middle)}`}${warm && cool ? '; warm-season grass waits for the warm soil of late spring' : ''}.`,
      },
      ...(cool && coolBys.length > 0
        ? [
            {
              question: `What is the latest I can plant grass seed in ${state.name}?`,
              answer: `For cool-season seed, about 45 days before the first fall frost (Illinois Extension): from ${dateText(coolBys.toSorted((a, b) => a - b)[0] ?? stats.fall.middle)} in the earliest zone of ${state.name} to ${dateText(coolBys.toSorted((a, b) => a - b).at(-1) ?? stats.fall.middle)} in the latest, at the middle station of each zone.`,
            },
          ]
        : []),
      {
        question: `What planting zones are in ${state.name}?`,
        answer: `Its NOAA stations fall in USDA ${zoneSpan(rows)} of the 2023 map, from the grid behind the map. ${kindsText(calendar)[0]?.toUpperCase() ?? ''}${kindsText(calendar).slice(1)} are grown there, by its extension service.`,
      },
    ],
    sources: uniqueSources({
      ...sourcesOf([calendar.grasses, ...calendar.seed]),
      illinois: RULE_SOURCES.illinois,
      uga: RULE_SOURCES.uga,
      ...(warm
        ? {
            oklahoma: RULE_SOURCES.oklahoma,
            ugaEstablish: RULE_SOURCES.ugaEstablish,
            turffiles: RULE_SOURCES.turffiles,
          }
        : {}),
      noaa: NOAA,
      usda: USDA_SOURCES.usda,
      prism: USDA_SOURCES.prism,
    }),
    calculators: [],
    card: {
      title: `Grass seed in ${state.name}`,
      summary: `Seeding dates for ${state.name}, zone by zone.`,
    },
  };
};

/** The fertilizer calendar of one state. */
const feedGuideOf = (state: StateEntry): Guide => {
  const calendar = calendarOf(state);
  const stats = statsOfState(state);
  const rows = zoneRowsOf(state.slug);
  const warm = calendar.kinds.includes('warm');
  const cool = calendar.kinds.includes('cool');
  const stations = STATIONS_OF[state.slug]?.length ?? 0;
  const first = calendar.feed[0];
  return {
    id: `feed:${state.slug}`,
    path: feedStatePathOf(state.slug),
    parent: {
      name: 'When to fertilize and seed your lawn',
      path: '/when-to-fertilize-and-seed-your-lawn',
    },
    title: `When to Fertilize Your Lawn in ${state.name} | Lawn Figures`,
    description: `The months to feed a ${state.name} lawn, from its extension service, and the spring and fall freeze dates of its ${count(stations, 'NOAA station')} by zone.`,
    h1: `When to fertilize your lawn in ${state.name}`,
    lead: `${first?.text[0] ?? ''} ${warm ? `For warm-season grass timed from the frost, the first feeding comes about 6 weeks after the last spring freeze, ${dateText(warmFeedFirst(stats.spring.middle))} at the middle station, and the last no later than 6 weeks before the first fall freeze, ${dateText(warmFeedLast(stats.fall.middle).weeks6)}.` : `The middle of its ${count(stations, 'weather station')} has its last spring freeze on ${dateText(stats.spring.middle)} and its first fall freeze on ${dateText(stats.fall.middle)}.`}`,
    checked: READ,
    sections: [
      {
        id: 'extension',
        heading: `What ${state.name}’s extension service says`,
        paragraphs: calendar.feed.flatMap(({ text }) => text),
      },
      {
        id: 'grasses',
        heading: 'Which grass you feed',
        paragraphs: [
          ...calendar.grasses.text,
          cool
            ? 'Purdue Extension sums up the cool-season rule: most of the nitrogen from late summer through autumn, less in the spring flush and little to none in summer, and none on frozen soil.'
            : 'Warm-season grasses grow in the heat, so they are fed from green-up through summer and not into the cold months.',
        ],
      },
      {
        id: 'by-zone',
        heading: `Feeding dates by zone in ${state.name}`,
        paragraphs: [
          warm
            ? `For warm-season lawns, Texas A&M AgriLife makes the first feeding about 6 weeks after the average last spring frost and the last no later than 6 weeks before the autumn frost; NC State Extension takes the last light one up to four weeks before it. On the middle station of each zone of ${state.name}:`
            : `Cool-season feeding follows the season, not a frost date, but the freeze dates show where the fall is short. The middle station of each zone of ${state.name}:`,
        ],
        items: rows.map(({ label, stations: n, stats: each }) => {
          const last = warmFeedLast(each.fall.middle);
          return warm
            ? `Zone ${label} (${count(n, 'station')}): first warm-season feeding ${dateText(warmFeedFirst(each.spring.middle))}, last ${range(last.weeks6, last.weeks4)}.`
            : `Zone ${label} (${count(n, 'station')}): ${String(each.season.middle)} days from the last spring freeze, ${dateText(each.spring.middle)}, to the first fall freeze, ${dateText(each.fall.middle)}.`;
        }),
        links: zoneLinks(rows),
      },
      {
        id: 'cities',
        heading: `City stations in ${state.name}`,
        paragraphs: [
          warm
            ? `The warm-season feeding dates at the first-order NOAA stations of ${state.name}:`
            : `The 50% freeze dates of the first-order NOAA stations of ${state.name}, which bound the spring and fall feedings:`,
        ],
        items: citiesOf(state).map((city) =>
          warm
            ? `${city.name} (zone ${city.zone}): first feeding ${dateText(warmFeedFirst(city.spring))}, last by ${dateText(warmFeedLast(city.fall).weeks6)}.`
            : `${city.name} (zone ${city.zone}): last spring freeze ${dateText(city.spring)}, first fall freeze ${dateText(city.fall)}.`,
        ),
      },
      {
        id: 'how-much',
        heading: 'How much to put down',
        paragraphs: [
          `The fertilizer calculator turns the N-P-K numbers on the bag and the rate of your source into pounds for your lawn. Check the station nearest you on the ${state.name} frost page before you set the dates.`,
        ],
        links: [
          { href: frostPathOf(state.slug), label: `${state.name} frost dates` },
          { href: seedStatePathOf(state.slug), label: `When to plant grass seed in ${state.name}` },
          { href: '/lawn-fertilizer-calculator', label: 'Lawn fertilizer calculator' },
          PRE_EMERGENT_LINK,
          AERATION_LINK,
        ],
      },
    ],
    questions: [
      {
        question: `When should I fertilize my lawn in ${state.name}?`,
        answer: `${cool ? 'A cool-season lawn mostly from late summer through fall' : 'A warm-season lawn from green-up through summer'}, by ${calendar.feed[0]?.source.name.split(',')[0] ?? 'its extension service'}.${warm ? ` For warm-season grass timed from the frost, from about ${dateText(warmFeedFirst(stats.spring.middle))} to ${dateText(warmFeedLast(stats.fall.middle).weeks6)} at the middle station.` : ''}`,
      },
      {
        question: `When is the last frost in ${state.name}?`,
        answer: `At the middle of its ${count(stats.dated, 'dated station')}, the 50% last spring freeze is ${dateText(stats.spring.middle)}; half of them fall between ${dateText(stats.spring.low)} and ${dateText(stats.spring.high)}.`,
      },
    ],
    sources: uniqueSources({
      ...sourcesOf([calendar.grasses, ...calendar.feed]),
      ...(warm ? { texas: RULE_SOURCES.texas, ncBermuda: RULE_SOURCES.ncBermuda } : {}),
      ...(cool ? { purdue: RULE_SOURCES.purdue } : {}),
      noaa: NOAA,
      usda: USDA_SOURCES.usda,
      prism: USDA_SOURCES.prism,
    }),
    calculators: [],
    card: {
      title: `Lawn fertilizer in ${state.name}`,
      summary: `Feeding months for ${state.name}, zone by zone.`,
    },
  };
};

export const SEED_STATE_GUIDES: readonly Guide[] = CALENDAR_STATES.map(seedGuideOf);
export const FEED_STATE_GUIDES: readonly Guide[] = CALENDAR_STATES.map(feedGuideOf);
