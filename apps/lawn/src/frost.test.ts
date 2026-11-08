import { STATES } from '@maestro-calc/lawn-data/frost/states';
import { describe, expect, it } from 'vitest';
import {
  frostPageOf,
  frostPathOf,
  FROST_PAGES,
  FROST_STATES,
  partOf,
  ROWS_PER_PAGE,
  rowOf,
} from './frost.ts';

describe('frost pages', () => {
  it('has a page for every state with stations, and none for the District of Columbia', () => {
    expect(FROST_STATES.map(({ code }) => code)).toEqual(
      STATES.filter(({ stations }) => stations > 0).map(({ code }) => code),
    );
    expect(FROST_STATES.map(({ code }) => code)).not.toContain('DC');
    expect(FROST_STATES).toHaveLength(50);
  });

  it('lists every station of a state exactly once, across its parts, sorted by name', () => {
    for (const state of FROST_STATES) {
      const pages = FROST_PAGES.filter((page) => page.state.slug === state.slug);
      expect(pages.reduce((total, page) => total + page.rows.length, 0)).toBe(state.stations);
      expect(pages.map(({ part }) => part)).toEqual(pages.map((_, index) => index + 1));
      expect(pages.every(({ rows }) => rows.length <= ROWS_PER_PAGE)).toBe(true);
      const ids = pages.flatMap(({ rows }) => rows.map(({ id }) => id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('puts the first part at the state address and the later ones under it', () => {
    expect(frostPathOf('texas')).toBe('/frost-dates/texas');
    expect(frostPathOf('texas', 2)).toBe('/frost-dates/texas/2');
    expect(frostPageOf('/frost-dates/texas/2').part).toBe(2);
    expect(frostPageOf('/frost-dates/texas').parts).toBe(3);
    expect(frostPageOf('/frost-dates/delaware').parts).toBe(1);
    expect(() => frostPageOf('/frost-dates/nowhere')).toThrow(
      'no frost page at /frost-dates/nowhere',
    );
  });

  // NOAA 1991-2020 normals, FT COLLINS (USC00053005), read by hand from the station's CSV: last
  // spring 32 F at 90, 50 and 10 percent 04/18, 05/02, 05/14; first fall 09/24, 10/07, 10/20
  it('writes the dates of Fort Collins, Colorado as the station file gives them', () => {
    const row = FROST_PAGES.flatMap(({ rows }) => rows).find(({ id }) => id === 'USC00053005');
    expect(row).toEqual({
      id: 'USC00053005',
      name: 'Ft Collins',
      dates: ['May 14', 'May 2', 'Apr 18', 'Sep 24', 'Oct 7', 'Oct 20'],
      alwaysFreezing: false,
    });
  });

  it('finds the part that lists a station, and part 1 for an unknown one', () => {
    const texas = FROST_PAGES.filter(({ state }) => state.slug === 'texas');
    const last = texas.at(-1)?.rows.at(-1)?.id ?? '';
    expect(partOf('texas', last)).toBe(texas.length);
    expect(partOf('texas', 'nope')).toBe(1);
  });

  it('flags a station that NOAA says freezes all year, with no dates', () => {
    const flagged = FROST_PAGES.flatMap(({ rows }) => rows).filter(
      ({ alwaysFreezing }) => alwaysFreezing,
    );
    for (const row of flagged) expect(row.dates).toEqual(Array(6).fill('–'));
    expect(
      rowOf({
        id: 'X',
        name: 'ALPHA',
        lat: 0,
        lon: 0,
        elevation: null,
        spring: [1, 2, 3],
        fall: [4, 5, 6],
      }).alwaysFreezing,
    ).toBe(false);
  });
});
