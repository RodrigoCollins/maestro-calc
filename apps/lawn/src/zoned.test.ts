import { describe, expect, it } from 'vitest';
import { STATIONS_OF } from './frost-stations.ts';
import { PAGE_ZONES, stationsOfZone, ZONED, zonesOfState } from './zoned.ts';

describe('ZONED', () => {
  it('holds every zoned frost station once, with its state and USDA half zone', () => {
    expect(ZONED).toHaveLength(6933);
    expect(new Set(ZONED.map(({ station }) => station.id)).size).toBe(ZONED.length);
    const seattle = ZONED.find(({ station }) => station.id === 'USW00024233');
    expect(seattle?.state.code).toBe('WA');
    expect(seattle?.zone.label).toBe('9a');
    expect(seattle?.min).toBe(21.4);
  });
});

describe('PAGE_ZONES', () => {
  it('are the half zones 3a to 10b, each with stations', () => {
    expect(PAGE_ZONES.map(({ label }) => label)).toEqual([
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
    for (const zone of PAGE_ZONES) expect(stationsOfZone(zone.label).length).toBeGreaterThan(0);
    expect(stationsOfZone('7b')).toHaveLength(548);
  });
});

describe('zonesOfState', () => {
  it('splits the stations of a state by half zone, coldest first', () => {
    const wisconsin = zonesOfState('wisconsin');
    expect(wisconsin.map(({ zone }) => zone.label)).toEqual(['4a', '4b', '5a', '5b', '6a']);
    expect(wisconsin.reduce((sum, { stations }) => sum + stations.length, 0)).toBe(
      STATIONS_OF['wisconsin']?.length,
    );
  });

  it('gives a state off the contiguous grid no zones', () => {
    expect(zonesOfState('alaska')).toEqual([]);
  });
});
