import {
  clockInput,
  countInput,
  defineCalculator,
  Rational,
  shiftMinutes,
} from '@maestro-calc/core';

const SIXTY = Rational.of(60);

/** A shift that reaches this minute from the start of its day ends on the next day. */
const MINUTES_PER_DAY = 1440;

const hoursOf = (minutes: number): Rational => Rational.of(minutes).div(SIXTY);

/**
 * The hours between two times of day, less an unpaid break: one shift of the time card. An end
 * before the start is the next day, so the shift crosses midnight (an `overnight` notice). A
 * missing time, the same start and end, or a break as long as the shift counts zero, with a
 * warning that names why.
 */
export const hoursBetween = defineCalculator({
  id: 'hours',
  inputs: [
    clockInput({ key: 'start', urlKey: 's', default: 540 }),
    clockInput({ key: 'end', urlKey: 'e', default: 1050 }),
    countInput({ key: 'unpaidBreak', urlKey: 'b', default: 30, max: 720 }),
  ],
  outputs: [
    { key: 'hours', measure: 'hours', role: 'primary' },
    { key: 'shiftHours', measure: 'hours', role: 'secondary' },
  ],
  warnings: ['overnight', 'missingTime', 'sameTime', 'breakTooLong'],
  compute: ({ start, end, unpaidBreak }) => {
    if (start === null || end === null) {
      return {
        outputs: { hours: Rational.of(0), shiftHours: Rational.of(0) },
        shopping: [],
        warnings: [{ code: 'missingTime' as const, params: {} }],
      };
    }
    const shift = shiftMinutes(start, end);
    const worked = Math.max(shift - unpaidBreak, 0);
    const warning =
      shift === 0
        ? ('sameTime' as const)
        : worked === 0
          ? ('breakTooLong' as const)
          : start + shift >= MINUTES_PER_DAY
            ? ('overnight' as const)
            : null;
    return {
      outputs: { hours: hoursOf(worked), shiftHours: hoursOf(shift) },
      shopping: [],
      warnings: warning === null ? [] : [{ code: warning, params: {} }],
    };
  },
});
