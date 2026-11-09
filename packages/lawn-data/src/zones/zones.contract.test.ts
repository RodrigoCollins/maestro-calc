import { describe, expect, it } from 'vitest';
import { STATES } from '../frost/states.ts';
import type { Station } from '../frost/types.ts';
import { ZONE_SOURCE } from './source.ts';
import { STATION_ZONES } from './stations.ts';
import { ZONES, zoneAt, zoneOf } from './zone.ts';

const CONTIGUOUS = STATES.filter(({ code }) => !['AK', 'HI', 'DC'].includes(code));

const stations: Station[] = [];
for (const { slug } of CONTIGUOUS) {
  const module = (await import(/* @vite-ignore */ `../frost/${slug}.ts`)) as {
    STATIONS: readonly Station[];
  };
  stations.push(...module.STATIONS);
}

/** The one station that falls on a coastal cell of the grid with no value. */
const NO_VALUE = ['USW00012843'];

describe('STATION_ZONES', () => {
  it('zones every station of the 48 contiguous states but the one on a no-data cell', () => {
    const ids = stations.map(({ id }) => id).filter((id) => !NO_VALUE.includes(id));
    expect(Object.keys(STATION_ZONES).sort()).toEqual(ids.sort());
  });

  it('gives a half zone that its tenth-of-a-degree value agrees with, but at a boundary', () => {
    for (const [id, [label, min]] of Object.entries(STATION_ZONES)) {
      const zone = zoneAt(label);
      const nearBoundary = Math.abs(min - zone.low) <= 0.05 || Math.abs(min - zone.high) <= 0.05;
      if (!nearBoundary) expect(zoneOf(min).label, id).toBe(label);
    }
  });

  it('spans zones 3a to 10b, the zones of the frost stations of the contiguous US', () => {
    const labels = new Set(Object.values(STATION_ZONES).map(([label]) => label));
    expect(ZONES.filter(({ label }) => labels.has(label)).map(({ label }) => label)).toEqual([
      '3a',
      '3b',
      '4a',
      '4b',
      '5a',
      '5b',
      '6a',
      '6b',
      '7a',
      '7b',
      '8a',
      '8b',
      '9a',
      '9b',
      '10a',
      '10b',
    ]);
  });

  it('agrees with the zone USDA gives the ZIP code of a checked station', () => {
    // phzm_us_zipcode_2023.csv: 55111 is 5a (-20 to -15), 98158 is 9a (20 to 25)
    expect(STATION_ZONES['USW00014922']?.[0]).toBe('5a'); // Minneapolis/St Paul airport
    expect(STATION_ZONES['USW00024233']?.[0]).toBe('9a'); // Seattle Tacoma airport
  });
});

describe('ZONE_SOURCE', () => {
  it('names the USDA map and the PRISM grid with the day it was pulled', () => {
    expect(ZONE_SOURCE.pulled).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ZONE_SOURCE.map.url).toBe('https://planthardiness.ars.usda.gov/');
    expect(ZONE_SOURCE.grid.dataUrl).toMatch(/^https:\/\/prism\.oregonstate\.edu\//);
  });
});
