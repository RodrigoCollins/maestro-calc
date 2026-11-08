/**
 * Builds the frost-date dataset of the Lawn Figures site from NOAA and Census public-domain data.
 *
 * Rerun (Node 24 runs the TypeScript directly; only node: builtins and global fetch are used):
 *
 *   node packages/lawn-data/scripts/build-frost.ts --pulled YYYY-MM-DD
 *
 * `--pulled` is the day the inputs were fetched and goes into `src/frost/source.ts`; pass the same
 * date again and a rerun is byte-identical. Inputs are downloaded once into a cache directory
 * (`FROST_CACHE_DIR`, default `packages/lawn-data/.cache/`, git-ignored) and reused; delete a file
 * there to fetch it again. Inputs:
 *
 *   - NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal, by-station archive (tar.gz of
 *     one CSV per station, about 54 MB)
 *   - Census 2020 ZCTA gazetteer (internal points) and the 2020 ZCTA-to-county relationship file
 *
 * Outputs (all overwritten, sorted, already Prettier-formatted):
 *
 *   - packages/lawn-data/src/frost/<state-slug>.ts   `STATIONS` of each of the 50 states and DC
 *   - packages/lawn-data/src/frost/states.ts         `STATES`
 *   - packages/lawn-data/src/frost/source.ts         source metadata and the pull date
 *   - apps/lawn/public/data/frost/zip-<digit>.json   ZIP to nearest station, shard format of
 *                                                    packages/lawn-data/src/frost/zip.ts
 *
 * The parsing and rendering live in `src/frost/build.ts` (unit-tested); this file only does I/O.
 */
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createGunzip, inflateRawSync } from 'node:zlib';
import {
  STATE_TABLE,
  classifyStation,
  encodeShards,
  parseGazetteer,
  parseStationCsv,
  parseZctaStates,
  renderSourceModule,
  renderStatesModule,
  renderStationsModule,
  type Located,
  type Zcta,
} from '../src/frost/build.ts';
import type { Station } from '../src/frost/types.ts';

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(PACKAGE, '..', '..');
const FROST_DIR = join(PACKAGE, 'src', 'frost');
const SHARD_DIR = join(REPO, 'apps', 'lawn', 'public', 'data', 'frost');

const NOAA_ARCHIVE =
  'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/archive/us-climate-normals_1991-2020_v1.0.1_annualseasonal_multivariate_by-station_c20230404.tar.gz';
const GAZETTEER =
  'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip';
const RELATIONSHIP =
  'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt';

function pulledArgument(): string {
  const at = process.argv.indexOf('--pulled');
  const value = process.argv[at + 1];
  if (at < 0 || !value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('usage: node packages/lawn-data/scripts/build-frost.ts --pulled YYYY-MM-DD');
  }
  return value;
}

async function exists(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false,
  );
}

/** Downloads `url` to `cache/<name>` unless it is already there. */
async function fetched(cache: string, name: string, url: string): Promise<string> {
  const path = join(cache, name);
  if (await exists(path)) return path;
  await mkdir(cache, { recursive: true });
  console.log(`downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${url}: HTTP ${String(response.status)}`);
  const partial = `${path}.part`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial));
  await rename(partial, path);
  return path;
}

/** The one file of a single-file zip, read through its central directory. */
function unzipOnly(zip: Buffer): string {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0 || zip.readUInt16LE(end + 10) !== 1) throw new Error('expected a one-file zip');
  const central = zip.readUInt32LE(end + 16);
  const method = zip.readUInt16LE(central + 10);
  const size = zip.readUInt32LE(central + 20);
  const local = zip.readUInt32LE(central + 42);
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const data = zip.subarray(start, start + size);
  if (method === 0) return data.toString('utf8');
  if (method === 8) return inflateRawSync(data).toString('utf8');
  throw new Error(`unsupported zip method ${String(method)}`);
}

/** Streams the regular files of a tar.gz as `[name, text]`, one at a time. */
async function* tarEntries(path: string): AsyncGenerator<[name: string, text: string]> {
  let buffer: Buffer = Buffer.alloc(0);
  for await (const chunk of createReadStream(path).pipe(createGunzip()) as AsyncIterable<Buffer>) {
    buffer = buffer.length === 0 ? chunk : Buffer.concat([buffer, chunk]);
    for (;;) {
      if (buffer.length < 512) break;
      const header = buffer.subarray(0, 512);
      if (header.every((byte) => byte === 0)) {
        buffer = buffer.subarray(512);
        continue;
      }
      const size = parseInt(header.toString('ascii', 124, 136).replace(/\0.*$/, '').trim(), 8);
      const padded = Math.ceil(size / 512) * 512;
      if (buffer.length < 512 + padded) break;
      const type = String.fromCharCode(header[156] ?? 0);
      if (type === '0' || type === '\0') {
        const name = header.toString('utf8', 0, 100).replace(/\0.*$/, '');
        yield [name, buffer.toString('utf8', 512, 512 + size)];
      }
      buffer = buffer.subarray(512 + padded);
    }
  }
}

