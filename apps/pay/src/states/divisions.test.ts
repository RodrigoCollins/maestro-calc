import { describe, expect, it } from 'vitest';
import { TIPPED_STATES } from '../guide/tipped-states.ts';
import { CENSUS_DIVISIONS, DIVISIONS, divisionOf } from './divisions.ts';

describe('DIVISIONS (the nine Census divisions)', () => {
  it('puts every state and DC in exactly one of the nine divisions', () => {
    expect(DIVISIONS).toHaveLength(9);
    const listed = DIVISIONS.flatMap(({ states }) => states);
    expect(listed.toSorted()).toEqual(TIPPED_STATES.map(({ name }) => name.en).toSorted());
  });

  it('holds the states of the Census map, division by division', () => {
    // U.S. Census Bureau, "Census Regions and Divisions of the United States"
    expect(
      Object.fromEntries(DIVISIONS.map(({ name, states }) => [name.en, states.length])),
    ).toEqual({
      'New England': 6,
      'Middle Atlantic': 3,
      'East North Central': 5,
      'West North Central': 7,
      'South Atlantic': 9,
      'East South Central': 4,
      'West South Central': 4,
      Mountain: 8,
      Pacific: 5,
    });
    expect(divisionOf('Texas').states).toEqual(['Arkansas', 'Louisiana', 'Oklahoma', 'Texas']);
    expect(divisionOf('District of Columbia').name.en).toBe('South Atlantic');
    expect(divisionOf('Utah').name.es).toBe('Montaña');
    expect(divisionOf('Alaska').name.en).toBe('Pacific');
  });

  it('cites the Census Bureau map', () => {
    expect(CENSUS_DIVISIONS.href).toBe(
      'https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf',
    );
    expect(() => divisionOf('Puerto Rico')).toThrow('no division for Puerto Rico');
  });
});
