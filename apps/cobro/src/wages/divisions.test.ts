import { describe, expect, it } from 'vitest';
import { AREAS } from './areas.ts';
import { DIVISIONS, divisionOf } from './divisions.ts';

describe('the Census divisions', () => {
  it('put each of the 50 states and DC in exactly one of the nine divisions', () => {
    expect(DIVISIONS).toHaveLength(9);
    const members = DIVISIONS.flatMap(({ fips }) => fips);
    expect(members.toSorted()).toEqual(AREAS.map(({ fips }) => fips).toSorted());
  });

  it('follow the Census Bureau map: Texas is West South Central, DC South Atlantic, Hawaii Pacific', () => {
    expect(divisionOf('48').name.en).toBe('West South Central');
    expect(divisionOf('48').fips.toSorted()).toEqual(['05', '22', '40', '48']);
    expect(divisionOf('11').name.en).toBe('South Atlantic');
    expect(divisionOf('15').name.es).toBe('Pacífico');
    expect(divisionOf('09').fips).toHaveLength(6);
  });

  it('refuses an area it does not know', () => {
    expect(() => divisionOf('99')).toThrow('no division for 99');
  });
});
