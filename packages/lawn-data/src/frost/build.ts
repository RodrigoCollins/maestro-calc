/**
 * Pure parsing, transform and rendering functions of the frost build
 * (`packages/lawn-data/scripts/build-frost.ts` does the I/O). No network, no files, no clock.
 */
import type { Shard } from './zip.ts';
import type { Station, Triple } from './types.ts';

export interface StateInfo {
  readonly code: string;
  readonly name: string;
  readonly slug: string;
  /** Census state FIPS code. */
  readonly fips: string;
}

const STATE_ROWS: readonly (readonly [code: string, fips: string, name: string])[] = [
  ['AL', '01', 'Alabama'],
  ['AK', '02', 'Alaska'],
  ['AZ', '04', 'Arizona'],
  ['AR', '05', 'Arkansas'],
  ['CA', '06', 'California'],
  ['CO', '08', 'Colorado'],
  ['CT', '09', 'Connecticut'],
  ['DE', '10', 'Delaware'],
  ['DC', '11', 'District of Columbia'],
  ['FL', '12', 'Florida'],
  ['GA', '13', 'Georgia'],
  ['HI', '15', 'Hawaii'],
  ['ID', '16', 'Idaho'],
  ['IL', '17', 'Illinois'],
  ['IN', '18', 'Indiana'],
  ['IA', '19', 'Iowa'],
  ['KS', '20', 'Kansas'],
  ['KY', '21', 'Kentucky'],
  ['LA', '22', 'Louisiana'],
  ['ME', '23', 'Maine'],
  ['MD', '24', 'Maryland'],
  ['MA', '25', 'Massachusetts'],
  ['MI', '26', 'Michigan'],
  ['MN', '27', 'Minnesota'],
  ['MS', '28', 'Mississippi'],
  ['MO', '29', 'Missouri'],
  ['MT', '30', 'Montana'],
  ['NE', '31', 'Nebraska'],
  ['NV', '32', 'Nevada'],
  ['NH', '33', 'New Hampshire'],
  ['NJ', '34', 'New Jersey'],
  ['NM', '35', 'New Mexico'],
  ['NY', '36', 'New York'],
  ['NC', '37', 'North Carolina'],
  ['ND', '38', 'North Dakota'],
  ['OH', '39', 'Ohio'],
  ['OK', '40', 'Oklahoma'],
  ['OR', '41', 'Oregon'],
  ['PA', '42', 'Pennsylvania'],
  ['RI', '44', 'Rhode Island'],
  ['SC', '45', 'South Carolina'],
  ['SD', '46', 'South Dakota'],
  ['TN', '47', 'Tennessee'],
  ['TX', '48', 'Texas'],
  ['UT', '49', 'Utah'],
  ['VT', '50', 'Vermont'],
  ['VA', '51', 'Virginia'],
  ['WA', '53', 'Washington'],
  ['WV', '54', 'West Virginia'],
  ['WI', '55', 'Wisconsin'],
  ['WY', '56', 'Wyoming'],
];

/** The 50 states and DC, sorted by name. */
export const STATE_TABLE: readonly StateInfo[] = STATE_ROWS.map(([code, fips, name]) => ({
  code,
  fips,
  name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
})).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** One NOAA cell of a frost field: the trimmed value text and its measurement flag. */
export interface FrostCell {
  readonly value: string;
  readonly flag: string;
}

export interface ParsedStation {
  readonly id: string;
  /** NAME as NOAA gives it, e.g. `FT COLLINS, CO US`. */
  readonly rawName: string;
  readonly lat: number;
  readonly lon: number;
  readonly elevation: number | null;
  /** `ANN-TMIN-PRBLST-T32FP10`, `FP50`, `FP90`. */
  readonly spring: readonly FrostCell[];
  /** `ANN-TMIN-PRBFST-T32FP10`, `FP50`, `FP90`. */
  readonly fall: readonly FrostCell[];
}

export type Classified =
  | { readonly kind: 'station'; readonly code: string; readonly station: Station }
  | { readonly kind: 'dropped'; readonly reason: 'not-us-state' | 'insufficient' | 'mixed' };

const SPRING_FIELDS = [
  'ANN-TMIN-PRBLST-T32FP10',
  'ANN-TMIN-PRBLST-T32FP50',
  'ANN-TMIN-PRBLST-T32FP90',
] as const;
const FALL_FIELDS = [
  'ANN-TMIN-PRBFST-T32FP10',
  'ANN-TMIN-PRBFST-T32FP50',
  'ANN-TMIN-PRBFST-T32FP90',
] as const;

