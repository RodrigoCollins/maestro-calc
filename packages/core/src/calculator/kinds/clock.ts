import { clockText, parseClock } from '../../format/clock.ts';
import { err, ok } from '../../result.ts';
import type { ClockDescriptor, InputKind } from '../descriptors.ts';
import { builderOf, SURROUNDING_WS } from './shared.ts';

/** The last minute of a day: a time of day is 0..1439 minutes since midnight. */
const LAST_MINUTE = 1439;

/** The URL text of a clock field with no time (a day off). */
const NO_TIME = '-';

const isMinuteOfDay = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= LAST_MINUTE;

/**
 * A time of day, a whole number of minutes in a day, or `null`; blank text is `null`, a day off.
 * The URL holds `HHMM` on the 24-hour clock, exactly four digits, or `-` for no time.
 */
const CLOCK: InputKind<ClockDescriptor> = {
  read: (_input, raw) => {
    if (raw === null) return ok(null);
    if (typeof raw === 'number') return isMinuteOfDay(raw) ? ok(raw) : err({ code: 'MALFORMED' });
    if (typeof raw !== 'string') return err({ code: 'MALFORMED' });
    const text = raw.replace(SURROUNDING_WS, '');
    if (text === '') return ok(null);
    const minutes = parseClock(text);
    return minutes.ok ? minutes : err({ code: 'MALFORMED' });
  },
  urlText: (_input, value) =>
    value === null ? NO_TIME : isMinuteOfDay(value) ? clockText(value) : undefined,
  fromUrl: (_input, text) => {
    if (text === NO_TIME) return null;
    if (!/^[0-9]{4}$/.test(text)) return undefined;
    const minutes = parseClock(text);
    return minutes.ok ? minutes.value : undefined;
  },
};

/**
 * A time of day in minutes since midnight (0..1439), read from `7:00 am`, `16:30` or `0730`;
 * `null` is no time (an empty field, a day off).
 */
export const clockInput = /* @__PURE__ */ builderOf<ClockDescriptor>('clock', CLOCK);
