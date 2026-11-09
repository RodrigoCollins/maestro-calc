import { err, ok, type Result } from '../result.ts';

export interface ClockParseError {
  readonly code: 'MALFORMED';
}

const MINUTES_PER_DAY = 1440;

// `h`, `h:mm`, then an optional meridiem `a`, `am`, `a.m.`, `a. m.` (the Spanish style, RAE) or `a.m`
// (or `p`), one optional space before it;
// or `HHMM`, the canonical URL form, which takes no meridiem. ASCII digits only; the caller trims
// the surrounding whitespace.
const CLOCK = /^([0-9]{1,2})(?::([0-9]{2}))?(?: ?([ap])(?:m|\. ?m\.?)?)?$/i;
const COMPACT = /^([0-9]{2})([0-9]{2})$/;

/**
 * Reads a time of day as minutes since midnight (0..1439). Without a meridiem the hour is on the
 * 24-hour clock (0..23); with one it is 1..12, and 12 a.m. is midnight. Anything else is
 * `MALFORMED`.
 */
export const parseClock = (text: string): Result<number, ClockParseError> => {
  const match = CLOCK.exec(text) ?? COMPACT.exec(text);
  if (match === null) return err({ code: 'MALFORMED' });
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? '0');
  const meridiem = match[3]?.toLowerCase();
  if (minute > 59) return err({ code: 'MALFORMED' });
  if (meridiem === undefined) {
    return hour > 23 ? err({ code: 'MALFORMED' }) : ok(hour * 60 + minute);
  }
  if (hour < 1 || hour > 12) return err({ code: 'MALFORMED' });
  const hour24 = (hour % 12) + (meridiem === 'p' ? 12 : 0);
  return ok(hour24 * 60 + minute);
};

/** The canonical text of a time of day, `HHMM` on the 24-hour clock (the URL form). */
export const clockText = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  return `${String(hour).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}`;
};

/** The minutes from `start` to `end`; an end before the start is the next day, so never negative. */
export const shiftMinutes = (start: number, end: number): number =>
  (end - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;
