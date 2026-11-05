import { describe, expect, it } from 'vitest';
import { decimalHoursText, hoursMinutesText, hoursText, moneyText } from '../format.ts';
import {
  EXAMPLES,
  figuresOf,
  HOURS_EXAMPLES,
  hoursOf,
  OVERTIME_EXAMPLES,
  overtimeFiguresOf,
  PTO_EXAMPLES,
  ptoFiguresOf,
} from './examples.ts';

// The PTO accrual calculator, verified by hand on 52 weeks a year: 10 days x 8 h = 80 h over
// 40 x 52 = 2,080 h worked, 80/26 = 3.0769 every two weeks, 80/2,080 = 0.0385 per hour worked;
// 15 days = 120 h, 120/26 = 4.6154, 120/2,080 = 0.0577; 10 days x 6 h = 60 h over 30 x 52 =
// 1,560 h, 60/26 = 2.3077, 60/1,560 = 0.0385; 20 days = 160 h, 160/26 = 6.1538, 160/2,080 = 0.0769.
const PTO_HAND = {
  'two-weeks': { annual: '80', biweekly: '3.08', perHour: '0.0385' },
  'three-weeks': { annual: '120', biweekly: '4.62', perHour: '0.0577' },
  'part-time': { annual: '60', biweekly: '2.31', perHour: '0.0385' },
  'four-weeks': { annual: '160', biweekly: '6.15', perHour: '0.0769' },
} as const;

describe('PTO accrual examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(PTO_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(PTO_HAND));
  });

  it.each(PTO_EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    expect(ptoFiguresOf(example)).toEqual(PTO_HAND[example.id]);
  });
});

// The worked examples the methodology page publishes, verified by hand at $22 an hour
// (overtime $33, double time $44). The page renders what the engine returns; this pins it.
const HAND = {
  'federal-week': { regular: '40', overtime: '9.5', double: '0', pay: '$1,193.50' },
  'california-long-day': { regular: '40', overtime: '12.5', double: '1', pay: '$1,336.50' },
  'california-ten-hour-days': { regular: '40', overtime: '10', double: '0', pay: '$1,210.00' },
  'california-seventh-day': { regular: '40', overtime: '22', double: '1', pay: '$1,650.00' },
} as const;

describe('methodology examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
  });

  it.each(EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    const figures = figuresOf(example);
    expect({
      regular: hoursText(figures.regularHours),
      overtime: hoursText(figures.overtimeHours),
      double: hoursText(figures.doubleHours),
      pay: moneyText(figures.pay),
    }).toEqual(HAND[example.id]);
  });
});

// The overtime calculator's examples, hours worked each day at $22 an hour, verified by hand:
// four 10 h days are 40 h, no federal overtime ($880); California pays 2 h a day past 8
// (32 x 22 + 8 x 33 = $968); a 13 h Monday and four 8 h days in California are 8 + 4 + 1 and
// 32 regular (40 x 22 + 4 x 33 + 1 x 44 = $1,056).
const OVERTIME_HAND = {
  'four-tens-federal': { regular: '40', overtime: '0', double: '0', pay: '$880.00' },
  'four-tens-california': { regular: '32', overtime: '8', double: '0', pay: '$968.00' },
  'long-day-california': { regular: '40', overtime: '4', double: '1', pay: '$1,056.00' },
} as const;

// The hours calculator and the decimal hours converter, verified by hand: 9:00 to 17:30 less 30 min
// is 8 h 0 min; 22:00 to 6:15 crosses midnight, 2 h + 6 h 15 min; 20/60 = 0.333.. so 8.33;
// 45/60 = 0.75; 0.75 x 60 = 45 min.
const HOURS_HAND = {
  'day-shift': { hoursMinutes: '8 h 0 min', decimal: '8.00' },
  'night-shift': { hoursMinutes: '8 h 15 min', decimal: '8.25' },
  'eight-twenty': { hoursMinutes: '8 h 20 min', decimal: '8.33' },
  'forty-five': { hoursMinutes: '0 h 45 min', decimal: '0.75' },
  'seven-seventy-five': { hoursMinutes: '7 h 45 min', decimal: '7.75' },
} as const;

describe('hours and decimal hours examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(HOURS_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HOURS_HAND));
  });

  it.each(HOURS_EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    const hours = hoursOf(example);
    expect({ hoursMinutes: hoursMinutesText(hours), decimal: decimalHoursText(hours) }).toEqual(
      HOURS_HAND[example.id],
    );
  });
});

describe('overtime calculator examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(OVERTIME_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(OVERTIME_HAND));
  });

  it.each(OVERTIME_EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    const figures = overtimeFiguresOf(example);
    expect({
      regular: hoursText(figures.regularHours),
      overtime: hoursText(figures.overtimeHours),
      double: hoursText(figures.doubleHours),
      pay: moneyText(figures.pay),
    }).toEqual(OVERTIME_HAND[example.id]);
  });
});
