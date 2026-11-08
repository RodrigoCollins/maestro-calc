/** Minutes in a day: a time past it is the next day. */
export const DAY_MINUTES = 1440;

/** `9 am`, `8:30 am`, `12 pm`: a time as people search it, the same in both languages. */
export const clockOf = (minutes: number): string => {
  const hour = Math.floor(minutes / 60) % 24;
  const clock = String(hour % 12 === 0 ? 12 : hour % 12);
  const time = minutes % 60 === 0 ? clock : `${clock}:${String(minutes % 60).padStart(2, '0')}`;
  return `${time} ${hour < 12 ? 'am' : 'pm'}`;
};

/** A time as the hours calculator reads it, on a 24-hour clock: `17:00`; past a day, `30:00`. */
export const fieldOf = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;
