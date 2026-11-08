import { describe, expect, it } from 'vitest';
import {
  STATE_TABLE,
  classifyStation,
  dayOfYear,
  encodeShards,
  haversineMiles,
  nearestStation,
  parseCsvLine,
  parseGazetteer,
  parseStationCsv,
  parseZctaStates,
  quote,
  renderSourceModule,
  renderStatesModule,
  renderStationsModule,
  shardKey,
  stateOfName,
  stationName,
} from './build.ts';
import type { Station } from './types.ts';

const FIELDS = [
  'ANN-TMIN-PRBLST-T32FP10',
  'ANN-TMIN-PRBLST-T32FP50',
  'ANN-TMIN-PRBLST-T32FP90',
  'ANN-TMIN-PRBFST-T32FP10',
  'ANN-TMIN-PRBFST-T32FP50',
  'ANN-TMIN-PRBFST-T32FP90',
];

const q = (s: string): string => `"${s}"`;

/** A by-station CSV the way NOAA writes it: every field quoted, a header row and one data row. */
function csv(
  meta: { id: string; lat: string; lon: string; elev: string; name: string },
  cells: readonly (readonly [value: string, meas: string, comp: string])[],
  fields: readonly string[] = FIELDS,
): string {
  const head = ['STATION', 'LATITUDE', 'LONGITUDE', 'ELEVATION', 'NAME', 'month', 'day', 'hour'];
  const row = [meta.id, meta.lat, meta.lon, meta.elev, meta.name, '99', '99', '99'];
  fields.forEach((field, i) => {
    const [value, meas, comp] = cells[i] ?? ['', '', ''];
    head.push(field, `meas_flag_${field}`, `comp_flag_${field}`, `years_${field}`);
    row.push(value, meas, comp, '30');
  });
  return `${head.map(q).join(',')}\n${row.map(q).join(',')}\n`;
}

const FORT_COLLINS = {
  id: 'USC00053005',
  lat: ' 40.5764',
  lon: '-105.0858',
  elev: '1525.2',
  name: 'FT COLLINS, CO US',
};
const DATES = [
  ['   05/14', ' ', 'S'],
  ['   05/02', ' ', 'S'],
  ['   04/18', ' ', 'S'],
  ['   09/24', ' ', 'S'],
  ['   10/07', ' ', 'S'],
  ['   10/20', ' ', 'S'],
] as const;

describe('parseCsvLine', () => {
  it('splits quoted fields and keeps commas inside quotes', () => {
    expect(parseCsvLine('"A","FT COLLINS, CO US"," 40.5"')).toEqual([
      'A',
      'FT COLLINS, CO US',
      ' 40.5',
    ]);
  });

  it('reads a doubled quote as one quote and unquoted fields as they are', () => {
    expect(parseCsvLine('"A ""B""",x,')).toEqual(['A "B"', 'x', '']);
  });
});

describe('dayOfYear', () => {
  it('numbers the days of a 365-day year', () => {
    expect(dayOfYear('01/01')).toBe(1);
    expect(dayOfYear('02/28')).toBe(59);
    expect(dayOfYear('03/01')).toBe(60);
    expect(dayOfYear('05/14')).toBe(134);
    expect(dayOfYear('12/31')).toBe(365);
  });

  it('tolerates the padding NOAA puts in front of the value', () => {
    expect(dayOfYear('   09/24')).toBe(267);
  });

  it('rejects anything that is not a real month and day of a 365-day year', () => {
    for (const bad of ['02/29', '13/01', '00/10', '04/31', '4/3', '', '-9999.0', '05-14']) {
      expect(() => dayOfYear(bad), bad).toThrow(/month\/day/);
    }
  });
});

describe('stateOfName', () => {
  it('reads the USPS code from the ", ST US" suffix', () => {
    expect(stateOfName('FT COLLINS, CO US')).toBe('CO');
    expect(stateOfName('WASHINGTON DC DULLES AP, VA US')).toBe('VA');
  });

  it('refuses territories, Canada and names with no suffix', () => {
    expect(stateOfName('PAGO PAGO WSO AP, AS AQ')).toBeUndefined();
    expect(stateOfName('SAN JUAN, PR RQ')).toBeUndefined();
    expect(stateOfName('EGBERT 1 W, ON CA')).toBeUndefined();
    expect(stateOfName('NO SUFFIX')).toBeUndefined();
    expect(stateOfName('SOMEWHERE, ZZ US')).toBeUndefined();
  });
});

