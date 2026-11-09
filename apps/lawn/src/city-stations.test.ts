import { describe, expect, it } from 'vitest';
import { cityStationsOf } from './city-stations.ts';
import { stationsOfZone, ZONED } from './zoned.ts';

describe('cityStationsOf', () => {
  it('lists the dated first-order (USW) stations of a group by name, with their 50% dates', () => {
    const texas = cityStationsOf(
      ZONED.filter(({ state }) => state.code === 'TX'),
      100,
    );
    expect(texas.length).toBeGreaterThan(5);
    expect(texas.every(({ id }) => id.startsWith('USW'))).toBe(true);
    expect(texas.map(({ name }) => name)).toEqual(texas.map(({ name }) => name).toSorted());
    const dallas = texas.find(({ name }) => name === 'Dallas Love Fld');
    expect(dallas).toMatchObject({ code: 'TX' });
    expect(typeof dallas?.spring).toBe('number');
  });

  it('samples at most the limit, spread over the list from its first to its last', () => {
    const all = cityStationsOf(stationsOfZone('6a'), 1000);
    const four = cityStationsOf(stationsOfZone('6a'), 4);
    expect(four).toHaveLength(4);
    expect(four[0]).toEqual(all[0]);
    expect(four.at(-1)).toEqual(all.at(-1));
  });
});
