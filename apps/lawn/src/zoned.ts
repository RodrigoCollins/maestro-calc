import { STATES, type StateEntry } from '@maestro-calc/lawn-data/frost/states';
import type { Station } from '@maestro-calc/lawn-data/frost/types';
import { STATION_ZONES } from '@maestro-calc/lawn-data/zones/stations';
import { ZONES, zoneAt, type Zone } from '@maestro-calc/lawn-data/zones/zone';
import { STATIONS_OF } from './frost-stations.ts';

/** A frost station of the 48 contiguous states with its 2023 USDA half zone. */
export interface ZonedStation {
  readonly station: Station;
  readonly state: StateEntry;
  readonly zone: Zone;
  /** Average annual extreme minimum, °F, to a tenth. */
  readonly min: number;
}

/** Every frost station with a zone (`@maestro-calc/lawn-data/zones/stations`), state by state. */
export const ZONED: readonly ZonedStation[] = STATES.flatMap((state) =>
  (STATIONS_OF[state.slug] ?? []).flatMap((station) => {
    const zoned = STATION_ZONES[station.id];
    if (zoned === undefined) return [];
    const [label, min] = zoned;
    return [{ station, state, zone: zoneAt(label), min }];
  }),
);

/** The half zones with a page: those the zoned stations fall in, coldest first (3a to 10b). */
export const PAGE_ZONES: readonly Zone[] = ZONES.filter(({ label }) =>
  ZONED.some(({ zone }) => zone.label === label),
);

/** The zoned stations of half zone `label`. */
export const stationsOfZone = (label: string): readonly ZonedStation[] =>
  ZONED.filter(({ zone }) => zone.label === label);

/** The stations of state `slug` by half zone, coldest first; none off the contiguous grid. */
export const zonesOfState = (
  slug: string,
): readonly { readonly zone: Zone; readonly stations: readonly ZonedStation[] }[] => {
  const ofState = ZONED.filter(({ state }) => state.slug === slug);
  return ZONES.map((zone) => ({
    zone,
    stations: ofState.filter((each) => each.zone.label === zone.label),
  })).filter(({ stations }) => stations.length > 0);
};
