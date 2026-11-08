import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STATE_TABLE } from '../../scripts/frost-build.ts';
import { monthDayOfDay } from './calendar.ts';
import { FROST_SOURCE } from './source.ts';
import { STATES } from './states.ts';
import type { Station } from './types.ts';
import { lookupZip, shardOf, type Shard } from './zip.ts';

const NON_STATE = new Set(['build', 'calendar', 'frost', 'source', 'states', 'types', 'zip']);
const SHARDS = new URL('../../../../apps/lawn/public/data/frost/', import.meta.url);

async function stationsOf(slug: string): Promise<readonly Station[]> {
  const module = (await import(/* @vite-ignore */ `./${slug}.ts`)) as {
    STATIONS: readonly Station[];
  };
  return module.STATIONS;
}

const all = new Map<string, { slug: string; station: Station }>();
for (const { slug } of STATES) {
  for (const station of await stationsOf(slug)) all.set(station.id, { slug, station });
}

const shard = (digit: string): Shard =>
  JSON.parse(readFileSync(new URL(`zip-${digit}.json`, SHARDS), 'utf8')) as Shard;

describe('STATES', () => {
  it('lists the 50 states and DC sorted by name, like the state table', () => {
    expect(STATES).toHaveLength(51);
    expect(STATES.map(({ code, slug, name }) => ({ code, slug, name }))).toEqual(
      STATE_TABLE.map(({ code, slug, name }) => ({ code, slug, name })),
    );
  });

  it('matches the module files of src/frost one to one', () => {
    const files = readdirSync(new URL('.', import.meta.url))
      .filter((file) => file.endsWith('.ts') && !file.includes('.test.'))
      .map((file) => file.slice(0, -3))
      .filter((name) => !NON_STATE.has(name))
      .sort();
    expect(files).toEqual(STATES.map((state) => state.slug).sort());
  });

  it('counts the stations of each module', async () => {
    for (const state of STATES) {
      expect((await stationsOf(state.slug)).length, state.slug).toBe(state.stations);
    }
  });
});

describe('state modules', () => {
  it('are sorted by name then id, with unique ids across the country', () => {
    expect(all.size).toBe(STATES.reduce((sum, state) => sum + state.stations, 0));
    for (const { slug } of STATES) {
      const stations = [...all.values()]
        .filter((entry) => entry.slug === slug)
        .map((e) => e.station);
      const sorted = [...stations].sort(
        (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) || (a.id < b.id ? -1 : 1),
      );
      expect(
        stations.map((s) => s.id),
        slug,
      ).toEqual(sorted.map((s) => s.id));
    }
  });

  it('give every station an id, a name, finite coordinates and valid day numbers', () => {
    for (const { station: s } of all.values()) {
      expect(s.id, s.id).toMatch(/^[A-Z0-9]{11}$/);
      expect(s.name.length, s.id).toBeGreaterThan(0);
      expect(Number.isFinite(s.lat) && Math.abs(s.lat) <= 90, s.id).toBe(true);
      expect(Number.isFinite(s.lon) && Math.abs(s.lon) <= 180, s.id).toBe(true);
      expect(s.elevation === null || Number.isFinite(s.elevation), s.id).toBe(true);
      for (const day of [...s.spring, ...s.fall]) {
        expect(day === null || (Number.isInteger(day) && day >= 1 && day <= 366), s.id).toBe(true);
        if (day !== null) monthDayOfDay(day);
      }
    }
  });

  it('are all dates, or all null with the year-round flag (never a mix)', () => {
    for (const { station: s } of all.values()) {
      const days = [...s.spring, ...s.fall];
      if (s.year === 'always-freezing')
        expect(
          days.every((d) => d === null),
          s.id,
        ).toBe(true);
      else
        expect(
          days.every((d) => d !== null),
          s.id,
        ).toBe(true);
    }
  });

  // NOAA computes the dates over August 1 - July 30 (day 213 = August 1), so in warm climates a
  // spring date can lie in the previous calendar year (AJO spring FP90 = 12/11 = day 345) and a fall
  // date in the next (ANDALUSIA OPP AP fall FP90 = 01/01 = day 1). The position in the cold season
  // (days since August 1) orders them: spring FP10 is the latest and fall FP10 the earliest.
  it('read 10, 50, 90 percent: spring dates fall earlier, fall dates later (season order)', () => {
    const season = (day: number): number => (day - 213 + 365) % 365;
    for (const { station: s } of all.values()) {
      const [s10, s50, s90] = s.spring;
      const [f10, f50, f90] = s.fall;
      if (s.year || s10 == null || s50 == null || s90 == null) continue;
      if (f10 == null || f50 == null || f90 == null) throw new Error(s.id);
      expect(season(s10) >= season(s50) && season(s50) >= season(s90), `spring ${s.id}`).toBe(true);
      expect(season(f10) <= season(f50) && season(f50) <= season(f90), `fall ${s.id}`).toBe(true);
    }
  });

  it('keeps DC empty: NOAA has no DC station with freeze dates', () => {
    expect(STATES.find((state) => state.code === 'DC')?.stations).toBe(0);
  });
});

