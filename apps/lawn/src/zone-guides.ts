import { ZONE_SOURCE } from '@maestro-calc/lawn-data/zones/source';
import type { Zone } from '@maestro-calc/lawn-data/zones/zone';
import { CALENDAR_STATES, seedStatePathOf, ZONE_INDEX_PATH, zonePathOf } from './calendar-paths.ts';
import {
  coolSeedBy,
  RULE_SOURCES,
  vegetablesOf,
  warmFeedFirst,
  warmFeedLast,
  warmPlugBy,
} from './calendar-rules.ts';
import { cityStationsOf } from './city-stations.ts';
import { frostPathOf } from './frost.ts';
import { frostStatsOf, type FrostStats } from './frost-stats.ts';
import { dateText, titleCase } from './frost-text.ts';
import type { Guide, GuideSource } from './guide.ts';
import { NOAA, READ } from './seed-sources.ts';
import { PAGE_ZONES, stationsOfZone, ZONED, type ZonedStation } from './zoned.ts';

/*
 * The USDA planting zone pages: one per half zone the NOAA frost stations of the 48 contiguous
 * states fall in (3a to 10b), each worked out from its own stations, and the index that lists them.
 */

export const USDA_SOURCES = {
  usda: {
    name: `USDA Agricultural Research Service, 2023 USDA Plant Hardiness Zone Map, accessed ${READ}`,
    url: 'https://planthardiness.ars.usda.gov/',
  },
  usdaUse: {
    name: `USDA ARS, Plant Hardiness Zone Map, “How to Use the Maps”, accessed ${READ}`,
    url: 'https://planthardiness.ars.usda.gov/pages/how-to-use-the-maps',
  },
  usdaRelease: {
    name: `USDA ARS news release, “USDA Unveils Updated Plant Hardiness Zone Map” (November 15, 2023), accessed ${READ}`,
    url: 'https://www.ars.usda.gov/news-events/news/research-news/2023/usda-unveils-updated-plant-hardiness-zone-map/',
  },
  prism: {
    name: `${ZONE_SOURCE.grid.name}, pulled ${ZONE_SOURCE.pulled}`,
    url: ZONE_SOURCE.grid.pageUrl,
  },
} as const satisfies Record<string, GuideSource>;

/** The note every zone page carries: how a station got its zone, and that this is not the map. */
export const ZONE_METHOD =
  'Each NOAA station takes the zone of the cell of the PRISM grid behind the 2023 USDA map (Oregon State University) nearest its coordinates. This is our reading of that grid at the stations, not the official USDA Plant Hardiness Zone Map; the official map and its ZIP lookup are on the USDA site.';

const SITE_LAWN = 'Lawn Figures';
const range = (from: number, to: number): string =>
  from === to ? dateText(from) : `${dateText(from)} to ${dateText(to)}`;
const celsius = (fahrenheit: number): string =>
  String(Math.round(((fahrenheit - 32) * 5) / 9)).replace('-', '−');