/** Splits one CSV line (RFC 4180 quoting: `"` wraps a field, `""` is a quote inside it). */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line.charAt(i);
    if (quoted) {
      if (char !== '"') field += char;
      else if (line.charAt(i + 1) === '"') {
        field += '"';
        i += 1;
      } else quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      fields.push(field);
      field = '';
    } else field += char;
  }
  fields.push(field);
  return fields;
}

/** `MM/DD` (NOAA pads it with spaces) as a day of a 365-day year; February 29 does not exist. */
export function dayOfYear(monthDay: string): number {
  const match = /^\s*(\d{2})\/(\d{2})\s*$/.exec(monthDay);
  const month = Number(match?.[1]);
  const day = Number(match?.[2]);
  const length = MONTH_DAYS[month - 1];
  if (!match || length === undefined || day < 1 || day > length) {
    throw new RangeError(`not a month/day of a 365-day year: ${JSON.stringify(monthDay)}`);
  }
  return MONTH_DAYS.slice(0, month - 1).reduce((sum, days) => sum + days, 0) + day;
}

const NAME_SUFFIX = /\s*,\s*([A-Z]{2}) US\s*$/;

/** USPS code of the state in a `NAME, ST US` station name; `undefined` outside the 50 states + DC. */
export function stateOfName(name: string): string | undefined {
  const code = NAME_SUFFIX.exec(name)?.[1];
  return STATE_TABLE.some((state) => state.code === code) ? code : undefined;
}

/** The station name without its `, ST US` suffix and with runs of spaces collapsed. */
export function stationName(rawName: string): string {
  return rawName.replace(NAME_SUFFIX, '').replace(/\s+/g, ' ').trim();
}

function number(text: string, what: string): number {
  const value = Number(text.trim());
  if (text.trim() === '' || !Number.isFinite(value)) {
    throw new RangeError(`bad ${what}: ${JSON.stringify(text)}`);
  }
  return value;
}

/** Reads one by-station annual/seasonal CSV; `undefined` when it has no freeze variables. */
export function parseStationCsv(text: string): ParsedStation | undefined {
  const [headLine, rowLine] = text.split(/\r?\n/);
  if (!headLine || !rowLine) return undefined;
  const head = parseCsvLine(headLine);
  const row = parseCsvLine(rowLine);
  const column = (name: string): number => head.indexOf(name);
  const cells = (names: readonly string[]): FrostCell[] | undefined => {
    const out: FrostCell[] = [];
    for (const name of names) {
      const at = column(name);
      if (at < 0) return undefined;
      out.push({ value: (row[at] ?? '').trim(), flag: row[at + 1] ?? '' });
    }
    return out;
  };
  const spring = cells(SPRING_FIELDS);
  const fall = cells(FALL_FIELDS);
  if (!spring || !fall) return undefined;
  const at = (name: string): string => row[column(name)] ?? '';
  const elevation = at('ELEVATION').trim();
  return {
    id: at('STATION').trim(),
    rawName: at('NAME').trim(),
    lat: number(at('LATITUDE'), 'latitude'),
    lon: number(at('LONGITUDE'), 'longitude'),
    elevation:
      elevation === '' || Number(elevation) === -999.9 ? null : number(elevation, 'elevation'),
    spring,
    fall,
  };
}

/**
 * Maps a parsed station to the module record. The measurement flag rules come from NOAA's
 * documentation: ` ` (blank) a value, `V` year-round risk of frost-freeze ("too cold to compute"),
 * `Y` insufficient values to perform computation. Any other flag throws instead of being guessed.
 */
export function classifyStation(parsed: ParsedStation): Classified {
  const code = stateOfName(parsed.rawName);
  if (code === undefined) return { kind: 'dropped', reason: 'not-us-state' };
  const all = [...parsed.spring, ...parsed.fall];
  for (const { flag } of all) {
    if (flag.trim() !== '' && flag !== 'V' && flag !== 'Y') {
      throw new RangeError(`unknown measurement flag ${JSON.stringify(flag)} at ${parsed.id}`);
    }
  }
  const kinds = new Set(all.map(({ flag }) => flag.trim()));
  if (kinds.size > 1) return { kind: 'dropped', reason: 'mixed' };
  if (kinds.has('Y')) return { kind: 'dropped', reason: 'insufficient' };
  const frozen = kinds.has('V');
  const triple = (cells: readonly FrostCell[]): Triple =>
    frozen
      ? [null, null, null]
      : [
          dayOfYear(cells[0]?.value ?? ''),
          dayOfYear(cells[1]?.value ?? ''),
          dayOfYear(cells[2]?.value ?? ''),
        ];
  const base = {
    id: parsed.id,
    name: stationName(parsed.rawName),
    lat: parsed.lat,
    lon: parsed.lon,
    elevation: parsed.elevation,
    spring: triple(parsed.spring),
    fall: triple(parsed.fall),
  };
  const station: Station = frozen ? { ...base, year: 'always-freezing' } : base;
  return { kind: 'station', code, station };
}