describe('hand-verified stations (raw by-station CSV rows of the pull)', () => {
  const day = (month: number, d: number): number =>
    ([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][month - 1] ?? 0) + d;

  // USW00014835 LAFAYETTE PURDUE UNIV AP, IN US; 40.4122, -86.9369, 182.6 m. Raw cells:
  // PRBLST FP10/50/90 = 05/14, 04/26, 04/11; PRBFST FP10/50/90 = 10/04, 10/18, 10/31.
  it('Indiana: Lafayette Purdue University airport', () => {
    expect(all.get('USW00014835')).toEqual({
      slug: 'indiana',
      station: {
        id: 'USW00014835',
        name: 'LAFAYETTE PURDUE UNIV AP',
        lat: 40.4122,
        lon: -86.9369,
        elevation: 182.6,
        spring: [day(5, 14), day(4, 26), day(4, 11)],
        fall: [day(10, 4), day(10, 18), day(10, 31)],
      },
    });
  });

  // USW00014922 MINNEAPOLIS/ST PAUL AP, MN US; 44.8831, -93.2289, 265.8 m. Raw cells:
  // PRBLST = 05/07, 04/23, 04/08; PRBFST = 10/01, 10/18, 10/31.
  it('Minnesota: Minneapolis/St Paul airport', () => {
    expect(all.get('USW00014922')).toEqual({
      slug: 'minnesota',
      station: {
        id: 'USW00014922',
        name: 'MINNEAPOLIS/ST PAUL AP',
        lat: 44.8831,
        lon: -93.2289,
        elevation: 265.8,
        spring: [day(5, 7), day(4, 23), day(4, 8)],
        fall: [day(10, 1), day(10, 18), day(10, 31)],
      },
    });
  });

  // USW00013904 AUSTIN BERGSTROM AP, TX US; 30.1831, -97.6800, 146.3 m. Raw cells:
  // PRBLST = 04/02, 03/12, 02/20; PRBFST = 11/01, 11/16, 12/05.
  it('Texas: Austin Bergstrom airport', () => {
    expect(all.get('USW00013904')).toEqual({
      slug: 'texas',
      station: {
        id: 'USW00013904',
        name: 'AUSTIN BERGSTROM AP',
        lat: 30.1831,
        lon: -97.68,
        elevation: 146.3,
        spring: [day(4, 2), day(3, 12), day(2, 20)],
        fall: [day(11, 1), day(11, 16), day(12, 5)],
      },
    });
    expect(all.get('USW00013904')?.station.spring).toEqual([92, 71, 51]);
  });

  it('converts a day number back to the date NOAA gave (Lafayette spring FP50: 116 = 04/26)', () => {
    expect(monthDayOfDay(116)).toEqual({ month: 4, day: 26 });
  });
});

describe('ZIP shards', () => {
  it('has ten shards, each under 80 KB, for 5-digit ZIPs of their first digit', () => {
    for (const digit of '0123456789') {
      const text = readFileSync(new URL(`zip-${digit}.json`, SHARDS), 'utf8');
      expect(Buffer.byteLength(text), digit).toBeLessThan(80_000);
      const zips = Object.keys((JSON.parse(text) as Shard).zips);
      expect(zips.length, digit).toBeGreaterThan(1000);
      expect(
        zips.every((zip) => shardOf(zip) === `zip-${digit}.json`),
        digit,
      ).toBe(true);
    }
  });

  it('points every ZIP at a station that exists, has dates, and whose state matches', () => {
    let rows = 0;
    for (const digit of '0123456789') {
      const data = shard(digit);
      for (const zip of Object.keys(data.zips)) {
        const match = lookupZip(data, zip);
        const known = match && all.get(match.stationId);
        expect(known?.slug, zip).toBe(match?.stationState);
        expect(known?.station.year, zip).toBeUndefined();
        expect(Number.isInteger(match?.miles) && (match?.miles ?? -1) >= 0, zip).toBe(true);
        expect(
          STATES.some((state) => state.slug === match?.state),
          zip,
        ).toBe(true);
        rows += 1;
      }
    }
    expect(rows).toBeGreaterThan(32_000);
  });

  // 47907 (West Lafayette, IN): Census internal point 40.424395, -86.915485. The nearest station
  // is USW00014835 (40.4122, -86.9369): haversine 1.41 mi by hand, stored rounded as 1.
  // 10001 (Manhattan, NY): internal point 40.750636, -73.997177; nearest is USW00094728
  // NEW YORK CNTRL PK TWR (40.7789, -73.9692): haversine 2.44 mi by hand, stored as 2.
  // Tolerance 1 mile: the stored value is a rounded whole number, and the Earth radius used
  // (3958.8 mi) differs from other common radii by well under 0.1 percent (under 0.01 mi here).
  it.each([
    ['47907', 'indiana', 'USW00014835', 1.41],
    ['10001', 'new-york', 'USW00094728', 2.44],
  ])('ZIP %s: state %s, nearest station %s, about %s miles', (zip, state, station, miles) => {
    const file = shardOf(zip);
    const match = lookupZip(shard(file?.slice(4, 5) ?? ''), zip);
    expect(match).toMatchObject({ state, stationId: station, stationState: state });
    expect(Math.abs((match?.miles ?? 99) - miles)).toBeLessThanOrEqual(1);
  });
});

describe('FROST_SOURCE', () => {
  it('records the pull date and the sources', () => {
    expect(FROST_SOURCE.pulled).toBe('2026-11-07');
    expect(FROST_SOURCE.normals.archiveUrl).toContain('ncei.noaa.gov');
    expect(FROST_SOURCE.census.gazetteerUrl).toContain('census.gov');
  });
});