describe('stationName', () => {
  it('drops the suffix and collapses padding', () => {
    expect(stationName('FT  COLLINS , CO US  ')).toBe('FT COLLINS');
  });
});

describe('parseStationCsv', () => {
  it('reads the metadata and the six cells with their measurement flags', () => {
    const parsed = parseStationCsv(csv(FORT_COLLINS, DATES));
    expect(parsed).toMatchObject({
      id: 'USC00053005',
      rawName: 'FT COLLINS, CO US',
      lat: 40.5764,
      lon: -105.0858,
      elevation: 1525.2,
    });
    expect(parsed?.spring.map((c) => c.value)).toEqual(['05/14', '05/02', '04/18']);
    expect(parsed?.fall.map((c) => c.value)).toEqual(['09/24', '10/07', '10/20']);
    expect(parsed?.fall.map((c) => c.flag)).toEqual([' ', ' ', ' ']);
  });

  it('reads the right columns when other variables sit around them (CRLF too)', () => {
    const fields = ['ANN-TAVG-NORMAL', ...FIELDS, 'ANN-ZZZ'];
    const cells = [['50.7', ' ', 'S'], ...DATES, ['1', ' ', 'S']] as const;
    const parsed = parseStationCsv(csv(FORT_COLLINS, cells, fields).replaceAll('\n', '\r\n'));
    expect(parsed?.spring.map((c) => c.value)).toEqual(['05/14', '05/02', '04/18']);
  });

  it('is undefined for a station with no freeze variables or no data row', () => {
    expect(parseStationCsv(csv(FORT_COLLINS, DATES, ['ANN-TAVG-NORMAL']))).toBeUndefined();
    expect(parseStationCsv('"STATION"\n')).toBeUndefined();
    expect(parseStationCsv('')).toBeUndefined();
  });

  it('reads a missing elevation as null', () => {
    const parsed = parseStationCsv(csv({ ...FORT_COLLINS, elev: '-999.9' }, DATES));
    expect(parsed?.elevation).toBeNull();
  });

  it('throws on a non-numeric coordinate', () => {
    expect(() => parseStationCsv(csv({ ...FORT_COLLINS, lat: 'x' }, DATES))).toThrow(/latitude/);
  });
});

describe('classifyStation', () => {
  it('turns six dates into day numbers, keeping NOAA order (10, 50, 90 percent)', () => {
    const parsed = parseStationCsv(csv(FORT_COLLINS, DATES));
    expect(parsed && classifyStation(parsed)).toEqual({
      kind: 'station',
      code: 'CO',
      station: {
        id: 'USC00053005',
        name: 'FT COLLINS',
        lat: 40.5764,
        lon: -105.0858,
        elevation: 1525.2,
        spring: [134, 122, 108],
        fall: [267, 280, 293],
      },
    });
  });

  it('keeps the V flag as year-round freezing with empty triples', () => {
    const v = FIELDS.map(() => ['-9999.0', 'V', 'S'] as const);
    const meta = { ...FORT_COLLINS, id: 'USC00049063', name: 'TUOLUMNE MEADOWS RS, CA US' };
    const parsed = parseStationCsv(csv(meta, v));
    expect(parsed && classifyStation(parsed)).toEqual({
      kind: 'station',
      code: 'CA',
      station: {
        id: 'USC00049063',
        name: 'TUOLUMNE MEADOWS RS',
        lat: 40.5764,
        lon: -105.0858,
        elevation: 1525.2,
        spring: [null, null, null],
        fall: [null, null, null],
        year: 'always-freezing',
      },
    });
  });

  it('drops the Y flag (insufficient values), mixed rows and non-state stations', () => {
    const y = FIELDS.map(() => ['-9999.0', 'Y', ' '] as const);
    const mixed = [['-9999.0', 'V', 'S'], ...DATES.slice(1)] as const;
    const reasons = (cells: Parameters<typeof csv>[1], name = FORT_COLLINS.name) => {
      const parsed = parseStationCsv(csv({ ...FORT_COLLINS, name }, cells));
      const result = parsed && classifyStation(parsed);
      return result?.kind === 'dropped' ? result.reason : result?.kind;
    };
    expect(reasons(y)).toBe('insufficient');
    expect(reasons(mixed)).toBe('mixed');
    expect(reasons(DATES, 'SAN JUAN, PR RQ')).toBe('not-us-state');
  });

  it('throws on an unknown flag instead of guessing', () => {
    const odd = [['-9999.0', 'Z', 'S'], ...DATES.slice(1)] as const;
    const parsed = parseStationCsv(csv(FORT_COLLINS, odd));
    expect(() => parsed && classifyStation(parsed)).toThrow(/flag/);
  });
});

