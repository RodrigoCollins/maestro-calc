import { ROWS_PER_PAGE } from './frost.ts';
import { STATIONS_OF } from './frost-stations.ts';

/**
 * The dates of one state for the ZIP lookup, as `data/frost/<slug>.json`: the state's name and,
 * by station id, `[part, name, spring 10, 50, 90, fall 10, 50, 90]` with day numbers of the
 * 365-day calendar (`null` for none). `part` is the page of the state that lists the station, so
 * the result can link its row. Stations are in the order of the pages (sorted by name).
 */
export interface StateJson {
  readonly name: string;
  readonly stations: Readonly<Record<string, readonly (number | string | null)[]>>;
}

export const stateJsonOf = (slug: string, name: string): StateJson => {
  const stations = [...(STATIONS_OF[slug] ?? [])].sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1,
  );
  return {
    name,
    stations: Object.fromEntries(
      stations.map((station, index) => [
        station.id,
        [Math.floor(index / ROWS_PER_PAGE) + 1, station.name, ...station.spring, ...station.fall],
      ]),
    ),
  };
};
