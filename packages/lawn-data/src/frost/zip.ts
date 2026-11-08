/**
 * ZIP lookup shard, as written to `apps/lawn/public/data/frost/zip-<first digit>.json`:
 *
 *   {
 *     "states":   ["new-jersey", "new-york"],          // state slugs, sorted
 *     "stations": [[0, "USW00014734"], ...],           // [index into states, GHCN station id]
 *     "zips":     { "07001": [0, 8], "10002": [0, 0, 1] }
 *   }
 *
 * A zip row is `[station index, whole miles]` (the ZIP is in the state of its station) or
 * `[station index, whole miles, index into states]` (the ZIP is in another state). The distance
 * is haversine miles from the ZCTA internal point to the nearest station, rounded.
 */
export interface Shard {
  readonly states: readonly string[];
  readonly stations: readonly (readonly [state: number, id: string])[];
  readonly zips: Readonly<Record<string, readonly number[]>>;
}

export interface ZipMatch {
  /** Slug of the state the ZIP is in. */
  readonly state: string;
  readonly stationId: string;
  /** Slug of the state whose module holds the station. */
  readonly stationState: string;
  readonly miles: number;
}

/** File name of the shard that holds a 5-digit ZIP, or `undefined` when it is not 5 ASCII digits. */
export function shardOf(zip: string): string | undefined {
  return /^[0-9]{5}$/.test(zip) ? `zip-${zip.charAt(0)}.json` : undefined;
}

export function lookupZip(shard: Shard, zip: string): ZipMatch | undefined {
  if (!Object.hasOwn(shard.zips, zip)) return undefined;
  const row = shard.zips[zip];
  const station = shard.stations[row?.[0] ?? -1];
  const stationState = station && shard.states[station[0]];
  const miles = row?.[1];
  const state = row?.length === 3 ? shard.states[row[2] ?? -1] : stationState;
  if (!station || !stationState || miles === undefined || !state) return undefined;
  return { state, stationId: station[1], stationState, miles };
}
