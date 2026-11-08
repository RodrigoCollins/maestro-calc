/** The chocolate band ruler runs from 0 to 80 mg/kg: the bands 20, 40 and 60 sit at 25, 50 and 75%. */
export const RULER_END = 80;

/** How far along the ruler a dose in mg/kg is, as a percentage; past either end it stays on it. */
export const rulerPercent = (dose: number): number =>
  Math.min(100, Math.max(0, (dose / RULER_END) * 100));

const WEEKS = 11;
const DAY = 10;

/**
 * The calendar strip of the due date: 11 weeks of ticks, one for each day counted from the start
 * (day 0), the days of the window `min` to `max` shaded. Decorative: the dates are in the text.
 */
export const calendarSvg = (min: number, max: number): string => {
  const days = Array.from({ length: WEEKS * 7 }, (_, day) => {
    const kind = day === 0 ? 'start' : day >= min && day <= max ? 'window' : '';
    return `<rect class="day${kind === '' ? '' : ` ${kind}`}" x="${String(day * DAY)}" y="0" width="8" height="26" rx="2"/>`;
  });
  const weeks = Array.from(
    { length: WEEKS },
    (_, week) =>
      `<text x="${String(week * 7 * DAY)}" y="46" font-size="11">wk ${String(week + 1)}</text>`,
  );
  return [
    `<svg viewBox="0 0 ${String(WEEKS * 7 * DAY)} 52" width="${String(WEEKS * 7 * DAY)}" height="52" aria-hidden="true" focusable="false">`,
    ...days,
    ...weeks,
    '</svg>',
  ].join('');
};
