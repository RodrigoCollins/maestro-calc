/**
 * Builds the USDA Plant Hardiness Zone of every frost station of the 48 contiguous states, from the
 * PRISM grid behind the 2023 USDA map (Oregon State University for USDA ARS).
 *
 * Rerun after `build-frost.ts` (Node 24 runs the TypeScript directly; only node: builtins and
 * global fetch are used):
 *
 *   node packages/lawn-data/scripts/build-zones.ts --pulled YYYY-MM-DD
 *
 * The grid zip (about 30 MB) is downloaded once into the cache directory of the frost build
 * (`FROST_CACHE_DIR`, default `packages/lawn-data/.cache/`, git-ignored) and reused. Outputs:
 *
 *   - packages/lawn-data/src/zones/stations.ts   `STATION_ZONES`, by station id
 *   - packages/lawn-data/src/zones/source.ts     `ZONE_SOURCE`, the sources and the pull date
 *
 * The parsing and rendering live in `scripts/zones-build.ts` (unit-tested); this file only does I/O.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { STATES } from '../src/frost/states.ts';
import type { Station } from '../src/frost/types.ts';
import {
  gridValue,
  parseBilHeader,
  renderZoneSourceModule,
  renderZonesModule,
  stationZoneOf,
  zipEntry,
  type ZoneRow,
} from './zones-build.ts';

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZONES_DIR = join(PACKAGE, 'src', 'zones');
const GRID_ZIP = 'https://prism.oregonstate.edu/phzm/data/2023/phzm_us_grid_2023.zip';
/** Not on the conterminous grid: Alaska and Hawaii have grids of their own; DC has no station. */
const OFF_GRID = new Set(['AK', 'HI', 'DC']);

function pulledArgument(): string {
  const at = process.argv.indexOf('--pulled');
  const value = process.argv[at + 1];
  if (at < 0 || !value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('usage: node packages/lawn-data/scripts/build-zones.ts --pulled YYYY-MM-DD');
  }
  return value;
}

async function fetched(cache: string, name: string, url: string): Promise<string> {
  const path = join(cache, name);
  const there = await stat(path).then(
    () => true,
    () => false,
  );
  if (there) return path;
  await mkdir(cache, { recursive: true });
  console.log(`downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${url}: HTTP ${String(response.status)}`);
  const partial = `${path}.part`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial));
  await rename(partial, path);
  return path;
}

async function main(): Promise<void> {
  const pulled = pulledArgument();
  const cache = process.env['FROST_CACHE_DIR'] ?? join(PACKAGE, '.cache');
  const zip = await readFile(await fetched(cache, 'phzm_us_grid_2023.zip', GRID_ZIP));
  const grid = {
    header: parseBilHeader(zipEntry(zip, 'phzm_us_grid_2023.hdr').toString('utf8')),
    data: zipEntry(zip, 'phzm_us_grid_2023.bil'),
  };

  const rows: ZoneRow[] = [];
  const missing: string[] = [];
  for (const state of STATES.filter(({ code }) => !OFF_GRID.has(code))) {
    const module = (await import(join(PACKAGE, 'src', 'frost', `${state.slug}.ts`))) as {
      STATIONS: readonly Station[];
    };
    for (const station of module.STATIONS) {
      const value = gridValue(grid, station.lat, station.lon);
      if (value === null) {
        missing.push(`${station.id} ${station.name}, ${state.code}`);
        continue;
      }
      const [zone, min] = stationZoneOf(value);
      rows.push({ id: station.id, zone, min });
    }
  }
  console.log(`${String(rows.length)} stations zoned; no grid value at:`, missing);

  await mkdir(ZONES_DIR, { recursive: true });
  await writeFile(join(ZONES_DIR, 'stations.ts'), renderZonesModule(rows));
  await writeFile(join(ZONES_DIR, 'source.ts'), renderZoneSourceModule(pulled));
}

await main();
