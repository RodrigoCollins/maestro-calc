import {
  addMoney,
  defineCalculator,
  Rational,
  scaleMoney,
  shiftMinutes,
  usd,
  type ClockDescriptor,
  type CountDescriptor,
} from '@maestro-calc/core';

/** The days of the week, Monday first; the key of a day is its clock-in field. */
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type Day = (typeof DAYS)[number];

/** The two-letter stem of a day's URL keys: `moi`, `moo` and `mob` for Monday. */
const STEM: Readonly<Record<Day, string>> = {
  mon: 'mo',
  tue: 'tu',
  wed: 'we',
  thu: 'th',
  fri: 'fr',
  sat: 'sa',
  sun: 'su',
};

const H8 = 8 * 60;
const H12 = 12 * 60;
const H40 = 40 * 60;
const SIXTY = Rational.of(60);
const ONE_AND_A_HALF = Rational.of(3, 2);
const TWO = Rational.of(2);

/** The example week of the plan: Monday to Friday 7:00 to 16:30, Saturday 7:00 to 11:30. */
const DEFAULT_IN: Readonly<Record<Day, number | null>> = {
  mon: 420,
  tue: 420,
  wed: 420,
  thu: 420,
  fri: 420,
  sat: 420,
  sun: null,
};
const DEFAULT_OUT: Readonly<Record<Day, number | null>> = {
  mon: 990,
  tue: 990,
  wed: 990,
  thu: 990,
  fri: 990,
  sat: 690,
  sun: null,
};

const clockIn = <const D extends Day>(day: D): ClockDescriptor & { readonly key: D } => ({
  kind: 'clock',
  key: day,
  urlKey: `${STEM[day]}i`,
  default: DEFAULT_IN[day],
});

const clockOut = <const D extends Day>(day: D): ClockDescriptor & { readonly key: `${D}Out` } => ({
  kind: 'clock',
  key: `${day}Out`,
  urlKey: `${STEM[day]}o`,
  default: DEFAULT_OUT[day],
});

const unpaidBreak = <const D extends Day>(
  day: D,
): CountDescriptor & { readonly key: `${D}Break` } => ({
  kind: 'count',
  key: `${day}Break`,
  urlKey: `${STEM[day]}b`,
  default: DEFAULT_IN[day] === null || day === 'sat' ? 0 : 30,
  max: 720,
});

const dayFields = <const D extends Day>(day: D) =>
  [clockIn(day), clockOut(day), unpaidBreak(day)] as const;

/** Minutes split by the rate they are paid at. */
interface Split {
  readonly regular: number;
  readonly overtime: number;
  readonly double: number;
}

/** FLSA: every hour past 40 in the workweek is overtime at 1.5x; there is no double time. */
const federal = (days: readonly number[]): Split => {
  const total = days.reduce((sum, minutes) => sum + minutes, 0);
  const regular = Math.min(total, H40);
  return { regular, overtime: total - regular, double: 0 };
};

/**
 * California (Labor Code 510): past 8 h in a day at 1.5x and past 12 h at 2x; on the seventh
 * consecutive workday the first 8 h at 1.5x and the rest at 2x; then regular hours past 40 in the
 * week become overtime.
 */
const california = (days: readonly number[]): Split => {
  const seventh = days.every((minutes) => minutes > 0);
  let regular = 0;
  let overtime = 0;
  let double = 0;
  days.forEach((minutes, index) => {
    if (seventh && index === days.length - 1) {
      overtime += Math.min(minutes, H8);
      double += Math.max(minutes - H8, 0);
      return;
    }
    regular += Math.min(minutes, H8);
    overtime += Math.min(Math.max(minutes - H8, 0), H12 - H8);
    double += Math.max(minutes - H12, 0);
  });
  const excess = Math.max(regular - H40, 0);
  return { regular: regular - excess, overtime: overtime + excess, double };
};

const hours = (minutes: number): Rational => Rational.of(minutes).div(SIXTY);

/**
 * The time card of plans/pago-del-trabajador/PLAN.md: the clock-in, clock-out and unpaid break of
 * each day, the hourly rate and the overtime rule give the hours and the gross pay of the week. A
 * day with only one time is not worked; a shift may cross midnight.
 */
export const timeCard = defineCalculator({
  id: 'time-card',
  inputs: [
    { kind: 'money', key: 'rate', urlKey: 'r', default: usd(22), max: usd(1000) },
    {
      kind: 'select',
      key: 'rule',
      urlKey: 'ru',
      options: ['federal', 'california'],
      default: 'federal',
    },
    ...dayFields('mon'),
    ...dayFields('tue'),
    ...dayFields('wed'),
    ...dayFields('thu'),
    ...dayFields('fri'),
    ...dayFields('sat'),
    ...dayFields('sun'),
  ],
  outputs: [
    { key: 'pay', measure: 'money', role: 'primary' },
    { key: 'totalHours', measure: 'hours', role: 'secondary' },
    { key: 'regularHours', measure: 'hours', role: 'secondary' },
    { key: 'overtimeHours', measure: 'hours', role: 'secondary' },
    { key: 'doubleHours', measure: 'hours', role: 'secondary' },
    { key: 'regularPay', measure: 'money', role: 'secondary' },
    { key: 'overtimePay', measure: 'money', role: 'secondary' },
    { key: 'doublePay', measure: 'money', role: 'secondary' },
    { key: 'monHours', measure: 'hours', role: 'intermediate' },
    { key: 'tueHours', measure: 'hours', role: 'intermediate' },
    { key: 'wedHours', measure: 'hours', role: 'intermediate' },
    { key: 'thuHours', measure: 'hours', role: 'intermediate' },
    { key: 'friHours', measure: 'hours', role: 'intermediate' },
    { key: 'satHours', measure: 'hours', role: 'intermediate' },
    { key: 'sunHours', measure: 'hours', role: 'intermediate' },
  ],
  warnings: ['breakTooLong'],
  compute: (inputs) => {
    // the minutes of a day before the break check: 0 for a day with one time or none
    const shiftOf = (day: Day): number => {
      const start = inputs[day];
      const end = inputs[`${day}Out`];
      return start === null || end === null ? 0 : shiftMinutes(start, end) - inputs[`${day}Break`];
    };
    const workedOf = (day: Day): number => Math.max(shiftOf(day), 0);
    const warnings = DAYS.filter(
      (day) => inputs[day] !== null && inputs[`${day}Out`] !== null && shiftOf(day) <= 0,
    ).map((day) => ({ code: 'breakTooLong' as const, params: { day } }));
    const days = DAYS.map(workedOf);
    const split = inputs.rule === 'california' ? california(days) : federal(days);
    const regularPay = scaleMoney(inputs.rate, hours(split.regular));
    const overtimePay = scaleMoney(inputs.rate, hours(split.overtime).mul(ONE_AND_A_HALF));
    const doublePay = scaleMoney(inputs.rate, hours(split.double).mul(TWO));
    return {
      outputs: {
        pay: addMoney(addMoney(regularPay, overtimePay), doublePay),
        totalHours: hours(split.regular + split.overtime + split.double),
        regularHours: hours(split.regular),
        overtimeHours: hours(split.overtime),
        doubleHours: hours(split.double),
        regularPay,
        overtimePay,
        doublePay,
        monHours: hours(workedOf('mon')),
        tueHours: hours(workedOf('tue')),
        wedHours: hours(workedOf('wed')),
        thuHours: hours(workedOf('thu')),
        friHours: hours(workedOf('fri')),
        satHours: hours(workedOf('sat')),
        sunHours: hours(workedOf('sun')),
      },
      shopping: [],
      warnings,
    };
  },
});