describe('haversineMiles / nearestStation', () => {
  it('measures great-circle miles (Times Square to the Statue of Liberty is about 5.7 mi)', () => {
    const d = haversineMiles(40.758, -73.9855, 40.6892, -74.0445);
    expect(d).toBeGreaterThan(5.5);
    expect(d).toBeLessThan(5.9);
    expect(haversineMiles(10, 20, 10, 20)).toBe(0);
  });

  it('finds the nearest, breaking ties by the first one given', () => {
    const near = [
      { lat: 40, lon: -100 },
      { lat: 41, lon: -100 },
      { lat: 41, lon: -100 },
    ];
    expect(nearestStation(40.9, -100, near)).toEqual({
      index: 1,
      miles: haversineMiles(40.9, -100, 41, -100),
    });
    expect(nearestStation(0, 0, [])).toBeUndefined();
  });
});

describe('Census parsers', () => {
  const gaz =
    'GEOID\tALAND\tAWATER\tALAND_SQMI\tAWATER_SQMI\tINTPTLAT\tINTPTLONG   \n' +
    '10001\t1\t1\t1.0\t1.0\t40.750635\t-73.997\n' +
    '00601\t1\t1\t1.0\t1.0\t18.18\t-66.74\n';

  it('reads each ZCTA internal point', () => {
    expect(parseGazetteer(gaz)).toEqual(
      new Map([
        ['10001', { lat: 40.750635, lon: -73.997 }],
        ['00601', { lat: 18.18, lon: -66.74 }],
      ]),
    );
  });

  const rel = [
    '\uFEFFOID_ZCTA5_20|GEOID_ZCTA5_20|NAMELSAD_ZCTA5_20|AREALAND_ZCTA5_20|AREAWATER_ZCTA5_20|MTFCC_ZCTA5_20|CLASSFP_ZCTA5_20|FUNCSTAT_ZCTA5_20|OID_COUNTY_20|GEOID_COUNTY_20|NAMELSAD_COUNTY_20|AREALAND_COUNTY_20|AREAWATER_COUNTY_20|MTFCC_COUNTY_20|CLASSFP_COUNTY_20|FUNCSTAT_COUNTY_20|AREALAND_PART|AREAWATER_PART',
    '||||||||1|01003|Baldwin County|1|1|G4020|H1|A|5|5',
    '9|10001|ZCTA5 10001|10|1|G6350|B5|S|2|36061|New York County|1|1|G4020|H6|A|60|1',
    '9|10001|ZCTA5 10001|10|1|G6350|B5|S|3|34017|Hudson County|1|1|G4020|H1|A|40|1',
    '9|71749|ZCTA5 71749|10|1|G6350|B5|S|4|22017|Caddo Parish|1|1|G4020|H1|A|5|1',
    '9|71749|ZCTA5 71749|10|1|G6350|B5|S|5|05003|Ashley County|1|1|G4020|H1|A|5|1',
  ].join('\n');

  it('takes the state of the county with the largest land part, ties to the lower county', () => {
    expect(parseZctaStates(rel)).toEqual(
      new Map([
        ['10001', '36'],
        ['71749', '05'],
      ]),
    );
  });

  it('throws when the relationship columns are missing', () => {
    expect(() => parseZctaStates('a|b\n1|2')).toThrow(/GEOID_ZCTA5_20/);
  });
});

describe('STATE_TABLE', () => {
  it('has the 50 states and DC sorted by name with unique codes, slugs and FIPS', () => {
    expect(STATE_TABLE).toHaveLength(51);
    const names = STATE_TABLE.map((s) => s.name);
    expect(names).toEqual([...names].sort());
    for (const key of ['code', 'slug', 'fips'] as const) {
      expect(new Set(STATE_TABLE.map((s) => s[key])).size).toBe(51);
    }
    expect(STATE_TABLE.find((s) => s.code === 'DC')).toMatchObject({
      slug: 'district-of-columbia',
      fips: '11',
    });
    expect(STATE_TABLE.find((s) => s.code === 'NY')).toMatchObject({
      slug: 'new-york',
      fips: '36',
    });
  });
});