const EARTH_RADIUS_MILES = 3958.8;
const RAD = Math.PI / 180;

/** Haversine part: monotonic in distance, so the nearest point needs no square root or asin. */
function haversineTerm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = Math.sin(((lat2 - lat1) * RAD) / 2);
  const dLon = Math.sin(((lon2 - lon1) * RAD) / 2);
  return dLat * dLat + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * dLon * dLon;
}

/** Great-circle distance in statute miles. */
export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const term = haversineTerm(lat1, lon1, lat2, lon2);
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(term)));
}

/** Index and distance (unrounded miles) of the nearest point; the first one wins a tie. */
export function nearestStation(
  lat: number,
  lon: number,
  points: readonly { readonly lat: number; readonly lon: number }[],
): { index: number; miles: number } | undefined {
  let best = -1;
  let bestTerm = Infinity;
  for (const [index, point] of points.entries()) {
    const term = haversineTerm(lat, lon, point.lat, point.lon);
    if (term < bestTerm) {
      bestTerm = term;
      best = index;
    }
  }
  const point = points[best];
  return point && { index: best, miles: haversineMiles(lat, lon, point.lat, point.lon) };
}

/** ZCTA internal points of the Census gazetteer (tab separated; the last header is padded). */
export function parseGazetteer(text: string): Map<string, { lat: number; lon: number }> {
  const [headLine, ...lines] = text.split(/\r?\n/);
  const head = (headLine ?? '').split('\t').map((name) => name.trim());
  const [zip, lat, lon] = ['GEOID', 'INTPTLAT', 'INTPTLONG'].map((name) => head.indexOf(name));
  if (zip === undefined || lat === undefined || lon === undefined || Math.min(zip, lat, lon) < 0) {
    throw new RangeError('gazetteer lacks GEOID, INTPTLAT or INTPTLONG');
  }
  const points = new Map<string, { lat: number; lon: number }>();
  for (const line of lines) {
    if (line.trim() === '') continue;
    const fields = line.split('\t').map((field) => field.trim());
    points.set(fields[zip] ?? '', {
      lat: number(fields[lat] ?? '', 'ZCTA latitude'),
      lon: number(fields[lon] ?? '', 'ZCTA longitude'),
    });
  }
  return points;
}

/**
 * State FIPS of each ZCTA from the Census ZCTA-to-county relationship file (pipe separated):
 * the state of the county with the largest `AREALAND_PART`; a tie goes to the lower county code.
 */
export function parseZctaStates(text: string): Map<string, string> {
  const [headLine, ...lines] = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const head = (headLine ?? '').split('|');
  const [zip, county, area] = ['GEOID_ZCTA5_20', 'GEOID_COUNTY_20', 'AREALAND_PART'].map((name) =>
    head.indexOf(name),
  );
  if (
    zip === undefined ||
    county === undefined ||
    area === undefined ||
    Math.min(zip, county, area) < 0
  ) {
    throw new RangeError(
      'relationship file lacks GEOID_ZCTA5_20, GEOID_COUNTY_20 or AREALAND_PART',
    );
  }
  const best = new Map<string, { county: string; area: number }>();
  for (const line of lines) {
    const fields = line.split('|');
    const id = fields[zip] ?? '';
    const code = fields[county] ?? '';
    if (id === '' || code === '') continue;
    const land = number(fields[area] ?? '', 'AREALAND_PART');
    const held = best.get(id);
    if (!held || land > held.area || (land === held.area && code < held.county)) {
      best.set(id, { county: code, area: land });
    }
  }
  return new Map([...best].map(([id, { county }]) => [id, county.slice(0, 2)]));
}

/** A string literal the way Prettier prints it: single quotes unless that needs more escapes. */
export function quote(text: string): string {
  if (text.includes('\\')) throw new RangeError(`backslash in ${JSON.stringify(text)}`);
  const singles = text.split("'").length - 1;
  const doubles = text.split('"').length - 1;
  return singles > doubles ? `"${text}"` : `'${text.replaceAll("'", "\\'")}'`;
}

const literal = (value: number | null): string => (value === null ? 'null' : String(value));
const triple = (value: Triple): string => `[${value.map(literal).join(', ')}]`;

