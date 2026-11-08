import { STATES, type StateEntry } from '@maestro-calc/lawn-data/frost/states';
import type { Station, Triple } from '@maestro-calc/lawn-data/frost/types';
import { STATIONS_OF } from './frost-stations.ts';
import { dateText, titleCase } from './frost-text.ts';

/**
 * Rows of one frost page. A state with more stations is split into parts of this many (sorted by
 * name), so the page stays inside the HTML budget of `@maestro-calc/site-kit/budgets`.
 */
export const ROWS_PER_PAGE = 200;

/** One row of a frost page: a station with its six dates as the page writes them. */
export interface FrostRow {
  readonly id: string;
  readonly name: string;
  /** Last spring then first fall 32 F freeze at 10, 50 and 90 percent: six dates. */
  readonly dates: readonly string[];
  /** True when NOAA flags the station as freezing all year (no dates to give). */
  readonly alwaysFreezing: boolean;
}

const datesOf = (spring: Triple, fall: Triple): string[] => [...spring, ...fall].map(dateText);

export const rowOf = (station: Station): FrostRow => ({
  id: station.id,
  name: titleCase(station.name),
  dates: datesOf(station.spring, station.fall),
  alwaysFreezing: station.year === 'always-freezing',
});

/** One built page of the frost dates: a state, or one part of a big state. */
export interface FrostPage {
  readonly state: StateEntry;
  /** 1-based part of the state, and how many parts it has. */
  readonly part: number;
  readonly parts: number;
  readonly path: string;
  readonly rows: readonly FrostRow[];
}

/** The path of the frost page of `slug`: the state itself, or `/2`, `/3`... for its later parts. */
export const frostPathOf = (slug: string, part = 1): string =>
  part === 1 ? `/frost-dates/${slug}` : `/frost-dates/${slug}/${String(part)}`;

/** The states that have a page: those with stations (the District of Columbia has none). */
export const FROST_STATES: readonly StateEntry[] = STATES.filter(({ stations }) => stations > 0);

const sortedStations = (slug: string): readonly Station[] =>
  [...(STATIONS_OF[slug] ?? [])].sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1,
  );

/** Every frost page, state by state, each state in parts of at most `ROWS_PER_PAGE` stations. */
export const FROST_PAGES: readonly FrostPage[] = FROST_STATES.flatMap((state) => {
  const stations = sortedStations(state.slug);
  const parts = Math.ceil(stations.length / ROWS_PER_PAGE);
  return Array.from({ length: parts }, (_, index) => ({
    state,
    part: index + 1,
    parts,
    path: frostPathOf(state.slug, index + 1),
    rows: stations.slice(index * ROWS_PER_PAGE, (index + 1) * ROWS_PER_PAGE).map(rowOf),
  }));
});

/** The frost page at `path`; any other path throws at build time. */
export const frostPageOf = (path: string): FrostPage => {
  const page = FROST_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no frost page at ${path}`);
  return page;
};

/** The part of its state's pages that lists station `id`, for the link a ZIP result gives. */
export const partOf = (slug: string, id: string): number => {
  const at = sortedStations(slug).findIndex((station) => station.id === id);
  return at < 0 ? 1 : Math.floor(at / ROWS_PER_PAGE) + 1;
};
