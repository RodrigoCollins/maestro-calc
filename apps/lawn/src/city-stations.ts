import { titleCase } from './frost-text.ts';
import type { ZonedStation } from './zoned.ts';

/** A first-order station of a page: its name, state, 50% freeze dates and USDA half zone. */
export interface CityStation {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly zone: string;
  readonly spring: number;
  readonly fall: number;
}

/**
 * The first-order weather stations of a group (NOAA ids beginning `USW`, mostly city airports)
 * with both 50% dates, sorted by name; when there are more than `limit`, a sample spread evenly
 * from the first to the last.
 */
export const cityStationsOf = (
  stations: readonly ZonedStation[],
  limit = 10,
): readonly CityStation[] => {
  const all = stations
    .flatMap(({ station, state, zone }) => {
      const [, spring] = station.spring;
      const [, fall] = station.fall;
      return station.id.startsWith('USW') && spring !== null && fall !== null
        ? [
            {
              id: station.id,
              name: titleCase(station.name),
              code: state.code,
              zone: zone.label,
              spring,
              fall,
            },
          ]
        : [];
    })
    .toSorted((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1));
  if (all.length <= limit) return all;
  if (limit <= 1) return all.slice(0, limit);
  return Array.from(
    { length: limit },
    (_, index) => all[Math.round((index * (all.length - 1)) / (limit - 1))],
  ).filter((each): each is CityStation => each !== undefined);
};
