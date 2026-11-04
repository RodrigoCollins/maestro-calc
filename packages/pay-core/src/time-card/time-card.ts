import {
  type ClockDescriptor,
  clockInput,
  type CountDescriptor,
  countInput,
  defineCalculator,
  moneyInput,
  Rational,
  selectInput,
  shiftMinutes,
  usd,
} from '@maestro-calc/core';
import { payOf, RULES, splitWeek } from '../overtime/split.ts';

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

const SIXTY = Rational.of(60);

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

const clockIn = <const D extends Day>(day: D): ClockDescriptor & { readonly key: D } =>
  clockInput({
    key: day,
    urlKey: `${STEM[day]}i`,
    default: DEFAULT_IN[day],
  });

const clockOut = <const D extends Day>(day: D): ClockDescriptor & { readonly key: `${D}Out` } =>
  clockInput({
    key: `${day}Out`,
    urlKey: `${STEM[day]}o`,
    default: DEFAULT_OUT[day],
  });

const unpaidBreak = <const D extends Day>(
  day: D,
): CountDescriptor & { readonly key: `${D}Break` } =>
  countInput({
    key: `${day}Break`,
    urlKey: `${STEM[day]}b`,
    default: DEFAULT_IN[day] === null || day === 'sat' ? 0 : 30,
    max: 720,
  });

const dayFields = <const D extends Day>(day: D) =>
  [clockIn(day), clockOut(day), unpaidBreak(day)] as const;

const hours = (minutes: number): Rational => Rational.of(minutes).div(SIXTY);

/**
 * The time card of plans/pago-del-trabajador/PLAN.md: the clock-in, clock-out and unpaid break of
 * each day, the hourly rate and the overtime rule give the hours and the gross pay of the week. A
 * day with only one time is not worked; a shift may cross midnight.
 */
export const timeCard = defineCalculator({
  id: 'time-card',
  inputs: [
    moneyInput({ key: 'rate', urlKey: 'r', default: usd(22), max: usd(1000) }),
    selectInput({
      key: 'rule',
      urlKey: 'ru',
      options: RULES,
      default: 'federal',
    }),
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
    const split = splitWeek(
      inputs.rule,
      DAYS.map((day) => hours(workedOf(day))),
    );
    const { regularPay, overtimePay, doublePay, pay } = payOf(inputs.rate, split);
    return {
      outputs: {
        pay,
        totalHours: split.regular.add(split.overtime).add(split.double),
        regularHours: split.regular,
        overtimeHours: split.overtime,
        doubleHours: split.double,
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
