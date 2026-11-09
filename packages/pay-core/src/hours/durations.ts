/**
 * Adding and subtracting lengths of time, "7 h 45 min + 3 h 30 min": plain whole minutes, an hour
 * being 60 of them. A duration may carry more than 59 minutes (90 min is 1 h 30 min); the column
 * method below normalizes it first, the way it is done by hand.
 */
export interface Duration {
  readonly hours: number;
  readonly minutes: number;
}

/** Minutes with the sign apart: `-85` is `{ negative: true, hours: 1, minutes: 25 }`. */
export interface Split {
  readonly negative: boolean;
  readonly hours: number;
  readonly minutes: number;
}

const HOUR = 60;
const WHOLE = /^[0-9]+$/;

/** A field of whole hours or minutes: empty is 0, ASCII digits up to `max`, anything else `null`. */
export const readAmount = (text: string, max: number): number | null => {
  if (text === '') return 0;
  if (!WHOLE.test(text)) return null;
  const value = Number(text);
  return value <= max ? value : null;
};

export const minutesOf = ({ hours, minutes }: Duration): number => hours * HOUR + minutes;

/** The total of `durations`, in minutes. */
export const sumOf = (durations: readonly Duration[]): number =>
  durations.reduce((total, duration) => total + minutesOf(duration), 0);

/** `a − b` in minutes: negative when `b` is the longer. */
export const differenceOf = (a: Duration, b: Duration): number => minutesOf(a) - minutesOf(b);

export const splitOf = (minutes: number): Split => {
  const size = Math.abs(minutes);
  return { negative: minutes < 0, hours: Math.floor(size / HOUR), minutes: size % HOUR };
};

/** Adding by hand: the minutes first, their whole hours carried to the hours. */
export const additionOf = (a: Duration, b: Duration) => {
  const minutes = a.minutes + b.minutes;
  const carry = Math.floor(minutes / HOUR);
  return {
    minutes,
    carry,
    restMinutes: minutes % HOUR,
    hours: a.hours + b.hours + carry,
    total: minutesOf(a) + minutesOf(b),
  };
};

/**
 * Subtracting by hand: the shorter from the longer (the result is negative when `b` is longer),
 * both written with under 60 minutes, and an hour borrowed as 60 minutes when the minutes to take
 * away are more than the minutes there are.
 */
export const subtractionOf = (a: Duration, b: Duration) => {
  const total = differenceOf(a, b);
  const [long, short] = total < 0 ? [b, a] : [a, b];
  const from = splitOf(minutesOf(long));
  const away = splitOf(minutesOf(short));
  const borrow = from.minutes < away.minutes;
  return {
    negative: total < 0,
    borrow,
    minutes: from.minutes + (borrow ? HOUR : 0) - away.minutes,
    hours: from.hours - (borrow ? 1 : 0) - away.hours,
    total,
  };
};
