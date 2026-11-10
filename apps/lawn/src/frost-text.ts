import { monthDayOfDay } from '@maestro-calc/lawn-data/frost/calendar';

// The text helpers of the frost pages, with no station data: the ZIP lookup script imports them too.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A day number of the 365-day calendar of the normals as `Apr 18`; a missing one is a dash. */
export const dateText = (day: number | null): string => {
  if (day === null) return '–';
  const { month, day: date } = monthDayOfDay(day);
  return `${MONTHS[month - 1] ?? ''} ${String(date)}`;
};

/** Words NOAA writes in capitals that stay capitals: compass points and station kinds. */
const KEEP = new Set([
  'N',
  'S',
  'E',
  'W',
  'NE',
  'NW',
  'SE',
  'SW',
  'NNE',
  'NNW',
  'SSE',
  'SSW',
  'ENE',
  'ESE',
  'WNW',
  'WSW',
]);
const KEEP_ENDING = new Set(['AP', 'AFB', 'ARPT', 'USA', 'US', 'NY', 'II', 'III', 'IV']);

/** A station name as NOAA gives it (`FT COLLINS`, `BEDFORD 5 WNW`) in title case, compass points kept. */
export const titleCase = (name: string): string =>
  name
    .split(' ')
    .map((word) => {
      if (KEEP.has(word) || KEEP_ENDING.has(word)) return word;
      const lower = word.toLowerCase();
      return lower.replace(
        /(^|[-/('.])([a-z])/g,
        (_, edge: string, letter: string) => `${edge}${letter.toUpperCase()}`,
      );
    })
    .join(' ');