/** The source of `src/frost/<slug>.ts`, already formatted for Prettier. */
export function renderStationsModule(stations: readonly Station[]): string {
  const head = "import type { Station } from './types.ts';\n\n";
  if (stations.length === 0) return `${head}export const STATIONS: readonly Station[] = [];\n`;
  const items = stations.map((s) =>
    [
      '  {',
      `    id: ${quote(s.id)},`,
      `    name: ${quote(s.name)},`,
      `    lat: ${literal(s.lat)},`,
      `    lon: ${literal(s.lon)},`,
      `    elevation: ${literal(s.elevation)},`,
      `    spring: ${triple(s.spring)},`,
      `    fall: ${triple(s.fall)},`,
      ...(s.year ? [`    year: ${quote(s.year)},`] : []),
      '  },',
    ].join('\n'),
  );
  return `${head}export const STATIONS: readonly Station[] = [\n${items.join('\n')}\n];\n`;
}

export interface StateEntry {
  readonly code: string;
  readonly slug: string;
  readonly name: string;
  readonly stations: number;
}

/** The source of `src/frost/states.ts`. */
export function renderStatesModule(states: readonly StateEntry[]): string {
  const rows = states.map(
    (s) =>
      `  { code: ${quote(s.code)}, slug: ${quote(s.slug)}, name: ${quote(s.name)}, stations: ${String(s.stations)} },`,
  );
  return [
    'export interface StateEntry {',
    '  readonly code: string;',
    '  readonly slug: string;',
    '  readonly name: string;',
    '  readonly stations: number;',
    '}',
    '',
    'export const STATES: readonly StateEntry[] = [',
    ...rows,
    '];',
    '',
  ].join('\n');
}

interface SourceTree {
  readonly [key: string]: string | SourceTree;
}

/** `key: 'value',` the way Prettier lays it out: after the colon when only that makes it fit. */
function property(indent: number, key: string, value: string): string[] {
  const pad = ' '.repeat(indent);
  const inline = `${pad}${key}: ${quote(value)},`;
  const below = `${pad}  ${quote(value)},`;
  // Prettier keeps a value on its key line when it fits or when the key is shorter than 5 characters.
  return inline.length <= 100 || key.length < 5 ? [inline] : [`${pad}${key}:`, below];
}

function renderTree(tree: SourceTree, indent: number): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? property(indent, key, value)
      : [
          `${' '.repeat(indent)}${key}: {`,
          ...renderTree(value, indent + 2),
          `${' '.repeat(indent)}},`,
        ],
  );
}

const NORMALS = 'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020';

