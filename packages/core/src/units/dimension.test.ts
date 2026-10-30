import { describe, expect, it } from 'vitest';
import { addVec, DIMENSIONS, nameOf, subVec } from './dimension.ts';

describe('dimension model (units-quantities › Dimension model)', () => {
  // spec: units-quantities › Dimension model — exponent table (length, mass)
  it('names the five dimensions with their exponent vectors', () => {
    expect(DIMENSIONS).toEqual({
      length: { length: 1, mass: 0, angle: 0 },
      area: { length: 2, mass: 0, angle: 0 },
      volume: { length: 3, mass: 0, angle: 0 },
      mass: { length: 0, mass: 1, angle: 0 },
      density: { length: -3, mass: 1, angle: 0 },
      angle: { length: 0, mass: 0, angle: 1 },
    });
  });

  // spec: units-quantities › Runtime exponent vector [UQ2]: vectors are immutable
  it('freezes the table and every vector in it', () => {
    expect(Object.isFrozen(DIMENSIONS)).toBe(true);
    for (const vector of Object.values(DIMENSIONS)) {
      expect(Object.isFrozen(vector)).toBe(true);
    }
  });

  // spec: units-quantities › Derived products — a vector maps back to its name or to nothing
  it('maps a vector to its name, or to undefined when no dimension has it', () => {
    expect(nameOf({ length: 2, mass: 0, angle: 0 })).toBe('area');
    expect(nameOf({ length: 1, mass: 0, angle: 0 })).toBe('length');
    expect(nameOf({ length: -3, mass: 1, angle: 0 })).toBe('density');
    expect(nameOf({ length: 0, mass: 1, angle: 0 })).toBe('mass');
    expect(nameOf({ length: 3, mass: 0, angle: 0 })).toBe('volume');
    expect(nameOf({ length: 4, mass: 0, angle: 0 })).toBeUndefined();
    expect(nameOf({ length: 1, mass: 1, angle: 0 })).toBeUndefined();
    expect(nameOf({ length: 0, mass: 0, angle: 0 })).toBeUndefined();
    // a length over a length is a plain ratio, never an angle: the angle is a base dimension
    expect(nameOf({ length: 0, mass: 0, angle: 1 })).toBe('angle');
    expect(nameOf(subVec(DIMENSIONS.length, DIMENSIONS.length))).toBeUndefined();
  });

  // spec: units-quantities › Derived products — vectors add for products, subtract for quotients
  it('adds and subtracts vectors componentwise', () => {
    expect(addVec(DIMENSIONS.length, DIMENSIONS.length)).toEqual({ length: 2, mass: 0, angle: 0 });
    expect(addVec(DIMENSIONS.area, DIMENSIONS.length)).toEqual({ length: 3, mass: 0, angle: 0 });
    expect(addVec(DIMENSIONS.density, DIMENSIONS.volume)).toEqual({ length: 0, mass: 1, angle: 0 });
    expect(addVec(DIMENSIONS.mass, DIMENSIONS.density)).toEqual({ length: -3, mass: 2, angle: 0 });
    expect(subVec(DIMENSIONS.volume, DIMENSIONS.area)).toEqual({ length: 1, mass: 0, angle: 0 });
    expect(subVec(DIMENSIONS.mass, DIMENSIONS.volume)).toEqual({ length: -3, mass: 1, angle: 0 });
    expect(subVec(DIMENSIONS.length, DIMENSIONS.mass)).toEqual({ length: 1, mass: -1, angle: 0 });
    expect(subVec(DIMENSIONS.density, DIMENSIONS.mass)).toEqual({ length: -3, mass: 0, angle: 0 });
  });
});
