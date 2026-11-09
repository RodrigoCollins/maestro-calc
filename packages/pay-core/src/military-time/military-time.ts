import { parseClock } from '@maestro-calc/core';

/*
 * Military time, the 24-hour clock written with four digits and no colon: `1500` is 3:00 PM. A time
 * is whole minutes from midnight, 0 to 1439, and 1440 for `2400`, the midnight that ends a day (the
 * same instant as `0000` of the next). The spoken form is the American military one: the hour and
 * the minutes as two numbers, a leading zero said, and "hundred hours" on the hour.
 */

/** Minutes in a day: 1440 is `2400`. */
const DAY = 1440;
const HOUR = 60;

export interface MilitaryTime {
  /** Minutes from midnight, 0 to 1440. */
  readonly minutes: number;
  /** The hour of the 24-hour clock, 0 to 24 (24 only for `2400`). */
  readonly hour: number;
  readonly minute: number;
  /** Four digits, no colon: `1500`. */
  readonly military: string;
  /** The same with a colon, as ISO 8601 writes it: `15:00`. */
  readonly colon: string;
  /** The 12-hour clock: 12 for the hours of midnight and noon, `am` before noon. */
  readonly twelve: {
    readonly hour: number;
    readonly minute: number;
    readonly meridiem: 'am' | 'pm';
  };
  /** `3:00 PM`. */
  readonly twelveText: string;
  /** `fifteen hundred hours`, `thirteen forty-five`. */
  readonly spoken: string;
}

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const;
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'] as const;

const whole = (value: number, most: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= most;

/** A number from 0 to 59 in English words: `forty-five`. */
export const numberWords = (value: number): string => {
  if (!whole(value, 59)) throw new RangeError(`no words for ${String(value)}`);
  if (value < 20) return ONES[value] ?? '';
  const tens = TENS[Math.floor(value / 10)] ?? '';
  return value % 10 === 0 ? tens : `${tens}-${ONES[value % 10] ?? ''}`;
};

/** Two digits as they are said: `08` is "zero eight", `00` "zero zero", `45` "forty-five". */
const pairWords = (value: number): string =>
  value < 10 ? `zero ${numberWords(value)}` : numberWords(value);

/**
 * How a time is said: on the hour, the hour and "hundred hours" (`0800` "zero eight hundred
 * hours", `0000` "zero hundred hours"); otherwise the hour and the minutes as two numbers, each
 * leading zero said (`0005` "zero zero zero five", `1345` "thirteen forty-five").
 */
export const spokenOf = (hour: number, minute: number): string => {
  if (minute === 0) return hour === 0 ? 'zero hundred hours' : `${pairWords(hour)} hundred hours`;
  return `${pairWords(hour)} ${pairWords(minute)}`;
};

const two = (value: number): string => String(value).padStart(2, '0');

/** The time `minutes` after midnight, 0 to 1440, in every form. */
export const militaryTimeOf = (minutes: number): MilitaryTime => {
  if (!whole(minutes, DAY)) throw new RangeError(`no time of day at ${String(minutes)} minutes`);
  const hour = Math.floor(minutes / HOUR);
  const minute = minutes % HOUR;
  const ofDay = hour % 24;
  const twelve = {
    hour: ofDay % 12 === 0 ? 12 : ofDay % 12,
    minute,
    meridiem: ofDay < 12 ? ('am' as const) : ('pm' as const),
  };
  return {
    minutes,
    hour,
    minute,
    military: `${two(hour)}${two(minute)}`,
    colon: `${two(hour)}:${two(minute)}`,
    twelve,
    twelveText: `${String(twelve.hour)}:${two(minute)} ${twelve.meridiem.toUpperCase()}`,
    spoken: spokenOf(hour, minute),
  };
};

/** A trailing "hours", "hrs", "hr" or "h", as military times are often written. */
const SUFFIX = / ?(?:hours|hrs|hr|h)$/i;
const THREE = /^[0-9]{3}$/;
const END_OF_DAY = /^24:?00$/;

/**
 * Reads a time typed either way: military (`1500`, `930`, `1500 hours`, `2400`) or on a 12-hour or
 * 24-hour clock (`3:00 PM`, `3 pm`, `15:00`). `null` when it is none of them.
 */
export const readTime = (text: string): MilitaryTime | null => {
  const bare = text.trim().replace(SUFFIX, '');
  if (END_OF_DAY.test(bare)) return militaryTimeOf(DAY);
  const read = parseClock(THREE.test(bare) ? `0${bare}` : bare);
  return read.ok ? militaryTimeOf(read.value) : null;
};

/** A US time zone: its offset from UTC in standard time, and whether it keeps daylight time. */
export interface UsZone {
  readonly id: 'ET' | 'CT' | 'MT' | 'PT' | 'AKT' | 'HT';
  readonly standard: number;
  readonly daylight: boolean;
}

/** The six zones of the 50 states, east to west (49 CFR part 71); Hawaii keeps no daylight time. */
export const US_ZONES: readonly UsZone[] = [
  { id: 'ET', standard: -5, daylight: true },
  { id: 'CT', standard: -6, daylight: true },
  { id: 'MT', standard: -7, daylight: true },
  { id: 'PT', standard: -8, daylight: true },
  { id: 'AKT', standard: -9, daylight: true },
  { id: 'HT', standard: -10, daylight: false },
];

/** A time in one zone: minutes from its midnight, and its day against the Eastern day (−1, 0, 1). */
export interface ZoneTime {
  readonly zone: UsZone['id'];
  readonly minutes: number;
  readonly day: number;
}

/**
 * The time in every US zone when it is `minutes` after midnight Eastern Time, in standard time
 * (November to March) or daylight time (March to November, when every zone but Hawaii is an hour
 * ahead of its standard offset). `1440` is the midnight that starts the next Eastern day.
 */
export const zoneTimesOf = (minutes: number, season: 'standard' | 'daylight'): ZoneTime[] => {
  const shift = (zone: UsZone): number =>
    zone.standard + (season === 'daylight' && zone.daylight ? 1 : 0);
  const [eastern] = US_ZONES;
  const base = eastern === undefined ? 0 : shift(eastern);
  return US_ZONES.map((zone) => {
    const at = minutes + (shift(zone) - base) * HOUR;
    const day = Math.floor(at / DAY);
    return { zone: zone.id, minutes: at - day * DAY, day };
  });
};
