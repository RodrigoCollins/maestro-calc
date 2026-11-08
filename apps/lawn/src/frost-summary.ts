import type { Station } from '@maestro-calc/lawn-data/frost/types';
import { frostPathOf, FROST_PAGES, FROST_STATES, type FrostPage } from './frost.ts';
import { STATIONS_OF } from './frost-stations.ts';
import { dateText, titleCase } from './frost-text.ts';

/*
 * What a frost page says about its own stations, worked out from their NOAA 1991-2020 dates: the
 * range and the middle of the 50% last spring and first fall freeze, the days between the two at
 * each station, and the highest station against the lowest. NOAA counts the season from August 1
 * to July 30 (`@maestro-calc/lawn-data/frost/types`), so a spring day of 213 or more lies in the
 * year before and a fall day under 213 in the year after; the order of the dates follows that.
 */

const SEASON_START = 213;
const FEET_PER_METER = 3.28084;

/** A spring day on the season's line: a day from August on belongs to the year before. */
const springOrder = (day: number): number => (day >= SEASON_START ? day - 365 : day);
/** A fall day on the season's line: a day before August belongs to the year after. */
const fallOrder = (day: number): number => (day < SEASON_START ? day + 365 : day);

interface Dated {
  readonly name: string;
  readonly elevation: number | null;
  readonly spring: number;
  readonly fall: number;
  /** Days from the 50% last spring freeze to the 50% first fall freeze. */
  readonly season: number;
}

const datedOf = (stations: readonly Station[]): readonly Dated[] =>
  stations.flatMap(({ name, elevation, spring, fall, year }) => {
    const [, springDay] = spring;
    const [, fallDay] = fall;
    if (year === 'always-freezing' || springDay === null || fallDay === null) return [];
    return [
      {
        name: titleCase(name),
        elevation,
        spring: springDay,
        fall: fallDay,
        season: fallOrder(fallDay) - springOrder(springDay),
      },
    ];
  });

/** The middle value of a list in order: the lower of the two middles of an even list. */
const middleOf = <T>(sorted: readonly T[]): T | undefined =>
  sorted[Math.floor((sorted.length - 1) / 2)];

/** `a`, `a and b`, `a, b and 3 other stations`. */
const namesText = (names: readonly string[]): string =>
  names.length <= 2
    ? names.join(' and ')
    : names.length === 3
      ? `${names[0] ?? ''}, ${names[1] ?? ''} and ${names[2] ?? ''}`
      : `${names[0] ?? ''}, ${names[1] ?? ''} and ${String(names.length - 2)} other stations`;

/** The stations at the lowest and at the highest value of `order`, with the extreme values. */
const extremesOf = (dated: readonly Dated[], order: (each: Dated) => number) => {
  const values = dated.map(order);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const at = (value: number) =>
    namesText(dated.filter((each) => order(each) === value).map(({ name }) => name));
  return { low, high, lowNames: at(low), highNames: at(high) };
};

const rangeSentence = (
  dated: readonly Dated[],
  pick: (each: Dated) => number,
  order: (day: number) => number,
  opening: string,
): string => {
  const { lowNames, highNames } = extremesOf(dated, (each) => order(pick(each)));
  const sorted = dated.toSorted((a, b) => order(pick(a)) - order(pick(b)));
  const first = sorted[0];
  const last = sorted.at(-1);
  const middle = middleOf(sorted);
  const tail =
    dated.length >= 3 && middle !== undefined
      ? `; the middle of the ${String(dated.length)} stations is ${dateText(pick(middle))}`
      : '';
  return `${opening} from ${dateText(first === undefined ? null : pick(first))} at ${lowNames} to ${dateText(last === undefined ? null : pick(last))} at ${highNames}${tail}.`;
};

const feet = (meters: number): string =>
  Math.round(meters * FEET_PER_METER).toLocaleString('en-US');

const elevationSentence = (dated: readonly Dated[]): string | undefined => {
  const known = dated.filter(
    (each): each is Dated & { elevation: number } => each.elevation !== null,
  );
  const sorted = known.toSorted((a, b) => a.elevation - b.elevation);
  const lowest = sorted[0];
  const highest = sorted.at(-1);
  if (lowest === undefined || highest === undefined || lowest.elevation === highest.elevation)
    return undefined;
  return `The highest station, ${highest.name} at ${feet(highest.elevation)} ft, has ${String(highest.season)} days between the two; the lowest, ${lowest.name} at ${feet(lowest.elevation)} ft, has ${String(lowest.season)} days.`;
};

export interface FrostSummary {
  readonly h2: string;
  readonly paragraphs: readonly string[];
  /** The other parts of a state split over several pages, linked from the text. */
  readonly parts: readonly { readonly href: string; readonly label: string }[];
}

const stationsOfPage = (page: FrostPage): readonly Station[] => {
  const ids = new Set(page.rows.map(({ id }) => id));
  return (STATIONS_OF[page.state.slug] ?? []).filter(({ id }) => ids.has(id));
};