function byStationOrder(a: Station, b: Station): number {
  const name = a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  return name || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

async function main(): Promise<void> {
  const pulled = pulledArgument();
  const cache = process.env['FROST_CACHE_DIR'] ?? join(PACKAGE, '.cache');
  const archive = await fetched(cache, 'noaa-annualseasonal-by-station.tar.gz', NOAA_ARCHIVE);
  const gazetteer = await fetched(cache, 'census-2020-gaz-zcta.zip', GAZETTEER);
  const relationship = await fetched(cache, 'census-2020-zcta-county.txt', RELATIONSHIP);

  const byState = new Map<string, Station[]>(STATE_TABLE.map((state) => [state.code, []]));
  const dropped = { total: 0, 'not-us-state': 0, insufficient: 0, mixed: 0 };
  let files = 0;
  let withFreeze = 0;
  for await (const [, text] of tarEntries(archive)) {
    files += 1;
    const parsed = parseStationCsv(text);
    if (!parsed) continue;
    withFreeze += 1;
    const result = classifyStation(parsed);
    if (result.kind === 'dropped') {
      dropped.total += 1;
      dropped[result.reason] += 1;
    } else byState.get(result.code)?.push(result.station);
  }
  console.log(
    `${String(files)} station files, ${String(withFreeze)} with freeze fields, dropped`,
    dropped,
  );

  const located: Located[] = [];
  const entries = STATE_TABLE.map((state) => {
    const stations = (byState.get(state.code) ?? []).sort(byStationOrder);
    for (const s of stations) {
      // A year-round-freezing station has no dates to give a ZIP: it never is a nearest station.
      if (s.year === undefined)
        located.push({ stateSlug: state.slug, id: s.id, lat: s.lat, lon: s.lon });
    }
    return {
      code: state.code,
      slug: state.slug,
      name: state.name,
      stations: stations.length,
      list: stations,
    };
  });
  located.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  await mkdir(FROST_DIR, { recursive: true });
  for (const entry of entries) {
    await writeFile(join(FROST_DIR, `${entry.slug}.ts`), renderStationsModule(entry.list));
  }
  await writeFile(join(FROST_DIR, 'states.ts'), renderStatesModule(entries));
  await writeFile(join(FROST_DIR, 'source.ts'), renderSourceModule(pulled));

  const points = parseGazetteer(unzipOnly(await readFile(gazetteer)));
  const fipsOf = parseZctaStates(await readFile(relationship, 'utf8'));
  const slugOfFips = new Map(STATE_TABLE.map((state) => [state.fips, state.slug]));
  const zctas: Zcta[] = [];
  let outside = 0;
  for (const [zip, point] of points) {
    const stateSlug = slugOfFips.get(fipsOf.get(zip) ?? '');
    if (stateSlug === undefined) outside += 1;
    else zctas.push({ zip, lat: point.lat, lon: point.lon, stateSlug });
  }
  console.log(
    `${String(zctas.length)} ZCTAs in the 50 states + DC, ${String(outside)} elsewhere (skipped)`,
  );

  await mkdir(SHARD_DIR, { recursive: true });
  const far = { over50: 0, over100: 0, over200: 0, max: 0 };
  let covered = 0;
  for (const [key, shard] of encodeShards(zctas, located)) {
    const json = JSON.stringify(shard);
    await writeFile(join(SHARD_DIR, `zip-${key}.json`), json);
    console.log(`zip-${key}.json ${String(Buffer.byteLength(json))} B`);
    for (const row of Object.values(shard.zips)) {
      const miles = row[1] ?? 0;
      covered += 1;
      far.max = Math.max(far.max, miles);
      if (miles > 50) far.over50 += 1;
      if (miles > 100) far.over100 += 1;
      if (miles > 200) far.over200 += 1;
    }
  }
  console.log(`${String(covered)} ZIPs covered; nearest-station distance`, far);
  console.log(
    'stations per state:',
    entries.map((entry) => `${entry.code}=${String(entry.stations)}`).join(' '),
    `total=${String(located.length)}`,
  );
}

await main();