describe('rendering', () => {
  const station: Station = {
    id: 'USC1',
    name: "O'HARE",
    lat: 41.9,
    lon: -87.9,
    elevation: null,
    spring: [100, 90, null],
    fall: [280, 290, 300],
  };

  it('quotes like Prettier (single unless that needs more escapes)', () => {
    expect(quote('A')).toBe("'A'");
    expect(quote("O'HARE")).toBe('"O\'HARE"');
    expect(quote('a\'b"c')).toBe("'a\\'b\"c'");
    expect(() => quote('a\\b')).toThrow(/backslash/);
  });

  it('renders a state module already formatted', () => {
    expect(
      renderStationsModule([station, { ...station, id: 'USC2', year: 'always-freezing' }]),
    ).toBe(
      [
        "import type { Station } from './types.ts';",
        '',
        'export const STATIONS: readonly Station[] = [',
        '  {',
        "    id: 'USC1',",
        '    name: "O\'HARE",',
        '    lat: 41.9,',
        '    lon: -87.9,',
        '    elevation: null,',
        '    spring: [100, 90, null],',
        '    fall: [280, 290, 300],',
        '  },',
        '  {',
        "    id: 'USC2',",
        '    name: "O\'HARE",',
        '    lat: 41.9,',
        '    lon: -87.9,',
        '    elevation: null,',
        '    spring: [100, 90, null],',
        '    fall: [280, 290, 300],',
        "    year: 'always-freezing',",
        '  },',
        '];',
        '',
      ].join('\n'),
    );
  });

  it('renders an empty state module on one line', () => {
    expect(renderStationsModule([])).toContain('export const STATIONS: readonly Station[] = [];');
  });

  it('renders the states list', () => {
    expect(
      renderStatesModule([{ code: 'NY', slug: 'new-york', name: 'New York', stations: 2 }]),
    ).toBe(
      [
        'export interface StateEntry {',
        '  readonly code: string;',
        '  readonly slug: string;',
        '  readonly name: string;',
        '  readonly stations: number;',
        '}',
        '',
        'export const STATES: readonly StateEntry[] = [',
        "  { code: 'NY', slug: 'new-york', name: 'New York', stations: 2 },",
        '];',
        '',
      ].join('\n'),
    );
  });

  it('renders the source metadata with the explicit pull date', () => {
    const text = renderSourceModule('2026-11-07');
    expect(text).toContain("pulled: '2026-11-07'");
    expect(text).toContain('https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/');
    expect(() => renderSourceModule('07/11/2026')).toThrow(/YYYY-MM-DD/);
  });
});

describe('encodeShards', () => {
  const stations = [
    { stateSlug: 'new-york', id: 'USW1', lat: 40.7, lon: -74 },
    { stateSlug: 'new-jersey', id: 'USW2', lat: 39.4, lon: -74.4 },
  ];
  const zctas = [
    { zip: '10001', lat: 40.75, lon: -73.99, stateSlug: 'new-york' },
    { zip: '08201', lat: 39.45, lon: -74.5, stateSlug: 'new-jersey' },
    { zip: '07001', lat: 40.6, lon: -74.2, stateSlug: 'new-york' },
  ];

  it('keys a shard by the first digit', () => {
    expect(shardKey('10001')).toBe('1');
    expect(shardKey('08201')).toBe('0');
  });

  it('writes a station table and one [station, miles(, zip state)] row per zip', () => {
    const shards = encodeShards(zctas, stations);
    expect([...shards.keys()]).toEqual(['0', '1']);
    expect(shards.get('1')).toEqual({
      states: ['new-york'],
      stations: [[0, 'USW1']],
      zips: { '10001': [0, Math.round(haversineMiles(40.75, -73.99, 40.7, -74))] },
    });
    // 07001 is a NY zip served by the nearest station USW1 (NY): no state override.
    // 08201 is a NJ zip whose nearest station is USW2 (NJ): no override either.
    const zero = shards.get('0');
    expect(zero?.states).toEqual(['new-jersey', 'new-york']);
    expect(zero?.stations).toEqual([
      [0, 'USW2'],
      [1, 'USW1'],
    ]);
    expect(zero?.zips['08201']).toEqual([0, Math.round(haversineMiles(39.45, -74.5, 39.4, -74.4))]);
    expect(zero?.zips['07001']).toEqual([1, Math.round(haversineMiles(40.6, -74.2, 40.7, -74))]);
  });

  it('adds the ZIP state as a third value when it differs from the station state', () => {
    const shards = encodeShards(
      [{ zip: '10002', lat: 39.4, lon: -74.4, stateSlug: 'new-york' }],
      stations,
    );
    expect(shards.get('1')?.zips['10002']).toEqual([0, 0, 1]);
    expect(shards.get('1')?.states).toEqual(['new-jersey', 'new-york']);
  });
});