/** The source of `src/frost/source.ts`; `pulled` (YYYY-MM-DD) is given, never read from a clock. */
export function renderSourceModule(pulled: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pulled)) {
    throw new RangeError(`pulled must be YYYY-MM-DD: ${pulled}`);
  }
  const tree: SourceTree = {
    pulled,
    license: 'U.S. government data (NOAA NCEI, U.S. Census Bureau): public domain',
    normals: {
      name: 'NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal product (v1.0.1)',
      dataUrl: `${NORMALS}/access/`,
      archiveUrl: `${NORMALS}/archive/us-climate-normals_1991-2020_v1.0.1_annualseasonal_multivariate_by-station_c20230404.tar.gz`,
      documentationUrl:
        'https://www.ncei.noaa.gov/pub/data/cdo/documentation/normals-annualseasonal-1991-2020_documentation.pdf',
      methodologyUrl: `${NORMALS}/doc/Normals_Calculation_Methodology_2020.pdf`,
      readmeUrl: `${NORMALS}/doc/Readme_By-Variable_By-Station_Normals_Files.txt`,
      interpretationUrl:
        'https://content.ces.ncsu.edu/interpreting-freezefrost-probabilities-from-the-national-centers-for-environmental-information',
    },
    census: {
      gazetteerUrl:
        'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip',
      relationshipUrl:
        'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt',
    },
    fields: {
      spring: 'ANN-TMIN-PRBLST-T32FP10, ANN-TMIN-PRBLST-T32FP50, ANN-TMIN-PRBLST-T32FP90',
      fall: 'ANN-TMIN-PRBFST-T32FP10, ANN-TMIN-PRBFST-T32FP50, ANN-TMIN-PRBFST-T32FP90',
    },
    definitions: {
      spring:
        'Readme: PRBLST = Earliest date on which the last frost-freeze of the cold season will occur given probability and temperature threshold. Methodology: the probability that the last spring freeze will occur on or after the specified date.',
      fall: 'Readme: PRBFST = Latest date on which the first frost-freeze of the cold season will occur at the given probability and temperature threshold. Methodology: the probability that the first autumn freeze will occur on or before the specified date.',
      reading:
        'FP10, FP50 and FP90 are the 10, 50 and 90 percent probability levels. In spring the FP10 date is the latest: a 10 percent chance that the last 32 F freeze falls on or after it (FP90 is the earliest: 90 percent). In fall the FP10 date is the earliest: a 10 percent chance that the first 32 F freeze falls on or before it. Checked on FT COLLINS, CO (USC00053005): spring 05/14, 05/02, 04/18; fall 09/24, 10/07, 10/20. The product documentation table describes the spring elements with the words or earlier, which the data and the methodology contradict.',
      day: 'The CSV gives MM/DD text with no year, on a 365-day calendar (the methodology simulates a 365-point annual cycle; 02/29 occurs in no station). Stored here as the day of a non-leap year: 1 = 01/01, 59 = 02/28, 60 = 03/01, 365 = 12/31. The dates are computed over August 1 to July 30 (methodology), so in warm climates a spring date can lie in the previous calendar year (day number 213 or more) and a fall date in the next one (day number below 213): read the month and day, not a year.',
      flags:
        'Measurement flag V = Year-round risk of frost-freeze; too cold to compute (stored as year: always-freezing with empty triples). Y = Insufficient values to perform computation (dropped, never mapped to a meaning). Completeness flags S, R, P and E are all kept.',
      station:
        'Stations of the 50 states and DC whose six 32 F freeze cells are all dates or all flagged V. The state is the ST of the NAME suffix, ST US. Elevation is meters above mean sea level.',
      zip: 'ZCTA internal point of the 2020 Census gazetteer to the nearest station that has dates (year-round-freezing stations are skipped), haversine miles rounded to whole miles. A ZCTA is not exactly a ZIP code. The ZCTA state is the state of the county with the largest AREALAND_PART.',
    },
  };
  return [
    '// Generated by packages/lawn-data/scripts/build-frost.ts: do not edit.',
    '',
    'export const FROST_SOURCE = {',
    ...renderTree(tree, 2),
    '} as const;',
    '',
  ].join('\n');
}

/** First digit of a ZIP: the key of its shard. */
export function shardKey(zip: string): string {
  return zip.charAt(0);
}

export interface Located {
  readonly stateSlug: string;
  readonly id: string;
  readonly lat: number;
  readonly lon: number;
}

export interface Zcta {
  readonly zip: string;
  readonly lat: number;
  readonly lon: number;
  readonly stateSlug: string;
}

const byText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * One shard per first digit, in the format documented in `zip.ts`. The ZCTAs are sorted by ZIP,
 * the state table is sorted, the station table is sorted by state then id: output is stable.
 */
export function encodeShards(
  zctas: readonly Zcta[],
  stations: readonly Located[],
): Map<string, Shard> {
  const groups = new Map<string, Zcta[]>();
  for (const zcta of [...zctas].sort((a, b) => byText(a.zip, b.zip))) {
    const key = shardKey(zcta.zip);
    groups.set(key, [...(groups.get(key) ?? []), zcta]);
  }
  const shards = new Map<string, Shard>();
  for (const key of [...groups.keys()].sort(byText)) {
    const matches = (groups.get(key) ?? []).map((zcta) => {
      const near = nearestStation(zcta.lat, zcta.lon, stations);
      const station = near && stations[near.index];
      if (!near || !station) throw new RangeError('no stations to match against');
      return { zcta, station, miles: Math.round(near.miles) };
    });
    const states = [
      ...new Set(matches.flatMap(({ zcta, station }) => [zcta.stateSlug, station.stateSlug])),
    ].sort(byText);
    const used = new Map(matches.map(({ station }) => [station.id, station]));
    const table = [...used.values()].sort(
      (a, b) => byText(a.stateSlug, b.stateSlug) || byText(a.id, b.id),
    );
    const stateIndex = (slug: string): number => states.indexOf(slug);
    const stationIndex = new Map(table.map((station, index) => [station.id, index]));
    const zips: Record<string, number[]> = {};
    for (const { zcta, station, miles } of matches) {
      const row = [stationIndex.get(station.id) ?? -1, miles];
      zips[zcta.zip] =
        zcta.stateSlug === station.stateSlug ? row : [...row, stateIndex(zcta.stateSlug)];
    }
    shards.set(key, {
      states,
      stations: table.map((station) => [stateIndex(station.stateSlug), station.id] as const),
      zips,
    });
  }
  return shards;
}
