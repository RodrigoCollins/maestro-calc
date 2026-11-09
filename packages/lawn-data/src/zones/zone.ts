/**
 * The half zones of the USDA Plant Hardiness Zone Map: each covers 5°F of the average annual
 * extreme minimum winter temperature, from zone 1a (-60°F to -55°F) to zone 13b (65°F to 70°F).
 * A zone holds its low bound and not its high one: -55°F is zone 1b.
 */
export interface Zone {
  /** `7b`. */
  readonly label: string;
  readonly zone: number;
  readonly half: 'a' | 'b';
  /** °F, inclusive. */
  readonly low: number;
  /** °F, exclusive. */
  readonly high: number;
}

/**
 * A station's half zone label and its average annual extreme minimum in °F, to a tenth of a
 * degree. The label comes from the unrounded grid value, so near a boundary it can differ from
 * `zoneOf` of the rounded number.
 */
export type StationZone = readonly [zone: string, extremeMinimum: number];

const FLOOR = -60;
const STEP = 5;
const COUNT = 26;

const zoneOfIndex = (index: number): Zone => {
  const zone = Math.floor(index / 2) + 1;
  const half = index % 2 === 0 ? 'a' : 'b';
  const low = FLOOR + STEP * index;
  return { label: `${String(zone)}${half}`, zone, half, low, high: low + STEP };
};

/** The 26 half zones, coldest first. */
export const ZONES: readonly Zone[] = Array.from({ length: COUNT }, (_, index) =>
  zoneOfIndex(index),
);

/** The half zone of an average annual extreme minimum temperature in °F. */
export const zoneOf = (extremeMinimum: number): Zone => {
  const index = Math.floor((extremeMinimum - FLOOR) / STEP);
  const zone = ZONES[index];
  if (!Number.isFinite(extremeMinimum) || zone === undefined) {
    throw new RangeError(`no USDA zone for ${String(extremeMinimum)}°F`);
  }
  return zone;
};

/** The half zone labelled `label` (`7b`); an unknown label throws. */
export const zoneAt = (label: string): Zone => {
  const zone = ZONES.find((candidate) => candidate.label === label);
  if (zone === undefined) throw new Error(`no zone ${label}`);
  return zone;
};