/** The summary of one frost page, from the stations it lists. */
export const frostSummaryOf = (page: FrostPage): FrostSummary => {
  const stations = stationsOfPage(page);
  const dated = datedOf(stations);
  const freezing = stations.filter(({ year }) => year === 'always-freezing').length;
  const undated = stations.length - dated.length - freezing;
  const seasons = dated.toSorted((a, b) => a.season - b.season);
  const middle = middleOf(seasons);
  const shortest = extremesOf(dated, ({ season }) => season);
  const paragraphs =
    dated.length === 0
      ? []
      : [
          rangeSentence(
            dated,
            ({ spring }) => spring,
            springOrder,
            'At the 50% level, the last spring freeze on this page runs',
          ),
          rangeSentence(dated, ({ fall }) => fall, fallOrder, 'The first fall freeze runs'),
          `Between the two 50% dates, the time without a 32°F freeze runs from ${String(shortest.low)} days at ${shortest.lowNames} to ${String(shortest.high)} days at ${shortest.highNames}${dated.length >= 3 && middle !== undefined ? `; the middle station has ${String(middle.season)} days` : ''}.`,
        ];
  const elevation = elevationSentence(dated);
  return {
    h2: `${page.state.name} at a glance`,
    paragraphs: [
      ...paragraphs,
      ...(elevation === undefined ? [] : [elevation]),
      ...(freezing === 0
        ? []
        : [
            `${String(freezing)} of the ${String(stations.length)} stations on this page have a freeze risk all year, so NOAA gives them no dates.`,
          ]),
      ...(undated === 0
        ? []
        : [
            `${String(undated)} of the ${String(stations.length)} stations on this page have no 50% date for spring or fall in the normals and are left out of these figures.`,
          ]),
    ],
    parts: FROST_PAGES.filter(
      ({ state, part }) => state.slug === page.state.slug && part !== page.part,
    ).map(({ state, part, rows }) => ({
      href: frostPathOf(state.slug, part),
      label: `${state.name}, part ${String(part)}: ${rows[0]?.name ?? ''} to ${rows.at(-1)?.name ?? ''}`,
    })),
  };
};

/** What the index of the frost pages says: the states with the earliest and the latest middle dates. */
export const frostIndexSummary = (): {
  readonly h2: string;
  readonly paragraphs: readonly string[];
} => {
  const states = FROST_STATES.flatMap((state) => {
    const dated = datedOf(STATIONS_OF[state.slug] ?? []);
    const spring = middleOf(
      dated.toSorted((a, b) => springOrder(a.spring) - springOrder(b.spring)),
    );
    const fall = middleOf(dated.toSorted((a, b) => fallOrder(a.fall) - fallOrder(b.fall)));
    const season = middleOf(dated.toSorted((a, b) => a.season - b.season));
    return spring === undefined || fall === undefined || season === undefined
      ? []
      : [{ name: state.name, spring: spring.spring, fall: fall.fall, season: season.season }];
  });
  const total = FROST_STATES.reduce((sum, { slug }) => sum + (STATIONS_OF[slug]?.length ?? 0), 0);
  const freezing = FROST_STATES.flatMap(({ slug }) => STATIONS_OF[slug] ?? []).filter(
    ({ year }) => year === 'always-freezing',
  ).length;
  const by = (order: (each: (typeof states)[number]) => number) =>
    states.toSorted((a, b) => order(a) - order(b));
  const spring = by(({ spring }) => springOrder(spring));
  const fall = by(({ fall }) => fallOrder(fall));
  const season = by(({ season }) => season);
  const ends = <T extends { name: string }>(list: readonly T[]) => [list[0], list.at(-1)] as const;
  const [earlySpring, lateSpring] = ends(spring);
  const [earlyFall, lateFall] = ends(fall);
  const [shortSeason, longSeason] = ends(season);
  return {
    h2: 'The states side by side',
    paragraphs: [
      `This index covers ${total.toLocaleString('en-US')} stations in 50 states. Take the middle station of each state at the 50% level: its last spring freeze runs from ${dateText(earlySpring?.spring ?? null)} in ${earlySpring?.name ?? ''} to ${dateText(lateSpring?.spring ?? null)} in ${lateSpring?.name ?? ''}, and its first fall freeze from ${dateText(earlyFall?.fall ?? null)} in ${earlyFall?.name ?? ''} to ${dateText(lateFall?.fall ?? null)} in ${lateFall?.name ?? ''}.`,
      `The middle station of ${shortSeason?.name ?? ''} has the fewest days between the two dates, ${String(shortSeason?.season ?? 0)}, and the middle station of ${longSeason?.name ?? ''} the most, ${String(longSeason?.season ?? 0)}. ${String(freezing)} stations have a freeze risk all year and no dates. Each state page lists its own range, its middle station and its highest and lowest station.`,
    ],
  };
};
