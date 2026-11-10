import type { Station } from '@maestro-calc/lawn-data/frost/types';
import { feedStatePathOf, seedStatePathOf, zonePathOf } from './calendar-paths.ts';
import {
  coolSeedBy,
  RULE_SOURCES,
  vegetablesOf,
  warmFeedFirst,
  warmFeedLast,
  warmPlugBy,
} from './calendar-rules.ts';
import {
  CENSUS_PLACES,
  CITY_READ,
  cityPathOf,
  FROST_CITIES,
  nearestOf,
  stateOfCode,
  type FrostCity,
  type NearStation,
} from './frost-cities.ts';
import { frostPathOf, partOf } from './frost.ts';
import { STATIONS_OF } from './frost-stations.ts';
import { fallOrder, frostStatsOf, springOrder } from './frost-stats.ts';
import { dateText, titleCase } from './frost-text.ts';
import type { Guide, GuideSource } from './guide.ts';
import { NOAA } from './seed-sources.ts';
import { STATE_CALENDARS } from './state-calendars.ts';
import { USDA_SOURCES } from './zone-guides.ts';
import { ZONED } from './zoned.ts';

/*
 * The frost date page of each city of `frost-cities.ts`: the dates of the NOAA station nearest its
 * Census point, the stations around it, where it sits in its state, and the lawn and garden dates
 * the rules of `calendar-rules.ts` and the claims of `state-calendars.ts` give from those dates.
 * Every figure is read or worked out from the data; nothing is typed in by hand.
 */

/** Stations listed around the nearest one: at most this many, within `NEAR_MILES`. */
const NEIGHBORS = 6;
const NEAR_MILES = 25;
/** The UNH table counts from a spring frost: a last freeze from March 1 (day 60) to May 31. */
const GARDEN_FROM = 60;
const GARDEN_TO = 151;

const FEET_PER_METER = 3.28084;

const count = (n: number, one: string, many = `${one}s`): string =>
  `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const range = (from: number, to: number): string =>
  from === to ? dateText(from) : `${dateText(from)} to ${dateText(to)}`;
const milesText = (miles: number): string => `${miles.toFixed(1)} miles`;
const feetText = (meters: number | null): string =>
  meters === null
    ? 'elevation not given'
    : `${Math.round(meters * FEET_PER_METER).toLocaleString('en-US')} ft`;

/** A spring date, with the year it falls in when NOAA's season puts it in the one before. */
export const springText = (day: number): string =>
  springOrder(day) === day ? dateText(day) : `${dateText(day)} of the year before`;
/** A fall date, with the year it falls in when NOAA's season puts it in the next one. */
export const fallText = (day: number): string =>
  fallOrder(day) === day ? dateText(day) : `${dateText(day)} of the next year`;

/** The three dates of a triple, which every station here has (`nearestOf` keeps dated ones). */
const triple = (values: Station['spring']): readonly [number, number, number] => {
  const [p10, p50, p90] = values;
  if (p10 === null || p50 === null || p90 === null) throw new Error('a dated station lacks a date');
  return [p10, p50, p90];
};

const zoneOf = (id: string): string | undefined =>
  ZONED.find(({ station }) => station.id === id)?.zone.label;

const daysBetween = (spring: number, fall: number): number => fallOrder(fall) - springOrder(spring);

const stationLink = (near: NearStation) => ({
  href: `${frostPathOf(near.state.slug, partOf(near.state.slug, near.station.id))}#${near.station.id}`,
  label: `${titleCase(near.station.name)} on the ${near.state.name} frost page`,
});

const relative = (days: number, what: string): string =>
  days === 0
    ? `the same day as ${what}`
    : `${count(Math.abs(days), 'day')} ${days < 0 ? 'earlier' : 'later'} than ${what}`;

