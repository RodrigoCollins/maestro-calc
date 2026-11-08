import { describe, expect, it } from 'vitest';
import { FROST_PAGES, partOf } from './frost.ts';
import { stateJsonOf } from './frost-json.ts';

describe('stateJsonOf', () => {
  it('lists every station of a state with its page part, name and six day numbers', () => {
    const json = stateJsonOf('colorado', 'Colorado');
    expect(json.name).toBe('Colorado');
    // NOAA normals, FT COLLINS: spring 134, 122, 108; fall 267, 280, 293 (read from the station file)
    expect(json.stations['USC00053005']).toEqual([
      partOf('colorado', 'USC00053005'),
      'FT COLLINS',
      134,
      122,
      108,
      267,
      280,
      293,
    ]);
    const rows = FROST_PAGES.filter(({ state }) => state.slug === 'colorado').flatMap(
      ({ rows: pageRows }) => pageRows,
    );
    expect(Object.keys(json.stations)).toEqual(rows.map(({ id }) => id));
  });

  it('numbers the parts of a big state as its pages do', () => {
    const json = stateJsonOf('texas', 'Texas');
    const parts = new Set(Object.values(json.stations).map(([part]) => part));
    expect([...parts]).toEqual([1, 2, 3]);
  });

  it('has no stations for an unknown state', () => {
    expect(stateJsonOf('nowhere', 'Nowhere').stations).toEqual({});
  });
});