const degrees = (value: number): string => `${String(value).replace('-', '−')}°F`;
const count = (n: number, one: string, many = `${one}s`): string =>
  `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

/** The states of a group of stations, most stations first, then by name. */
const statesOf = (stations: readonly ZonedStation[]) => {
  const by = new Map<string, ZonedStation[]>();
  for (const each of stations) by.set(each.state.slug, [...(by.get(each.state.slug) ?? []), each]);
  return [...by.values()]
    .map((list) => ({ state: list[0]?.state, stations: list }))
    .filter(
      (entry): entry is { state: ZonedStation['state']; stations: ZonedStation[] } =>
        entry.state !== undefined,
    )
    .toSorted(
      (a, b) => b.stations.length - a.stations.length || (a.state.name < b.state.name ? -1 : 1),
    );
};

/** The stations at both ends of the zone's temperature range. */
const extremesOf = (stations: readonly ZonedStation[]) => {
  const sorted = stations.toSorted(
    (a, b) => a.min - b.min || (a.station.id < b.station.id ? -1 : 1),
  );
  return { coldest: sorted[0], mildest: sorted.at(-1) };
};

const stationName = ({ station, state }: ZonedStation): string =>
  `${titleCase(station.name)}, ${state.code}`;

const statsOrThrow = (label: string, stations: readonly ZonedStation[]): FrostStats => {
  const stats = frostStatsOf(stations.map(({ station }) => station));
  if (stats === undefined) throw new Error(`zone ${label} has no dated station`);
  return stats;
};

const nameOfZone = (zone: Zone): string => `Zone ${zone.label}`;

/** The page of one half zone. */
const zoneGuideOf = (zone: Zone, index: number): Guide => {
  const stations = stationsOfZone(zone.label);
  const stats = statsOrThrow(zone.label, stations);
  const states = statesOf(stations);
  const { coldest, mildest } = extremesOf(stations);
  const cool = coolSeedBy(stats.fall.middle);
  const feedLast = warmFeedLast(stats.fall.middle);
  const vegetables = vegetablesOf(stats.spring.middle);
  const tomato = vegetables.find(({ crop }) => crop.startsWith('Tomato'));
  const name = nameOfZone(zone);
  // zones 8 to 10 lead with the warm-season dates: there, most of the stations have well over
  // 200 days between the freezes, and the cool-season seeding date falls in late fall or winter
  const warmZone = zone.zone >= 8;
  const span = `${degrees(zone.low)} to ${degrees(zone.high)}`;
  const before = PAGE_ZONES[index - 1];
  const after = PAGE_ZONES[index + 1];
  const top = states.slice(0, 8);
  return {
    id: `zone:${zone.label}`,
    path: zonePathOf(zone.label),
    parent: { name: 'USDA planting zones', path: ZONE_INDEX_PATH },
    title: `${name} Planting Schedule and Frost Dates | ${SITE_LAWN}`,
    description: `${name} averages ${span} at its coldest. Frost dates of its ${count(stations.length, 'NOAA station')}, and when to seed grass and plant vegetables there.`,
    h1: `${name} planting schedule`,
    lead: `${name} is the half zone where the coldest night of the winter averages ${span} (2023 USDA map). At its ${count(stations.length, 'NOAA weather station')}, the middle last spring freeze is ${dateText(stats.spring.middle)} and the middle first fall freeze ${dateText(stats.fall.middle)}: ${warmZone ? `feed a warm-season lawn first around ${dateText(warmFeedFirst(stats.spring.middle))}, plant warm-season plugs by ${dateText(warmPlugBy(stats.fall.middle))}` : `sow cool-season grass seed by about ${dateText(cool.days45)}`}, and set out tomatoes from ${range(tomato?.from ?? stats.spring.middle, tomato?.to ?? stats.spring.middle)}.`,
    checked: READ,
    sections: [
      {
        id: 'zone',
        heading: `What ${name.toLowerCase()} means`,
        paragraphs: [
          `The USDA map is based on the average annual extreme minimum winter temperature, shown as 10°F zones and 5°F half zones; ${zone.half === 'a' ? `${zone.label} is the colder half of zone ${String(zone.zone)}` : `${zone.label} is the warmer half of zone ${String(zone.zone)}`}, from ${span} (about ${celsius(zone.low)} to ${celsius(zone.high)}°C). USDA says this is not the coldest it has ever been, but the average lowest winter temperature of 1991 to 2020.`,
          ...(coldest !== undefined && mildest !== undefined && coldest !== mildest
            ? [
                `Among the ${count(stations.length, 'station')} of ${name.toLowerCase()}, the coldest average winter low on the grid is ${degrees(coldest.min)} at ${stationName(coldest)}, and the mildest ${degrees(mildest.min)} at ${stationName(mildest)}.`,
              ]
            : []),
          ZONE_METHOD,
        ],
      },
      {
        id: 'frost-dates',
        heading: `Frost dates in ${name.toLowerCase()}`,
        paragraphs: [
          `Of the ${count(stations.length, 'station')}, ${String(stats.dated)} have both a 50% last spring and a 50% first fall 32°F freeze in the NOAA 1991-2020 normals. Half of them have their last spring freeze between ${dateText(stats.spring.low)} and ${dateText(stats.spring.high)}, and their first fall freeze between ${dateText(stats.fall.low)} and ${dateText(stats.fall.high)}.`,
          `The middle station goes ${String(stats.season.middle)} days between the two dates; half of them go ${String(stats.season.low)} to ${String(stats.season.high)} days. A zone is set by winter cold alone, so its frost dates vary more than its name suggests: USDA adds that wind, soil, moisture, humidity, snow and summer heat also decide what grows.`,
        ],
      },
      {
        id: 'cities',
        heading: `City stations in ${name.toLowerCase()}`,
        paragraphs: [
          `First-order NOAA stations of ${name.toLowerCase()}, mostly city airports, with their own 50% freeze dates and ${warmZone ? 'the latest date for warm-season plugs, two months before the fall one' : 'the cool-season seeding date 45 days before the fall one'}:`,
        ],
        items: cityStationsOf(stations).map(
          (city) =>
            `${city.name}, ${city.code}: last spring freeze ${dateText(city.spring)}, first fall freeze ${dateText(city.fall)}; ${warmZone ? `plugs by ${dateText(warmPlugBy(city.fall))}` : `seed by ${dateText(coolSeedBy(city.fall).days45)}`}.`,
        ),
      },
      {
        id: 'states',
        heading: `Where ${name.toLowerCase()} is`,
        paragraphs: [
          `${name} takes in stations in ${count(states.length, 'state')}. The states with the most, and the middle 50% dates of their stations in the zone:`,
        ],
        items: top.map(({ state, stations: own }) => {
          const each = frostStatsOf(own.map(({ station }) => station));
          return each === undefined
            ? `${state.name}: ${count(own.length, 'station')}, none with both dates.`
            : `${state.name}: ${count(own.length, 'station')}, last spring freeze ${dateText(each.spring.middle)}, first fall freeze ${dateText(each.fall.middle)}.`;
        }),
        links: top.flatMap(({ state }) => [
          { href: frostPathOf(state.slug), label: `${state.name} frost dates` },
          ...(CALENDAR_STATES.some(({ slug }) => slug === state.slug)
            ? [
                {
                  href: seedStatePathOf(state.slug),
                  label: `When to plant grass seed in ${state.name}`,
                },
              ]
            : []),
        ]),
      },
      {
        id: 'grass',
        heading: `When to seed grass in ${name.toLowerCase()}`,
        paragraphs: [
          `Cool-season grass (tall fescue, Kentucky bluegrass, ryegrass): Illinois Extension plants it at least 45 days before the first fall frost, which at the middle station is ${dateText(cool.days45)}; UGA Extension says at least four to six weeks before the first fall 32°F date, ${range(cool.weeks6, cool.weeks4)} here.`,
          `Warm-season grass (bermudagrass, zoysiagrass): UGA Extension seeds it once the soil 4 inches down holds at 65°F and rising, typically mid to late spring, and NC State says not in the fall, since there is too little time to mature before the first frost. Oklahoma State plants warm-season sprigs and plugs at least two months before the first fall frost: by ${dateText(warmPlugBy(stats.fall.middle))} at the middle station.`,
          'Which kind fits your lawn is a matter of summer heat more than winter cold: the best grass seed page sorts them by region.',
        ],
        links: [
          { href: '/best-grass-seed', label: 'Best grass seed by region' },
          { href: '/when-to-plant-grass-seed', label: 'When to plant grass seed' },
          { href: '/grass-seed-calculator', label: 'Grass seed calculator' },
        ],
      },
      {
        id: 'feeding',
        heading: `When to fertilize a lawn in ${name.toLowerCase()}`,
        paragraphs: [
          `Warm-season lawns: Texas A&M AgriLife makes the first feeding after the second mowing, usually about 6 weeks after the average last spring frost, ${dateText(warmFeedFirst(stats.spring.middle))} at the middle station, and the last no later than 6 weeks before the autumn frost, ${dateText(feedLast.weeks6)}. NC State Extension allows its last light September feeding up to four weeks before the first frost, ${dateText(feedLast.weeks4)}.`,
          'Cool-season lawns: Purdue Extension puts most of the nitrogen on from late summer through autumn, with less in the spring flush and little to none in summer. It does not tie that to a frost date.',
        ],
        links: [{ href: '/lawn-fertilizer-calculator', label: 'Lawn fertilizer calculator' }],
      },
      {
        id: 'vegetables',
        heading: `Vegetables in ${name.toLowerCase()}`,
        paragraphs: [
          `UNH Extension times the garden from the last spring frost. At the middle station of ${name.toLowerCase()} (${dateText(stats.spring.middle)}), that gives:`,
        ],
        items: vegetables.map(({ crop, from, to }) => `${crop}: ${range(from, to)}.`),
      },
      {
        id: 'zones',
        heading: 'Other zones',
        paragraphs: [
          `The half zones on either side of ${zone.label}, and the index of every zone with its dates.`,
        ],
        links: [
          ...(before === undefined
            ? []
            : [
                {
                  href: zonePathOf(before.label),
                  label: `${nameOfZone(before)} planting schedule`,
                },
              ]),
          ...(after === undefined
            ? []
            : [{ href: zonePathOf(after.label), label: `${nameOfZone(after)} planting schedule` }]),
          { href: ZONE_INDEX_PATH, label: 'All USDA planting zones' },
        ],
      },
    ],
    questions: [
      {
        question: `When is the last frost in ${name.toLowerCase()}?`,
        answer: `At the middle of its ${count(stats.dated, 'dated station')}, the 50% last spring freeze is ${dateText(stats.spring.middle)}; half fall between ${dateText(stats.spring.low)} and ${dateText(stats.spring.high)}. Look up the station nearest you for your own date.`,
      },
      {
        question: `When should I plant grass seed in ${name.toLowerCase()}?`,
        answer: `Cool-season seed by about ${dateText(cool.days45)}, 45 days before the middle first fall freeze of ${dateText(stats.fall.middle)} (Illinois Extension). Warm-season seed in late spring, once the soil is 65°F (UGA Extension).`,
      },
      {
        question: `How cold does it get in ${name.toLowerCase()}?`,
        answer: `The coldest night of an average winter reaches ${span}, by the 2023 USDA map of 1991-2020 data.`,
      },
    ],
    sources: {
      ...USDA_SOURCES,
      noaa: NOAA,
      illinois: RULE_SOURCES.illinois,
      uga: RULE_SOURCES.uga,
      ugaEstablish: RULE_SOURCES.ugaEstablish,
      turffiles: RULE_SOURCES.turffiles,
      oklahoma: RULE_SOURCES.oklahoma,
      texas: RULE_SOURCES.texas,
      ncBermuda: RULE_SOURCES.ncBermuda,
      purdue: RULE_SOURCES.purdue,
      unh: RULE_SOURCES.unh,
    },
    calculators: [],
    card: {
      title: `${name} planting schedule`,
      summary: `${span}; last freeze ${dateText(stats.spring.middle)}, first freeze ${dateText(stats.fall.middle)}.`,
    },
  };
};

/** Every zone page, coldest first. */
export const ZONE_GUIDES: readonly Guide[] = PAGE_ZONES.map(zoneGuideOf);

const zoneLine = (zone: Zone): string => {
  const stats = statsOrThrow(zone.label, stationsOfZone(zone.label));
  return `${nameOfZone(zone)}, ${degrees(zone.low)} to ${degrees(zone.high)}: ${count(stationsOfZone(zone.label).length, 'station')}, last spring freeze ${dateText(stats.spring.middle)}, first fall freeze ${dateText(stats.fall.middle)}, ${String(stats.season.middle)} days between.`;
};

/** The index of the zone pages: what a zone is, every zone in a line, and how we zoned the stations. */
export const ZONE_INDEX: Guide = {
  id: 'zone-index',
  path: ZONE_INDEX_PATH,
  title: `USDA Planting Zones: Frost Dates by Zone | ${SITE_LAWN}`,
  description:
    'The 2023 USDA hardiness zones 3a to 10b, each with the frost dates of its NOAA stations and when to seed grass, fertilize and plant vegetables there.',
  h1: 'USDA planting zones and their frost dates',
  lead: `A planting zone is a half zone of the 2023 USDA Plant Hardiness Zone Map: the average coldest winter night in 5°F steps. The ${count(ZONED.length, 'NOAA frost station')} of the 48 contiguous states fall in zones 3a to 10b, and each zone page gives the frost dates of its own stations and the seeding, feeding and planting dates worked out from them.`,
  checked: READ,
  sections: [
    {
      id: 'map',
      heading: 'What the zones are',
      paragraphs: [
        'USDA says the map is based on the average annual extreme minimum winter temperature, shown as 10°F zones and 5°F half zones marked a (colder) and b (warmer). The 2023 map uses 1991-2020 weather data; compared with the 2012 map, about half of the country moved to the next warmer half zone and the other half stayed where it was.',
        'A zone says how cold the winter gets, not when the frosts come. Two places of one zone can have frost dates weeks apart, which is why every page below gives the dates of the stations in that zone, not one date for the zone.',
      ],
    },
    {
      id: 'zones',
      heading: 'Every zone, coldest first',
      paragraphs: ['The middle 50% freeze dates of the stations in each zone:'],
      items: PAGE_ZONES.map(zoneLine),
      links: ZONE_GUIDES.map(({ path, card }) => ({ href: path, label: card.title })),
    },
    {
      id: 'method',
      heading: 'How the stations got their zones',
      paragraphs: [
        ZONE_METHOD,
        'Alaska and Hawaii have grids of their own and are not on these pages; one Florida station falls on a coastal cell with no value and is left out. The frost dates are the NOAA 1991-2020 normals of our frost pages.',
      ],
      links: [{ href: '/frost-dates', label: 'Frost dates by state and ZIP' }],
    },
  ],
  questions: [
    {
      question: 'What planting zone am I in?',
      answer:
        'Find your ZIP code on the USDA Plant Hardiness Zone Map site, then open that zone here for its frost dates and planting dates.',
    },
    {
      question: 'Did the zones change in 2023?',
      answer:
        'Yes. USDA says that compared with the 2012 map, about half of the country shifted to the next warmer half zone, a warming somewhere between 0 and 5°F, and the other half stayed in the same half zone.',
    },
  ],
  sources: { ...USDA_SOURCES, noaa: NOAA },
  calculators: [],
  card: {
    title: 'USDA planting zones',
    summary: 'Zones 3a to 10b, with the frost dates and planting dates of each.',
  },
};