/** The frost page of one city. */
const cityGuideOf = (city: FrostCity): Guide => {
  const state = stateOfCode(city.code);
  const calendar = STATE_CALENDARS[city.code];
  const [nearest, ...rest] = nearestOf(city, NEIGHBORS + 1);
  if (nearest === undefined) throw new Error(`${city.name} has no station`);
  const neighbors = rest.filter(({ miles }) => miles <= NEAR_MILES);
  const station = titleCase(nearest.station.name);
  const [spring10, spring50, spring90] = triple(nearest.station.spring);
  const [fall10, fall50, fall90] = triple(nearest.station.fall);
  const season = daysBetween(spring50, fall50);
  const safe = daysBetween(spring10, fall10);
  const zone = zoneOf(nearest.station.id);
  const cool = calendar.kinds.includes('cool');
  const warm = calendar.kinds.includes('warm');

  // the state the city is in, whatever state its nearest station is in
  const stateStations = STATIONS_OF[state.slug] ?? [];
  const stats = frostStatsOf(stateStations);
  if (stats === undefined) throw new Error(`${state.name} has no dated station`);
  const later = stateStations.filter(
    ({ spring: [, p50] }) => p50 !== null && springOrder(p50) > springOrder(spring50),
  ).length;
  const versusState = springOrder(spring50) - springOrder(stats.spring.middle);

  // the stations around it: the earliest and the latest 50% last freeze of the group
  const group = [nearest, ...neighbors];
  const bySpring = group.toSorted(
    (a, b) => springOrder(triple(a.station.spring)[1]) - springOrder(triple(b.station.spring)[1]),
  );
  const earliest = bySpring[0] ?? nearest;
  const latest = bySpring.at(-1) ?? nearest;
  const earliestDay = triple(earliest.station.spring)[1];
  const latestDay = triple(latest.station.spring)[1];
  const spread = springOrder(latestDay) - springOrder(earliestDay);
  const airport = group.find(({ station: each }) => each.id.startsWith('USW'));

  const seedBy = coolSeedBy(fall50);
  const feedLast = warmFeedLast(fall50);
  const garden = spring50 >= GARDEN_FROM && spring50 <= GARDEN_TO;
  // the Texas feeding rule counts from a spring frost; where the last one is in January or
  // February outside Texas (Phoenix), the state's own source times the first feeding instead
  const texasRule = warm && (city.code === 'TX' || spring50 >= GARDEN_FROM);
  const vegetables = vegetablesOf(spring50);
  const tomato = vegetables.find(({ crop }) => crop.startsWith('Tomato'));
  const others = FROST_CITIES.filter(
    (other) => other.code === city.code && other.slug !== city.slug,
  );

  const lawnTimed = [
    ...(cool
      ? [
          `Timed from the frost: Illinois Extension sows cool-season seed at least 45 days before the first fall frost, which puts the last day at ${dateText(seedBy.days45)} for ${station}; UGA’s rule of four to six weeks before the normal first fall 32°F date gives ${range(seedBy.weeks6, seedBy.weeks4)}.`,
        ]
      : []),
    ...(texasRule
      ? [
          `For warm-season grass, Texas A&M AgriLife makes the first feeding about 6 weeks after the average last spring frost, ${dateText(warmFeedFirst(spring50))} here, and the last no later than 6 weeks before the autumn frost, ${dateText(feedLast.weeks6)}.`,
        ]
      : []),
    ...(warm
      ? [
          `Oklahoma State plants warm-season sprigs and plugs at least two months before the first fall frost: by ${dateText(warmPlugBy(fall50))} at ${station}.`,
        ]
      : []),
  ];

  const sources: Record<string, GuideSource> = {
    noaa: NOAA,
    census: CENSUS_PLACES,
    ...Object.fromEntries(
      [calendar.grasses, ...calendar.seed, ...calendar.feed].map(({ source }) => [
        source.url,
        source,
      ]),
    ),
    ...(cool ? { illinois: RULE_SOURCES.illinois, uga: RULE_SOURCES.uga } : {}),
    ...(texasRule ? { texas: RULE_SOURCES.texas } : {}),
    ...(warm ? { oklahoma: RULE_SOURCES.oklahoma } : {}),
    ...(garden ? { unh: RULE_SOURCES.unh } : {}),
    ...(zone === undefined ? {} : { usda: USDA_SOURCES.usda, prism: USDA_SOURCES.prism }),
  };
  const seen = new Set<string>();
  const unique = Object.fromEntries(
    Object.entries(sources).filter(([, { url }]) => !seen.has(url) && Boolean(seen.add(url))),
  );

  return {
    id: `city:${city.slug}`,
    path: cityPathOf(city.slug),
    parent: { name: 'Frost dates', path: '/frost-dates' },
    title: `When Is the Last Frost in ${city.name}? | Lawn Figures`,
    description: `${city.name}’s last spring frost: ${dateText(spring50)} in a middle year, ${dateText(spring10)} in 1 year in 10, at the nearest NOAA station; first fall frost ${dateText(fall50)}.`,
    h1: `When is the last frost in ${city.name}?`,
    lead: `The last spring frost in ${city.name} comes around ${dateText(spring50)} in a middle year: the 50% date of ${station}, the NOAA weather station nearest the Census Bureau’s point for the city, ${milesText(nearest.miles)} away. In 1 year in 10 it comes on or after ${springText(spring10)}. The first fall frost comes around ${dateText(fall50)}, from the 1991-2020 normals.`,
    checked: CITY_READ,
    sections: [
      {
        id: 'dates',
        heading: `Frost dates at ${station}`,
        paragraphs: [
          `${station} (${nearest.station.id}, ${nearest.state.name}, ${feetText(nearest.station.elevation)}) is the station with freeze dates nearest the internal point the 2020 Census gives for ${city.name}. NOAA gives each 32°F date at three probability levels:`,
        ],
        items: [
          `Last spring freeze: ${springText(spring10)} at 10% (a 1 in 10 chance it comes on or after that day), ${springText(spring50)} at 50%, ${springText(spring90)} at 90%.`,
          `First fall freeze: ${fallText(fall10)} at 10% (a 1 in 10 chance it comes on or before that day), ${fallText(fall50)} at 50%, ${fallText(fall90)} at 90%.`,
        ],
      },
      {
        id: 'season',
        heading: `Growing season in ${city.name}`,
        paragraphs: [
          `${count(season, 'day')} pass between the 50% last spring freeze (${dateText(spring50)}) and the 50% first fall freeze (${dateText(fall50)}) at ${station}. Counting the cautious way, from the late spring date (${springText(spring10)}) to the early fall date (${fallText(fall10)}), leaves ${count(safe, 'day')}.`,
          `The spring dates are spread over ${count(springOrder(spring10) - springOrder(spring90), 'day')} from the 90% date to the 10% date, and the fall dates over ${count(fallOrder(fall90) - fallOrder(fall10), 'day')}: that is how far one year can stray from another here.`,
        ],
      },
      {
        id: 'nearby',
        heading: `Other stations near ${city.name}`,
        paragraphs: [
          ...(spread > 0
            ? [
                `Frost dates shift over short distances. Within ${String(NEAR_MILES)} miles of the Census point, the 50% last freeze runs from ${springText(earliestDay)} at ${titleCase(earliest.station.name)} (${feetText(earliest.station.elevation)}) to ${springText(latestDay)} at ${titleCase(latest.station.name)} (${feetText(latest.station.elevation)}): ${count(spread, 'day')} apart.`,
              ]
            : []),
          neighbors.length === 0
            ? `No other station with dates lies within ${String(NEAR_MILES)} miles of the Census point.`
            : `The ${count(neighbors.length, 'other station')} with dates within ${String(NEAR_MILES)} miles, nearest first, with their 50% dates:`,
        ],
        items: neighbors.map(
          ({ station: each, state: where, miles }) =>
            `${titleCase(each.name)} (${where.code}), ${milesText(miles)}, ${feetText(each.elevation)}: last spring freeze ${springText(triple(each.spring)[1])}, first fall freeze ${fallText(triple(each.fall)[1])}.`,
        ),
      },
      {
        id: 'state',
        heading: `${city.name} against the rest of ${state.name}`,
        paragraphs: [
          `${String(later)} of the ${String(stats.dated)} ${state.name} stations with dates have their 50% last freeze later than ${station}. The middle one is ${dateText(stats.spring.middle)}, so ${station} is ${relative(versusState, 'the middle of the state')}.`,
          ...(airport !== undefined && airport.station.id !== nearest.station.id
            ? [
                `The nearest first-order station (a NOAA id starting USW, mostly airports) is ${titleCase(airport.station.name)}, ${milesText(airport.miles)} from the point, with its last freeze on ${springText(triple(airport.station.spring)[1])}.`,
              ]
            : []),
          ...(zone === undefined
            ? []
            : [`On the grid behind the 2023 USDA map, ${station} is in zone ${zone}.`]),
        ],
        links: [
          ...(zone === undefined
            ? []
            : [{ href: zonePathOf(zone), label: `Zone ${zone} planting schedule` }]),
          ...others.map((other) => ({
            href: cityPathOf(other.slug),
            label: `Last frost in ${other.name}`,
          })),
        ],
      },
      {
        id: 'lawn',
        heading: `Lawn dates for ${city.name}`,
        paragraphs: [
          ...calendar.grasses.text,
          ...(city.local === undefined ? [] : [city.local]),
          ...calendar.seed.flatMap(({ text }) => text),
          ...lawnTimed,
          ...(calendar.feed[0]?.text ?? []),
        ],
        links: [
          { href: seedStatePathOf(state.slug), label: `When to plant grass seed in ${state.name}` },
          { href: feedStatePathOf(state.slug), label: `When to fertilize a lawn in ${state.name}` },
        ],
      },
      {
        id: 'garden',
        heading: `Vegetable planting in ${city.name}`,
        paragraphs: [
          garden
            ? `UNH Extension times the vegetable garden from the last spring frost. Counting from ${dateText(spring50)} at ${station}:`
            : `UNH Extension times its vegetable table from a last spring frost, and the 50% one at ${station} is ${springText(spring50)}: counting from it would put tomato transplants out ${range(tomato?.from ?? spring50, tomato?.to ?? spring50)}, too early for a table written in New Hampshire. This page leaves it out; ${state.name}’s extension service is the place to ask for ${city.name}’s planting dates.`,
        ],
        ...(garden
          ? { items: vegetables.map(({ crop, from, to }) => `${crop}: ${range(from, to)}.`) }
          : {}),
      },
      {
        id: 'frost',
        heading: 'Your own station',
        paragraphs: [
          `A station is not your yard: hills, water and city heat move frost dates, and the Census point is one spot in ${city.name}. Type your ZIP on the frost dates page to find the station nearest your home, or open the ${nearest.state.name} table at ${station}.`,
        ],
        links: [
          { href: '/frost-dates#zip', label: 'ZIP lookup' },
          stationLink(nearest),
          ...(nearest.state.slug === state.slug
            ? []
            : [{ href: frostPathOf(state.slug), label: `${state.name} frost dates` }]),
        ],
      },
    ],
    questions: [
      {
        question: `When is the last frost in ${city.name}?`,
        answer: `Around ${dateText(spring50)} in a middle year at ${station}, the NOAA station nearest the city, and on or after ${springText(spring10)} in 1 year in 10 (1991-2020 normals).`,
      },
      {
        question: `When is the first frost in ${city.name}?`,
        answer: `Around ${dateText(fall50)} at ${station}; in 1 year in 10 it comes on or before ${fallText(fall10)}.`,
      },
      {
        question: `How long is the growing season in ${city.name}?`,
        answer: `${count(season, 'day')} between the 50% last spring and first fall freezes at ${station}, or ${count(safe, 'day')} between the 10% dates.`,
      },
      {
        question: `When should I seed my lawn in ${city.name}?`,
        answer: `${calendar.seed[0]?.text[0] ?? ''} ${cool ? `Timed from the frost, cool-season seed goes down by ${dateText(seedBy.days45)} at ${station}.` : `Timed from the frost, warm-season sprigs and plugs go in by ${dateText(warmPlugBy(fall50))} at ${station}.`}`,
      },
    ],
    sources: unique,
    calculators: [],
    card: {
      title: `Last frost in ${city.name}`,
      summary: `${dateText(spring50)} at ${station}; first frost ${dateText(fall50)}.`,
    },
  };
};

/** Every city page, in the order of `FROST_CITIES`. */
const CITY_PAIRS = FROST_CITIES.map((city) => ({ city, guide: cityGuideOf(city) }));

export const CITY_GUIDES: readonly Guide[] = CITY_PAIRS.map(({ guide }) => guide);

/** The city pages of the state `slug`, for its frost page. */
export const cityGuidesOfState = (slug: string): readonly Guide[] =>
  CITY_PAIRS.filter(({ city }) => stateOfCode(city.code).slug === slug).map(({ guide }) => guide);
