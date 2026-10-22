// Unit conversion. Every dimension has a base unit; compute functions only ever see base units.
// length: ft · area: sq ft · volume: cu ft · weight: lb · money: USD

export type Dim = 'length' | 'area' | 'volume' | 'weight' | 'money' | 'count' | 'percent' | 'angle' | 'number';

interface UnitDef {
  label: string;
  short: string;
  factor: number; // base units per 1 of this unit
}

export const UNITS: Record<string, Record<string, UnitDef>> = {
  length: {
    in: { label: 'inches', short: 'in', factor: 1 / 12 },
    ft: { label: 'feet', short: 'ft', factor: 1 },
    yd: { label: 'yards', short: 'yd', factor: 3 },
    cm: { label: 'centimeters', short: 'cm', factor: 1 / 30.48 },
    m: { label: 'meters', short: 'm', factor: 1 / 0.3048 },
  },
  area: {
    sqft: { label: 'square feet', short: 'sq ft', factor: 1 },
    sqyd: { label: 'square yards', short: 'sq yd', factor: 9 },
    sqm: { label: 'square meters', short: 'm²', factor: 1 / 0.09290304 },
    acre: { label: 'acres', short: 'acres', factor: 43560 },
  },
  volume: {
    cuft: { label: 'cubic feet', short: 'cu ft', factor: 1 },
    cuyd: { label: 'cubic yards', short: 'cu yd', factor: 27 },
    cuin: { label: 'cubic inches', short: 'cu in', factor: 1 / 1728 },
    m3: { label: 'cubic meters', short: 'm³', factor: 1 / 0.028316846592 },
    gal: { label: 'US gallons', short: 'gal', factor: 0.133680556 },
    L: { label: 'liters', short: 'L', factor: 0.0353146667 },
  },
  weight: {
    lb: { label: 'pounds', short: 'lb', factor: 1 },
    ton: { label: 'US tons', short: 'tons', factor: 2000 },
    kg: { label: 'kilograms', short: 'kg', factor: 2.20462262 },
    t: { label: 'metric tonnes', short: 't', factor: 2204.62262 },
  },
};

export const DEFAULT_DISPLAY: Partial<Record<Dim, string[]>> = {
  length: ['ft', 'in', 'm'],
  area: ['sqft', 'sqyd', 'sqm'],
  volume: ['cuyd', 'cuft', 'm3'],
  weight: ['ton', 'lb', 't'],
};

export function toBase(dim: Dim, value: number, unit?: string): number {
  if (!unit) return value;
  const def = UNITS[dim]?.[unit];
  if (!def) throw new Error(`Unknown unit ${unit} for ${dim}`);
  return value * def.factor;
}

export function fromBase(dim: Dim, value: number, unit?: string): number {
  if (!unit) return value;
  const def = UNITS[dim]?.[unit];
  if (!def) throw new Error(`Unknown unit ${unit} for ${dim}`);
  return value / def.factor;
}

export function unitShort(dim: Dim, unit: string): string {
  return UNITS[dim]?.[unit]?.short ?? unit;
}
